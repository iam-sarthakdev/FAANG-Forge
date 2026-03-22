import express from 'express';
import { getPlatformStats, getLeaderboard } from '../controllers/platformController.js';

const router = express.Router();

// Public endpoints - no auth required
router.get('/stats', getPlatformStats);
router.get('/leaderboard', getLeaderboard);

export default router;
