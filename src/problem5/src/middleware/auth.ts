// requireAuth middleware: verifies JWT and injects req.user.

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../lib/http';
import { verifyAccessToken } from '../lib/jwt';
import type { JwtPayload } from 'jsonwebtoken';

export type AuthUser = { id: string };

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  // Expect Authorization: Bearer <token>
  const header = req.headers.authorization;
  if (!header || !/^Bearer\s+.+/i.test(header)) {
    return next(UnauthorizedException('Missing or invalid Authorization header'));
  }
  const token = header.split(/\s+/)[1];

  try {
    const payload = verifyAccessToken<JwtPayload>(token);

    // Ensure we have a proper subject claim
    if (typeof payload.sub !== 'string' || !payload.sub) {
      return next(UnauthorizedException('Invalid token payload'));
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(UnauthorizedException('Invalid or expired token'));
  }
};
