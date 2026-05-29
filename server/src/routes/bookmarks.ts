import { Router } from 'express';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmarkController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, getBookmarks);
router.post('/', authenticate, addBookmark);
router.delete('/:sculptureId', authenticate, removeBookmark);
export default router;