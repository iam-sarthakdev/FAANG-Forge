-- Sample seed data for testing DSA Spaced Revision System

-- Insert sample problems
INSERT INTO problems (title, url, topic, difficulty, notes, next_reminder_date, status) VALUES
('Two Sum', 'https://leetcode.com/problems/two-sum/', 'Array', 'Easy', 'Use hashmap for O(n) solution', '2026-01-10', 'pending'),
('Add Two Numbers', 'https://leetcode.com/problems/add-two-numbers/', 'Linked List', 'Medium', 'Handle carry properly', '2026-01-09', 'pending'),
('Longest Substring Without Repeating', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'String', 'Medium', 'Sliding window approach', '2026-01-11', 'pending'),
('Median of Two Sorted Arrays', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 'Array', 'Hard', 'Binary search on smaller array', '2026-01-15', 'pending'),
('Longest Palindromic Substring', 'https://leetcode.com/problems/longest-palindromic-substring/', 'String', 'Medium', 'Expand around center or DP', '2026-01-12', 'pending'),
('Valid Parentheses', 'https://leetcode.com/problems/valid-parentheses/', 'Stack', 'Easy', 'Use stack to match pairs', '2026-01-08', 'overdue'),
('Merge k Sorted Lists', 'https://leetcode.com/problems/merge-k-sorted-lists/', 'Linked List', 'Hard', 'Use min heap or divide & conquer', '2026-01-14', 'pending'),
('Binary Tree Maximum Path Sum', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 'Tree', 'Hard', 'Post-order traversal with global max', '2026-01-07', 'overdue'),
('Coin Change', 'https://leetcode.com/problems/coin-change/', 'DP', 'Medium', 'Bottom-up DP with min coins', '2026-01-13', 'pending'),
('Number of Islands', 'https://leetcode.com/problems/number-of-islands/', 'Graph', 'Medium', 'DFS or BFS from each unvisited land cell', '2026-01-09', 'pending'),
('Word Ladder', 'https://leetcode.com/problems/word-ladder/', 'Graph', 'Hard', 'BFS with word transformations', '2026-01-16', 'pending'),
('LRU Cache', 'https://leetcode.com/problems/lru-cache/', 'Design', 'Medium', 'HashMap + Doubly Linked List', '2026-01-10', 'pending'),
('Trapping Rain Water', 'https://leetcode.com/problems/trapping-rain-water/', 'Array', 'Hard', 'Two pointer approach or stack', '2026-01-14', 'pending'),
('Course Schedule', 'https://leetcode.com/problems/course-schedule/', 'Graph', 'Medium', 'Topological sort with DFS cycle detection', '2026-01-11', 'pending'),
('Serialize and Deserialize Binary Tree', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', 'Tree', 'Hard', 'BFS with null markers', NULL, 'no_reminder');

-- Insert sample revisions for some problems
INSERT INTO revisions (problem_id, notes, revised_at) VALUES
(1, 'Solved in 5 minutes, very comfortable now', '2026-01-05 10:30:00'),
(1, 'Revisited after 3 days, still fast', '2026-01-08 14:20:00'),
(6, 'Forgot edge case for empty string', '2026-01-04 09:15:00'),
(6, 'Much better this time, remembered all cases', '2026-01-06 16:45:00'),
(8, 'Struggled with negative path sums initially', '2026-01-03 11:00:00'),
(10, 'Implemented both DFS and BFS solutions', '2026-01-05 13:30:00'),
(12, 'Took time to implement doubly linked list correctly', '2026-01-04 15:00:00');
