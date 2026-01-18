import { Problem, Revision } from '../models/index.js';

// Get analytics data
export const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Total problems count - filtered by user
        const total = await Problem.countDocuments({ user_id: userId });

        // Total solved problems - filtered by user
        const totalSolved = await Problem.countDocuments({ user_id: userId, isSolved: true });

        // Group by difficulty - filtered by user
        const difficultyAgg = await Problem.aggregate([
            { $match: { user_id: userId } },
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        const byDifficulty = difficultyAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Ensure all difficulties exist
        if (!byDifficulty.Easy) byDifficulty.Easy = 0;
        if (!byDifficulty.Medium) byDifficulty.Medium = 0;
        if (!byDifficulty.Hard) byDifficulty.Hard = 0;

        // Group by topic - filtered by user
        const topicAgg = await Problem.aggregate([
            { $match: { user_id: userId } },
            {
                $group: {
                    _id: '$topic',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        const byTopic = topicAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Most revised problems - filtered by user
        const mostRevisedAgg = await Revision.aggregate([
            { $match: { user_id: userId } },
            {
                $group: {
                    _id: '$problem_id',
                    revision_count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    revision_count: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        // Get problem details for most revised
        const mostRevised = await Promise.all(
            mostRevisedAgg.map(async (item) => {
                const problem = await Problem.findById(item._id).select('title');
                return {
                    id: item._id,
                    title: problem ? problem.title : 'Unknown',
                    revision_count: item.revision_count
                };
            })
        );

        // Calculate revision streak (consecutive days) - filtered by user
        const allRevisions = await Revision.find({ user_id: userId })
            .sort({ revised_at: -1 })
            .select('revised_at');

        let streak = 0;
        if (allRevisions.length > 0) {
            const uniqueDates = [
                ...new Set(
                    allRevisions.map((r) =>
                        new Date(r.revised_at).toISOString().split('T')[0]
                    )
                )
            ].sort((a, b) => new Date(b) - new Date(a));

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

        res.json({
            total_problems: total,
            total_solved: totalSolved,
            by_difficulty: byDifficulty,
            by_topic: byTopic,
            most_revised: mostRevised,
            revision_streak: streak,
            all_revisions: allRevisions
        });
    } catch (error) {
        next(error);
    }
};
