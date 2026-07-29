import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getOverview,
  getFacultyList,
  createFaculty,
  setFacultyApproval,
  updateFaculty,
  setFacultyActiveStatus,
  getStudentList,
  setStudentActiveStatus,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAllResourcesForAdmin,
  deleteResourceAsAdmin,
  getAllNoticesForAdmin,
  deleteNoticeAsAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

// Every route below is admin-only
router.use(protect, authorize('admin'));

// 1. Overview
router.get('/overview', getOverview);

// 2. Faculty Management
router.get('/faculty', getFacultyList);
router.post('/faculty', createFaculty);
router.patch('/faculty/:id/approval', setFacultyApproval);
router.put('/faculty/:id', updateFaculty);
router.patch('/faculty/:id/status', setFacultyActiveStatus);

// 3. Student Management
router.get('/students', getStudentList);
router.patch('/students/:id/status', setStudentActiveStatus);

// 4. Reference Data — Branches
router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.put('/branches/:id', updateBranch);
router.delete('/branches/:id', deleteBranch);

// 4. Reference Data — Academic Years
router.get('/academic-years', getAcademicYears);
router.post('/academic-years', createAcademicYear);
router.put('/academic-years/:id', updateAcademicYear);
router.delete('/academic-years/:id', deleteAcademicYear);

// 4. Reference Data — Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// 5. Content Oversight
router.get('/resources', getAllResourcesForAdmin);
router.delete('/resources/:id', deleteResourceAsAdmin);
router.get('/notices', getAllNoticesForAdmin);
router.delete('/notices/:id', deleteNoticeAsAdmin);

export default router;