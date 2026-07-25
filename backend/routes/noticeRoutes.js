import express from 'express';
import { createNotice, getNotices, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotices);
router.post('/', protect, authorize('faculty', 'admin'), createNotice);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteNotice);

export default router;