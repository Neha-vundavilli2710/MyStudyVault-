import express from 'express';
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  getRecentResources,
  getResourceTypeSummary,
  getSimilar,
  trackDownload,
} from '../controllers/resourceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/recent', protect, getRecentResources);
router.get('/type-summary', protect, getResourceTypeSummary);
router.get('/:id/similar', protect, getSimilar);
router.get('/:id/download', protect, trackDownload);
router.get('/', protect, getResources);
router.get('/:id', protect, getResourceById);
router.post('/', protect, authorize('faculty', 'admin'), upload.single('file'), createResource);
router.put('/:id', protect, authorize('faculty', 'admin'), updateResource);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteResource);

export default router;