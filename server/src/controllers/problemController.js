import { Problem, Revision } from '../models/index.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create a new problem
export const createProblem = async (req, res, next) => {
    try {
        const { title, url, topic, difficulty, notes, next_reminder_date } = req.body;
        const userId = req.user.userId;

        // Validation
        if (!title || title.length > 200) {
            return res.status(400).json({ error: 'Title is required and must be less than 200 characters' });
        }
        if (!topic || !difficulty) {
            return res.status(400).json({ error: 'Topic and difficulty are required' });
        }
        if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
            return res.status(400).json({ error: 'Difficulty must be Easy, Medium, or Hard' });
        }

        // Set status based on reminder date
        let status = 'no_reminder';
        if (next_reminder_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const reminderDate = new Date(next_reminder_date);
            reminderDate.setHours(0, 0, 0, 0);
            status = reminderDate <= today ? 'overdue' : 'pending';
        }

        const problem = new Problem({
            user_id: userId,
            title,
            url: url || null,
            topic,
            difficulty,
            notes: notes || null,
            next_reminder_date: next_reminder_date || null,
            status
        });

        await problem.save();

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.totalProblems': 1 }
        });

        res.status(201).json(problem);
    } catch (error) {
        next(error);
    }
};

// Get all problems with filters
export const getAllProblems = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { topic, difficulty, status, sort = 'createdAt', order = 'desc' } = req.query;

        // Build filter - always filter by user_id
        // Build filter - always filter by user_id
        const filter = { user_id: userId };

        // Search Logic
        const { search } = req.query;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { title: searchRegex },
                { topic: searchRegex },
                { difficulty: searchRegex }
            ];
        }

        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        if (status) filter.status = status;
        if (req.query.pattern) filter.patterns = req.query.pattern;

        // Build sort
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortField = sort === 'created_at' ? 'createdAt' : sort;
        const sortObj = { [sortField]: sortOrder };

        const problems = await Problem.find(filter).sort(sortObj);
        console.log(`[DEBUG] Found ${problems.length} problems for user ${userId}`);

        // Debug first problem with companies
        const sample = problems.find(p => p.companies && p.companies.length > 0);
        if (sample) {
            console.log(`[DEBUG] Sample problem companies:`, sample.companies);
        } else {
            console.log(`[DEBUG] No problems with company tags found in this query.`);
            const anyProblem = problems[0];
            if (anyProblem) {
                console.log(`[DEBUG] First problem raw structure:`, JSON.stringify(anyProblem, null, 2));
            }
        }

        // Add revision count to each problem
        const problemsWithCount = await Promise.all(
            problems.map(async (problem) => {
                const revisionCount = await Revision.countDocuments({
                    problem_id: problem._id,
                    user_id: userId
                });
                return {
                    id: problem._id,
                    title: problem.title,
                    url: problem.url,
                    topic: problem.topic,
                    difficulty: problem.difficulty,
                    notes: problem.notes,
                    isSolved: problem.isSolved,
                    next_reminder_date: problem.next_reminder_date,
                    status: problem.status,
                    created_at: problem.createdAt,
                    updated_at: problem.updatedAt,
                    revision_count: revisionCount,
                    companies: problem.companies || [],
                    patterns: problem.patterns || [],
                    tags: problem.tags || []
                };
            })
        );

        res.json({
            problems: problemsWithCount,
            total: problemsWithCount.length
        });
    } catch (error) {
        next(error);
    }
};

// Get single problem by ID with revisions
export const getProblemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const problem = await Problem.findOne({ _id: id, user_id: userId });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const revisionCount = await Revision.countDocuments({
            problem_id: id,
            user_id: userId
        });

        const revisions = await Revision.find({
            problem_id: id,
            user_id: userId
        }).sort({ revised_at: -1 });

        // Fetch related problems (same pattern or topic)
        let related = [];
        if (problem.patterns && problem.patterns.length > 0) {
            related = await Problem.find({
                user_id: userId,
                patterns: { $in: problem.patterns },
                _id: { $ne: id }
            }).limit(5).select('title difficulty status isSolved');
        }

        if (related.length < 5 && problem.topic) {
            const more = await Problem.find({
                user_id: userId,
                topic: problem.topic,
                _id: { $ne: id, $nin: related.map(p => p._id) }
            }).limit(5 - related.length).select('title difficulty status isSolved');
            related = [...related, ...more];
        }

        res.json({
            id: problem._id,
            title: problem.title,
            url: problem.url,
            topic: problem.topic,
            difficulty: problem.difficulty,
            notes: problem.notes,
            isSolved: problem.isSolved,
            timeComplexity: problem.timeComplexity,
            spaceComplexity: problem.spaceComplexity,
            codeSnippet: problem.codeSnippet,
            language: problem.language,
            next_reminder_date: problem.next_reminder_date,
            status: problem.status,
            created_at: problem.createdAt,
            updated_at: problem.updatedAt,
            revision_count: revisionCount,
            companies: problem.companies || [],
            patterns: problem.patterns || [],
            tags: problem.tags || [],
            hints: problem.hints || [],
            relatedProblems: related || [],
            revisions: revisions.map(r => ({
                id: r._id,
                revised_at: r.revised_at,
                notes: r.notes
            }))
        });
    } catch (error) {
        next(error);
    }
};

// Update a problem
export const updateProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { title, url, topic, difficulty, notes, next_reminder_date, timeComplexity, spaceComplexity, codeSnippet, language, isSolved, patterns, companies, tags, hints } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (url !== undefined) updates.url = url;
        if (topic !== undefined) updates.topic = topic;
        if (difficulty !== undefined) {
            if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
                return res.status(400).json({ error: 'Invalid difficulty' });
            }
            updates.difficulty = difficulty;
        }
        if (notes !== undefined) updates.notes = notes;
        if (timeComplexity !== undefined) updates.timeComplexity = timeComplexity;
        if (spaceComplexity !== undefined) updates.spaceComplexity = spaceComplexity;
        if (codeSnippet !== undefined) updates.codeSnippet = codeSnippet;
        if (language !== undefined) updates.language = language;
        if (isSolved !== undefined) updates.isSolved = isSolved;
        if (patterns !== undefined) updates.patterns = patterns;
        if (companies !== undefined) updates.companies = companies;
        if (tags !== undefined) updates.tags = tags;
        if (hints !== undefined) updates.hints = hints;
        if (next_reminder_date !== undefined) {
            updates.next_reminder_date = next_reminder_date;
            updates.status = next_reminder_date === null ? 'no_reminder' : 'pending';
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const problem = await Problem.findOneAndUpdate(
            { _id: id, user_id: userId },
            updates,
            { new: true }
        );

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json(problem);
    } catch (error) {
        next(error);
    }
};

// Delete a problem
export const deleteProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const problem = await Problem.findOneAndDelete({ _id: id, user_id: userId });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Delete associated revisions
        await Revision.deleteMany({ problem_id: id, user_id: userId });

        // Update user stats
        await User.findByIdAndUpdate(userId, {
            $inc: { 'stats.totalProblems': -1 }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
