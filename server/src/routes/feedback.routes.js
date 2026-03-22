import express from 'express';
import { submitFeedback, getApprovedFeedback, getMyFeedback } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint
router.get('/approved', getApprovedFeedback);

// Protected endpoints
router.post('/', authenticate, submitFeedback);
router.get('/mine', authenticate, getMyFeedback);

export default router;
