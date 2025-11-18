import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { logger } from '../lib/logger';
import { UpdateProfileBodySchema, UpdateLocationBodySchema } from '../schemas/user.schema';

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  logger.info(userId);
  const profile = await userService.getProfile(userId);
  return res.status(200).json(profile);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const body = UpdateProfileBodySchema.parse(req.body);
  const updated = await userService.updateProfile(userId, body);
  return res.status(200).json(updated);
};
