import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Stores per-user progress for ProblemList items.
 * The ProblemList itself is a shared (global) resource;
 * this model tracks each user's individual completion and revision state.
 */
const userListProgressSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    list_id: {
        type: Schema.Types.ObjectId,
        ref: 'ProblemList',
        required: true
    },
    // Map of problem _id (string) -> { isCompleted, revision_count }
    progress: {
        type: Map,
        of: new Schema({
            isCompleted: { type: Boolean, default: false },
            revision_count: { type: Number, default: 0 },
            code: { type: String, default: '' },
            language: { type: String, default: 'cpp' }
        }, { _id: false }),
        default: () => new Map()
    }
}, {
    timestamps: true
});

// Compound unique index — one progress document per user per list
userListProgressSchema.index({ user_id: 1, list_id: 1 }, { unique: true });

const UserListProgress = mongoose.model('UserListProgress', userListProgressSchema);

export default UserListProgress;
