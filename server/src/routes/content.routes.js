import express from 'express';
import {
    getFundamentalsContent,
    getBehavioralContent,
    getDSAContent,
    getSystemDesignContent,
    getFileContent
} from '../controllers/contentController.js';

const router = express.Router();

// Content routes are PUBLIC since they fetch from public GitHub repos and local static files
// No authentication required

router.get('/fundamentals/:topic?', getFundamentalsContent);
router.get('/behavioral', getBehavioralContent);
router.get('/dsa', getDSAContent);
router.get('/system-design', getSystemDesignContent);
router.get('/file', getFileContent);

export default router;
