import mongoose from 'mongoose';

const { Schema } = mongoose;

// Problem Schema
const problemSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    url: {
        type: String,
        default: null
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    notes: {
        type: String,
        default: null
    },
    next_reminder_date: {
        type: Date,
        default: null,
        index: true // Index for cron job queries
    },
    status: {
        type: String,
        enum: ['pending', 'overdue', 'no_reminder'],
        default: 'pending',
        index: true
    },
    isSolved: {
        type: Boolean,
        default: false,
        index: true
    },
    timeComplexity: {
        type: String,
        default: ''
    },
    spaceComplexity: {
        type: String,
        default: ''
    },
    codeSnippet: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'java' // Default language from GitHub repo
    },
    patterns: [{
        type: String,
        index: true
    }],
    companies: [{
        type: String
    }],
    hints: [{
        type: String
    }],
    relatedProblems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    tags: [{
        type: String
    }]
}, {
    timestamps: true // Creates createdAt and updatedAt automatically
});

// Indexes for performance
problemSchema.index({ user_id: 1, topic: 1 });
problemSchema.index({ user_id: 1, difficulty: 1 });
problemSchema.index({ user_id: 1, patterns: 1 });
problemSchema.index({ user_id: 1, next_reminder_date: 1, status: 1 });
problemSchema.index({ user_id: 1, createdAt: -1 });

// Revision Schema
const revisionSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    problem_id: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        index: true
    },
    notes: {
        type: String,
        default: null
    },
    revised_at: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Models
export const Problem = mongoose.model('Problem', problemSchema);
export const Revision = mongoose.model('Revision', revisionSchema);
