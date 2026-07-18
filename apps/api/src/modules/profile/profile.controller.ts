import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { ProfileService } from "./profile.service.js";

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.getProfile(userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Education CRUD
  addEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.addEducation(userId, req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await this.profileService.updateEducation(userId, id, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await this.profileService.deleteEducation(userId, id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reorderEducation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { ids } = req.body;
      await this.profileService.reorderEducation(userId, ids);
      res.status(200).json({
        success: true,
        data: { message: "Education reordered successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  // Experience CRUD
  addExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.addExperience(userId, req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  updateExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await this.profileService.updateExperience(userId, id, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await this.profileService.deleteExperience(userId, id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reorderExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { ids } = req.body;
      await this.profileService.reorderExperience(userId, ids);
      res.status(200).json({
        success: true,
        data: { message: "Experience reordered successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  // Skills
  upsertSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.upsertSkill(userId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name } = req.params;
      const result = await this.profileService.deleteSkill(userId, name);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Languages
  upsertLanguage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.upsertLanguage(userId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLanguage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name } = req.params;
      const result = await this.profileService.deleteLanguage(userId, name);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Social Links
  upsertSocialLink = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await this.profileService.upsertSocialLink(userId, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSocialLink = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { platform } = req.params;
      const result = await this.profileService.deleteSocialLink(userId, platform);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
