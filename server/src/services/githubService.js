import axios from 'axios';

// GitHub Personal Access Token for authentication
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_IMPORT;

class GitHubService {
    constructor(username, repo) {
        this.username = username;
        this.repo = repo;
        this.baseUrl = `https://api.github.com/repos/${username}/${repo}`;
        this.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DSA-Tracker-App'
        };

        // Only add Authorization header if token exists
        if (GITHUB_TOKEN) {
            this.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }
    }

    /**
     * Fetch all folder contents from the repository
     */
    async getAllFolders() {
        try {
            console.log(`📡 Fetching repository contents from ${this.username}/${this.repo}...`);
            console.log('✅ Using GitHub token for authentication (5000 req/hour limit)');

            const response = await axios.get(`${this.baseUrl}/contents`, {
                headers: this.headers
            });

            // Filter only directories (problem folders)
            const folders = response.data.filter(item => item.type === 'dir');

            console.log(`✅ Found ${folders.length} problem folders`);
            return folders;
        } catch (error) {
            console.error('Error fetching GitHub repository:', error.message);
            throw new Error(`Failed to fetch repository: ${error.message}`);
        }
    }

    /**
     * Parse problem information from folder name
     * Format: "1-two-sum" or "295-find-median-from-data-stream"
     */
    parseProblemFromFolder(folderName) {
        try {
            // Split by first hyphen to separate number and title
            const match = folderName.match(/^(\d+)-(.+)$/);

            if (!match) {
                console.log(`⚠️ Skipping folder with unexpected format: ${folderName}`);
                return null;
            }

            const [, problemNumber, titleSlug] = match;

            // Convert slug to title: "two-sum" -> "Two Sum"
            const title = titleSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            return {
                problemNumber: parseInt(problemNumber),
                title,
                titleSlug,
                folderPath: folderName
            };
        } catch (error) {
            console.error(`Error parsing folder ${folderName}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch code file content from a problem folder
     */
    async getCodeFromFolder(folderPath) {
        try {
            // Get folder contents
            const response = await axios.get(`${this.baseUrl}/contents/${folderPath}`, {
                headers: this.headers
            });

            // Find code file (usually .java, .py, .cpp, etc.)
            const codeFile = response.data.find(file =>
                file.type === 'file' &&
                (file.name.endsWith('.java') ||
                    file.name.endsWith('.py') ||
                    file.name.endsWith('.cpp') ||
                    file.name.endsWith('.js') ||
                    file.name.endsWith('.c'))
            );

            if (!codeFile) {
                console.log(`⚠️ No code file found in ${folderPath}`);
                return { code: '', language: '' };
            }

            // Fetch file content
            const fileResponse = await axios.get(codeFile.download_url);

            // Determine language from file extension
            const language = codeFile.name.split('.').pop();

            return {
                code: fileResponse.data,
                language,
                fileName: codeFile.name
            };
        } catch (error) {
            console.error(`Error fetching code from ${folderPath}:`, error.message);
            return { code: '', language: '' };
        }
    }

    /**
     * Get all problems with their code from GitHub
     */
    async getAllProblemsWithCode() {
        try {
            const folders = await this.getAllFolders();
            const problems = [];

            console.log(`🔄 Processing ${folders.length} problem folders...`);

            // Process in smaller batches with delay
            const BATCH_SIZE = 5;
            for (let i = 0; i < folders.length; i += BATCH_SIZE) {
                const batch = folders.slice(i, i + BATCH_SIZE);

                const batchPromises = batch.map(async (folder) => {
                    const problemInfo = this.parseProblemFromFolder(folder.name);

                    if (!problemInfo) {
                        return null;
                    }

                    // Fetch code for this problem
                    const { code, language } = await this.getCodeFromFolder(folder.path);

                    return {
                        ...problemInfo,
                        code,
                        language,
                        url: `https://leetcode.com/problems/${problemInfo.titleSlug}/`
                    };
                });

                const batchResults = await Promise.all(batchPromises);
                problems.push(...batchResults.filter(p => p !== null));

                console.log(`✅ Processed ${Math.min(i + BATCH_SIZE, folders.length)}/${folders.length} folders...`);

                // Delay between batches to avoid rate limits
                if (i + BATCH_SIZE < folders.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            console.log(`🎉 Successfully processed ${problems.length} problems from GitHub`);
            return problems;
        } catch (error) {
            console.error('Error getting problems from GitHub:', error.message);
            throw error;
        }
    }
}

export default GitHubService;
