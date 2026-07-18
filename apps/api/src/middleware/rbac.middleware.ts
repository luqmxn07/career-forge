import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { AuthorizationError } from "../errors/index.js";

// Basic role mapping. If we need granular permissions later, this is where we check them.
export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError("Authentication context missing"));
    }

    const { role } = req.user;

    // Check if the user's role is in the allowed list
    if (!allowedRoles.includes(role)) {
      return next(new AuthorizationError("Forbidden: You do not have permission to perform this action"));
    }

    next();
  };
};
