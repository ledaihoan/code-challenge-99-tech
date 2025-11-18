import { Router } from 'express';
import {
    createPost,
    getPostById,
    updatePost,
    deletePost,
    searchUserPosts,
} from '../controllers/post.controller';
import { requireAuth } from '../middleware/auth';

const userPostRouter = Router();

// POST /users/:userId/posts
userPostRouter.post('/', requireAuth, createPost);

// GET /users/:userId/posts/:id
userPostRouter.get('/:id', requireAuth, getPostById);

// PATCH /users/:userId/posts/:id
userPostRouter.patch('/:id', requireAuth, updatePost);

// DELETE /users/:userId/posts/:id
userPostRouter.delete('/:id', requireAuth, deletePost);

// POST /users/:userId/posts/search
userPostRouter.post('/search', requireAuth, searchUserPosts);

export default userPostRouter;