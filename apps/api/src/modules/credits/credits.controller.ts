import { Request, Response, NextFunction } from "express";
import { CreditsService } from "./credits.service.js";

export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const balance = await this.creditsService.getBalance(userId);
      res.status(200).json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await this.creditsService.getHistory(userId, limit);
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  };
}
