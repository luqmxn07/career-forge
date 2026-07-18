import { z } from "zod";

export const adjustCreditsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  amount: z.number().int("Amount must be an integer"),
  reason: z.string().min(5, "Reason must be at least 5 characters long")
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
});

export type AdjustCreditsDto = z.infer<typeof adjustCreditsSchema>;
export type UpdateFeedbackStatusDto = z.infer<typeof updateFeedbackStatusSchema>;
