import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError, unauthorized } from './errors.js';

export interface AccessTokenPayload {
  sub: string;
  deviceId: string;
  typ: 'access';
}

export function signAccessToken(playerId: string, deviceId: string): string {
  const payload: AccessTokenPayload = {
    sub: playerId,
    deviceId,
    typ: 'access',
  };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.accessTokenTtl as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded !== 'object' || decoded === null) {
      throw unauthorized('Invalid token');
    }
    const { sub, deviceId, typ } = decoded as Partial<AccessTokenPayload>;
    if (typ !== 'access' || typeof sub !== 'string' || typeof deviceId !== 'string') {
      throw unauthorized('Invalid token payload');
    }
    return { sub, deviceId, typ };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('Invalid or expired token');
  }
}
