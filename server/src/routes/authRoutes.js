import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.patch('/password', authenticate, changePassword);

export default router;
