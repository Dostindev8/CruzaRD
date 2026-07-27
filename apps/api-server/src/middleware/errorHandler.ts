import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  console.error('[api] unhandled error', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: 'Internal server error',
    },
  });
}
