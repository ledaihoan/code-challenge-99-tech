import { Router } from 'express';
import { searchPosts } from '../controllers/post.controller';

const router = Router();

router.get('health', (req, res) => {
  res.status(200).send('OK');
});

router.post('posts/search', searchPosts);

export default router;
