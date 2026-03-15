import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";
import { backendErrorsTotal } from "../clients/prometheus.client";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  backendErrorsTotal.inc({ type: err.name, route: req.path });

  // Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Known App Error
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unknown / critical errors
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
}
