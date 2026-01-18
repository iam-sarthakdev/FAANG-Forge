import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem, Revision } from './src/models/index.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_revision';

// Sample problems data
const problems = [
    {
        title: 'Two Sum',
        url: 'https://leetcode.com/problems/two-sum/',
        topic: 'Array',
        difficulty: 'Easy',
        notes: 'Use hashmap for O(n) solution',
        next_reminder_date: new Date('2026-01-10'),
        status: 'pending'
    },
    {
        title: 'Add Two Numbers',
        url: 'https://leetcode.com/problems/add-two-numbers/',
        topic: 'Linked List',
        difficulty: 'Medium',
        notes: 'Handle carry properly',
        next_reminder_date: new Date('2026-01-09'),
        status: 'pending'
    },
    {
        title: 'Longest Substring Without Repeating',
        url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        topic: 'String',
        difficulty: 'Medium',
        notes: 'Sliding window approach',
        next_reminder_date: new Date('2026-01-11'),
        status: 'pending'
    },
    {
        title: 'Median of Two Sorted Arrays',
        url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
        topic: 'Array',
        difficulty: 'Hard',
        notes: 'Binary search on smaller array',
        next_reminder_date: new Date('2026-01-15'),
        status: 'pending'
    },
    {
        title: 'Longest Palindromic Substring',
        url: 'https://leetcode.com/problems/longest-palindromic-substring/',
        topic: 'String',
        difficulty: 'Medium',
        notes: 'Expand around center or DP',
        next_reminder_date: new Date('2026-01-12'),
        status: 'pending'
    },
    {
        title: 'Valid Parentheses',
        url: 'https://leetcode.com/problems/valid-parentheses/',
        topic: 'Stack',
        difficulty: 'Easy',
        notes: 'Use stack to match pairs',
        next_reminder_date: new Date('2026-01-08'),
        status: 'overdue'
    },
    {
        title: 'Merge k Sorted Lists',
        url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
        topic: 'Linked List',
        difficulty: 'Hard',
        notes: 'Use min heap or divide & conquer',
        next_reminder_date: new Date('2026-01-14'),
        status: 'pending'
    },
    {
        title: 'Binary Tree Maximum Path Sum',
        url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
        topic: 'Tree',
        difficulty: 'Hard',
        notes: 'Post-order traversal with global max',
        next_reminder_date: new Date('2026-01-07'),
        status: 'overdue'
    },
    {
        title: 'Coin Change',
        url: 'https://leetcode.com/problems/coin-change/',
        topic: 'DP',
        difficulty: 'Medium',
        notes: 'Bottom-up DP with min coins',
        next_reminder_date: new Date('2026-01-13'),
        status: 'pending'
    },
    {
        title: 'Number of Islands',
        url: 'https://leetcode.com/problems/number-of-islands/',
        topic: 'Graph',
        difficulty: 'Medium',
        notes: 'DFS or BFS from each unvisited land cell',
        next_reminder_date: new Date('2026-01-09'),
        status: 'pending'
    },
    {
        title: 'Word Ladder',
        url: 'https://leetcode.com/problems/word-ladder/',
        topic: 'Graph',
        difficulty: 'Hard',
        notes: 'BFS with word transformations',
        next_reminder_date: new Date('2026-01-16'),
        status: 'pending'
    },
    {
        title: 'LRU Cache',
        url: 'https://leetcode.com/problems/lru-cache/',
        topic: 'Design',
        difficulty: 'Medium',
        notes: 'HashMap + Doubly Linked List',
        next_reminder_date: new Date('2026-01-10'),
        status: 'pending'
    },
    {
        title: 'Trapping Rain Water',
        url: 'https://leetcode.com/problems/trapping-rain-water/',
        topic: 'Array',
        difficulty: 'Hard',
        notes: 'Two pointer approach or stack',
        next_reminder_date: new Date('2026-01-14'),
        status: 'pending'
    },
    {
        title: 'Course Schedule',
        url: 'https://leetcode.com/problems/course-schedule/',
        topic: 'Graph',
        difficulty: 'Medium',
        notes: 'Topological sort with DFS cycle detection',
        next_reminder_date: new Date('2026-01-11'),
        status: 'pending'
    },
    {
        title: 'Serialize and Deserialize Binary Tree',
        url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
        topic: 'Tree',
        difficulty: 'Hard',
        notes: 'BFS with null markers',
        next_reminder_date: null,
        status: 'no_reminder'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Problem.deleteMany({});
        await Revision.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert problems
        const insertedProblems = await Problem.insertMany(problems);
        console.log(`✅ Inserted ${insertedProblems.length} problems`);

        // Create sample revisions for some problems
        const revisions = [
            {
                problem_id: insertedProblems[0]._id,
                notes: 'Solved in 5 minutes, very comfortable now',
                revised_at: new Date('2026-01-05T10:30:00Z')
            },
            {
                problem_id: insertedProblems[0]._id,
                notes: 'Revisited after 3 days, still fast',
                revised_at: new Date('2026-01-08T14:20:00Z')
            },
            {
                problem_id: insertedProblems[5]._id,
                notes: 'Forgot edge case for empty string',
                revised_at: new Date('2026-01-04T09:15:00Z')
            },
            {
                problem_id: insertedProblems[5]._id,
                notes: 'Much better this time, remembered all cases',
                revised_at: new Date('2026-01-06T16:45:00Z')
            },
            {
                problem_id: insertedProblems[7]._id,
                notes: 'Struggled with negative path sums initially',
                revised_at: new Date('2026-01-03T11:00:00Z')
            },
            {
                problem_id: insertedProblems[9]._id,
                notes: 'Implemented both DFS and BFS solutions',
                revised_at: new Date('2026-01-05T13:30:00Z')
            },
            {
                problem_id: insertedProblems[11]._id,
                notes: 'Took time to implement doubly linked list correctly',
                revised_at: new Date('2026-01-04T15:00:00Z')
            }
        ];

        await Revision.insertMany(revisions);
        console.log(`✅ Inserted ${revisions.length} revisions`);

        console.log('\n🎉 Database seeded successfully!');
        console.log(`📊 Total: ${insertedProblems.length} problems, ${revisions.length} revisions`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
