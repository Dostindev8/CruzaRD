import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { badRequest } from '../utils/errors.js';

type Source = 'body' | 'query' | 'params';

export function validate<T>(schema: ZodSchema<T>, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(
        badRequest('Validation failed', result.error.flatten()),
      );
      return;
    }
    if (source === 'body') req.body = result.data;
    else if (source === 'query') {
      (req as Request & { validatedQuery?: T }).validatedQuery = result.data;
      Object.assign(req.query, result.data as object);
    } else {
      Object.assign(req.params, result.data as object);
    }
    next();
  };
}
