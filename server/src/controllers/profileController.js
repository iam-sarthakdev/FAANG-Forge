import User from '../models/User.js';
import { Problem, Revision } from '../models/index.js';

export const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select('name username avatar stats createdAt');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get activity from last 365 days
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        // Fetch problems solved in last year
        const recentProblems = await Problem.find({ 
            user_id: user._id, 
            isSolved: true,
            updatedAt: { $gte: oneYearAgo } 
        }).select('updatedAt');

        // Fetch revisions in last year
        const recentRevisions = await Revision.find({
            user_id: user._id,
            revised_at: { $gte: oneYearAgo }
        }).select('revised_at');

        // Aggregate activity by day (YYYY-MM-DD string)
        const activityMap = {};

        recentProblems.forEach(p => {
            const dateStr = p.updatedAt.toISOString().split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
        });

        recentRevisions.forEach(r => {
            const dateStr = r.revised_at.toISOString().split('T')[0];
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
        });

        // Convert to array format for react-calendar-heatmap
        const activityData = Object.keys(activityMap).map(date => ({
            date,
            count: activityMap[date]
        }));

        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    stats: user.stats
                },
                activity: activityData
            }
        });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};
