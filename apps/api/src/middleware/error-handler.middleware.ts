import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/index.js";
import { logger, loggerStorage } from "../utils/logger.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const context = loggerStorage.getStore() || {};
  const correlationId = context.correlationId || "unknown";

  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let message = "An unexpected error occurred. Please contact support.";
  let details: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else if (err.name === "ZodError") {
    // If Zod validation errors make it through
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = (err as any).errors || (err as any).issues;
  }

  // Log error with complete metadata and stack trace (in server logs only)
  logger.error(`${req.method} ${req.originalUrl} - error: ${err.message}`, {
    stack: err.stack,
    statusCode,
    errorCode,
    details,
    correlationId
  });

  // TODO: Add Sentry reporting here for 500 errors

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      correlationId,
      ...(details ? { details } : {})
    }
  });
};
