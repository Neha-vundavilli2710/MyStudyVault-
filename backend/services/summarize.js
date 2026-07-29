import Chunk from '../models/Chunk.js';
import Summary from '../models/Summary.js';
import genAI from '../config/gemini.js';

const PROMPTS = {
  short: 'Write a short summary (3-4 sentences) of the following academic material.',
  detailed: 'Write a detailed, well-organized summary of the following academic material, covering all major topics.',
  'key-concepts': 'List the key concepts from the following academic material as a bulleted list, with a one-line explanation of each.',
  'important-points': 'List the most important points a student should remember from the following academic material, as a bulleted list.',
};

// Caps how much raw text we send to the LLM in one call — long documents
// would otherwise exceed the model's input limit and the call would fail.
const MAX_CHARS = 18000;

export const getOrGenerateSummary = async (resourceId, type) => {
  const existing = await Summary.findOne({ resourceId, type });
  if (existing) {
    return { content: existing.content, cached: true };
  }

  const chunks = await Chunk.find({ resourceId }).sort({ chunkIndex: 1 });
  if (chunks.length === 0) {
    throw new Error('This resource has no processed content to summarize yet.');
  }

  let fullText = chunks.map((c) => c.text).join(' ');
  if (fullText.length > MAX_CHARS) {
    fullText = fullText.slice(0, MAX_CHARS);
  }

  const prompt = `${PROMPTS[type]}\n\nMaterial:\n${fullText}`;

  let response;
  try {
    response = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });
  } catch (apiError) {
    console.error('Gemini summarize call failed:', apiError.message);
    throw new Error('The AI service could not generate a summary right now. Please try again in a moment.');
  }

  const content = response.text;
  if (!content) {
    throw new Error('The AI service returned an empty response. Please try again.');
  }

  const summary = await Summary.create({ resourceId, type, content });

  return { content: summary.content, cached: false };
};