import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.dashboardService.getDashboardStats(userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
