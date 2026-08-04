import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        sources: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            title: String,
            type: String,
            subject: String,
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    scope: {
      type: {
        type: String,
        enum: ['branch', 'subject', 'resource', 'general'],
        default: 'general',
      },
      value: String, // branch name, subject name, or resourceId
    },
  },
  { timestamps: true }
);

conversationSchema.index({ student: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;