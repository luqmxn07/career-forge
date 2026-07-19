import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  updateProfileSchema,
  educationSchema,
  experienceSchema,
  updateEducationSchema,
  updateExperienceSchema,
  skillSchema,
  languageSchema,
  socialLinkSchema
} from "./profile.dto.js";

export const createProfileRouter = (profileController: ProfileController): Router => {
  const router = Router();

  // All profile endpoints are protected by authMiddleware
  router.use(authMiddleware);

  router.get("/", profileController.getProfile);
  router.patch("/", validate({ body: updateProfileSchema }), profileController.updateProfile);
  router.put("/", validate({ body: updateProfileSchema }), profileController.updateProfile);

  // Education routes
  router.post("/education", validate({ body: educationSchema }), profileController.addEducation);
  router.put("/education/:id", validate({ body: updateEducationSchema }), profileController.updateEducation);
  router.delete("/education/:id", profileController.deleteEducation);
  router.post("/education/reorder", profileController.reorderEducation);

  // Experience routes
  router.post("/experience", validate({ body: experienceSchema }), profileController.addExperience);
  router.put("/experience/:id", validate({ body: updateExperienceSchema }), profileController.updateExperience);
  router.delete("/experience/:id", profileController.deleteExperience);
  router.post("/experience/reorder", profileController.reorderExperience);

  // Skills routes
  router.post("/skills", validate({ body: skillSchema }), profileController.upsertSkill);
  router.delete("/skills/:name", profileController.deleteSkill);

  // Languages routes
  router.post("/languages", validate({ body: languageSchema }), profileController.upsertLanguage);
  router.delete("/languages/:name", profileController.deleteLanguage);

  // Social Links routes
  router.post("/social-links", validate({ body: socialLinkSchema }), profileController.upsertSocialLink);
  router.delete("/social-links/:platform", profileController.deleteSocialLink);

  return router;
};
