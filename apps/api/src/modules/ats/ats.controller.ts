import { Request, Response, NextFunction } from "express";
import { AtsService } from "./ats.service.js";

export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  runScan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { resumeId, jobDescription, jobRole, role } = req.body;

      const scanResult = await this.atsService.scanResume(userId, resumeId, jobDescription, jobRole || role);
      
      res.status(201).json({
        success: true,
        data: scanResult
      });
    } catch (error) {
      next(error);
    }
  };

  getScan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const scan = await this.atsService.getScan(userId, id);
      
      res.status(200).json({
        success: true,
        data: scan
      });
    } catch (error) {
      next(error);
    }
  };

  deleteScan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      await this.atsService.deleteScan(userId, id);

      res.status(200).json({
        success: true,
        message: "ATS scan deleted"
      });
    } catch (error) {
      next(error);
    }
  };

  getScans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { resumeId } = req.query;

      let scans;
      if (resumeId) {
        scans = await this.atsService.getScansByResume(userId, resumeId as string);
      } else {
        scans = await this.atsService.getScansByUser(userId);
      }

      res.status(200).json({
        success: true,
        data: scans
      });
    } catch (error) {
      next(error);
    }
  };
}
