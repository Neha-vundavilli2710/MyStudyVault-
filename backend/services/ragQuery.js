import mongoose from 'mongoose';
import Chunk from '../models/Chunk.js';
import Resource from '../models/Resource.js';
import genAI from '../config/gemini.js';
import { generateEmbedding } from '../utils/embeddings.js';

export const answerQuestion = async (question, resourceId = null) => {
  const questionEmbedding = await generateEmbedding(question, 'RETRIEVAL_QUERY');

  const vectorSearchStage = {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector: questionEmbedding,
      numCandidates: 100,
      limit: 5,
    },
  };

  if (resourceId) {
    vectorSearchStage.$vectorSearch.filter = {
      resourceId: new mongoose.Types.ObjectId(resourceId),
    };
  }

  const relevantChunks = await Chunk.aggregate([
    vectorSearchStage,
    {
      $project: {
        text: 1,
        resourceId: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  if (relevantChunks.length === 0) {
    return {
      answer: "I couldn't find relevant information in the uploaded academic resources to answer this question.",
      sources: [],
    };
  }

  const context = relevantChunks.map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`).join('\n\n');

  const prompt = `You are an academic study assistant. Answer the student's question using ONLY the excerpts below, taken from their uploaded course materials. If the excerpts don't contain enough information to answer, say so honestly instead of guessing or using outside knowledge.

Excerpts:
${context}

Question: ${question}

Answer:`;

  const response = await genAI.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
  });

  const answer = response.text;

  const uniqueResourceIds = [...new Set(relevantChunks.map((c) => c.resourceId.toString()))];
  const sourceResources = await Resource.find({ _id: { $in: uniqueResourceIds } }).select('title type subject');

  return { answer, sources: sourceResources };
};