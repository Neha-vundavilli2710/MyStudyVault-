import express from 'express';
import axios from 'axios';
import { extractTextFromPDF } from '../utils/textExtractor.js';
import { chunkText } from '../utils/chunker.js';
import { protect } from '../middleware/authMiddleware.js';
import Resource from '../models/Resource.js';

const router = express.Router();

router.get('/:resourceId', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource || !resource.fileUrl) {
      return res.status(404).json({ message: 'Resource or file not found' });
    }

    const response = await axios.get(resource.fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    const text = await extractTextFromPDF(buffer);
    const chunks = chunkText(text);

    res.status(200).json({
      totalTextLength: text.length,
      totalChunks: chunks.length,
      firstChunkPreview: chunks[0] ? chunks[0].slice(0, 300) : '',
      lastChunkPreview: chunks.length > 0 ? chunks[chunks.length - 1].slice(0, 300) : '',
    });
  } catch (error) {
    res.status(500).json({ message: 'Extraction test failed', error: error.message });
  }
});

export default router;