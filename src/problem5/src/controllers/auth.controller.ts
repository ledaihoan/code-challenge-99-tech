// Update auth.controller.ts
import { Request, Response } from 'express';
import { SignInBodySchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

export const signIn = async (req: Request, res: Response) => {
  const body = SignInBodySchema.parse(req.body);
  const result = await authService.signIn(body.email, body.password);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({ accessToken: result.accessToken });
};

export const acquireAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token provided');
  }

  const result = await authService.refresh(refreshToken);
  return res.status(200).json(result);
};

export const signOut = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.signOut(refreshToken);

  res.clearCookie('refreshToken');
  return res.status(204).send();
};
