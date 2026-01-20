import CompanyProblem from '../models/CompanyProblem.js';

// Get all companies with problem counts
export const getAllCompanies = async (req, res) => {
    try {
        const companies = await CompanyProblem.aggregate([
            { $unwind: '$companies' },
            {
                $group: {
                    _id: '$companies',
                    count: { $sum: 1 },
                    easy: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] }
                    },
                    medium: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] }
                    },
                    hard: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    problemCount: '$count',
                    easy: 1,
                    medium: 1,
                    hard: 1
                }
            }
        ]);

        res.json({
            success: true,
            companies
        });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch companies'
        });
    }
};

// Get all company problems (paginated)
export const getAllCompanyProblems = async (req, res) => {
    try {
        const { difficulty, search, page = 1, limit = 200 } = req.query;

        const query = {};

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [problems, total] = await Promise.all([
            CompanyProblem.find(query)
                .sort({ frequency: -1, title: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v'),
            CompanyProblem.countDocuments(query)
        ]);

        res.json({
            success: true,
            problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all company problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company problems'
        });
    }
};

// Get problems for a specific company
export const getCompanyProblems = async (req, res) => {
    try {
        const { company } = req.params;
        const { difficulty, search, page = 1, limit = 200 } = req.query;

        const query = { companies: company };

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [problems, total] = await Promise.all([
            CompanyProblem.find(query)
                .sort({ frequency: -1, title: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-__v'),
            CompanyProblem.countDocuments(query)
        ]);

        res.json({
            success: true,
            problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get company problems error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company problems'
        });
    }
};

// Get statistics
export const getStatistics = async (req, res) => {
    try {
        const stats = await CompanyProblem.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byDifficulty: [
                        {
                            $group: {
                                _id: '$difficulty',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    companies: [
                        { $unwind: '$companies' },
                        {
                            $group: {
                                _id: null,
                                uniqueCompanies: { $addToSet: '$companies' }
                            }
                        },
                        {
                            $project: {
                                count: { $size: '$uniqueCompanies' }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = {
            totalProblems: stats[0].total[0]?.count || 0,
            totalCompanies: stats[0].companies[0]?.count || 0,
            byDifficulty: {
                Easy: stats[0].byDifficulty.find(d => d._id === 'Easy')?.count || 0,
                Medium: stats[0].byDifficulty.find(d => d._id === 'Medium')?.count || 0,
                Hard: stats[0].byDifficulty.find(d => d._id === 'Hard')?.count || 0
            }
        };

        res.json({
            success: true,
            stats: result
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};
