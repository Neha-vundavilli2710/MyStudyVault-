// Splits text into overlapping chunks, roughly by character count.
// Overlap helps preserve context across chunk boundaries (e.g. a sentence
// that gets cut in half at the end of one chunk still appears in full
// at the start of the next one).
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 150; // characters shared between consecutive chunks

export const chunkText = (text) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const chunks = [];

  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end === cleaned.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
};