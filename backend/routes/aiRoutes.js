import express from 'express';
import {
  getConversations,
  createConversation,
  getConversation,
  addMessage,
  updateConversation,
  deleteConversation,
  clearConversation,
  askQuestion,
  summarizeResource,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Conversation endpoints
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:id', protect, getConversation);
router.post('/conversations/:id/messages', protect, addMessage);
router.put('/conversations/:id', protect, updateConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.delete('/conversations/:id/clear', protect, clearConversation);

// Legacy endpoints (keep for backward compatibility)
router.post('/ask', protect, askQuestion);
router.post('/summarize/:resourceId', protect, summarizeResource);

export default router;