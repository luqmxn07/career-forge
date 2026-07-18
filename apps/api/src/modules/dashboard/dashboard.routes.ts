import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const createDashboardRouter = (dashboardController: DashboardController): Router => {
  const router = Router();

  router.use(authMiddleware);
  router.get("/stats", dashboardController.getStats);

  return router;
};
