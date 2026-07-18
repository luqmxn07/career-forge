import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createProfileRouter } from "./modules/profile/profile.routes.js";
import { createResumeRouter } from "./modules/resume/resume.routes.js";
import { createCreditsRouter } from "./modules/credits/credits.routes.js";
import { createAtsRouter } from "./modules/ats/ats.routes.js";
import { createCoverLetterRouter } from "./modules/cover-letter/cover-letter.routes.js";
import { createBillingRouter } from "./modules/billing/billing.routes.js";
import { createInterviewsRouter } from "./modules/interviews/interviews.routes.js";
import { createJobTrackerRouter } from "./modules/job-tracker/job-tracker.routes.js";
import { createNotificationsRouter } from "./modules/notifications/notifications.routes.js";
import { createDashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { createAdminRouter } from "./modules/admin/admin.routes.js";
import { container } from "./config/di-container.js";

const app = express();

// 1. Core security & parsing middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.use(express.json());
app.use(cookieParser());

// 2. Logging and tracing middleware (correlationId tracking)
app.use(requestLogger);

// 3. Health check endpoints (Liveness & Readiness)
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, status: "UP" });
});

app.get("/health/ready", async (req, res) => {
  try {
    // Check DB connection
    await container.prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, database: "CONNECTED" });
  } catch (error) {
    res.status(503).json({ success: false, database: "DISCONNECTED", error: (error as any).message });
  }
});

// 4. API Routes
app.use("/api/v1/auth", createAuthRouter(container.authController));
app.use("/api/v1/profile", createProfileRouter(container.profileController));
app.use("/api/v1/resume", createResumeRouter(container.resumeController));
app.use("/api/v1/credits", createCreditsRouter(container.creditsController));
app.use("/api/v1/ats", createAtsRouter(container.atsController));
app.use("/api/v1/cover-letters", createCoverLetterRouter(container.coverLetterController));
app.use("/api/v1/billing", createBillingRouter(container.billingController));
app.use("/api/v1/interviews", createInterviewsRouter(container.interviewsController));
app.use("/api/v1/job-tracker", createJobTrackerRouter(container.jobTrackerController));
app.use("/api/v1/notifications", createNotificationsRouter(container.notificationsController));
app.use("/api/v1/dashboard", createDashboardRouter(container.dashboardController));
app.use("/api/v1/admin", createAdminRouter(container.adminController));

// 5. Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;

