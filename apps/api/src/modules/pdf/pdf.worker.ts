import { Worker } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { PdfService } from "./pdf.service.js";
import { container } from "../../config/di-container.js";

let pdfWorker: Worker | null = null;

try {
  const pdfService = new PdfService();

  pdfWorker = new Worker(
    "pdf.queue",
    async (job) => {
      logger.info(`Starting BullMQ PDF worker job: ID ${job.id}`);
      const { htmlContent, filename } = job.data;
      
      if (!htmlContent || !filename) {
        throw new Error("Missing required htmlContent or filename in PDF job data");
      }
      
      const uploadResult = await pdfService.generateAndUploadPdf(htmlContent, filename);
      return uploadResult;
    },
    {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null
      }
    }
  );

  pdfWorker.on("completed", async (job) => {
    logger.info(`BullMQ PDF worker job: ID ${job.id} completed successfully`);
    const { userId, title } = job.data;
    if (userId) {
      try {
        await container.notificationsService.createNotification(
          userId,
          "Resume Export Completed",
          `Your resume "${title || "Resume"}" has been successfully generated and compiled to PDF.`,
          "SUCCESS"
        );
      } catch (err) {
        logger.error(`Failed to trigger notification on PDF complete: ${(err as any).message}`);
      }
    }
  });

  pdfWorker.on("failed", async (job, err) => {
    logger.error(`BullMQ PDF worker job: ID ${job?.id} failed:`, err);
    if (job) {
      const { userId, title } = job.data;
      if (userId) {
        try {
          await container.notificationsService.createNotification(
            userId,
            "Resume Export Failed",
            `We encountered an error rendering your resume "${title || "Resume"}" to PDF: ${err.message}`,
            "WARNING"
          );
        } catch (notifierErr) {
          logger.error(`Failed to trigger notification on PDF failure: ${(notifierErr as any).message}`);
        }
      }
    }
  });
} catch (error) {
  logger.error("Failed to initialize BullMQ PDF Worker:", error);
}

export { pdfWorker };
