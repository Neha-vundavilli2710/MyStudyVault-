import { answerQuestion } from '../services/ragQuery.js';
import { getOrGenerateSummary } from '../services/summarize.js';
import Conversation from '../models/Conversation.js';

// @desc   Get all conversations for logged-in student
// @route  GET /api/ai/conversations
// @access Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ student: req.user._id })
      .select('_id title scope createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

// @desc   Create new conversation
// @route  POST /api/ai/conversations
// @access Private
export const createConversation = async (req, res) => {
  try {
    const { title, scope } = req.body;

    const conversation = new Conversation({
      student: req.user._id,
      title: title || 'New Chat',
      messages: [],
      scope: scope || { type: 'general', value: '' },
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create conversation', error: error.message });
  }
};

// @desc   Get single conversation with all messages
// @route  GET /api/ai/conversations/:id
// @access Private
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
  }
};

// @desc   Add message to conversation
// @route  POST /api/ai/conversations/:id/messages
// @access Private
export const addMessage = async (req, res) => {
  try {
    const { question, resourceId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'A question is required' });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    await conversation.save();

    // Get AI response with conversation history
    const result = await answerQuestion(
      question,
      resourceId || null,
      conversation.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: result.answer,
      sources: result.sources,
      timestamp: new Date(),
    });

    // Update title if it's the first message
    if (conversation.messages.length === 2) {
      conversation.title = question.substring(0, 60) + (question.length > 60 ? '...' : '');
    }

    await conversation.save();

    res.status(200).json({
      conversationId: conversation._id,
      message: {
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add message', error: error.message });
  }
};

// @desc   Rename conversation
// @route  PUT /api/ai/conversations/:id
// @access Private
export const updateConversation = async (req, res) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this conversation' });
    }

    conversation.title = title || conversation.title;
    await conversation.save();

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update conversation', error: error.message });
  }
};

// @desc   Delete conversation
// @route  DELETE /api/ai/conversations/:id
// @access Private
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    await Conversation.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
};

// @desc   Clear all messages in conversation
// @route  DELETE /api/ai/conversations/:id/clear
// @access Private
export const clearConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to clear this conversation' });
    }

    conversation.messages = [];
    conversation.title = 'New Chat';
    await conversation.save();

    res.status(200).json({ message: 'Conversation cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear conversation', error: error.message });
  }
};

// @desc   Ask the AI study assistant a question, grounded in uploaded resources
// @route  POST /api/ai/ask
// @access Private
export const askQuestion = async (req, res) => {
  try {
    const { question, resourceId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'A question is required' });
    }

    const result = await answerQuestion(question, resourceId || null);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to answer question', error: error.message });
  }
};

// @desc   Generate (or retrieve cached) summary for a resource
// @route  POST /api/ai/summarize/:resourceId
// @access Private
export const summarizeResource = async (req, res) => {
  try {
    const { type } = req.body;
    const validTypes = ['short', 'detailed', 'key-concepts', 'important-points'];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ message: 'type must be one of: ' + validTypes.join(', ') });
    }

    const result = await getOrGenerateSummary(req.params.resourceId, type);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate summary', error: error.message });
  }
};