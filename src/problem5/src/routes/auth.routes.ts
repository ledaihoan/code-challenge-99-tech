// Auth HTTP routes.

import { Router } from 'express';
import { signIn, acquireAccessToken, signOut } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const authRouter = Router();

// POST /sign-in
authRouter.post('/sign-in', signIn);

// POST /refresh
authRouter.post('/refresh', acquireAccessToken);

// POST /sign-out (requires Authorization)
authRouter.post('/sign-out', requireAuth, signOut);

export default authRouter;
