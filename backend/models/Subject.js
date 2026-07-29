import mongoose from 'mongoose';

// Semester uses the "year-sem" format agreed for the whole app: 1-1, 1-2, 2-1, 2-2, 3-1, 3-2, 4-1, 4-2
const SEMESTER_VALUES = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String, // e.g. "CS301"
      trim: true,
      uppercase: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    semester: {
      type: String,
      enum: SEMESTER_VALUES,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ branch: 1, semester: 1 });
subjectSchema.index({ branch: 1, semester: 1, name: 1 }, { unique: true });

export const SEMESTERS = SEMESTER_VALUES;

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;