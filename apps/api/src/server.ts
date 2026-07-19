import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { container } from "./config/di-container.js";
import { pdfWorker } from "./modules/pdf/pdf.worker.js";
import { reminderWorker } from "./modules/job-tracker/reminder.worker.js";
import { defaultTemplates } from "./prisma/seed.js";

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 CareerForge Server started in ${env.NODE_ENV} mode on port ${env.PORT}`);
  
  // Auto-migrate missing PostgreSQL columns & seed templates on startup
  try {
    const prisma = container.prisma;

    // Run safe ALTER TABLE queries to ensure education_entries columns exist in production DB
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "education_entries" ADD COLUMN IF NOT EXISTS "board" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "education_entries" ADD COLUMN IF NOT EXISTS "level" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "education_entries" ADD COLUMN IF NOT EXISTS "marks" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "education_entries" ADD COLUMN IF NOT EXISTS "year_of_passing" TEXT;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "education_entries" ADD COLUMN IF NOT EXISTS "city_state" TEXT;`);
      logger.info("✅ Database schema column verification complete.");
    } catch (dbErr) {
      logger.warn("⚠️ Database column verification skipped/handled:", dbErr);
    }

    const count = await prisma.template.count();
    if (count === 0) {
      logger.info("🌱 Seeding database templates on startup...");
      for (const t of defaultTemplates) {
        await prisma.template.upsert({
          where: { id: t.id },
          update: t,
          create: t
        });
      }
      logger.info("✅ Database templates seeded successfully!");
    }
  } catch (err) {
    logger.error("❌ Failed to auto-seed database templates on startup:", err);
  }
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info("Express server closed.");
    
    try {
      if (pdfWorker) {
        await pdfWorker.close();
        logger.info("BullMQ PDF worker shut down cleanly.");
      }
      if (reminderWorker) {
        await reminderWorker.close();
        logger.info("BullMQ Reminder worker shut down cleanly.");
      }
      await container.prisma.$disconnect();
      logger.info("Database connection disconnected cleanly.");
      process.exit(0);
    } catch (err) {
      logger.error("Error disconnecting database during shutdown:", err);
      process.exit(1);
    }
  });

  // Timeout force exit after 10s
  setTimeout(() => {
    logger.error("Force exit triggered after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
  // Sentry tracking can go here
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // Sentry tracking can go here
  process.exit(1);
});
