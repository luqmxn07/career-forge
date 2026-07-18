import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthenticationError } from "../errors/index.js";
import { loggerStorage } from "../utils/logger.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AuthenticationError("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: string;
    };

    req.user = decoded;

    // Dynamically update the async logger storage context with the authenticated user ID
    const context = loggerStorage.getStore();
    if (context) {
      context.userId = decoded.userId;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AuthenticationError("Access token expired"));
    }
    return next(new AuthenticationError("Invalid access token"));
  }
};

export const adminMfaMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AuthenticationError("Unauthorized"));
  }

  if (req.user.role === "ADMIN") {
    const decoded = req.user as any;
    if (!decoded.mfaVerified) {
      return next(new AuthenticationError("MFA not completed this session"));
    }
  }

  next();
};

