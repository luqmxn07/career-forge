import { Request, Response, NextFunction } from "express";
import { InterviewsService } from "./interviews.service.js";

export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  start = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { type, difficulty, questionCount, sourceResumeId, jobDescriptionText } = req.body;

      const result = await this.interviewsService.startSession(userId, {
        type,
        difficulty,
        questionCount,
        sourceResumeId,
        jobDescriptionText
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { answerText } = req.body;

      const result = await this.interviewsService.submitAnswer(userId, id, answerText);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getSessionDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = await this.interviewsService.getSessionDetail(userId, id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.interviewsService.getSessionsByUser(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
