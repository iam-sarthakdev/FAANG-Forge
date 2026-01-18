import express from 'express';
import {
    getAllPatterns,
    getProblemsByPattern,
    getPatternStats,
    autoTagProblems,
    updateProblemPatterns,
    getPatternDefinition
} from '../controllers/patternController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all patterns
router.get('/', getAllPatterns);

// Get pattern statistics
router.get('/stats', authenticate, getPatternStats);

// Auto-tag all problems
router.post('/auto-tag', authenticate, autoTagProblems);

// Get pattern definition
router.get('/:pattern/definition', getPatternDefinition);

// Get problems by pattern
router.get('/:pattern/problems', authenticate, getProblemsByPattern);

// Update problem patterns
router.patch('/problems/:problemId', authenticate, updateProblemPatterns);

export default router;
