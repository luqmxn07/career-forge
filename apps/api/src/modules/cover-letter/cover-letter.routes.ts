import { Router } from "express";
import { CoverLetterController } from "./cover-letter.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createCoverLetterSchema } from "./cover-letter.dto.js";

export const createCoverLetterRouter = (coverLetterController: CoverLetterController): Router => {
  const router = Router();

  // Protect all routes with authMiddleware
  router.use(authMiddleware);

  router.post("/", validate({ body: createCoverLetterSchema }), coverLetterController.generate);
  router.get("/", coverLetterController.getCoverLetters);
  router.get("/:id", coverLetterController.getCoverLetter);
  router.put("/:id", coverLetterController.update);
  router.delete("/:id", coverLetterController.delete);

  return router;
};
