import { Queue } from "bullmq";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

let reminderQueue: Queue | null = null;

try {
  reminderQueue = new Queue("reminder.queue", {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null
    }
  });

  reminderQueue.on("error", (err) => {
    logger.error("BullMQ Reminder Queue encountered a connection/runtime error:", err);
  });
} catch (error) {
  logger.error("Failed to initialize BullMQ Reminder Queue:", error);
}

export { reminderQueue };
