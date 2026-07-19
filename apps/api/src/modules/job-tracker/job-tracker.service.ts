import { PrismaClient, JobEntry, JobStage } from "@prisma/client";
import { JobTrackerRepository } from "./job-tracker.repository.js";
import { reminderQueue } from "./reminder.queue.js";
import { NotFoundError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";

export class JobTrackerService {
  constructor(
    private readonly jobTrackerRepository: JobTrackerRepository,
    private readonly prisma: PrismaClient
  ) {}

  async createJobEntry(
    userId: string,
    data: {
      company: string;
      role: string;
      stage: JobStage;
      linkedResumeVersionId?: string;
      linkedCoverLetterId?: string;
      notes?: string;
      deadline?: string;
      tags?: string[];
    }
  ): Promise<JobEntry> {
    const deadlineDate = data.deadline ? new Date(data.deadline) : undefined;

    const entry = await this.jobTrackerRepository.create(userId, {
      ...data,
      deadline: deadlineDate
    });

    if (deadlineDate) {
      await this.scheduleReminder(userId, entry.id, entry.company, entry.role, deadlineDate);
    }

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}

    return entry;
  }

  async getJobEntries(userId: string): Promise<JobEntry[]> {
    return this.jobTrackerRepository.findByUser(userId);
  }

  async getJobEntry(id: string, userId: string): Promise<JobEntry> {
    const entry = await this.jobTrackerRepository.findById(id);
    if (!entry || entry.userId !== userId) {
      throw new NotFoundError("Job entry not found");
    }
    return entry;
  }

  async updateJobEntry(
    id: string,
    userId: string,
    data: {
      company?: string;
      role?: string;
      stage?: JobStage;
      linkedResumeVersionId?: string | null;
      linkedCoverLetterId?: string | null;
      notes?: string;
      deadline?: string | null;
      tags?: string[];
    }
  ): Promise<JobEntry> {
    const existing = await this.jobTrackerRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Job entry not found");
    }

    let deadlineDate: Date | null | undefined = undefined;
    if (data.deadline !== undefined) {
      deadlineDate = data.deadline ? new Date(data.deadline) : null;
    }

    const updated = await this.jobTrackerRepository.update(id, userId, {
      ...data,
      deadline: deadlineDate
    });

    // Handle rescheduling or canceling of reminders
    if (deadlineDate !== undefined) {
      if (deadlineDate) {
        await this.scheduleReminder(userId, id, updated.company, updated.role, deadlineDate);
      } else {
        await this.cancelReminder(id);
      }
    } else if ((data.company || data.role) && existing.deadline) {
      // If company or role changed and deadline exists, update reminder details
      await this.scheduleReminder(userId, id, updated.company, updated.role, existing.deadline);
    }

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}

    return updated;
  }

  async deleteJobEntry(id: string, userId: string): Promise<void> {
    const existing = await this.jobTrackerRepository.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundError("Job entry not found");
    }

    await this.jobTrackerRepository.softDelete(id, userId);
    await this.cancelReminder(id);

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}
  }

  /**
   * Helper to schedule or reschedule a BullMQ delayed reminder
   */
  private async scheduleReminder(
    userId: string,
    jobEntryId: string,
    company: string,
    role: string,
    deadline: Date
  ): Promise<void> {
    if (!reminderQueue) {
      logger.warn("[Job Tracker Service] BullMQ reminderQueue is not initialized. Skipping reminder scheduling.");
      return;
    }

    const jobId = `reminder-job-${jobEntryId}`;
    
    // Remove existing if any
    try {
      await reminderQueue.remove(jobId);
    } catch (e) {}

    const now = Date.now();
    const deadlineTime = deadline.getTime();

    // Trigger alert 24 hours before deadline
    let triggerTime = deadlineTime - 24 * 60 * 60 * 1000;

    // If deadline is closer than 24 hours, schedule reminder to fire in 15 seconds for testing
    if (triggerTime <= now) {
      triggerTime = now + 15000; // 15 seconds
      if (triggerTime > deadlineTime) {
        // Deadline is in the past or immediately expiring. Skip scheduling.
        return;
      }
    }

    const delay = triggerTime - now;
    logger.info(`[Job Tracker Service] Scheduling deadline reminder for Job ${jobEntryId} in ${delay}ms`);

    await reminderQueue.add(
      "deadline-alert",
      {
        jobEntryId,
        userId,
        company,
        role,
        deadline: deadline.toISOString()
      },
      {
        jobId,
        delay,
        removeOnComplete: true,
        removeOnFail: true
      }
    );
  }

  /**
   * Helper to cancel a BullMQ reminder
   */
  private async cancelReminder(jobEntryId: string): Promise<void> {
    if (!reminderQueue) return;
    const jobId = `reminder-job-${jobEntryId}`;
    try {
      await reminderQueue.remove(jobId);
      logger.info(`[Job Tracker Service] Cancelled deadline reminder for Job ${jobEntryId}`);
    } catch (e) {
      logger.error(`[Job Tracker Service] Failed to cancel reminder for Job ${jobEntryId}: ${(e as any).message}`);
    }
  }

  /**
   * Discovers and searches live job postings from LinkedIn, Indeed, Glassdoor using AI Gateway.
   */
  async searchLiveJobs(
    userId: string,
    params: {
      role: string;
      city?: string;
      country?: string;
      locationPriority?: "city" | "country" | "remote";
    }
  ) {
    let defaultCity = params.city;
    let defaultCountry = params.country;

    if (!defaultCity || !defaultCountry) {
      try {
        const userProfile = await this.prisma.userProfile.findUnique({
          where: { userId }
        });
        if (userProfile?.location) {
          const parts = userProfile.location.split(",").map((s) => s.trim());
          if (!defaultCity && parts[0]) defaultCity = parts[0];
          if (!defaultCountry && parts[1]) defaultCountry = parts[1];
        }
      } catch (e) {}
    }

    const { AiGatewayService } = await import("../ai-gateway/ai-gateway.service.js");
    const aiGateway = new AiGatewayService();

    return await aiGateway.searchLiveJobs({
      role: params.role || "Software Engineer",
      city: defaultCity || "Kolkata",
      country: defaultCountry || "India",
      locationPriority: params.locationPriority || "city"
    });
  }
}
