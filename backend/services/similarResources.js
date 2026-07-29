import mongoose from 'mongoose';
import Chunk from '../models/Chunk.js';
import Resource from '../models/Resource.js';

export const getSimilarResources = async (resourceId) => {
  const ownChunks = await Chunk.find({ resourceId }).select('embedding');

  if (ownChunks.length === 0) {
    return []; // resource has no processed content (e.g. external-link type)
  }

  // Average this resource's chunk embeddings into one representative vector
  const dimensions = ownChunks[0].embedding.length;
  const avgEmbedding = new Array(dimensions).fill(0);
  ownChunks.forEach((chunk) => {
    chunk.embedding.forEach((val, i) => {
      avgEmbedding[i] += val;
    });
  });
  for (let i = 0; i < dimensions; i++) {
    avgEmbedding[i] /= ownChunks.length;
  }

  // Search for the most similar chunks across ALL resources
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: avgEmbedding,
        numCandidates: 100,
        limit: 20,
      },
    },
    {
      $project: {
        resourceId: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  // Exclude chunks belonging to the resource itself, then take the top
  // unique resources (a resource can have multiple matching chunks —
  // we only want to show each related resource once)
  const seen = new Set([resourceId.toString()]);
  const orderedResourceIds = [];
  for (const r of results) {
    const id = r.resourceId.toString();
    if (!seen.has(id)) {
      seen.add(id);
      orderedResourceIds.push(id);
    }
    if (orderedResourceIds.length >= 4) break;
  }

  if (orderedResourceIds.length === 0) return [];

  const resources = await Resource.find({ _id: { $in: orderedResourceIds } })
    .populate('uploadedBy', 'name role')
    .select('title type branch semester subject fileUrl externalLink');

  // Preserve the similarity-ranked order (Mongo's $in doesn't guarantee it)
  const byId = Object.fromEntries(resources.map((r) => [r._id.toString(), r]));
  return orderedResourceIds.map((id) => byId[id]).filter(Boolean);
};