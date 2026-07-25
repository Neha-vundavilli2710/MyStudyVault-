import axios from 'axios';
import { extractTextFromPDF } from '../utils/textExtractor.js';
import { chunkText } from '../utils/chunker.js';
import { generateEmbeddingsForChunks } from '../utils/embeddings.js';
import Chunk from '../models/Chunk.js';

// Downloads the resource's file, extracts text, chunks it, embeds each chunk,
// and stores them. Called automatically after a resource is created.
// Failures here are logged but never block the resource creation itself.
export const ingestResource = async (resource) => {
  try {
    if (!resource.fileUrl) return; // nothing to ingest for external-link resources

    const response = await axios.get(resource.fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const text = await extractTextFromPDF(buffer);
    const chunks = chunkText(text);

    if (chunks.length === 0) return;

    const embeddings = await generateEmbeddingsForChunks(chunks);

    const chunkDocs = chunks.map((text, index) => ({
      resourceId: resource._id,
      text,
      embedding: embeddings[index],
      chunkIndex: index,
    }));

    await Chunk.insertMany(chunkDocs);
    console.log(`Ingested ${chunkDocs.length} chunks for resource ${resource._id}`);
  } catch (error) {
    console.error(`Ingestion failed for resource ${resource._id}:`, error.message);
  }
};