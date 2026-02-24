import axios from 'axios';
import { ProblemList, Revision, User, Problem, UserListProgress } from '../models/index.js';

const checkAdmin = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.email !== 'sarthak1712005@gmail.com') {
        throw new Error('Unauthorized: Only the admin can perform this action.');
    }
    return true;
};

export const getLists = async (req, res) => {
    try {
        const lists = await ProblemList.find().select('name description createdAt');
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getListByName = async (req, res) => {
    const { name } = req.params;
    try {
        const list = await ProblemList.findOne({ name: decodeURIComponent(name) })
            .populate({
                path: 'sections.problems.problemRef',
                select: 'revision_count difficulty status isSolved'
            });

        if (!list) return res.status(404).json({ message: 'List not found' });

        // Merge per-user progress into the response
        const userId = req.user?.userId;
        let userProgress = null;
        if (userId) {
            userProgress = await UserListProgress.findOne({ user_id: userId, list_id: list._id });
        }

        const listObj = list.toObject();
        if (userProgress) {
            listObj.sections = listObj.sections.map(section => ({
                ...section,
                problems: section.problems.map(problem => {
                    const pid = problem._id.toString();
                    const prog = userProgress.progress.get(pid);
                    return {
                        ...problem,
                        isCompleted: prog ? prog.isCompleted : false,
                        revision_count: prog ? prog.revision_count : 0,
                        code: prog?.code || '',
                        language: prog?.language || 'cpp'
                    };
                })
            }));
        } else {
            // No progress document yet — new user, everything is 0/false
            listObj.sections = listObj.sections.map(section => ({
                ...section,
                problems: section.problems.map(problem => ({
                    ...problem,
                    isCompleted: false,
                    revision_count: 0,
                    code: '',
                    language: 'cpp'
                }))
            }));
        }

        res.status(200).json(listObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addProblemToList = async (req, res) => {
    const { listId, sectionTitle } = req.params;
    const { title, url, platform, difficulty } = req.body;

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.find(s => s.title === sectionTitle);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        section.problems.push({ title, url, platform, difficulty });
        await list.save();

        res.status(200).json(list);
        // ... existing code ...
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSection = async (req, res) => {
    const { listId } = req.params;
    const { title } = req.body;

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Check if section already exists
        if (list.sections.some(s => s.title === title)) {
            return res.status(400).json({ message: 'Section with this title already exists' });
        }

        list.sections.push({ title, problems: [] });
        await list.save();

        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSection = async (req, res) => {
    const { listId, sectionId } = req.params;
    const { password } = req.body; // Expect password in body

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        // Check password
        if (list.lockPassword && list.lockPassword !== password) {
            return res.status(401).json({ message: 'Incorrect password. Access denied.' });
        }

        list.sections = list.sections.filter(s => s._id.toString() !== sectionId);
        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const reorderSection = async (req, res) => {
    const { listId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const [removed] = list.sections.splice(sourceIndex, 1);
        list.sections.splice(destinationIndex, 0, removed);

        list.markModified('sections');
        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const reorderProblem = async (req, res) => {
    const { listId, sectionId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const [removed] = section.problems.splice(sourceIndex, 1);
        section.problems.splice(destinationIndex, 0, removed);

        list.markModified('sections');
        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProblem = async (req, res) => {
    const { listId, sectionId, problemId } = req.params;
    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        section.problems.pull(problemId);
        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleProblemCompletion = async (req, res) => {
    const { listId, sectionId, problemId } = req.params;
    const userId = req.user.userId;

    try {
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const problem = section.problems.id(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Get or create user progress for this list
        let userProgress = await UserListProgress.findOne({ user_id: userId, list_id: listId });
        if (!userProgress) {
            userProgress = await UserListProgress.create({ user_id: userId, list_id: listId, progress: new Map() });
        }

        const pid = problemId.toString();
        const current = userProgress.progress.get(pid) || { isCompleted: false, revision_count: 0, code: '', language: 'cpp' };
        const newCompleted = !current.isCompleted;

        userProgress.progress.set(pid, { isCompleted: newCompleted, revision_count: current.revision_count, code: current.code || '', language: current.language || 'cpp' });
        userProgress.markModified('progress');
        await userProgress.save();

        // Track activity for streak — create a Revision entry when marking as completed
        if (newCompleted) {
            try {
                const refId = problem.problemRef || problem._id;
                await Revision.create({
                    user_id: userId,
                    problem_id: refId,
                    notes: `Completed: ${problem.title}`
                });
            } catch (err) {
                console.warn('Failed to track completion activity:', err.message);
            }
        }

        // Return the list with user-specific progress merged in
        const listObj = list.toObject();
        listObj.sections = listObj.sections.map(s => ({
            ...s,
            problems: s.problems.map(p => {
                const ppid = p._id.toString();
                const prog = userProgress.progress.get(ppid);
                return {
                    ...p,
                    isCompleted: prog ? prog.isCompleted : false,
                    revision_count: prog ? prog.revision_count : 0,
                    code: prog?.code || '',
                    language: prog?.language || 'cpp'
                };
            })
        }));

        res.status(200).json(listObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const incrementProblemRevision = async (req, res) => {
    const { listId, sectionId, problemId } = req.params;
    const userId = req.user.userId;

    try {
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const problem = section.problems.id(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Get or create user progress for this list
        let userProgress = await UserListProgress.findOne({ user_id: userId, list_id: listId });
        if (!userProgress) {
            userProgress = await UserListProgress.create({ user_id: userId, list_id: listId, progress: new Map() });
        }

        const pid = problemId.toString();
        const current = userProgress.progress.get(pid) || { isCompleted: false, revision_count: 0, code: '', language: 'cpp' };

        userProgress.progress.set(pid, { isCompleted: current.isCompleted, revision_count: current.revision_count + 1, code: current.code || '', language: current.language || 'cpp' });
        userProgress.markModified('progress');
        await userProgress.save();

        // Always create a Revision entry for activity tracking (streak, analytics)
        try {
            const refId = problem.problemRef || problem._id;
            await Revision.create({
                user_id: userId,
                problem_id: refId,
                notes: `Revised: ${problem.title}`
            });
        } catch (err) {
            console.warn('Failed to track revision activity:', err.message);
        }

        // Return the list with user-specific progress merged in
        const listObj = list.toObject();
        listObj.sections = listObj.sections.map(s => ({
            ...s,
            problems: s.problems.map(p => {
                const ppid = p._id.toString();
                const prog = userProgress.progress.get(ppid);
                return {
                    ...p,
                    isCompleted: prog ? prog.isCompleted : false,
                    revision_count: prog ? prog.revision_count : 0,
                    code: prog?.code || '',
                    language: prog?.language || 'cpp'
                };
            })
        }));

        res.status(200).json(listObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCompanyTags = async (req, res) => {
    const { listId, sectionId, problemId } = req.params;
    const { companyTags } = req.body;

    try {
        await checkAdmin(req.user.userId);
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const problem = section.problems.id(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        problem.companyTags = companyTags || [];
        list.markModified('sections');
        await list.save();

        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveCode = async (req, res) => {
    const { listId, sectionId, problemId } = req.params;
    const { code, language } = req.body;
    const userId = req.user.userId;

    try {
        const list = await ProblemList.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const section = list.sections.id(sectionId);
        if (!section) return res.status(404).json({ message: 'Section not found' });

        const problem = section.problems.id(problemId);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Get or create user progress for this list
        let userProgress = await UserListProgress.findOne({ user_id: userId, list_id: listId });
        if (!userProgress) {
            userProgress = await UserListProgress.create({ user_id: userId, list_id: listId, progress: new Map() });
        }

        const pid = problemId.toString();
        const current = userProgress.progress.get(pid) || { isCompleted: false, revision_count: 0, code: '', language: 'cpp' };

        userProgress.progress.set(pid, {
            isCompleted: current.isCompleted,
            revision_count: current.revision_count,
            code: code !== undefined ? code : current.code,
            language: language || current.language
        });
        userProgress.markModified('progress');
        await userProgress.save();

        res.status(200).json({ message: 'Code saved successfully', code, language: language || current.language });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hardcoded list data for seeding
const sarthaksList = {
    name: "Sarthak's List",
    description: "Curated list of DSA patterns and problems.",
    sections: [
        {
            title: "Binary Search",
            problems: [
                { title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Search Insert Position", url: "https://leetcode.com/problems/search-insert-position/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Sqrt(x)", url: "https://leetcode.com/problems/sqrtx/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Find Smallest Letter Greater Than Target", url: "https://leetcode.com/problems/find-smallest-letter-greater-than-target/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Find First and Last Position of Element in Sorted Array", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Search in Rotated Sorted Array II", url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Find Minimum in Rotated Sorted Array II", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Find the Smallest Divisor Given a Threshold", url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Capacity To Ship Packages Within D Days", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Days to Make m Bouquets", url: "https://leetcode.com/problems/minimum-days-to-make-m-bouquets/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Split Array Largest Sum", url: "https://leetcode.com/problems/split-array-largest-sum/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Maximum Tastiness of Candy Basket", url: "https://leetcode.com/problems/maximum-tastiness-of-candy-basket/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Speed to Arrive on Time", url: "https://leetcode.com/problems/minimum-speed-to-arrive-on-time/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Maximum Candies Allocated to K Children", url: "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Successful Pairs of Spells and Potions", url: "https://leetcode.com/problems/successful-pairs-of-spells-and-potions/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Count Complete Tree Nodes", url: "https://leetcode.com/problems/count-complete-tree-nodes/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Two Pointers",
            problems: [
                { title: "Two Sum II - Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Move Zeroes", url: "https://leetcode.com/problems/move-zeroes/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Squares of a Sorted Array", url: "https://leetcode.com/problems/squares-of-a-sorted-array/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Reverse String", url: "https://leetcode.com/problems/reverse-string/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Sort Colors", url: "https://leetcode.com/problems/sort-colors/", platform: "LeetCode", difficulty: "Medium" },
                { title: "3Sum", url: "https://leetcode.com/problems/3sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "4Sum", url: "https://leetcode.com/problems/4sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Remove Nth Node From End of List", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Middle of the Linked List", url: "https://leetcode.com/problems/middle-of-the-linked-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Intersection of Two Linked Lists", url: "https://leetcode.com/problems/intersection-of-two-linked-lists/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Sort Array By Parity", url: "https://leetcode.com/problems/sort-array-by-parity/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Remove Duplicates from Sorted Array II", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "String Compression", url: "https://leetcode.com/problems/string-compression/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Valid Palindrome II", url: "https://leetcode.com/problems/valid-palindrome-ii/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Longest Mountain in Array", url: "https://leetcode.com/problems/longest-mountain-in-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Is Subsequence", url: "https://leetcode.com/problems/is-subsequence/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Reverse Words in a String", url: "https://leetcode.com/problems/reverse-words-in-a-string/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Sliding Window",
            problems: [
                { title: "Maximum Sum Subarray of Size K", url: "https://practice.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1", platform: "GeeksForGeeks", difficulty: "Easy" },
                { title: "First Negative Number in Every Window of Size K", url: "https://practice.geeksforgeeks.org/problems/first-negative-integer-in-every-window-of-size-k3345/1", platform: "GeeksForGeeks", difficulty: "Easy" },
                { title: "Count Occurrences of Anagrams", url: "https://practice.geeksforgeeks.org/problems/count-occurences-of-anagrams5839/1", platform: "GeeksForGeeks", difficulty: "Medium" },
                { title: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", url: "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Maximum Average Subarray I", url: "https://leetcode.com/problems/maximum-average-subarray-i/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Find K-Length Substrings With No Repeated Characters", url: "https://leetcode.com/problems/find-k-length-substrings-with-no-repeated-characters/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Longest Substring with At Most K Distinct Characters", url: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Size Subarray Sum", url: "https://leetcode.com/problems/minimum-size-subarray-sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Subarray Product Less Than K", url: "https://leetcode.com/problems/subarray-product-less-than-k/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Grumpy Bookstore Owner", url: "https://leetcode.com/problems/grumpy-bookstore-owner/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Maximum Points You Can Obtain from Cards", url: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Prefix Sum & Hashing",
            problems: [
                { title: "Longest Sub-Array with Sum K", url: "https://practice.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1", platform: "GeeksForGeeks", difficulty: "Medium" },
                { title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Largest Subarray with 0 Sum", url: "https://practice.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1", platform: "GeeksForGeeks", difficulty: "Easy" },
                { title: "Binary Subarrays With Sum", url: "https://leetcode.com/problems/binary-subarrays-with-sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Contiguous Array", url: "https://leetcode.com/problems/contiguous-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Subarray Sums Divisible by K", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Longest Consecutive Sequence", url: "https://leetcode.com/problems/longest-consecutive-sequence/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Count Subarrays with XOR as K", url: "https://practice.geeksforgeeks.org/problems/count-subarray-with-given-xor/1", platform: "GeeksForGeeks", difficulty: "Medium" },
                { title: "Find the Longest Substring Containing Vowels in Even Counts", url: "https://leetcode.com/problems/find-the-longest-substring-containing-vowels-in-even-counts/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Subarrays with K Different Integers", url: "https://leetcode.com/problems/subarrays-with-k-different-integers/", platform: "LeetCode", difficulty: "Hard" }
            ]
        },
        {
            title: "Hashmap & String",
            problems: [
                { title: "Valid Anagram", url: "https://leetcode.com/problems/valid-anagram/", platform: "LeetCode", difficulty: "Easy" },
                { title: "First Unique Character in a String", url: "https://leetcode.com/problems/first-unique-character-in-a-string/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Ransom Note", url: "https://leetcode.com/problems/ransom-note/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Isomorphic Strings", url: "https://leetcode.com/problems/isomorphic-strings/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Word Pattern", url: "https://leetcode.com/problems/word-pattern/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Determine if Two Strings Are Close", url: "https://leetcode.com/problems/determine-if-two-strings-are-close/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Stack & Monotonic Stack",
            problems: [
                { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Min Stack", url: "https://leetcode.com/problems/min-stack/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Next Greater Element I", url: "https://leetcode.com/problems/next-greater-element-i/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Next Greater Element II", url: "https://leetcode.com/problems/next-greater-element-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Remove All Adjacent Duplicates In String", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Decode String", url: "https://leetcode.com/problems/decode-string/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Online Stock Span", url: "https://leetcode.com/problems/online-stock-span/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Longest Valid Parentheses", url: "https://leetcode.com/problems/longest-valid-parentheses/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Asteroid Collision", url: "https://leetcode.com/problems/asteroid-collision/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Simplify Path", url: "https://leetcode.com/problems/simplify-path/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Evaluate Reverse Polish Notation", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Score of Parentheses", url: "https://leetcode.com/problems/score-of-parentheses/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Basic Calculator II", url: "https://leetcode.com/problems/basic-calculator-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Remove K Digits", url: "https://leetcode.com/problems/remove-k-digits/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Sum of Subarray Minimums", url: "https://leetcode.com/problems/sum-of-subarray-minimums/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Queue & Deque",
            problems: [
                { title: "Shortest Subarray with Sum at Least K", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Design Circular Deque", url: "https://leetcode.com/problems/design-circular-deque/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Heap / Priority Queue",
            problems: [
                { title: "Kth Largest Element in a Stream", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Last Stone Weight", url: "https://leetcode.com/problems/last-stone-weight/", platform: "LeetCode", difficulty: "Easy" },
                { title: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Sort Characters By Frequency", url: "https://leetcode.com/problems/sort-characters-by-frequency/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Kth Smallest Element in a Sorted Matrix", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Cost to Hire K Workers", url: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/", platform: "LeetCode", difficulty: "Hard" }
            ]
        },
        {
            title: "Trees",
            problems: []
        },
        {
            title: "Binary Search Tree",
            problems: []
        },
        {
            title: "Graphs",
            problems: []
        },
        {
            title: "DP",
            problems: []
        },
        {
            title: "Matrix",
            problems: []
        },
        {
            title: "Linked List",

            problems: [
                { title: "Delete Node in a Linked List", url: "https://leetcode.com/problems/delete-node-in-a-linked-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Remove Duplicates from Sorted List", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Middle of the Linked List", url: "https://leetcode.com/problems/middle-of-the-linked-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Remove Nth Node From End of List", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Linked List Cycle II", url: "https://leetcode.com/problems/linked-list-cycle-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Palindrome Linked List", url: "https://leetcode.com/problems/palindrome-linked-list/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Delete the Middle Node of a Linked List", url: "https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Add Two Numbers", url: "https://leetcode.com/problems/add-two-numbers/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Add Two Numbers II", url: "https://leetcode.com/problems/add-two-numbers-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Intersection of Two Linked Lists", url: "https://leetcode.com/problems/intersection-of-two-linked-lists/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Odd Even Linked List", url: "https://leetcode.com/problems/odd-even-linked-list/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Maximum Twin Sum of a Linked List", url: "https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Reverse Linked List II", url: "https://leetcode.com/problems/reverse-linked-list-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Reverse Nodes in k-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", platform: "LeetCode", difficulty: "Hard" },
                { title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Copy List with Random Pointer", url: "https://leetcode.com/problems/copy-list-with-random-pointer/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Flatten a Multilevel Doubly Linked List", url: "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Merge Intervals",
            problems: [
                { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Insert Interval", url: "https://leetcode.com/problems/insert-interval/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Non-overlapping Intervals", url: "https://leetcode.com/problems/non-overlapping-intervals/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Number of Arrows to Burst Balloons", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Remove Covered Intervals", url: "https://leetcode.com/problems/remove-covered-intervals/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Video Stitching", url: "https://leetcode.com/problems/video-stitching/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Greedy",
            problems: [
                { title: "Assign Cookies", url: "https://leetcode.com/problems/assign-cookies/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Lemonade Change", url: "https://leetcode.com/problems/lemonade-change/", platform: "LeetCode", difficulty: "Easy" },
                { title: "Best Time to Buy and Sell Stock II", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Jump Game", url: "https://leetcode.com/problems/jump-game/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Jump Game II", url: "https://leetcode.com/problems/jump-game-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Gas Station", url: "https://leetcode.com/problems/gas-station/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Boats to Save People", url: "https://leetcode.com/problems/boats-to-save-people/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Minimum Add to Make Parentheses Valid", url: "https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Two City Scheduling", url: "https://leetcode.com/problems/two-city-scheduling/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Bag of Tokens", url: "https://leetcode.com/problems/bag-of-tokens/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Largest Number", url: "https://leetcode.com/problems/largest-number/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Partition Labels", url: "https://leetcode.com/problems/partition-labels/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Valid Parenthesis String", url: "https://leetcode.com/problems/valid-parenthesis-string/", platform: "LeetCode", difficulty: "Medium" }
            ]
        },
        {
            title: "Backtracking",
            problems: [
                { title: "Permutations", url: "https://leetcode.com/problems/permutations/", platform: "LeetCode", difficulty: "Medium" },
                { title: "N-Queens", url: "https://leetcode.com/problems/n-queens/", platform: "LeetCode", difficulty: "Hard" },
                { title: "N-Queens II", url: "https://leetcode.com/problems/n-queens-ii/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Valid Sudoku", url: "https://leetcode.com/problems/valid-sudoku/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Sudoku Solver", url: "https://leetcode.com/problems/sudoku-solver/", platform: "LeetCode", difficulty: "Hard" },
                { title: "Permutations II", url: "https://leetcode.com/problems/permutations-ii/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Subsets", url: "https://leetcode.com/problems/subsets/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/", platform: "LeetCode", difficulty: "Medium" },
                { title: "Combination Sum II", url: "https://leetcode.com/problems/combination-sum-ii/", platform: "LeetCode", difficulty: "Medium" }
            ]
        }
    ]
};

export const seedDefaultLists = async (req, res) => {
    try {
        const existingList = await ProblemList.findOne({ name: sarthaksList.name });

        if (existingList) {
            existingList.sections = sarthaksList.sections;
            await existingList.save();
            res.status(200).json({ message: "List updated successfully", list: existingList });
        } else {
            const newList = await ProblemList.create(sarthaksList);
            res.status(201).json({ message: "List created successfully", list: newList });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const seedFamousLists = async (req, res) => {
    try {
        // Step 1: Check if req.user exists
        if (!req.user) {
            console.error("Seeding Error: req.user is undefined - Authentication middleware failed");
            return res.status(401).json({ message: "Authentication failed - no user found", step: "auth" });
        }

        console.log("Step 1 passed: req.user exists, userId:", req.user.userId);

        // Step 2: Check admin
        try {
            await checkAdmin(req.user.userId);
            console.log("Step 2 passed: Admin check successful");
        } catch (adminError) {
            console.error("Seeding Error: Admin check failed:", adminError.message);
            return res.status(403).json({ message: "Admin check failed: " + adminError.message, step: "admin_check" });
        }

        // Step 3: Import neetcode150 data
        let neetcode150;
        try {
            const ncModule = await import('../data/neetcode150.js');
            neetcode150 = ncModule.default;
            console.log("Step 3 passed: NeetCode 150 data imported, sections:", neetcode150?.sections?.length || 0);
        } catch (importError) {
            console.error("Seeding Error: Failed to import neetcode150.js:", importError.message);
            return res.status(500).json({ message: "Failed to import NeetCode 150 data: " + importError.message, step: "import_neetcode150" });
        }

        // Step 4: Import striverA2Z data
        let striverA2Z;
        try {
            const stModule = await import('../data/striverA2Z.js');
            striverA2Z = stModule.default;
            console.log("Step 4 passed: Striver data imported, sections:", striverA2Z?.sections?.length || 0);
        } catch (importError) {
            console.error("Seeding Error: Failed to import striverA2Z.js:", importError.message);
            return res.status(500).json({ message: "Failed to import Striver data: " + importError.message, step: "import_striver" });
        }

        // Step 5: Import NeetCode All data
        let neetcodeAll;
        try {
            const ncAllModule = await import('../data/neetcodeAll.js');
            neetcodeAll = ncAllModule.default;
            console.log("Step 5 passed: NeetCode All data imported, sections:", neetcodeAll?.sections?.length || 0);
        } catch (importError) {
            console.error("Seeding Error: Failed to import neetcodeAll.js:", importError.message);
            return res.status(500).json({ message: "Failed to import NeetCode All data: " + importError.message, step: "import_neetcode_all" });
        }

        // Step 6: Import Love Babbar 450 data
        let babbar450;
        try {
            const babbarModule = await import('../data/babbar450.js');
            babbar450 = babbarModule.default;
            console.log("Step 6 passed: Babbar 450 data imported, sections:", babbar450?.sections?.length || 0);
        } catch (importError) {
            console.error("Seeding Error: Failed to import babbar450.js:", importError.message);
            return res.status(500).json({ message: "Failed to import Babbar 450 data: " + importError.message, step: "import_babbar450" });
        }

        // Step 7: Upsert NeetCode 150
        try {
            await ProblemList.findOneAndUpdate(
                { name: neetcode150.name },
                {
                    name: neetcode150.name,
                    description: neetcode150.description,
                    sections: neetcode150.sections,
                    is_public: true
                },
                { upsert: true, new: true }
            );
            console.log("Step 7 passed: NeetCode 150 saved to database");
        } catch (dbError) {
            console.error("Seeding Error: Failed to save NeetCode 150 to DB:", dbError.message);
            return res.status(500).json({ message: "Failed to save NeetCode 150: " + dbError.message, step: "db_neetcode150" });
        }

        // Step 8: Upsert Striver's A2Z
        try {
            await ProblemList.findOneAndUpdate(
                { name: striverA2Z.name },
                {
                    name: striverA2Z.name,
                    description: striverA2Z.description,
                    sections: striverA2Z.sections,
                    is_public: true
                },
                { upsert: true, new: true }
            );
            console.log("Step 8 passed: Striver's A2Z saved to database");
        } catch (dbError) {
            console.error("Seeding Error: Failed to save Striver to DB:", dbError.message);
            return res.status(500).json({ message: "Failed to save Striver: " + dbError.message, step: "db_striver" });
        }

        // Step 9: Upsert NeetCode All
        try {
            await ProblemList.findOneAndUpdate(
                { name: neetcodeAll.name },
                {
                    name: neetcodeAll.name,
                    description: neetcodeAll.description,
                    sections: neetcodeAll.sections,
                    is_public: true
                },
                { upsert: true, new: true }
            );
            console.log("Step 9 passed: NeetCode All saved to database");
        } catch (dbError) {
            console.error("Seeding Error: Failed to save NeetCode All to DB:", dbError.message);
            return res.status(500).json({ message: "Failed to save NeetCode All: " + dbError.message, step: "db_neetcode_all" });
        }

        // Step 10: Upsert Love Babbar 450
        try {
            await ProblemList.findOneAndUpdate(
                { name: babbar450.name },
                {
                    name: babbar450.name,
                    description: babbar450.description,
                    sections: babbar450.sections,
                    is_public: true
                },
                { upsert: true, new: true }
            );
            console.log("Step 10 passed: Love Babbar 450 saved to database");
        } catch (dbError) {
            console.error("Seeding Error: Failed to save Babbar 450 to DB:", dbError.message);
            return res.status(500).json({ message: "Failed to save Babbar 450: " + dbError.message, step: "db_babbar450" });
        }

        console.log("✅ ALL STEPS PASSED - Seeding complete! (4 sheets)");
        res.status(200).json({ message: "Famous lists seeded successfully! (NeetCode 150, Striver A2Z, NeetCode All, Love Babbar 450)" });
    } catch (error) {
        console.error("Seeding error (uncaught):", error);
        res.status(500).json({ message: "Failed to seed famous lists", error: error.message, step: "unknown" });
    }
};

