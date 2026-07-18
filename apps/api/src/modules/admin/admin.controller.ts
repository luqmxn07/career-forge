import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service.js";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = (req as any).user.userId;
      const stats = await this.adminService.getAnalyticsSummary(adminUserId);
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = (req as any).user.userId;
      const logs = await this.adminService.getPlatformAuditLogs(adminUserId);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  };

  getFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = (req as any).user.userId;
      const tickets = await this.adminService.getFeedbackTickets(adminUserId);
      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  };

  resolveTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = (req as any).user.userId;
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.adminService.resolveFeedbackTicket(adminUserId, id, status);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  adjustCredits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminUserId = (req as any).user.userId;
      const { userId, amount, reason } = req.body;
      const result = await this.adminService.adjustUserCredits(
        adminUserId,
        userId,
        amount,
        reason
      );
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
