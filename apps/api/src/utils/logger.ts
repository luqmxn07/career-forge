import { AsyncLocalStorage } from "node:async_hooks";
import winston from "winston";
import { env } from "../config/env.js";

export interface LogContext {
  correlationId?: string;
  userId?: string;
}

// Storage to hold correlation ID and current user context for logs
export const loggerStorage = new AsyncLocalStorage<LogContext>();

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  winston.format.printf((info) => {
    const logInfo = info as any;
    const context = (loggerStorage.getStore() || {}) as LogContext;
    const logData = {
      timestamp: logInfo.timestamp,
      level: logInfo.level,
      correlationId: context.correlationId || logInfo.correlationId,
      userId: context.userId || logInfo.userId || logInfo.metadata?.userId,
      message: logInfo.message,
      ...(Object.keys(logInfo.metadata || {}).length > 0 ? { context: logInfo.metadata } : {})
    };
    
    if (env.NODE_ENV !== "production") {
      // Colorized string format for local development console readability
      const color = info.level === "error" ? "\x1b[31m" : info.level === "warn" ? "\x1b[33m" : "\x1b[36m";
      const reset = "\x1b[0m";
      const trace = logData.correlationId ? `[Trace: ${logData.correlationId}] ` : "";
      const user = logData.userId ? `[User: ${logData.userId}] ` : "";
      const contextStr = logData.context ? ` ${JSON.stringify(logData.context)}` : "";
      return `${logData.timestamp} ${color}${logData.level.toUpperCase()}${reset}: ${trace}${user}${logData.message}${contextStr}`;
    }
    return JSON.stringify(logData);
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format,
  transports: [
    new winston.transports.Console()
  ]
});
