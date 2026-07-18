import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { env } from "../../config/env.js";

const COOKIE_NAME = "cf_refresh_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, fullName, phoneNumber, location, age } = req.body;
      const result = await this.authService.register({
        email,
        passwordRaw: password,
        fullName,
        phoneNumber,
        location,
        age
      });
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.get("user-agent") || "unknown";
      const { accessToken, refreshToken, expiresIn } = await this.authService.login({
        email: req.body.email,
        passwordRaw: req.body.password,
        device: userAgent
      });

      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;
      const userAgent = req.get("user-agent") || "unknown";

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
        await this.authService.refresh(refreshToken, userAgent);

      res.cookie(COOKIE_NAME, newRefreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies[COOKIE_NAME] || req.body.refreshToken;
      
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      const { maxAge, ...clearOptions } = getCookieOptions();
      res.clearCookie(COOKIE_NAME, clearOptions);

      res.status(200).json({
        success: true,
        data: { message: "Logged out successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      await this.authService.logoutAllDevices(userId);

      const { maxAge, ...clearOptions } = getCookieOptions();
      res.clearCookie(COOKIE_NAME, clearOptions);

      res.status(200).json({
        success: true,
        data: { message: "Logged out from all devices successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        data: { message: "If the email is registered, a password reset link has been sent." }
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.resetPassword({
        token: req.body.token,
        newPasswordRaw: req.body.password
      });
      res.status(200).json({
        success: true,
        data: { message: "Password reset successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  verifyMfa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const userAgent = req.get("user-agent") || "unknown";
      
      const { accessToken, refreshToken, expiresIn } = await this.authService.verifyMfaCode(
        userId,
        req.body.code,
        userAgent
      );

      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
