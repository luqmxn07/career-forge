import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  age: z.union([z.string(), z.number()]).optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  device: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
});

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const verifyMfaSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 digits")
});

export type VerifyMfaDto = z.infer<typeof verifyMfaSchema>;

