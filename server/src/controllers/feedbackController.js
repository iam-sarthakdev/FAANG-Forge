import Feedback from '../models/Feedback.js';

/**
 * POST /api/feedback — Protected
 * Submit user feedback/testimonial
 */
export const submitFeedback = async (req, res) => {
    try {
        const { rating, message, role } = req.body;
        const userId = req.user.userId;

        if (!rating || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a rating and message'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user already submitted feedback
        const existing = await Feedback.findOne({ userId });
        if (existing) {
            // Update existing feedback
            existing.rating = rating;
            existing.message = message;
            if (role) existing.role = role;
            await existing.save();

            return res.json({
                success: true,
                message: 'Feedback updated successfully',
                data: existing
            });
        }

        // Get user name from the auth context
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);

        const feedback = await Feedback.create({
            userId,
            name: user ? user.name.split(' ')[0] : 'Anonymous',
            rating,
            message,
            role: role || 'Developer'
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
            data: feedback
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback'
        });
    }
};

/**
 * GET /api/feedback/approved — Public
 * Get approved testimonials for landing page
 */
export const getApprovedFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('name rating message role createdAt');

        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedback'
        });
    }
};

/**
 * GET /api/feedback/mine — Protected
 * Get the current user's feedback
 */
export const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ userId: req.user.userId });

        res.json({
            success: true,
            data: feedback || null
        });
    } catch (error) {
        console.error('Get my feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your feedback'
        });
    }
};
