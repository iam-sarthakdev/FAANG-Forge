import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAnalytics);

export default router;
