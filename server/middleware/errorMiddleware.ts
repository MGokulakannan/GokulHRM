import { NextFunction, Request, Response } from "express";

/* =========================================================
   404 - ROUTE NOT FOUND
   Runs when no route matched the request.
========================================================= */

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/* =========================================================
   CENTRALIZED ERROR HANDLER
   Safety net for anything that escapes a controller's own
   try/catch (unmatched Mongoose errors, thrown sync errors,
   etc). Individual controllers still handle their own
   expected error cases - this exists so the app never leaks
   a raw stack trace or crashes on an unexpected error.
========================================================= */

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error("Unhandled error:", err);

  // Mongoose: malformed ObjectId in a route param
  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Mongoose: schema validation failure
  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map(
      (item: any) => item.message
    );

    return res.status(400).json({
      success: false,
      message: messages.join(", ") || "Validation failed",
    });
  }

  // Mongoose: duplicate key (unique index violation)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";

    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors that slipped past the auth middleware
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const statusCode = err?.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Something went wrong on our end. Please try again."
        : err.message || "Request failed",
    ...(process.env.NODE_ENV === "development" ? { stack: err?.stack } : {}),
  });
};
