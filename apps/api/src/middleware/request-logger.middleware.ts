import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { logger, loggerStorage, LogContext } from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.header("x-correlation-id") || crypto.randomUUID()) as string;
  res.setHeader("x-correlation-id", correlationId);

  const context: LogContext = { correlationId };

  // Store user info if already authenticated (attached by auth middleware downstream)
  if ((req as any).user?.id) {
    context.userId = (req as any).user.id;
  }

  loggerStorage.run(context, () => {
    const startTime = Date.now();
    
    // Log request arrival
    logger.info(`${req.method} ${req.originalUrl} - started`, {
      ip: req.ip,
      userAgent: req.get("user-agent")
    });

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info(`${req.method} ${req.originalUrl} - finished - ${res.statusCode} ${duration}ms`, {
        statusCode: res.statusCode,
        durationMs: duration
      });
    });

    next();
  });
};
