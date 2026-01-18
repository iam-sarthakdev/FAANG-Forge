// DSA Pattern definitions and auto-detection logic

const DSA_PATTERNS = {
    // Array Patterns
    'Two Pointers': {
        keywords: ['two', 'pointer', 'left', 'right', 'palindrome', 'sorted array', 'container'],
        topics: ['Array', 'String', 'Two Pointers']
    },
    'Sliding Window': {
        keywords: ['window', 'substring', 'subarray', 'consecutive', 'maximum', 'minimum', 'k elements'],
        topics: ['Array', 'String', 'Sliding Window']
    },
    'Kadane Algorithm': {
        keywords: ['maximum subarray', 'contiguous', 'sum'],
        topics: ['Array', 'Dynamic Programming']
    },

    // String Patterns
    'String Matching': {
        keywords: ['pattern', 'match', 'search', 'find', 'kmp', 'rabin'],
        topics: ['String']
    },
    'Palindrome': {
        keywords: ['palindrome', 'reverse'],
        topics: ['String', 'Two Pointers']
    },
    'Anagram': {
        keywords: ['anagram', 'permutation', 'frequency'],
        topics: ['String', 'Hash Table']
    },

    // LinkedList Patterns
    'Fast and Slow Pointers': {
        keywords: ['cycle', 'middle', 'linked list', 'tortoise', 'hare'],
        topics: ['Linked List', 'Two Pointers']
    },
    'Linked List Reversal': {
        keywords: ['reverse', 'linked list'],
        topics: ['Linked List']
    },
    'Merge Lists': {
        keywords: ['merge', 'linked list', 'sorted'],
        topics: ['Linked List', 'Merge Sort']
    },

    // Tree Patterns
    'Tree DFS': {
        keywords: ['depth', 'dfs', 'preorder', 'inorder', 'postorder', 'path'],
        topics: ['Tree', 'Depth-First Search', 'Binary Tree']
    },
    'Tree BFS': {
        keywords: ['level', 'bfs', 'breadth'],
        topics: ['Tree', 'Breadth-First Search', 'Binary Tree']
    },
    'Binary Search Tree': {
        keywords: ['bst', 'binary search tree', 'validate'],
        topics: ['Binary Search Tree', 'Tree']
    },
    'Trie': {
        keywords: ['trie', 'prefix', 'dictionary'],
        topics: ['Trie']
    },

    // Graph Patterns
    'Graph DFS/BFS': {
        keywords: ['graph', 'dfs', 'bfs', 'connected', 'island'],
        topics: ['Graph', 'Depth-First Search', 'Breadth-First Search']
    },
    'Topological Sort': {
        keywords: ['topological', 'course', 'order', 'dag'],
        topics: ['Graph', 'Topological Sort']
    },
    'Union Find': {
        keywords: ['union', 'find', 'disjoint', 'connected components'],
        topics: ['Union Find', 'Graph']
    },
    'Shortest Path': {
        keywords: ['shortest', 'path', 'dijkstra', 'bellman'],
        topics: ['Graph', 'Shortest Path']
    },

    // DP Patterns
    '1D Dynamic Programming': {
        keywords: ['climb', 'fibonacci', 'house robber'],
        topics: ['Dynamic Programming']
    },
    '2D Dynamic Programming': {
        keywords: ['grid', 'matrix', 'path', 'edit distance'],
        topics: ['Dynamic Programming', 'Matrix']
    },
    'Knapsack': {
        keywords: ['knapsack', 'subset', 'partition'],
        topics: ['Dynamic Programming']
    },
    'LCS/LIS': {
        keywords: ['longest common', 'longest increasing', 'subsequence'],
        topics: ['Dynamic Programming']
    },

    // Other Important Patterns
    'Backtracking': {
        keywords: ['backtrack', 'permutation', 'combination', 'subset', 'n-queens', 'sudoku'],
        topics: ['Backtracking']
    },
    'Greedy': {
        keywords: ['greedy', 'interval', 'meeting', 'activity'],
        topics: ['Greedy']
    },
    'Binary Search': {
        keywords: ['binary search', 'search', 'sorted', 'find'],
        topics: ['Binary Search']
    },
    'Heap/Priority Queue': {
        keywords: ['heap', 'priority queue', 'kth', 'median', 'top k'],
        topics: ['Heap', 'Priority Queue']
    },
    'Stack': {
        keywords: ['stack', 'parenthes', 'valid', 'monotonic'],
        topics: ['Stack']
    },
    'Queue': {
        keywords: ['queue', 'deque', 'circular'],
        topics: ['Queue']
    },
    'Hash Table': {
        keywords: ['hash', 'map', 'frequency', 'count'],
        topics: ['Hash Table']
    },
    'Bit Manipulation': {
        keywords: ['bit', 'xor', 'binary', 'single number'],
        topics: ['Bit Manipulation']
    },
    'Math': {
        keywords: ['math', 'prime', 'gcd', 'lcm', 'divisor'],
        topics: ['Math']
    },
    'Sorting': {
        keywords: ['sort', 'merge sort', 'quick sort'],
        topics: ['Sorting']
    }
};

class PatternService {
    /**
     * Get all available patterns
     */
    getAllPatterns() {
        return Object.keys(DSA_PATTERNS);
    }

    /**
     * Auto-detect patterns for a problem based on title, topic, and tags
     */
    detectPatterns(problem) {
        const detectedPatterns = new Set();
        const searchText = `${problem.title} ${problem.topic || ''} ${(problem.tags || []).join(' ')}`.toLowerCase();

        // Check each pattern
        for (const [patternName, patternData] of Object.entries(DSA_PATTERNS)) {
            // Check if problem topic matches pattern topics
            if (patternData.topics.some(topic =>
                problem.topic?.toLowerCase().includes(topic.toLowerCase())
            )) {
                detectedPatterns.add(patternName);
                continue;
            }

            // Check keywords in title
            if (patternData.keywords.some(keyword =>
                searchText.includes(keyword.toLowerCase())
            )) {
                detectedPatterns.add(patternName);
            }
        }

        return Array.from(detectedPatterns);
    }

    /**
     * Get pattern statistics for a user
     */
    async getPatternStats(Problem, userId) {
        try {
            const stats = {};
            const allPatterns = this.getAllPatterns();

            for (const pattern of allPatterns) {
                const count = await Problem.countDocuments({
                    user_id: userId,
                    patterns: pattern
                });
                stats[pattern] = count;
            }

            return stats;
        } catch (error) {
            console.error('Error getting pattern stats:', error);
            throw error;
        }
    }

    /**
     * Auto-tag all problems for a user
     */
    async autoTagAllProblems(Problem, userId) {
        try {
            const problems = await Problem.find({ user_id: userId });
            let tagged = 0;

            for (const problem of problems) {
                const patterns = this.detectPatterns({
                    title: problem.title,
                    topic: problem.topic,
                    tags: problem.tags || []
                });

                if (patterns.length > 0) {
                    problem.patterns = patterns;
                    await problem.save();
                    tagged++;
                }
            }

            return { total: problems.length, tagged };
        } catch (error) {
            console.error('Error auto-tagging problems:', error);
            throw error;
        }
    }

    /**
     * Get pattern definition
     */
    getPatternDefinition(patternName) {
        return DSA_PATTERNS[patternName] || null;
    }
}

export default new PatternService();
