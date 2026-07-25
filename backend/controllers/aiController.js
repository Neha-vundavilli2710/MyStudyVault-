import { answerQuestion } from '../services/ragQuery.js';
import { getOrGenerateSummary } from '../services/summarize.js';

// @desc   Ask the AI study assistant a question, grounded in uploaded resources
// @route  POST /api/ai/ask
// @access Any logged-in user
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
// @access Any logged-in user
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