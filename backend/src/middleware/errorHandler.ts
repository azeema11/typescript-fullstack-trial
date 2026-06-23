import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error encountered:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 is Unique Constraint Violation
    if (err.code === "P2002") {
      const targets = (err.meta?.target as string[]) || [];
      return res.status(400).json({
        status: "fail",
        message: `Duplicate value for unique field: ${targets.join(", ")}`,
      });
    }
    // P2025 is Record Not Found
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "fail",
        message: "Record not found",
      });
    }
  }

  // Generic internal server error
  const isProduction = process.env.NODE_ENV === "production";
  return res.status(500).json({
    status: "error",
    message: isProduction ? "Internal server error" : err.message,
    stack: isProduction ? undefined : err.stack,
  });
}
