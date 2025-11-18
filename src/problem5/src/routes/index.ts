import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import userPostRoutes from './user-post.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/users/:userId/posts', userPostRoutes);
router.use('/api/v1/public', publicRoutes);

export default router;
