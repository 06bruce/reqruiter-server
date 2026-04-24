/**
 * Zod validation middleware factory.
 * Usage: router.post('/path', validate({ body: MySchema }), controller)
 * Returns 400 with field-level error details on validation failure.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/ApiError';

interface ValidationTargets {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationTargets) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new BadRequestError('Validation failed', err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
}
