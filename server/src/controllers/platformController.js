import PlatformStats from '../models/PlatformStats.js';
import User from '../models/User.js';
import { Problem, Revision } from '../models/index.js';

/**
 * Refresh platform stats - called by cron job every 15 minutes
 */
export const refreshPlatformStats = async () => {
    try {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Aggregate basic counts
        const [totalUsers, totalProblemsTracked, totalProblemsSolved, totalRevisions] = await Promise.all([
            User.countDocuments(),
            Problem.countDocuments(),
            Problem.countDocuments({ isSolved: true }),
            Revision.countDocuments()
        ]);

        // Active users today (users who have revisions today)
        const activeUsersTodayAgg = await Revision.distinct('user_id', {
            revised_at: { $gte: todayStart }
        });

        // Active users this week
        const activeUsersWeekAgg = await Revision.distinct('user_id', {
            revised_at: { $gte: weekAgo }
        });

        // Top streaks - Calculate per-user streaks
        const allUsers = await User.find({}, '_id name stats');
        const userStreaks = [];

        for (const user of allUsers) {
            const userRevisions = await Revision.find({ user_id: user._id })
                .sort({ revised_at: -1 })
                .select('revised_at');

            if (userRevisions.length === 0) continue;

            // Calculate streak
            const uniqueDates = [
                ...new Set(
                    userRevisions.map(r =>
                        new Date(r.revised_at).toISOString().split('T')[0]
                    )
                )
            ].sort((a, b) => new Date(b) - new Date(a));

            const today = now.toISOString().split('T')[0];
            const yesterday = new Date(now - 86400000).toISOString().split('T')[0];

            let streak = 0;
            if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
                streak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const current = new Date(uniqueDates[i]);
                    const next = new Date(uniqueDates[i + 1]);
                    const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }

            const problemsSolved = await Problem.countDocuments({
                user_id: user._id,
                isSolved: true
            });

            const userTotalRevisions = userRevisions.length;

            userStreaks.push({
                userId: user._id,
                name: user.name.split(' ')[0], // First name only for privacy
                streak,
                problemsSolved,
                totalRevisions: userTotalRevisions
            });
        }

        // Sort for different leaderboards
        const topStreaks = [...userStreaks]
            .filter(u => u.streak > 0)
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 10)
            .map(u => ({
                userId: u.userId,
                name: u.name,
                streak: u.streak,
                problemsSolved: u.problemsSolved
            }));

        const topSolvers = [...userStreaks]
            .filter(u => u.problemsSolved > 0)
            .sort((a, b) => b.problemsSolved - a.problemsSolved)
            .slice(0, 10)
            .map(u => ({
                userId: u.userId,
                name: u.name,
                problemsSolved: u.problemsSolved,
                streak: u.streak
            }));

        const topRevisers = [...userStreaks]
            .filter(u => u.totalRevisions > 0)
            .sort((a, b) => b.totalRevisions - a.totalRevisions)
            .slice(0, 10)
            .map(u => ({
                userId: u.userId,
                name: u.name,
                totalRevisions: u.totalRevisions,
                streak: u.streak
            }));

        // Upsert the singleton stats document
        await PlatformStats.findOneAndUpdate(
            { key: 'global' },
            {
                totalUsers,
                totalProblemsTracked,
                totalProblemsSolved,
                totalRevisions,
                activeUsersToday: activeUsersTodayAgg.length,
                activeUsersWeek: activeUsersWeekAgg.length,
                topStreaks,
                topSolvers,
                topRevisers,
                lastUpdated: now
            },
            { upsert: true, new: true }
        );

        console.log(`📊 Platform stats refreshed: ${totalUsers} users, ${totalProblemsTracked} problems, ${totalRevisions} revisions`);
    } catch (error) {
        console.error('❌ Error refreshing platform stats:', error.message);
    }
};

/**
 * GET /api/platform/stats — Public endpoint
 * Returns cached platform statistics
 */
export const getPlatformStats = async (req, res) => {
    try {
        let stats = await PlatformStats.findOne({ key: 'global' });

        // If no cached stats yet, trigger a refresh
        if (!stats) {
            await refreshPlatformStats();
            stats = await PlatformStats.findOne({ key: 'global' });
        }

        if (!stats) {
            return res.json({
                success: true,
                data: {
                    totalUsers: 0,
                    totalProblemsTracked: 0,
                    totalProblemsSolved: 0,
                    totalRevisions: 0,
                    activeUsersToday: 0,
                    activeUsersWeek: 0,
                    lastUpdated: new Date()
                }
            });
        }

        res.json({
            success: true,
            data: {
                totalUsers: stats.totalUsers,
                totalProblemsTracked: stats.totalProblemsTracked,
                totalProblemsSolved: stats.totalProblemsSolved,
                totalRevisions: stats.totalRevisions,
                activeUsersToday: stats.activeUsersToday,
                activeUsersWeek: stats.activeUsersWeek,
                lastUpdated: stats.lastUpdated
            }
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching platform stats'
        });
    }
};

/**
 * GET /api/platform/leaderboard — Public endpoint
 * Returns top performers across different categories
 */
export const getLeaderboard = async (req, res) => {
    try {
        let stats = await PlatformStats.findOne({ key: 'global' });

        if (!stats) {
            await refreshPlatformStats();
            stats = await PlatformStats.findOne({ key: 'global' });
        }

        if (!stats) {
            return res.json({
                success: true,
                data: {
                    topStreaks: [],
                    topSolvers: [],
                    topRevisers: [],
                    lastUpdated: new Date()
                }
            });
        }

        res.json({
            success: true,
            data: {
                topStreaks: stats.topStreaks,
                topSolvers: stats.topSolvers,
                topRevisers: stats.topRevisers,
                lastUpdated: stats.lastUpdated
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard'
        });
    }
};
