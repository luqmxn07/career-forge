import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { ValidationError } from "../errors/index.js";

export interface RequestValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: RequestValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to field-specific format
        const fieldErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        next(new ValidationError("Validation failed", fieldErrors));
      } else {
        next(error);
      }
    }
  };
};
