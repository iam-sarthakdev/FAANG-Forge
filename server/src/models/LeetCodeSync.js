import { Schema, model } from 'mongoose';

// LeetCode Sync Configuration Schema
const leetCodeSyncSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    leetcode_username: {
        type: String,
        required: true
    },
    session_cookie: {
        type: String,
        required: true
        // Will be encrypted before storage
    },
    csrf_token: {
        type: String,
        required: true
    },
    last_synced: {
        type: Date,
        default: null
    },
    total_problems_synced: {
        type: Number,
        default: 0
    },
    sync_enabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const LeetCodeSync = model('LeetCodeSync', leetCodeSyncSchema);

export default LeetCodeSync;
