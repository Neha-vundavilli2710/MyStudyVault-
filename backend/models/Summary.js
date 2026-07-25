import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    type: {
      type: String,
      enum: ['short', 'detailed', 'key-concepts', 'important-points'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// One cached result per resource+type combination
summarySchema.index({ resourceId: 1, type: 1 }, { unique: true });

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;