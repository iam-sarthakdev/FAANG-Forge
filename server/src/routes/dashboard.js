import express from 'express';
import { getReminders } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/reminders', getReminders);

export default router;
