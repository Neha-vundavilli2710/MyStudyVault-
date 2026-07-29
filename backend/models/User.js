import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true,
      default: 'student',
    },
    collegeId: { type: String, trim: true },
    branch: { type: String, trim: true },
    semester: { type: Number },

    facultyId: { type: String, trim: true },
    department: { type: String, trim: true },
    subjectsHandled: [{ type: String, trim: true }],

    // Faculty-only: branches this faculty member is assigned to (admin-managed).
    // Used to scope the Branch dropdown on Upload Resource, and to gate which
    // branches this faculty may post notices to (unless they hold a specialRole).
    assignedBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
      },
    ],

    // Faculty-only: an optional special role that grants broader notice-posting
    // permissions (all branches / selected branches) instead of the default
    // "own department only" restriction.
    specialRole: {
      type: String,
      enum: ['club-coordinator', 'nss-ncc', 'placement-cell', 'exam-cell', null],
      default: null,
    },

    profileImage: { type: String, default: '' },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === 'student';
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;