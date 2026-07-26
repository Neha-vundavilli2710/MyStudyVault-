import express from 'express';
import { createDoubt, getDoubts, answerDoubt, resolveDoubt, getDoubtSummary } from '../controllers/doubtController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, getDoubtSummary);
router.get('/', protect, getDoubts);
router.post('/', protect, authorize('student'), createDoubt);
router.post('/:id/answers', protect, authorize('faculty', 'admin'), answerDoubt);
router.patch('/:id/resolve', protect, authorize('student'), resolveDoubt);

export default router;