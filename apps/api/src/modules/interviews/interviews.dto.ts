import { z } from "zod";

export const startSessionSchema = z.object({
  type: z.enum(["HR", "Technical", "Behavioral", "Resume", "JD"]).default("JD"),
  difficulty: z.enum(["Entry", "Mid", "Senior"]).default("Mid"),
  questionCount: z.number().int().min(1).max(10).default(5),
  sourceResumeId: z.string().optional(),
  resumeId: z.string().optional(),
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  jobDescriptionText: z.string().optional()
});

export type StartSessionDto = z.infer<typeof startSessionSchema>;

export const submitAnswerSchema = z.object({
  answerText: z.string().min(5, "Answer must be at least 5 characters long")
});

export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
