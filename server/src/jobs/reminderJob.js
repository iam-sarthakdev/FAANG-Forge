import { Problem } from '../models/index.js';
import cron from 'node-cron';

// Update reminder statuses based on dates
export const updateReminderStatuses = async () => {
    try {
        console.log('🔄 Running reminder status update job...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Mark overdue problems
        const overdueResult = await Problem.updateMany(
            {
                next_reminder_date: { $lt: today },
                status: { $ne: 'no_reminder' },
                next_reminder_date: { $ne: null }
            },
            {
                $set: { status: 'overdue' }
            }
        );

        if (overdueResult.modifiedCount > 0) {
            console.log(`⚠️  Marked ${overdueResult.modifiedCount} problems as overdue`);
        }

        // Mark today's reminders as pending
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const pendingResult = await Problem.updateMany(
            {
                next_reminder_date: {
                    $gte: today,
                    $lt: tomorrow
                }
            },
            {
                $set: { status: 'pending' }
            }
        );

        if (pendingResult.modifiedCount > 0) {
            console.log(`✅ Marked ${pendingResult.modifiedCount} problems as pending for today`);
        }

        console.log('✅ Reminder status update completed');
    } catch (error) {
        console.error('❌ Error updating reminder statuses:', error);
    }
};

// Schedule cron job to run daily at midnight
export const scheduleReminderJob = () => {
    // Run at midnight every day (0 0 * * *)
    cron.schedule('0 0 * * *', updateReminderStatuses);

    console.log('📅 Reminder cron job scheduled (runs daily at midnight)');

    // Also run immediately on server startup
    console.log('🚀 Running initial reminder status check...');
    updateReminderStatuses();
};
