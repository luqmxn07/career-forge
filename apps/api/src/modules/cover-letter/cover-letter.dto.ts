import { z } from "zod";

export const createCoverLetterSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID format").optional(),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long"),
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job role is required"),
  tone: z.string().default("Professional")
});

export type CreateCoverLetterDto = z.infer<typeof createCoverLetterSchema>;
