import Chunk from '../models/Chunk.js';
import Summary from '../models/Summary.js';
import genAI from '../config/gemini.js';

const PROMPTS = {
  short: 'Write a short summary (3-4 sentences) of the following academic material.',
  detailed: 'Write a detailed, well-organized summary of the following academic material, covering all major topics.',
  'key-concepts': 'List the key concepts from the following academic material as a bulleted list, with a one-line explanation of each.',
  'important-points': 'List the most important points a student should remember from the following academic material, as a bulleted list.',
};

export const getOrGenerateSummary = async (resourceId, type) => {
  // Return cached result if it exists — avoids regenerating identical summaries
  const existing = await Summary.findOne({ resourceId, type });
  if (existing) {
    return { content: existing.content, cached: true };
  }

  const chunks = await Chunk.find({ resourceId }).sort({ chunkIndex: 1 });
  if (chunks.length === 0) {
    throw new Error('This resource has no processed content to summarize yet.');
  }

  const fullText = chunks.map((c) => c.text).join(' ');

  const prompt = `${PROMPTS[type]}\n\nMaterial:\n${fullText}`;

  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
  });

  const content = response.text;

  const summary = await Summary.create({ resourceId, type, content });

  return { content: summary.content, cached: false };
};