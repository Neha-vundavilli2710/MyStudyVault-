import User from '../models/User.js';
import Branch from '../models/Branch.js';
import AcademicYear from '../models/AcademicYear.js';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';
import Doubt from '../models/Doubt.js';
import Notice from '../models/Notice.js';

/* ---------------------------------------------------------------------- */
/* 1. Overview                                                            */
/* ---------------------------------------------------------------------- */

// @desc   College-wide stat cards for the Admin Overview screen
// @route  GET /api/admin/overview
export const getOverview = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      pendingFacultyApprovals,
      totalResources,
      openDoubts,
      resolvedDoubts,
      totalNotices,
      totalBranches,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'faculty', isApproved: false }),
      Resource.countDocuments(),
      Doubt.countDocuments({ status: { $ne: 'resolved' } }),
      Doubt.countDocuments({ status: 'resolved' }),
      Notice.countDocuments(),
      Branch.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      totalStudents,
      totalFaculty,
      pendingFacultyApprovals,
      totalResources,
      doubts: { open: openDoubts, resolved: resolvedDoubts },
      totalNotices,
      totalBranches,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load overview', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 2. Faculty Management                                                  */
/* ---------------------------------------------------------------------- */

// @desc   List/search/filter faculty
// @route  GET /api/admin/faculty?search=&branch=&isApproved=&specialRole=&page=&limit=
export const getFacultyList = async (req, res) => {
  try {
    const { search, branch, isApproved, specialRole, page = 1, limit = 20 } = req.query;

    const query = { role: 'faculty' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) query.assignedBranches = branch;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (specialRole) query.specialRole = specialRole;

    const skip = (Number(page) - 1) * Number(limit);

    const [faculty, total] = await Promise.all([
      User.find(query)
        .populate('assignedBranches', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({ faculty, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch faculty list', error: error.message });
  }
};

// @desc   Admin creates a faculty account directly (pre-approved)
// @route  POST /api/admin/faculty
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, facultyId, department, assignedBranches, subjectsHandled, specialRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const faculty = await User.create({
      name,
      email,
      password,
      role: 'faculty',
      facultyId,
      department,
      assignedBranches: assignedBranches || [],
      subjectsHandled: subjectsHandled || [],
      specialRole: specialRole || null,
      isApproved: true, // admin-created accounts are pre-approved
    });

    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      role: faculty.role,
      isApproved: faculty.isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create faculty account', error: error.message });
  }
};

// @desc   Approve or reject a pending faculty registration
// @route  PATCH /api/admin/faculty/:id/approval
export const setFacultyApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved (boolean) is required' });
    }

    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'faculty' },
      { isApproved },
      { new: true }
    );

    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update approval status', error: error.message });
  }
};

// @desc   Edit a faculty record: assigned branches, subjects handled, special role
// @route  PUT /api/admin/faculty/:id
export const updateFaculty = async (req, res) => {
  try {
    const { name, department, facultyId, assignedBranches, subjectsHandled, specialRole } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (department !== undefined) update.department = department;
    if (facultyId !== undefined) update.facultyId = facultyId;
    if (assignedBranches !== undefined) update.assignedBranches = assignedBranches;
    if (subjectsHandled !== undefined) update.subjectsHandled = subjectsHandled;
    if (specialRole !== undefined) update.specialRole = specialRole;

    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'faculty' },
      update,
      { new: true, runValidators: true }
    ).populate('assignedBranches', 'name code');

    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update faculty', error: error.message });
  }
};

// @desc   Activate/deactivate a faculty account
// @route  PATCH /api/admin/faculty/:id/status
export const setFacultyActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive (boolean) is required' });
    }

    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'faculty' },
      { isActive },
      { new: true }
    );

    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update faculty status', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 3. Student Management                                                  */
/* ---------------------------------------------------------------------- */

// @desc   List/search/filter students
// @route  GET /api/admin/students?search=&branch=&semester=&page=&limit=
export const getStudentList = async (req, res) => {
  try {
    const { search, branch, semester, page = 1, limit = 20 } = req.query;

    const query = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;

    const skip = (Number(page) - 1) * Number(limit);

    const [students, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({ students, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student list', error: error.message });
  }
};

// @desc   Activate/deactivate a student account
// @route  PATCH /api/admin/students/:id/status
export const setStudentActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive (boolean) is required' });
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { isActive },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student status', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 4. Reference Data — Branches                                           */
/* ---------------------------------------------------------------------- */

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch branches', error: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: 'name and code are required' });

    const branch = await Branch.create({ name, code });
    res.status(201).json(branch);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'A branch with this code already exists' });
    res.status(500).json({ message: 'Failed to create branch', error: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { name, code, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (isActive !== undefined) update.isActive = isActive;

    const branch = await Branch.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    res.status(200).json(branch);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update branch', error: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete branch', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 4. Reference Data — Academic Years                                     */
/* ---------------------------------------------------------------------- */

export const getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ label: -1 });
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch academic years', error: error.message });
  }
};

export const createAcademicYear = async (req, res) => {
  try {
    const { label, isCurrent } = req.body;
    if (!label) return res.status(400).json({ message: 'label is required' });

    const year = await AcademicYear.create({ label, isCurrent: !!isCurrent });
    res.status(201).json(year);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'This academic year already exists' });
    res.status(500).json({ message: 'Failed to create academic year', error: error.message });
  }
};

export const updateAcademicYear = async (req, res) => {
  try {
    const { label, isCurrent, isActive } = req.body;

    const year = await AcademicYear.findById(req.params.id);
    if (!year) return res.status(404).json({ message: 'Academic year not found' });

    if (label !== undefined) year.label = label;
    if (isCurrent !== undefined) year.isCurrent = isCurrent;
    if (isActive !== undefined) year.isActive = isActive;
    await year.save();

    res.status(200).json(year);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update academic year', error: error.message });
  }
};

export const deleteAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) return res.status(404).json({ message: 'Academic year not found' });
    res.status(200).json({ message: 'Academic year deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete academic year', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 4. Reference Data — Subjects                                           */
/* ---------------------------------------------------------------------- */

// @desc   List subjects, optionally filtered by branch + semester
// @route  GET /api/admin/subjects?branch=&semester=
export const getSubjects = async (req, res) => {
  try {
    const { branch, semester } = req.query;
    const query = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;

    const subjects = await Subject.find(query).populate('branch', 'name code').sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, branch, semester } = req.body;
    if (!name || !branch || !semester) {
      return res.status(400).json({ message: 'name, branch and semester are required' });
    }

    const subject = await Subject.create({ name, code, branch, semester });
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This subject already exists for the given branch and semester' });
    }
    res.status(500).json({ message: 'Failed to create subject', error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { name, code, branch, semester, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (branch !== undefined) update.branch = branch;
    if (semester !== undefined) update.semester = semester;
    if (isActive !== undefined) update.isActive = isActive;

    const subject = await Subject.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subject', error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.status(200).json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject', error: error.message });
  }
};

/* ---------------------------------------------------------------------- */
/* 5. Content Oversight                                                   */
/* ---------------------------------------------------------------------- */

// @desc   College-wide resource list for moderation (any owner)
// @route  GET /api/admin/resources?search=&branch=&page=&limit=
export const getAllResourcesForAdmin = async (req, res) => {
  try {
    const { search, branch, page = 1, limit = 20 } = req.query;
    const query = {};
    if (branch) query.branch = branch;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('uploadedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(query),
    ]);

    res.status(200).json({ resources, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

// @desc   Admin removes any resource regardless of owner
// @route  DELETE /api/admin/resources/:id
export const deleteResourceAsAdmin = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.status(200).json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove resource', error: error.message });
  }
};

// @desc   College-wide notice list for moderation (any owner)
// @route  GET /api/admin/notices?page=&limit=
export const getAllNoticesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notices, total] = await Promise.all([
      Notice.find()
        .populate('postedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notice.countDocuments(),
    ]);

    res.status(200).json({ notices, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notices', error: error.message });
  }
};

// @desc   Admin removes/unpublishes any notice regardless of owner
// @route  DELETE /api/admin/notices/:id
export const deleteNoticeAsAdmin = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.status(200).json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove notice', error: error.message });
  }
};