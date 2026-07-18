import { z } from "zod";

export const createResumeSchema = z.object({
  templateId: z.string().uuid("Invalid template ID"),
  title: z.string().min(1, "Resume title is required").max(100, "Title is too long"),
  themeSettings: z.record(z.any()).default({
    primaryColor: "#0284c7",
    textColor: "#1f2937",
    fontSize: "10pt",
    fontFamily: "Inter",
    spacing: "normal"
  }),
  content: z.record(z.any()).default({
    personalInfo: {},
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: []
  })
});

export const updateResumeSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100).optional(),
  templateId: z.string().uuid("Invalid template ID").optional(),
  themeSettings: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
  isLocked: z.boolean().optional()
});

export const duplicateResumeSchema = z.object({
  title: z.string().min(1, "Duplicated resume title is required").max(100)
});

export type CreateResumeDto = z.infer<typeof createResumeSchema>;
export type UpdateResumeDto = z.infer<typeof updateResumeSchema>;
export type DuplicateResumeDto = z.infer<typeof duplicateResumeSchema>;
