import { Router } from 'express';
import { searchPosts } from '../controllers/post.controller';
import { getAllCategories } from '../controllers/category.controller';

const router = Router();

// just simple endpoint demo unit test of rate limit
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

router.post('/posts/search', searchPosts);

router.get('/categories', getAllCategories);

export default router;
