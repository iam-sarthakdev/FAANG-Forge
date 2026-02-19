import { Problem, Revision, ProblemList, UserListProgress } from '../models/index.js';

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

        // Total revisions count
        const totalRevisions = await Revision.countDocuments({ user_id: userId });

        // Get all revisions for streak and activity calculations
        const allRevisions = await Revision.find({ user_id: userId })
            .sort({ revised_at: -1 })
            .select('revised_at');

        // Also gather activity from ProblemList completions and revisions (per-user)
        const userProgressDocs = await UserListProgress.find({ user_id: userId });
        let listSolvedCount = 0;
        let listRevisionCount = 0;
        let listRevisedProblems = [];

        // For each user progress doc, look up the list to get problem titles
        for (const upDoc of userProgressDocs) {
            const list = await ProblemList.findById(upDoc.list_id).select('sections');
            if (!list) continue;

            // Build a quick lookup map: problemId -> { title, sectionTitle }
            const problemMap = new Map();
            list.sections.forEach(section => {
                section.problems.forEach(problem => {
                    problemMap.set(problem._id.toString(), {
                        title: problem.title,
                        sectionTitle: section.title
                    });
                });
            });

            // Iterate over user's progress entries
            for (const [pid, prog] of upDoc.progress) {
                if (prog.isCompleted) listSolvedCount++;
                if (prog.revision_count > 0) {
                    listRevisionCount += prog.revision_count;
                    const info = problemMap.get(pid);
                    listRevisedProblems.push({
                        id: pid,
                        title: info ? info.title : 'Unknown',
                        revision_count: prog.revision_count,
                        sectionTitle: info ? info.sectionTitle : ''
                    });
                }
            }
        }

        // Merge most revised: combine Revision-model data with list-level revision data
        const combinedMostRevised = [...mostRevised];
        listRevisedProblems
            .sort((a, b) => b.revision_count - a.revision_count)
            .slice(0, 10)
            .forEach(lp => {
                // Only add if not already present
                const exists = combinedMostRevised.find(mr => mr.title === lp.title);
                if (!exists) {
                    combinedMostRevised.push({
                        id: lp.id,
                        title: lp.title,
                        revision_count: lp.revision_count,
                        section: lp.sectionTitle
                    });
                }
            });

        // Sort combined and take top 10
        combinedMostRevised.sort((a, b) => b.revision_count - a.revision_count);

        // Calculate streak - use revision dates
        let streak = 0;
        if (allRevisions.length > 0) {
            const uniqueDates = [
                ...new Set(
                    allRevisions.map((r) =>
                        new Date(r.revised_at).toISOString().split('T')[0]
                    )
                )
            ].sort((a, b) => new Date(b) - new Date(a));

            // Check if the most recent activity is today or yesterday
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
        }

        // Weekly activity - daily problems solved + revised for last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return {
                day: days[date.getDay()],
                date: date.toISOString().split('T')[0],
                solved: 0,
                revised: 0
            };
        });

        // Count revisions per day from Revision model
        allRevisions.forEach(rev => {
            const revDate = new Date(rev.revised_at).toISOString().split('T')[0];
            const dayData = weeklyActivity.find(d => d.date === revDate);
            if (dayData) dayData.revised++;
        });

        // Count solved per day from Problem model (using createdAt as solve date)
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const recentProblems = await Problem.find({
            user_id: userId,
            isSolved: true,
            createdAt: { $gte: weekStart }
        }).select('createdAt');

        recentProblems.forEach(prob => {
            const probDate = new Date(prob.createdAt).toISOString().split('T')[0];
            const dayData = weeklyActivity.find(d => d.date === probDate);
            if (dayData) dayData.solved++;
        });

        // Completion percentage
        const completionPct = total > 0 ? Math.round((totalSolved / total) * 100) : 0;

        res.json({
            total_problems: total,
            total_solved: totalSolved,
            by_difficulty: byDifficulty,
            by_topic: byTopic,
            most_revised: combinedMostRevised.slice(0, 10),
            revision_streak: streak,
            total_revisions: totalRevisions + listRevisionCount,
            weekly_activity: weeklyActivity,
            completion_pct: completionPct,
            list_solved: listSolvedCount,
            all_revisions: allRevisions
        });
    } catch (error) {
        next(error);
    }
};
