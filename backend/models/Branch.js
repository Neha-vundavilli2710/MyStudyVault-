import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    code: {
      type: String, // e.g. "CSE", "AIML", "ECE"
      required: [true, 'Branch code is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;