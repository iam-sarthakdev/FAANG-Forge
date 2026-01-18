import express from 'express';
import { getProgress, toggleTopic } from '../controllers/systemDesignController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require auth

router.get('/progress', getProgress);
router.post('/progress', toggleTopic);

export default router;
