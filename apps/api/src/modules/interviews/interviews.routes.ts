import { Router } from "express";
import { InterviewsController } from "./interviews.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { startSessionSchema, submitAnswerSchema } from "./interviews.dto.js";

export const createInterviewsRouter = (interviewsController: InterviewsController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.post("/sessions", validate({ body: startSessionSchema }), interviewsController.start);
  router.post("/sessions/:id/answers", validate({ body: submitAnswerSchema }), interviewsController.submitAnswer);
  router.get("/sessions/:id", interviewsController.getSessionDetail);
  router.get("/sessions", interviewsController.getSessions);

  return router;
};
