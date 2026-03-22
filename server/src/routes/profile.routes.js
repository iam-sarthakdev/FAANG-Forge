import express from 'express';
import { getPublicProfile } from '../controllers/profileController.js';

const router = express.Router();

// Public route to view a user's profile and heatmap
router.get('/:username', getPublicProfile);

export default router;
