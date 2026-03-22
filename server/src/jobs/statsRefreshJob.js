import cron from 'node-cron';
import { refreshPlatformStats } from '../controllers/platformController.js';

/**
 * Schedule platform stats refresh every 15 minutes
 * This avoids expensive aggregation queries on every API request
 */
export const scheduleStatsRefreshJob = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', refreshPlatformStats);

    console.log('📊 Platform stats refresh job scheduled (runs every 15 minutes)');

    // Run immediately on server startup
    console.log('🚀 Running initial platform stats calculation...');
    refreshPlatformStats();
};
