import express from 'express';
import {
    saveLeetCodeCredentials,
    getSyncStatus,
    syncFromLeetCode,
    bulkImportFromUrls,
    syncFromGitHub,
    deleteLeetCodeIntegration
} from '../controllers/leetcodeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Save LeetCode credentials
router.post('/credentials', authenticate, saveLeetCodeCredentials);

// Get sync status
router.get('/status', authenticate, getSyncStatus);

// Trigger sync from LeetCode
router.post('/sync', authenticate, syncFromLeetCode);

// Add bulk import route
router.post('/bulk-import', authenticate, bulkImportFromUrls);

// Add GitHub sync route
router.post('/sync-github', authenticate, syncFromGitHub);

// Delete integration
router.delete('/integration', authenticate, deleteLeetCodeIntegration);

export default router;
