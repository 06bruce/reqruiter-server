/**
 * Standardized JSON response envelope.
 * Every endpoint sends { success, message, data } so the frontend has a consistent contract.
 */
import { Response } from 'express';

interface SuccessPayload<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorPayload {
  success: false;
  message: string;
  details?: unknown;
}

export class ApiResponse<T> implements SuccessPayload<T> {
  readonly success = true;
  constructor(
    public message: string,
    public data: T,
  ) {}
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200,
): Response<SuccessPayload<T>> {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
): Response<ErrorPayload> {
  return res.status(statusCode).json({ success: false, message, details });
}
