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

import { seedCompanyProblems } from './scripts/seedCompanyProblemsLocal.js';
import CompanyProblem from './models/CompanyProblem.js';

// ... imports

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5000',
            /^https:\/\/.*\.vercel\.app$/  // All Vercel domains
        ];

        // Check if origin matches any of the allowed patterns
        const isAllowed = allowedOrigins.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(origin);
            }
            return pattern === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
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

        // Auto-seed company problems if empty
        try {
            const count = await CompanyProblem.countDocuments();
            if (count === 0) {
                console.log('🌱 Database empty. Starting auto-seed for company problems...');
                await seedCompanyProblems();
                console.log('✅ Auto-seed completed.');
            } else {
                console.log(`📦 Database already seeded with ${count} company problems.`);
            }
        } catch (seedError) {
            console.error('⚠️ Auto-seed failed (continuing server start):', seedError);
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
