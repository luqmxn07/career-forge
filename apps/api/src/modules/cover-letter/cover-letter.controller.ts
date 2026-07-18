import { Request, Response, NextFunction } from "express";
import { CoverLetterService } from "./cover-letter.service.js";

export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  generate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { resumeId, jobDescription, company, role, tone } = req.body;

      const result = await this.coverLetterService.generateCoverLetter(userId, {
        resumeId,
        jobDescription,
        company,
        role,
        tone
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getCoverLetter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = await this.coverLetterService.getCoverLetter(userId, id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getCoverLetters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.coverLetterService.getCoverLettersByUser(userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { content } = req.body;

      const result = await this.coverLetterService.updateCoverLetter(userId, id, content);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      await this.coverLetterService.deleteCoverLetter(userId, id);
      res.status(200).json({
        success: true,
        data: { message: "Cover letter deleted successfully" }
      });
    } catch (error) {
      next(error);
    }
  };
}
