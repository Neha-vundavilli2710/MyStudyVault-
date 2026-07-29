import express from 'express';
import { getPublicBranches, getPublicAcademicYears, getPublicSubjects } from '../controllers/referenceController.js';

const router = express.Router();

router.get('/branches', getPublicBranches);
router.get('/academic-years', getPublicAcademicYears);
router.get('/subjects', getPublicSubjects);

export default router;