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
import companyProblemsRoutes from './routes/companyProblems.js';
import contentRoutes from './routes/content.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { scheduleReminderJob } from './jobs/reminderJob.js';

import seedRoutes from './routes/seedRoutes.js';
import CompanyProblem from './models/CompanyProblem.js';

// ... imports

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins for production
app.use(cors({
    origin: true,
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
app.use('/api/company-problems', companyProblemsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', seedRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Check database status (non-blocking, just informational)
        try {
            const count = await CompanyProblem.countDocuments();
            console.log(`📦 Database status: ${count} company problems present.`);
            if (count < 500) {
                console.log(`💡 Tip: Run 'npm run seed' locally or use POST /api/admin/seed-companies to seed data.`);
            }
        } catch (countError) {
            console.warn('⚠️ Could not count company problems:', countError.message);
        }

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
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
