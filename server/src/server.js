import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problems.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import leetcodeRoutes from './routes/leetcode.js';
import patternRoutes from './routes/patterns.js';
import systemDesignRoutes from './routes/systemDesignRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { scheduleReminderJob } from './jobs/reminderJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', // Local development
        'https://algo-flow-sarthak-kanois-projects.vercel.app', // Production (project name)
        'https://algo-flow-khaki.vercel.app' // Production (actual domain)
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/system-design', systemDesignRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - POST   /api/problems`);
    console.log(`   - GET    /api/problems`);
    console.log(`   - GET    /api/problems/:id`);
    console.log(`   - PATCH  /api/problems/:id`);
    console.log(`   - DELETE /api/problems/:id`);
    console.log(`   - POST   /api/problems/:id/revisions`);
    console.log(`   - GET    /api/dashboard/reminders`);
    console.log(`   - GET    /api/analytics\n`);

    // Schedule reminder cron job
    scheduleReminderJob();
});

export default app;
