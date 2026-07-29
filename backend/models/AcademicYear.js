import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    label: {
      type: String, // e.g. "2025-2026"
      required: [true, 'Academic year label is required'],
      trim: true,
      unique: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Only one academic year should be marked current at a time.
academicYearSchema.pre('save', async function () {
  if (this.isModified('isCurrent') && this.isCurrent) {
    await mongoose.model('AcademicYear').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
});

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);

export default AcademicYear;