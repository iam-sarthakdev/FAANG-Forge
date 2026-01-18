import axios from 'axios';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

class LeetCodeService {
    constructor(sessionCookie, csrfToken) {
        this.sessionCookie = sessionCookie;
        this.csrfToken = csrfToken;
    }

    async makeGraphQLRequest(query, variables = {}) {
        try {
            const response = await axios.post(
                LEETCODE_GRAPHQL_URL,
                { query, variables },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `LEETCODE_SESSION=${this.sessionCookie}; csrftoken=${this.csrfToken}`,
                        'x-csrftoken': this.csrfToken,
                        'Referer': 'https://leetcode.com'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('LeetCode GraphQL Error:', error.response?.data || error.message);
            throw new Error('Failed to fetch from LeetCode');
        }
    }

    async getUserProfile(username) {
        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                    profile {
                        ranking
                        userAvatar
                        realName
                    }
                }
            }
        `;

        const result = await this.makeGraphQLRequest(query, { username });
        return result.data?.matchedUser;
    }

    async getRecentSubmissions(username, limit = 100) {
        const query = `
            query recentAcSubmissions($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                    id
                    title
                    titleSlug
                    timestamp
                    statusDisplay
                    lang
                }
            }
        `;

        const result = await this.makeGraphQLRequest(query, { username, limit });
        return result.data?.recentAcSubmissionList || [];
    }

    // New method to get ALL solved problems (no API limit)
    async getAllProblemsWithStatus(username) {
        // The questionList API requires authentication to show status
        // We'll use a different approach: get all problems and filter by user's submission history

        console.log(`📡 Fetching user profile and submission count...`);
        const profileQuery = `
            query userProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
        `;

        await this.makeGraphQLRequest(profileQuery, { username });

        // Get recent submissions to build a list of solved problem slugs
        console.log(`📡 Fetching all submission history...`);
        const submissionsQuery = `
            query ($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    submissionCalendar
                }
                recentSubmissionList(username: $username) {
                    title
                    titleSlug
                    timestamp
                    statusDisplay
                    lang
                }
            }
        `;

        const submissionData = await this.makeGraphQLRequest(submissionsQuery, { username });

        // Build set of solved problem slugs
        const solvedSlugs = new Set();
        const submissions = submissionData.data?.recentSubmissionList || [];

        submissions.forEach(sub => {
            if (sub.statusDisplay === 'Accepted') {
                solvedSlugs.add(sub.titleSlug);
            }
        });

        console.log(`📥 Found ${solvedSlugs.size} unique solved problems from submissions`);

        // If we got very few, the API doesn't return full history
        // Let's try alternate approach: use problemsetQuestionList with authentication
        if (solvedSlugs.size < 100) {
            console.log(`⚠️ Submission list incomplete, querying problemsetQuestionList...`);

            // This query should work with authentication cookies
            const allProblemsQuery = `
                query problemsetQuestionList {
                    problemsetQuestionList: questionList(
                        categorySlug: ""
                        limit: 3000
                        skip: 0
                        filters: {}
                    ) {
                        questions: data {
                            questionFrontendId
                            title
                            titleSlug
                            difficulty
                            topicTags {
                                name
                                slug
                            }
                            status
                        }
                    }
                }
            `;

            const allProblems = await this.makeGraphQLRequest(allProblemsQuery, {});
            const allQuestions = allProblems.data?.problemsetQuestionList?.questions || [];

            console.log(`📥 Received ${allQuestions.length} total problems from questionList`);

            // Filter by status field (should be "ac" for solved)
            const solved = allQuestions.filter(q => q.status === 'ac' || q.status === 'AC');
            console.log(`✅ Found ${solved.length} problems with status='ac'`);

            return solved;
        }

        // Fallback: fetch details for each solved slug
        const solvedProblems = [];
        for (const slug of solvedSlugs) {
            try {
                const details = await this.getProblemDetails(slug);
                if (details) {
                    solvedProblems.push({
                        ...details,
                        status: 'ac'
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch ${slug}:`, error.message);
            }
        }

        return solvedProblems;
    }

    async getProblemDetails(titleSlug) {
        const query = `
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    difficulty
                    topicTags {
                        name
                        slug
                    }
                    stats
                }
            }
        `;

        const result = await this.makeGraphQLRequest(query, { titleSlug });
        return result.data?.question;
    }

    async getSubmissionDetails(submissionId) {
        const query = `
            query submissionDetails($submissionId: Int!) {
                submissionDetail(submissionId: $submissionId) {
                    runtime
                    runtimeDisplay
                    runtimePercentile
                    memory
                    memoryDisplay
                    memoryPercentile
                    code
                    timestamp
                    statusCode
                    lang {
                        name
                        verboseName
                    }
                    question {
                        questionId
                        title
                        titleSlug
                        content
                        difficulty
                        topicTags {
                            name
                        }
                    }
                   notes
                }
            }
        `;

        const result = await this.makeGraphQLRequest(query, { submissionId: parseInt(submissionId) });
        return result.data?.submissionDetail;
    }

    async getAllSolvedProblems(username) {
        // Use the new method that gets ALL solved problems
        console.log(`📡 Fetching all solved problems for ${username} using questionList API...`);
        const solvedQuestions = await this.getAllProblemsWithStatus(username);
        console.log(`📥 Received ${solvedQuestions.length} solved problems from LeetCode`);

        const problemsWithDetails = [];

        for (const question of solvedQuestions) {
            try {
                // We already have most details from questionList API
                problemsWithDetails.push({
                    leetcodeId: question.questionFrontendId,
                    title: question.title,
                    titleSlug: question.titleSlug,
                    difficulty: question.difficulty,
                    topics: question.topicTags.map(tag => tag.name),
                    url: `https://leetcode.com/problems/${question.titleSlug}/`,
                    code: '', // Will implement code retrieval in Phase 2
                    language: '',
                    runtime: '',
                    memory: '',
                    solvedAt: new Date(),
                    submissionId: null
                });

                console.log(`✅ Processed: ${question.title}`);
            } catch (error) {
                console.error(`Failed to process ${question.titleSlug}:`, error.message);
            }
        }

        console.log(`✅ Total processed: ${problemsWithDetails.length} problems`);
        return problemsWithDetails;
    }
}

export default LeetCodeService;
