import { Worker } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { container } from "../../config/di-container.js";

let reminderWorker: Worker | null = null;

try {
  reminderWorker = new Worker(
    "reminder.queue",
    async (job) => {
      const { jobEntryId, userId, company, role, deadline } = job.data;
      
      const deadlineStr = new Date(deadline).toLocaleString();
      logger.warn(
        `[REMINDER SERVICE ALERT] User ID: ${userId} | Job Entry: ${jobEntryId} | ` +
        `Reminder: Your application for "${role}" at "${company}" is approaching its deadline of ${deadlineStr}!`
      );

      // Create in-app notification
      try {
        await container.notificationsService.createNotification(
          userId,
          "Job Application Deadline",
          `Your application for "${role}" at "${company}" is approaching its deadline of ${deadlineStr}!`,
          "WARNING"
        );
      } catch (notifierErr) {
        logger.error(`Failed to trigger notification on Job Deadline reminder: ${(notifierErr as any).message}`);
      }
    },
    {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null
      }
    }
  );

  reminderWorker.on("completed", (job) => {
    logger.info(`[Reminder Worker] Successfully processed job ${job.id}`);
  });

  reminderWorker.on("failed", (job, err) => {
    logger.error(`[Reminder Worker] Failed job ${job?.id}: ${err.message}`);
  });
} catch (error) {
  logger.error("Failed to initialize BullMQ Reminder Worker:", error);
}

export { reminderWorker };
