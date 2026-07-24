import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: [
        'lecture-notes',
        'assignment',
        'question-paper',
        'syllabus',
        'reference-material',
        'lab-material',
        'external-link',
        'other',
      ],
      required: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String, // e.g. "2025-2026"
      trim: true,
    },
    tags: [{ type: String, trim: true }],

    fileUrl: {
      type: String,
      default: '', // Cloudinary URL — added in Step 11
    },
    externalLink: {
      type: String,
      default: '', // used when type === 'external-link'
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Speed up the most common query patterns: filtering by branch+semester+subject,
// and text search across title/description/tags.
resourceSchema.index({ branch: 1, semester: 1, subject: 1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;