import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['examination', 'assignment', 'event', 'academic', 'department', 'general'],
      default: 'general',
    },
    branch: {
      type: String,
      trim: true,
      default: '', // empty = visible to all branches
    },
    semester: {
      type: Number,
      default: null, // null = visible to all semesters
    },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'normal',
    },
    eventDate: {
      type: Date,
      default: null, // used for exams/deadlines/events; null for a plain announcement
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

noticeSchema.index({ branch: 1, semester: 1, createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;