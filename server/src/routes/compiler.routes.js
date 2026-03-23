import express from 'express';
import { executeCode } from '../controllers/compilerController.js';

const router = express.Router();

router.post('/execute', executeCode);

export default router;
