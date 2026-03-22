import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    isApproved: {
        type: Boolean,
        default: true // Auto-approve for now (admin can moderate later)
    },
    role: {
        type: String,
        default: 'Developer',
        trim: true
    }
}, {
    timestamps: true
});

feedbackSchema.index({ isApproved: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
