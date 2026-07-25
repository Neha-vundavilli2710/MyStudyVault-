import genAI from '../config/gemini.js';

// Generates an embedding vector for a single piece of text.
// Using gemini-embedding-001 (the current model — text-embedding-004 was
// deprecated by Google on Jan 14, 2026). outputDimensionality is set to 768
// to match our Atlas Vector Search index definition.
export const generateEmbedding = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const response = await genAI.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { taskType, outputDimensionality: 768 },
  });
  return response.embeddings[0].values;
};

// Generates embeddings for many chunks, one at a time (keeps it simple and
// avoids rate-limit issues on the free tier — fine for a student project's scale)
export const generateEmbeddingsForChunks = async (chunks) => {
  const embeddings = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk, 'RETRIEVAL_DOCUMENT');
    embeddings.push(embedding);
  }
  return embeddings;
};