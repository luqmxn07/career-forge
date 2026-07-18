import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { ResumeService } from "./resume.service.js";
import { ApiResponse } from "@careerforge/shared-types";

export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  /**
   * Retrieves all active resumes for the authenticated user.
   */
  public getResumes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const resumes = await this.resumeService.getResumesForUser(userId);
      const response: ApiResponse<typeof resumes> = {
        success: true,
        data: resumes
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves details for a specific resume.
   */
  public getResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const resume = await this.resumeService.getResumeById(id, userId);
      const response: ApiResponse<typeof resume> = {
        success: true,
        data: resume
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new resume.
   */
  public createResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const resume = await this.resumeService.createResume(userId, req.body);
      const response: ApiResponse<typeof resume> = {
        success: true,
        data: resume
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates fields of a resume.
   */
  public updateResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { changeSummary, ...updateData } = req.body;
      const resume = await this.resumeService.updateResume(id, userId, updateData, changeSummary);
      const response: ApiResponse<typeof resume> = {
        success: true,
        data: resume
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicates an existing resume.
   */
  public duplicateResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { title } = req.body;
      const resume = await this.resumeService.duplicateResume(id, userId, title);
      const response: ApiResponse<typeof resume> = {
        success: true,
        data: resume
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Soft deletes a resume.
   */
  public deleteResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await this.resumeService.deleteResume(id, userId);
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: "Resume soft-deleted successfully" }
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves all available templates.
   */
  public getTemplates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await this.resumeService.getTemplates();
      const response: ApiResponse<typeof templates> = {
        success: true,
        data: templates
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enqueues a resume export task.
   */
  public exportResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const jobId = await this.resumeService.exportResume(id, userId, req.body);
      const response: ApiResponse<{ jobId: string }> = {
        success: true,
        data: { jobId }
      };
      res.status(202).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Polls the status of an export job.
   */
  public getExportStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const status = await this.resumeService.getExportStatus(jobId);
      const response: ApiResponse<typeof status> = {
        success: true,
        data: status
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
