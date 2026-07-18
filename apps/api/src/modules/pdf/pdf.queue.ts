import { Queue } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

let pdfQueue: Queue | null = null;

try {
  pdfQueue = new Queue("pdf.queue", {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null
    }
  });
  
  pdfQueue.on("error", (err) => {
    logger.error("BullMQ PDF Queue encountered a connection/runtime error:", err);
  });
} catch (error) {
  logger.error("Failed to initialize BullMQ PDF Queue:", error);
}

export { pdfQueue };
