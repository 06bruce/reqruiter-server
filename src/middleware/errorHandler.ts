/**
 * Global error handler — must be registered as the last middleware in app.ts.
 * Normalises ApiError instances and unexpected errors into the standard envelope.
 */
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/ApiResponse';
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // Mongoose duplicate-key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError' && (err as { code?: number }).code === 11000) {
    sendError(res, 'A record with that value already exists.', 409);
    return;
  }

  // Log unexpected errors but never leak stack traces to clients
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }

  sendError(res, 'Internal server error', 500, env.NODE_ENV === 'development' ? err.message : undefined);
}
