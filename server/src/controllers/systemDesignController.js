import User from '../models/User.js';

// Get current progress
export const getProgress = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('systemDesign');

        // Initialize if not exists
        if (!user.systemDesign) {
            user.systemDesign = { completedTopics: [] };
            await user.save();
        }

        res.json({
            completedTopics: user.systemDesign.completedTopics || []
        });
    } catch (error) {
        next(error);
    }
};

// Toggle topic completion
export const toggleTopic = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { topicId } = req.body;

        if (!topicId) {
            return res.status(400).json({ error: 'Topic ID is required' });
        }

        const user = await User.findById(userId);

        // Initialize if doesn't exist
        if (!user.systemDesign) {
            user.systemDesign = { completedTopics: [] };
        }

        const index = user.systemDesign.completedTopics.indexOf(topicId);
        let completed = false;

        if (index > -1) {
            // Remove (unmark)
            user.systemDesign.completedTopics.splice(index, 1);
            completed = false;
        } else {
            // Add (mark)
            user.systemDesign.completedTopics.push(topicId);
            completed = true;
        }

        await user.save();

        res.json({
            success: true,
            completed,
            completedTopics: user.systemDesign.completedTopics
        });
    } catch (error) {
        next(error);
    }
};
