import { Problem } from '../models/index.js';
import patternService from '../services/patternService.js';

// Get all available patterns
export const getAllPatterns = async (req, res, next) => {
    try {
        const patterns = patternService.getAllPatterns();
        res.json({ patterns });
    } catch (error) {
        next(error);
    }
};

// Get problems by pattern
export const getProblemsByPattern = async (req, res, next) => {
    try {
        const { pattern } = req.params;
        const userId = req.user.userId;

        const problems = await Problem.find({
            user_id: userId,
            patterns: pattern
        }).sort({ createdAt: -1 });

        res.json({
            pattern,
            count: problems.length,
            problems
        });
    } catch (error) {
        next(error);
    }
};

// Get pattern statistics
export const getPatternStats = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const stats = await patternService.getPatternStats(Problem, userId);

        res.json({ stats });
    } catch (error) {
        next(error);
    }
};

// Auto-tag all problems with patterns
export const autoTagProblems = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        console.log(`🏷️ Starting auto-tagging for user ${userId}...`);
        const result = await patternService.autoTagAllProblems(Problem, userId);

        console.log(`✅ Auto-tagged ${result.tagged} out of ${result.total} problems`);

        res.json({
            success: true,
            message: `Successfully tagged ${result.tagged} problems with patterns`,
            ...result
        });
    } catch (error) {
        console.error('Auto-tag error:', error);
        next(error);
    }
};

// Update problem patterns manually
export const updateProblemPatterns = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        const { patterns } = req.body;
        const userId = req.user.userId;

        const problem = await Problem.findOne({
            _id: problemId,
            user_id: userId
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        problem.patterns = patterns;
        await problem.save();

        res.json({
            success: true,
            message: 'Patterns updated successfully',
            problem
        });
    } catch (error) {
        next(error);
    }
};

// Get pattern definition
export const getPatternDefinition = async (req, res, next) => {
    try {
        const { pattern } = req.params;
        const definition = patternService.getPatternDefinition(pattern);

        if (!definition) {
            return res.status(404).json({ error: 'Pattern not found' });
        }

        res.json({
            pattern,
            definition
        });
    } catch (error) {
        next(error);
    }
};
