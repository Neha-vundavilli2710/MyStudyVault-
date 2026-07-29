import Branch from '../models/Branch.js';
import AcademicYear from '../models/AcademicYear.js';
import Subject from '../models/Subject.js';

// @desc   Public list of active branches (used by Register, Upload Resource, etc.)
// @route  GET /api/reference/branches
export const getPublicBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).select('name code').sort({ name: 1 });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch branches', error: error.message });
  }
};

// @desc   Public list of active academic years
// @route  GET /api/reference/academic-years
export const getPublicAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find({ isActive: true }).select('label isCurrent').sort({ label: -1 });
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch academic years', error: error.message });
  }
};

// @desc   Public list of active subjects, filtered by branch + semester
// @route  GET /api/reference/subjects?branch=&semester=
export const getPublicSubjects = async (req, res) => {
  try {
    const { branch, semester } = req.query;
    if (!branch || !semester) {
      return res.status(400).json({ message: 'branch and semester query params are required' });
    }

    const subjects = await Subject.find({ branch, semester, isActive: true })
      .select('name code')
      .sort({ name: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};