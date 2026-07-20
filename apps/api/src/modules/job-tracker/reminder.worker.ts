import { Worker } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { container } from "../../config/di-container.js";
import { sendEmailNotification } from "../../utils/email.js";

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

      // Send Email Notification
      try {
        const user = await container.prisma.user.findUnique({ where: { id: userId } });
        if (user && user.email) {
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-top: 0;">⚡ CareerForge Deadline Alert</h2>
              <p style="font-size: 16px; color: #e2e8f0;">
                Your application for <strong>${role}</strong> at <strong>${company}</strong> is approaching its deadline!
              </p>
              <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0; color: #fbbf24; font-weight: bold;">Application Deadline:</p>
                <p style="margin: 4px 0 0 0; color: #ffffff; font-size: 18px;">${deadlineStr}</p>
              </div>
              <p style="font-size: 14px; color: #94a3b8;">
                Log into CareerForge to tailor your resume, review your interview prep, or update your application stage.
              </p>
              <footer style="margin-top: 24px; border-top: 1px solid #334155; pt: 16px; font-size: 12px; color: #64748b;">
                Sent automatically by CareerForge Career Accelerator.
              </footer>
            </div>
          `;

          await sendEmailNotification({
            to: user.email,
            subject: `⏰ Reminder: Application for ${role} at ${company} Deadline Approaching!`,
            html: htmlContent,
          });
        }
      } catch (emailErr) {
        logger.error(`Failed to send email notification for job reminder: ${(emailErr as any).message}`);
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
