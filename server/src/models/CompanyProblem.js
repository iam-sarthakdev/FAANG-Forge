import mongoose from 'mongoose';

const companyProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    companies: [String],
    topics: [String],
    url: String,
    frequency: Number,
    acceptanceRate: Number
}, {
    timestamps: true,
    collection: 'company_problems'
});

// Indexes for better query performance
companyProblemSchema.index({ companies: 1 });
companyProblemSchema.index({ difficulty: 1 });
companyProblemSchema.index({ frequency: -1 });
companyProblemSchema.index({ title: 'text' });

const CompanyProblem = mongoose.model('CompanyProblem', companyProblemSchema);

export default CompanyProblem;
