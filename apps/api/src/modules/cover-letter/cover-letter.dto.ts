import { z } from "zod";

export const createCoverLetterSchema = z.object({
  resumeId: z.string().optional(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters long"),
  company: z.string().optional().default("Target Company"),
  role: z.string().optional().default("Target Role"),
  tone: z.string().default("Professional")
});

export type CreateCoverLetterDto = z.infer<typeof createCoverLetterSchema>;
