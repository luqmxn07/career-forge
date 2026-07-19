import { Request, Response, NextFunction } from "express";
import { JobTrackerService } from "./job-tracker.service.js";

export class JobTrackerController {
  constructor(private readonly jobTrackerService: JobTrackerService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.jobTrackerService.createJobEntry(userId, req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await this.jobTrackerService.getJobEntries(userId);
      res.status(200).json({
        success: true,
        data: result
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
      const result = await this.jobTrackerService.updateJobEntry(id, userId, req.body);
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
}
