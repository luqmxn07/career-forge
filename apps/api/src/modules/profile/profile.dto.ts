import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  phoneNumber: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  age: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  avatarUrl: z.string().url("Invalid avatar URL").nullable().optional()
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().nullable().optional(),
  board: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  marks: z.string().nullable().optional(),
  yearOfPassing: z.string().nullable().optional(),
  cityState: z.string().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().default(false),
  gpa: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Job title is required"),
  location: z.string().nullable().optional(),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional()
}).refine((data) => {
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date is required if not current, and must be after start date",
  path: ["endDate"]
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().nullable().optional(), // Technical, Soft, Tools
  level: z.string().nullable().optional() // Beginner, Intermediate, Expert
});

export const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  proficiency: z.string().min(1, "Proficiency level is required")
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Invalid platform URL")
});

export const updateEducationSchema = z.object({
  institution: z.string().min(1, "Institution cannot be empty").optional(),
  degree: z.string().min(1, "Degree cannot be empty").optional(),
  fieldOfStudy: z.string().nullable().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().optional(),
  gpa: z.string().nullable().optional(),
  description: z.string().nullable().optional()
});

export const updateExperienceSchema = z.object({
  company: z.string().min(1, "Company cannot be empty").optional(),
  title: z.string().min(1, "Job title cannot be empty").optional(),
  location: z.string().nullable().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().nullable().optional()
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type EducationDto = z.infer<typeof educationSchema>;
export type ExperienceDto = z.infer<typeof experienceSchema>;
export type UpdateEducationDto = z.infer<typeof updateEducationSchema>;
export type UpdateExperienceDto = z.infer<typeof updateExperienceSchema>;
export type SkillDto = z.infer<typeof skillSchema>;
export type LanguageDto = z.infer<typeof languageSchema>;
export type SocialLinkDto = z.infer<typeof socialLinkSchema>;
