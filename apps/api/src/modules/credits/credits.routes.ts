import { Router } from "express";
import { CreditsController } from "./credits.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const createCreditsRouter = (creditsController: CreditsController): Router => {
  const router = Router();

  // Apply authMiddleware to all routes
  router.use(authMiddleware);

  router.get("/balance", creditsController.getBalance);
  router.get("/history", creditsController.getHistory);

  return router;
};
