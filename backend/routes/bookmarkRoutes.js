import express from 'express';
import { addBookmark, removeBookmark, getMyBookmarks } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyBookmarks);
router.post('/:resourceId', protect, addBookmark);
router.delete('/:resourceId', protect, removeBookmark);

export default router;