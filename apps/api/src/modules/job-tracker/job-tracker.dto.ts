import { z } from "zod";

export const jobStageEnum = z.enum([
  "WISHLIST",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED"
]);

export const createJobEntrySchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role title is required"),
  stage: jobStageEnum.default("WISHLIST"),
  linkedResumeVersionId: z.string().uuid("Invalid resume version format").optional(),
  linkedCoverLetterId: z.string().uuid("Invalid cover letter format").optional(),
  notes: z.string().optional(),
  deadline: z.string().datetime({ message: "Invalid date format for deadline" }).optional(),
  tags: z.array(z.string()).optional()
});

export type CreateJobEntryDto = z.infer<typeof createJobEntrySchema>;

export const updateJobEntrySchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  stage: jobStageEnum.optional(),
  linkedResumeVersionId: z.string().uuid().nullable().optional(),
  linkedCoverLetterId: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
  deadline: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional()
});

export type UpdateJobEntryDto = z.infer<typeof updateJobEntrySchema>;
