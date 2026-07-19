import { Router } from "express";
import { InterviewsController } from "./interviews.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { startSessionSchema, submitAnswerSchema } from "./interviews.dto.js";

export const createInterviewsRouter = (interviewsController: InterviewsController): Router => {
  const router = Router();

  router.use(authMiddleware);

  // Session routes
  router.get("/", interviewsController.getSessions);
  router.get("/sessions", interviewsController.getSessions);
  router.post("/", validate({ body: startSessionSchema }), interviewsController.start);
  router.post("/sessions", validate({ body: startSessionSchema }), interviewsController.start);

  // Detail & Answer routes
  router.get("/:id", interviewsController.getSessionDetail);
  router.get("/sessions/:id", interviewsController.getSessionDetail);
  router.post("/:id/answer", validate({ body: submitAnswerSchema }), interviewsController.submitAnswer);
  router.post("/:id/answers", validate({ body: submitAnswerSchema }), interviewsController.submitAnswer);
  router.post("/sessions/:id/answers", validate({ body: submitAnswerSchema }), interviewsController.submitAnswer);

  return router;
};
