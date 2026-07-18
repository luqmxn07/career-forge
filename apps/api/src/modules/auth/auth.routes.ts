import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyMfaSchema
} from "./auth.dto.js";

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post("/signup", validate({ body: signupSchema }), authController.signup);
  router.post("/login", validate({ body: loginSchema }), authController.login);
  router.post("/refresh", authController.refresh);
  router.post("/logout", authController.logout);
  router.post("/forgot-password", validate({ body: forgotPasswordSchema }), authController.forgotPassword);
  router.post("/reset-password", validate({ body: resetPasswordSchema }), authController.resetPassword);

  // Session MFA validation (requires standard auth token first)
  router.post("/mfa/verify", authMiddleware, validate({ body: verifyMfaSchema }), authController.verifyMfa);

  // Protected route: Logout from all devices
  router.post("/logout-all", authMiddleware, authController.logoutAll);

  return router;
};
