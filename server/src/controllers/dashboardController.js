import { Problem } from '../models/index.js';

// Get reminders grouped by status
export const getReminders = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        // Get today's reminders - filtered by user
        const todayProblems = await Problem.find({
            user_id: userId,
            next_reminder_date: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .sort({ difficulty: -1, title: 1 })
            .select('title topic difficulty next_reminder_date');

        // Get overdue reminders - filtered by user
        const overdueProblems = await Problem.find({
            user_id: userId,
            next_reminder_date: { $lt: today },
            status: { $ne: 'no_reminder' }
        })
            .sort({ next_reminder_date: 1 })
            .select('title topic difficulty next_reminder_date');

        // Calculate days overdue
        const overdueWithDays = overdueProblems.map((problem) => {
            const diffTime = today - new Date(problem.next_reminder_date);
            const days_overdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return {
                id: problem._id,
                title: problem.title,
                topic: problem.topic,
                difficulty: problem.difficulty,
                next_reminder_date: problem.next_reminder_date,
                days_overdue
            };
        });

        // Get upcoming reminders (next 7 days) - filtered by user
        const upcomingProblems = await Problem.find({
            user_id: userId,
            next_reminder_date: {
                $gt: today,
                $lte: weekFromNow
            }
        })
            .sort({ next_reminder_date: 1, title: 1 })
            .select('title topic difficulty next_reminder_date');

        // Group upcoming by date
        const upcomingGrouped = upcomingProblems.reduce((acc, problem) => {
            const dateStr = problem.next_reminder_date.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push({
                id: problem._id,
                title: problem.title,
                topic: problem.topic,
                difficulty: problem.difficulty,
                next_reminder_date: problem.next_reminder_date
            });
            return acc;
        }, {});

        const upcoming = Object.keys(upcomingGrouped).map((date) => ({
            date,
            problems: upcomingGrouped[date]
        }));

        res.json({
            today: todayProblems.map(p => ({
                id: p._id,
                title: p.title,
                topic: p.topic,
                difficulty: p.difficulty,
                next_reminder_date: p.next_reminder_date
            })),
            overdue: overdueWithDays,
            upcoming
        });
    } catch (error) {
        next(error);
    }
};
