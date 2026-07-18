import { z } from "zod";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export enum AuthProvider {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE"
}

export enum PlanTier {
  FREE = "FREE",
  PREMIUM = "PREMIUM"
}

export enum JobStage {
  WISHLIST = "WISHLIST",
  APPLIED = "APPLIED",
  OA = "OA",
  INTERVIEW = "INTERVIEW",
  HR_ROUND = "HR_ROUND",
  OFFER = "OFFER",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED"
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  emailVerified: z.boolean(),
  createdAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// API Standard Response Envelope
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: any;
}

// API Standard Error Envelope
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    correlationId: string;
    details?: any;
  };
}

// ATS Scan Schema & Types
export const AtsScanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  resumeId: z.string().uuid(),
  jobDescriptionHash: z.string(),
  jobDescriptionText: z.string(),
  overallScore: z.number().int().min(0).max(100),
  subScores: z.object({
    keywords: z.number().int().min(0).max(100),
    formatting: z.number().int().min(0).max(100)
  }),
  missingKeywords: z.array(z.string()),
  formattingIssues: z.array(z.object({
    category: z.string(),
    issue: z.string(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
    suggestion: z.string()
  })),
  feedback: z.string(),
  createdAt: z.date()
});

export type AtsScan = z.infer<typeof AtsScanSchema>;

// Cover Letter Schema & Types
export const CoverLetterSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  company: z.string(),
  role: z.string(),
  jobDescriptionText: z.string().nullable().optional(),
  tone: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional()
});

export type CoverLetter = z.infer<typeof CoverLetterSchema>;

