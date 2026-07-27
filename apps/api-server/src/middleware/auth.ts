import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../utils/errors.js';
import { verifyAccessToken, type AccessTokenPayload } from '../utils/jwt.js';

export interface AuthedRequest extends Request {
  auth?: AccessTokenPayload;
}

export function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Missing Bearer token'));
    return;
  }
  try {
    req.auth = verifyAccessToken(header.slice(7));
    next();
  } catch (err) {
    next(err);
  }
}
