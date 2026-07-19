import { z } from "zod";

export const scanResumeSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID format"),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters long"),
  jobRole: z.string().optional(),
  role: z.string().optional()
});

export type ScanResumeDto = z.infer<typeof scanResumeSchema>;
