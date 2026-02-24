import mongoose from 'mongoose';

const { Schema } = mongoose;

const problemListSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    lockPassword: {
        type: String,
        default: 'sarthak123'
    },
    // Sections (Patterns)
    sections: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        problems: [{
            title: {
                type: String,
                required: true
            },
            url: String,
            platform: {
                type: String,
                default: 'LeetCode'
            },
            difficulty: {
                type: String,
                enum: ['Easy', 'Medium', 'Hard', ''],
                default: ''
            },
            companyTags: [{
                type: String,
                trim: true
            }],
            // Reference to the main Problem collection if the user has "saved" it
            problemRef: {
                type: Schema.Types.ObjectId,
                ref: 'Problem'
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            revision_count: {
                type: Number,
                default: 0
            }
        }]
    }]
}, {
    timestamps: true
});

// Index for faster lookups
problemListSchema.index({ name: 1 });

const ProblemList = mongoose.model('ProblemList', problemListSchema);

export default ProblemList;
