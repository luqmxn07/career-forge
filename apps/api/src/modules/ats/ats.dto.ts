import { z } from "zod";

export const scanResumeSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID format"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long")
});

export type ScanResumeDto = z.infer<typeof scanResumeSchema>;
