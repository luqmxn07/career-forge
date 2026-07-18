import { z } from "zod";

export const startSessionSchema = z.object({
  type: z.enum(["HR", "Technical", "Behavioral", "Resume", "JD"]),
  difficulty: z.enum(["Entry", "Mid", "Senior"]),
  questionCount: z.number().int().min(1).max(10).default(5),
  sourceResumeId: z.string().uuid("Invalid resume ID format").optional(),
  jobDescriptionText: z.string().min(50, "Job description must be at least 50 characters").optional()
});

export type StartSessionDto = z.infer<typeof startSessionSchema>;

export const submitAnswerSchema = z.object({
  answerText: z.string().min(5, "Answer must be at least 5 characters long")
});

export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>;
