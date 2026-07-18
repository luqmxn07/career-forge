export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly details: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: any = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthenticated") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT_ERROR");
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message: string = "Insufficient AI credits remaining") {
    super(message, 402, "INSUFFICIENT_CREDITS_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, details: any = null) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", details);
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
  }
}
