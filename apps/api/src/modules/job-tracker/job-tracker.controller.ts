import { Request, Response, NextFunction } from "express";
import { JobTrackerService } from "./job-tracker.service.js";

export class JobTrackerController {
  constructor(private readonly jobTrackerService: JobTrackerService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const payload = {
        ...req.body,
        role: req.body.role || req.body.position || "Software Engineer",
        stage: typeof req.body.stage === "string" ? req.body.stage.toUpperCase() : "WISHLIST",
      };
      const result = await this.jobTrackerService.createJobEntry(userId, payload);
      const responseData = {
        ...result,
        position: result.role,
        stage: result.stage.toLowerCase(),
      };
      res.status(201).json({
        success: true,
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  };

  getEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.jobTrackerService.getJobEntries(userId);
      const mapped = result.map((entry) => ({
        ...entry,
        position: entry.role,
        stage: entry.stage.toLowerCase(),
      }));
      res.status(200).json({
        success: true,
        data: mapped
      });
    } catch (error) {
      next(error);
    }
  };

  getEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const result = await this.jobTrackerService.getJobEntry(id, userId);
      res.status(200).json({
        success: true,
        data: {
          ...result,
          position: result.role,
          stage: result.stage.toLowerCase(),
        }
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const payload = {
        ...req.body,
        role: req.body.role || req.body.position,
        stage: req.body.stage ? (req.body.stage as string).toUpperCase() : undefined,
      };
      const result = await this.jobTrackerService.updateJobEntry(id, userId, payload);
      res.status(200).json({
        success: true,
        data: {
          ...result,
          position: result.role,
          stage: result.stage.toLowerCase(),
        }
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      await this.jobTrackerService.deleteJobEntry(id, userId);
      res.status(200).json({
        success: true,
        data: { message: "Job tracker entry soft-deleted successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  searchLiveJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { role, city, country, locationPriority } = req.body;
      const jobs = await this.jobTrackerService.searchLiveJobs(userId, {
        role,
        city,
        country,
        locationPriority
      });
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      next(error);
    }
  };

  notifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      await this.jobTrackerService.sendJobEmailSummary(id, userId);
      res.status(200).json({
        success: true,
        data: { message: "Job summary email sent successfully" }
      });
    } catch (error) {
      next(error);
    }
  };
}
