import { Router } from "express";
import { ResumeController } from "./resume.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createResumeSchema,
  updateResumeSchema,
  duplicateResumeSchema
} from "./resume.dto.js";

export const createResumeRouter = (resumeController: ResumeController): Router => {
  const router = Router();

  // All resume endpoints are protected by authMiddleware
  router.use(authMiddleware);

  router.get("/", resumeController.getResumes);
  router.get("/templates", resumeController.getTemplates);
  router.get("/:id", resumeController.getResume);
  router.post("/", validate({ body: createResumeSchema }), resumeController.createResume);
  router.patch("/:id", validate({ body: updateResumeSchema }), resumeController.updateResume);
  router.post("/:id/duplicate", validate({ body: duplicateResumeSchema }), resumeController.duplicateResume);
  router.delete("/:id", resumeController.deleteResume);
  router.post("/:id/export", resumeController.exportResume);
  router.get("/:id/export/:jobId", resumeController.getExportStatus);

  return router;
};
