import LeetCodeService from '../services/leetcodeService.js';
import LeetCodeSync from '../models/LeetCodeSync.js';
import { Problem } from '../models/index.js';
import crypto from 'crypto';

// Use scrypt to derive a proper 32-byte key
const SECRET_PASSPHRASE = process.env.ENCRYPTION_KEY || 'dsa-tracker-secret-passphrase';
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_PASSPHRASE, 'salt', 32); // Exactly 32 bytes
const ALGORITHM = 'aes-256-cbc';

// Encrypt session cookie
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt session cookie
function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Save or update LeetCode credentials
export const saveLeetCodeCredentials = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { leetcode_username, session_cookie, csrf_token } = req.body;

        if (!leetcode_username || !session_cookie || !csrf_token) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Encrypt the session cookie
        const encryptedCookie = encrypt(session_cookie);

        // Upsert LeetCode sync config
        const syncConfig = await LeetCodeSync.findOneAndUpdate(
            { user_id: userId },
            {
                leetcode_username,
                session_cookie: encryptedCookie,
                csrf_token,
                sync_enabled: true
            },
            { upsert: true, new: true }
        );

        res.json({
            message: 'LeetCode credentials saved successfully',
            username: leetcode_username
        });
    } catch (error) {
        next(error);
    }
};

// Get LeetCode sync status
export const getSyncStatus = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const syncConfig = await LeetCodeSync.findOne({ user_id: userId });

        if (!syncConfig) {
            return res.json({ configured: false });
        }

        res.json({
            configured: true,
            username: syncConfig.leetcode_username,
            last_synced: syncConfig.last_synced,
            total_problems_synced: syncConfig.total_problems_synced,
            sync_enabled: syncConfig.sync_enabled
        });
    } catch (error) {
        next(error);
    }
};

// Sync problems from LeetCode
export const syncFromLeetCode = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Get sync config
        const syncConfig = await LeetCodeSync.findOne({ user_id: userId });

        if (!syncConfig) {
            return res.status(404).json({ error: 'LeetCode credentials not configured' });
        }

        // Decrypt session cookie
        const sessionCookie = decrypt(syncConfig.session_cookie);

        // Initialize LeetCode service
        const leetcodeService = new LeetCodeService(sessionCookie, syncConfig.csrf_token);

        // Verify credentials by fetching profile
        console.log('🔍 Verifying LeetCode credentials for:', syncConfig.leetcode_username);
        const profile = await leetcodeService.getUserProfile(syncConfig.leetcode_username);
        if (!profile) {
            console.log('❌ Failed to verify LeetCode profile');
            return res.status(401).json({ error: 'Invalid LeetCode credentials' });
        }
        console.log('✅ Profile verified:', profile.username);

        // Fetch all solved problems
        console.log('📥 Fetching solved problems from LeetCode...');
        const solvedProblems = await leetcodeService.getAllSolvedProblems(syncConfig.leetcode_username);
        console.log(`✅ Found ${solvedProblems.length} solved problems from LeetCode API`);

        // Import problems into database
        let imported = 0;
        let updated = 0;

        for (const problem of solvedProblems) {
            // Check if problem already exists
            const existing = await Problem.findOne({
                user_id: userId,
                title: problem.title
            });

            const problemData = {
                user_id: userId,
                title: problem.title,
                url: problem.url,
                topic: problem.topics[0] || 'General',
                difficulty: problem.difficulty,
                notes: `Imported from LeetCode\n\nLanguage: ${problem.language}\nRuntime: ${problem.runtime}\nMemory: ${problem.memory}`,
                codeSnippet: problem.code,
                timeComplexity: '', // User can add later
                spaceComplexity: '', // User can add later
                isSolved: true,
                status: 'no_reminder',
                next_reminder_date: null
            };

            if (existing) {
                // Update existing problem
                await Problem.findByIdAndUpdate(existing._id, problemData);
                updated++;
                console.log(`📝 Updated: ${problem.title}`);
            } else {
                // Create new problem
                await Problem.create(problemData);
                imported++;
                console.log(`➕ Imported: ${problem.title}`);
            }
        }

        console.log(`🎉 Sync completed! Imported: ${imported}, Updated: ${updated}`);

        // Update sync status
        syncConfig.last_synced = new Date();
        syncConfig.total_problems_synced = solvedProblems.length;
        await syncConfig.save();

        res.json({
            success: true,
            message: 'Sync completed successfully',
            stats: {
                total: solvedProblems.length,
                imported,
                updated
            }
        });
    } catch (error) {
        console.error('Sync error:', error);
        next(error);
    }
};

// Bulk import from URLs
export const bulkImportFromUrls = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'URLs array is required' });
        }

        console.log(`📥 Bulk import requested for ${urls.length} URLs`);

        // Get LeetCode sync config for credentials
        const syncConfig = await LeetCodeSync.findOne({ user_id: userId });
        if (!syncConfig) {
            return res.status(404).json({ error: 'LeetCode credentials not configured' });
        }

        // Decrypt session cookie
        const sessionCookie = decrypt(syncConfig.session_cookie);
        const leetcodeService = new LeetCodeService(sessionCookie, syncConfig.csrf_token);

        // Parse URLs to extract problem slugs
        const slugs = urls.map(url => {
            // Extract slug from URL like: https://leetcode.com/problems/two-sum/
            const match = url.match(/leetcode\.com\/problems\/([^\/]+)/);
            return match ? match[1] : null;
        }).filter(Boolean);

        console.log(`✅ Extracted ${slugs.length} valid problem slugs`);

        let imported = 0;
        let updated = 0;
        let failed = 0;

        // Batch import problems
        for (const slug of slugs) {
            try {
                const problemDetails = await leetcodeService.getProblemDetails(slug);

                if (!problemDetails) {
                    failed++;
                    continue;
                }

                // Check if problem already exists
                const existing = await Problem.findOne({
                    user_id: userId,
                    title: problemDetails.title
                });

                const problemData = {
                    user_id: userId,
                    title: problemDetails.title,
                    url: `https://leetcode.com/problems/${slug}/`,
                    topic: problemDetails.topicTags[0]?.name || 'General',
                    difficulty: problemDetails.difficulty,
                    notes: `Imported from LeetCode (Bulk Import)`,
                    codeSnippet: '', // Will be filled in Phase 2
                    timeComplexity: '',
                    spaceComplexity: '',
                    isSolved: true,
                    status: 'no_reminder',
                    next_reminder_date: null
                };

                if (existing) {
                    await Problem.findByIdAndUpdate(existing._id, problemData);
                    updated++;
                    console.log(`📝 Updated: ${problemDetails.title}`);
                } else {
                    await Problem.create(problemData);
                    imported++;
                    console.log(`➕ Imported: ${problemDetails.title}`);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Failed to import ${slug}:`, error.message);
                failed++;
            }
        }

        console.log(`🎉 Bulk import completed! Imported: ${imported}, Updated: ${updated}, Failed: ${failed}`);

        res.json({
            success: true,
            message: 'Bulk import completed',
            stats: {
                total: slugs.length,
                imported,
                updated,
                failed
            }
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        next(error);
    }
};

// Sync from GitHub repository
export const syncFromGitHub = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { githubUsername, githubRepo } = req.body;

        if (!githubUsername || !githubRepo) {
            return res.status(400).json({
                success: false,
                error: 'GitHub username and repository name are required'
            });
        }

        console.log(`🔄 Starting GitHub sync for ${githubUsername}/${githubRepo}...`);

        // Import GitHub service
        const GitHubService = (await import('../services/githubService.js')).default;
        const githubService = new GitHubService(githubUsername, githubRepo);

        // Fetch all problems from GitHub
        const githubProblems = await githubService.getAllProblemsWithCode();

        if (!githubProblems || githubProblems.length === 0) {
            return res.json({
                success: true,
                message: 'No problems found in repository',
                stats: { total: 0, imported: 0, updated: 0 }
            });
        }

        console.log(`📥 Found ${githubProblems.length} problems in GitHub repository`);

        let imported = 0;
        let updated = 0;
        let failed = 0;

        // Import LeetCode service to get problem details (difficulty, topics)
        const LeetCodeService = (await import('../services/leetcodeService.js')).default;
        const syncConfig = await LeetCodeSync.findOne({ user_id: userId });

        let leetcodeService = null;
        if (syncConfig) {
            // Decrypt credentials
            const SECRET_PASSPHRASE = process.env.ENCRYPTION_KEY || 'dsa-tracker-secret-passphrase';
            const crypto = await import('crypto');
            const ENCRYPTION_KEY = crypto.scryptSync(SECRET_PASSPHRASE, 'salt', 32);

            const parts = syncConfig.session_cookie.split(':');
            const iv = Buffer.from(parts.shift(), 'hex');
            const encryptedText = Buffer.from(parts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
            let sessionCookie = decipher.update(encryptedText);
            sessionCookie = Buffer.concat([sessionCookie, decipher.final()]);
            sessionCookie = sessionCookie.toString();

            leetcodeService = new LeetCodeService(sessionCookie, syncConfig.csrf_token);
        }

        // Process problems in batches
        const BATCH_SIZE = 20;
        for (let i = 0; i < githubProblems.length; i += BATCH_SIZE) {
            const batch = githubProblems.slice(i, i + BATCH_SIZE);

            await Promise.all(batch.map(async (githubProblem) => {
                try {
                    // Check if problem exists
                    const existing = await Problem.findOne({
                        user_id: userId,
                        title: githubProblem.title
                    });

                    // Try to get additional details from LeetCode API if available
                    let difficulty = 'Medium'; // Default
                    let topics = [];

                    if (leetcodeService) {
                        try {
                            const leetcodeDetails = await leetcodeService.getProblemDetails(githubProblem.titleSlug);
                            if (leetcodeDetails) {
                                difficulty = leetcodeDetails.difficulty || difficulty;
                                topics = leetcodeDetails.topicTags?.map(t => t.name) || [];
                            }
                        } catch (err) {
                            console.log(`⚠️ Could not fetch LeetCode details for ${githubProblem.title}, using defaults`);
                        }
                    }

                    const problemData = {
                        user_id: userId,
                        title: githubProblem.title,
                        url: githubProblem.url,
                        topic: topics[0] || 'General',
                        difficulty,
                        notes: `Imported from GitHub repository on ${new Date().toLocaleDateString()}`,
                        codeSnippet: githubProblem.code,
                        language: githubProblem.language,
                        isSolved: true,
                        status: 'no_reminder'
                    };

                    if (existing) {
                        await Problem.findByIdAndUpdate(existing._id, problemData);
                        updated++;
                        console.log(`📝 Updated: ${githubProblem.title}`);
                    } else {
                        await Problem.create(problemData);
                        imported++;
                        console.log(`➕ Imported: ${githubProblem.title}`);
                    }
                } catch (error) {
                    failed++;
                    console.error(`❌ Failed to import ${githubProblem.title}:`, error.message);
                }
            }));

            console.log(`✅ Processed ${Math.min(i + BATCH_SIZE, githubProblems.length)}/${githubProblems.length} problems...`);
        }

        // Update sync config if exists
        if (syncConfig) {
            syncConfig.last_synced = new Date();
            syncConfig.total_problems_synced = imported + updated;
            await syncConfig.save();
        }

        console.log(`🎉 GitHub sync completed! Imported: ${imported}, Updated: ${updated}, Failed: ${failed}`);

        res.json({
            success: true,
            message: `Successfully synced from GitHub repository`,
            stats: {
                total: githubProblems.length,
                imported,
                updated,
                failed
            }
        });
    } catch (error) {
        console.error('GitHub sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sync from GitHub'
        });
    }
};

// Delete LeetCode integration
export const deleteLeetCodeIntegration = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await LeetCodeSync.findOneAndDelete({ user_id: userId });
        res.json({ message: 'LeetCode integration removed' });
    } catch (error) {
        next(error);
    }
};
