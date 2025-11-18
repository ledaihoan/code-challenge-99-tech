// src/routes/user.routes.ts
import { Router } from 'express';
import { getProfile, updateProfile, updateLocation } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';

const userRouter = Router();

console.log('🔵 User routes file loaded');

// GET /profile (requires Authorization)
userRouter.get('/profile', requireAuth, getProfile);
console.log('🔵 Registered GET /profile');

// PATCH /profile (requires Authorization)
userRouter.patch('/profile', requireAuth, updateProfile);

export default userRouter;
