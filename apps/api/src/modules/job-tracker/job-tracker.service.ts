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
      return;
    }

    await this.jobTrackerRepository.softDelete(id, userId);
    await this.cancelReminder(id);

    try {
      const { container } = await import("../../config/di-container.js");
      await container.dashboardService.invalidateDashboardCache(userId);
    } catch (e) {}
  }

  async sendJobEmailSummary(id: string, userId: string): Promise<boolean> {
    const entry = await this.jobTrackerRepository.findById(id);
    if (!entry || entry.userId !== userId) {
      throw new NotFoundError("Job tracker entry not found");
    }

    const { container } = await import("../../config/di-container.js");
    const user = await container.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      throw new NotFoundError("User email not found");
    }

    const { sendEmailNotification } = await import("../../utils/email.js");

    const deadlineStr = entry.deadline ? new Date(entry.deadline).toLocaleDateString() : "No deadline specified";

    const tagsList = Array.isArray(entry.tags) ? (entry.tags as string[]) : [];
    const urlTag = tagsList.find((t: string) => typeof t === "string" && t.startsWith("URL:"));
    const jobUrl = urlTag ? urlTag.replace(/^URL:/, "") : undefined;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <h2 style="color: #38bdf8; margin-top: 0;">💼 Tracked Job Summary — CareerForge</h2>
        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
          <h3 style="margin: 0; color: #ffffff; font-size: 20px;">${entry.role}</h3>
          <p style="margin: 4px 0 12px 0; color: #94a3b8; font-size: 14px;"><strong>Company:</strong> ${entry.company}</p>
          <p style="margin: 4px 0; color: #cbd5e1; font-size: 14px;"><strong>Application Stage:</strong> <span style="color: #38bdf8; font-weight: bold;">${entry.stage}</span></p>
          <p style="margin: 4px 0; color: #cbd5e1; font-size: 14px;"><strong>Deadline:</strong> ${deadlineStr}</p>
          ${jobUrl ? `<p style="margin: 8px 0 0 0;"><a href="${jobUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">View Job Posting →</a></p>` : ""}
        </div>
        ${entry.notes ? `<div style="margin-top: 16px; background-color: #1e293b; padding: 12px; border-radius: 6px;"><p style="margin: 0; color: #94a3b8; font-size: 12px;"><strong>Notes:</strong></p><p style="margin: 4px 0 0 0; color: #e2e8f0; font-size: 14px;">${entry.notes}</p></div>` : ""}
        <footer style="margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b;">
          Sent from your CareerForge Application Tracker dashboard.
        </footer>
      </div>
    `;

    return sendEmailNotification({
      to: user.email,
      subject: `📋 Tracked Job Details: ${entry.role} at ${entry.company}`,
      html: htmlContent,
    });
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
