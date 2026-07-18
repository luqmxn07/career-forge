import { z } from "zod";

export const updatePreferenceSchema = z.object({
  emailMarketingEnabled: z.boolean().optional(),
  emailSecurityEnabled: z.boolean().optional(),
  emailRemindersEnabled: z.boolean().optional(),
  inAppAiSuggestion: z.boolean().optional()
});

export type UpdatePreferenceDto = z.infer<typeof updatePreferenceSchema>;
