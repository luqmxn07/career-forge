import { Request, Response, NextFunction } from "express";
import { NotificationsService } from "./notifications.service.js";

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.notificationsService.getNotificationsByUser(userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const result = await this.notificationsService.markNotificationAsRead(id, userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      await this.notificationsService.markAllNotificationsAsRead(userId);
      res.status(200).json({
        success: true,
        data: { message: "All notifications marked as read" }
      });
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.notificationsService.getPreferences(userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.notificationsService.updatePreferences(userId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
