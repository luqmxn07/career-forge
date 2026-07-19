import { Router } from "express";
import { AtsController } from "./ats.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { scanResumeSchema } from "./ats.dto.js";

export const createAtsRouter = (atsController: AtsController): Router => {
  const router = Router();

  // Protect all routes with authMiddleware
  router.use(authMiddleware);

  router.post("/", validate({ body: scanResumeSchema }), atsController.runScan);
  router.get("/", atsController.getScans);
  router.get("/:id", atsController.getScan);
  router.delete("/:id", atsController.deleteScan);

  return router;
};
