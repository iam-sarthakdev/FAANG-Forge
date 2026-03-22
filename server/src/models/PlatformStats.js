import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema({
    // Singleton document identifier
    key: {
        type: String,
        default: 'global',
        unique: true
    },
    totalUsers: {
        type: Number,
        default: 0
    },
    totalProblemsSolved: {
        type: Number,
        default: 0
    },
    totalProblemsTracked: {
        type: Number,
        default: 0
    },
    totalRevisions: {
        type: Number,
        default: 0
    },
    activeUsersToday: {
        type: Number,
        default: 0
    },
    activeUsersWeek: {
        type: Number,
        default: 0
    },
    topStreaks: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        streak: Number,
        problemsSolved: Number
    }],
    topSolvers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        problemsSolved: Number,
        streak: Number
    }],
    topRevisers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        totalRevisions: Number,
        streak: Number
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);
export default PlatformStats;
