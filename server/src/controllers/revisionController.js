import { Problem, Revision } from '../models/index.js';
import User from '../models/User.js';

// Mark problem as revised
export const markAsRevised = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { notes, next_reminder_date } = req.body;

        // Check if problem exists and belongs to user
        const problemExists = await Problem.findOne({ _id: id, user_id: userId });
        if (!problemExists) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Create revision
        const revision = new Revision({
            user_id: userId,
            problem_id: id,
            notes: notes || null
        });

        await revision.save();

        // Update problem's next reminder date and status
        const status = next_reminder_date ? 'pending' : 'no_reminder';
        const problem = await Problem.findOneAndUpdate(
            { _id: id, user_id: userId },
            {
                next_reminder_date: next_reminder_date || null,
                status
            },
            { new: true }
        );

        // Update user stats
        const user = await User.findById(userId);
        if (user) {
            user.stats.totalRevisions = (user.stats.totalRevisions || 0) + 1;
            user.stats.lastActive = new Date();
            await user.save();
        }

        res.status(201).json({
            revision: {
                id: revision._id,
                problem_id: revision.problem_id,
                revised_at: revision.revised_at,
                notes: revision.notes
            },
            problem: {
                id: problem._id,
                next_reminder_date: problem.next_reminder_date,
                status: problem.status
            }
        });
    } catch (error) {
        next(error);
    }
};
