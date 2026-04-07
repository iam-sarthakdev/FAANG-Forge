// SQL Master — Patterns + LeetCode Problem Mapping
// Each pattern includes: SQL code example, tips, and mapped leetcode problems

export const SQL_PATTERNS = [
    {
        id: 'basic-filtering',
        title: 'Basic Filtering',
        emoji: '🟢',
        color: '#22c55e',
        colorBg: 'rgba(34,197,94,0.08)',
        colorBorder: 'rgba(34,197,94,0.2)',
        sql: `SELECT * 
FROM table
WHERE condition;`,
        tip: '📌 Example: salary > 50000',
        description: 'Used everywhere — the foundation of all SQL queries. Filter rows based on conditions using WHERE.',
        problems: [
            { lc: 1757, title: 'Recyclable and Low Fat Products', difficulty: 'Easy', url: 'https://leetcode.com/problems/recyclable-and-low-fat-products/' },
            { lc: 584, title: 'Find Customer Referee', difficulty: 'Easy', url: 'https://leetcode.com/problems/find-customer-referee/' },
            { lc: 595, title: 'Big Countries', difficulty: 'Easy', url: 'https://leetcode.com/problems/big-countries/' },
            { lc: 1148, title: 'Article Views I', difficulty: 'Easy', url: 'https://leetcode.com/problems/article-views-i/' },
        ]
    },
    {
        id: 'sorting',
        title: 'Sorting',
        emoji: '🟡',
        color: '#eab308',
        colorBg: 'rgba(234,179,8,0.08)',
        colorBorder: 'rgba(234,179,8,0.2)',
        sql: `SELECT * 
FROM table
ORDER BY column ASC/DESC;`,
        tip: '📌 ASC = ascending (default), DESC = descending',
        description: 'Order result sets by one or more columns. Crucial for ranking and display.',
        problems: [
            { lc: 1148, title: 'Article Views I', difficulty: 'Easy', url: 'https://leetcode.com/problems/article-views-i/' },
            { lc: 178, title: 'Rank Scores', difficulty: 'Medium', url: 'https://leetcode.com/problems/rank-scores/' },
        ]
    },
    {
        id: 'aggregation',
        title: 'Aggregation (GROUP BY)',
        emoji: '🔵',
        color: '#3b82f6',
        colorBg: 'rgba(59,130,246,0.08)',
        colorBorder: 'rgba(59,130,246,0.2)',
        sql: `SELECT column, COUNT(*) 
FROM table
GROUP BY column;`,
        tip: '👉 VERY IMPORTANT — Used with COUNT, SUM, AVG, MIN, MAX',
        description: 'Group rows that share values and apply aggregate functions. Essential for summarizing data.',
        problems: [
            { lc: 586, title: 'Customer Placing the Largest Number of Orders', difficulty: 'Easy', url: 'https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/' },
            { lc: 596, title: 'Classes More Than 5 Students', difficulty: 'Easy', url: 'https://leetcode.com/problems/classes-more-than-5-students/' },
            { lc: 1251, title: 'Average Selling Price', difficulty: 'Easy', url: 'https://leetcode.com/problems/average-selling-price/' },
            { lc: 1075, title: 'Project Employees I', difficulty: 'Easy', url: 'https://leetcode.com/problems/project-employees-i/' },
        ]
    },
    {
        id: 'having',
        title: 'HAVING (Filter After Grouping)',
        emoji: '🟣',
        color: '#a855f7',
        colorBg: 'rgba(168,85,247,0.08)',
        colorBorder: 'rgba(168,85,247,0.2)',
        sql: `SELECT column, COUNT(*) 
FROM table
GROUP BY column
HAVING COUNT(*) > 5;`,
        tip: '👉 WHERE → before grouping, HAVING → after grouping',
        description: 'Filter grouped results. HAVING is like WHERE but works on aggregated data.',
        problems: [
            { lc: 596, title: 'Classes More Than 5 Students', difficulty: 'Easy', url: 'https://leetcode.com/problems/classes-more-than-5-students/' },
            { lc: 586, title: 'Customer Placing the Largest Number of Orders', difficulty: 'Easy', url: 'https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/' },
            { lc: 570, title: 'Managers with at Least 5 Direct Reports', difficulty: 'Medium', url: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/' },
        ]
    },
    {
        id: 'inner-join',
        title: 'INNER JOIN',
        emoji: '🟠',
        color: '#f97316',
        colorBg: 'rgba(249,115,22,0.08)',
        colorBorder: 'rgba(249,115,22,0.2)',
        sql: `SELECT *
FROM A
INNER JOIN B
ON A.id = B.id;`,
        tip: '👉 Only matching rows from both tables',
        description: 'Combine rows from two or more tables based on matching column values. Returns only matched rows.',
        problems: [
            { lc: 175, title: 'Combine Two Tables', difficulty: 'Easy', url: 'https://leetcode.com/problems/combine-two-tables/' },
            { lc: 181, title: 'Employees Earning More Than Their Managers', difficulty: 'Easy', url: 'https://leetcode.com/problems/employees-earning-more-than-their-managers/' },
            { lc: 197, title: 'Rising Temperature', difficulty: 'Easy', url: 'https://leetcode.com/problems/rising-temperature/' },
            { lc: 570, title: 'Managers with at Least 5 Direct Reports', difficulty: 'Medium', url: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/' },
        ]
    },
    {
        id: 'left-join',
        title: 'LEFT JOIN (VERY IMPORTANT)',
        emoji: '🔴',
        color: '#ef4444',
        colorBg: 'rgba(239,68,68,0.08)',
        colorBorder: 'rgba(239,68,68,0.2)',
        sql: `SELECT *
FROM A
LEFT JOIN B
ON A.id = B.id;`,
        tip: '👉 All from A + matching from B. Used in: "customers who never ordered"',
        description: 'Returns all rows from the left table and matching rows from the right table. Non-matching rows get NULL.',
        problems: [
            { lc: 175, title: 'Combine Two Tables', difficulty: 'Easy', url: 'https://leetcode.com/problems/combine-two-tables/' },
            { lc: 183, title: 'Customers Who Never Order', difficulty: 'Easy', url: 'https://leetcode.com/problems/customers-who-never-order/' },
            { lc: 197, title: 'Rising Temperature', difficulty: 'Easy', url: 'https://leetcode.com/problems/rising-temperature/' },
        ]
    },
    {
        id: 'subquery',
        title: 'Subquery',
        emoji: '🟤',
        color: '#a8763e',
        colorBg: 'rgba(168,118,62,0.08)',
        colorBorder: 'rgba(168,118,62,0.2)',
        sql: `SELECT name
FROM Employee
WHERE salary > (
    SELECT AVG(salary) FROM Employee
);`,
        tip: '👉 Query inside query — used for comparisons against aggregated values',
        description: 'Nested queries that provide values for the outer query. Essential for complex filtering and comparisons.',
        problems: [
            { lc: 176, title: 'Second Highest Salary', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
            { lc: 177, title: 'Nth Highest Salary', difficulty: 'Medium', url: 'https://leetcode.com/problems/nth-highest-salary/' },
            { lc: 184, title: 'Department Highest Salary', difficulty: 'Medium', url: 'https://leetcode.com/problems/department-highest-salary/' },
        ]
    },
    {
        id: 'exists',
        title: 'EXISTS / NOT EXISTS',
        emoji: '⚫',
        color: '#64748b',
        colorBg: 'rgba(100,116,139,0.08)',
        colorBorder: 'rgba(100,116,139,0.2)',
        sql: `SELECT name
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1 FROM Orders o 
    WHERE o.customerId = c.id
);`,
        tip: '👉 Cleaner alternative to LEFT JOIN + IS NULL pattern',
        description: 'Check for existence of rows in a subquery. NOT EXISTS is powerful for finding "missing" records.',
        problems: [
            { lc: 183, title: 'Customers Who Never Order', difficulty: 'Easy', url: 'https://leetcode.com/problems/customers-who-never-order/' },
            { lc: 584, title: 'Find Customer Referee', difficulty: 'Easy', url: 'https://leetcode.com/problems/find-customer-referee/' },
        ]
    },
    {
        id: 'window-functions',
        title: 'Window Functions (VERY HIGH ROI 🔥)',
        emoji: '🔥',
        color: '#f59e0b',
        colorBg: 'rgba(245,158,11,0.08)',
        colorBorder: 'rgba(245,158,11,0.2)',
        sql: `SELECT name, 
       RANK() OVER (ORDER BY salary DESC) AS rnk
FROM Employee;`,
        tip: '👉 Used for: ranking, top-k, consecutive rows, running totals',
        description: 'Perform calculations across rows related to the current row. Includes RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD.',
        problems: [
            { lc: 178, title: 'Rank Scores', difficulty: 'Medium', url: 'https://leetcode.com/problems/rank-scores/' },
            { lc: 180, title: 'Consecutive Numbers', difficulty: 'Medium', url: 'https://leetcode.com/problems/consecutive-numbers/' },
            { lc: 185, title: 'Department Top Three Salaries', difficulty: 'Hard', url: 'https://leetcode.com/problems/department-top-three-salaries/' },
            { lc: 184, title: 'Department Highest Salary', difficulty: 'Medium', url: 'https://leetcode.com/problems/department-highest-salary/' },
        ]
    },
    {
        id: 'case',
        title: 'CASE (Conditional Logic)',
        emoji: '🧠',
        color: '#06b6d4',
        colorBg: 'rgba(6,182,212,0.08)',
        colorBorder: 'rgba(6,182,212,0.2)',
        sql: `SELECT name,
       CASE 
           WHEN salary > 50000 THEN 'High'
           ELSE 'Low'
       END AS category
FROM Employee;`,
        tip: '👉 SQL equivalent of if-else. Great for data transformation.',
        description: 'Add conditional logic in SQL queries. Works like if-else for creating computed columns.',
        problems: [
            { lc: 627, title: 'Swap Salary', difficulty: 'Easy', url: 'https://leetcode.com/problems/swap-salary/' },
            { lc: 1667, title: 'Fix Names in a Table', difficulty: 'Easy', url: 'https://leetcode.com/problems/fix-names-in-a-table/' },
        ]
    },
    {
        id: 'limit',
        title: 'LIMIT (Bonus)',
        emoji: '🎯',
        color: '#10b981',
        colorBg: 'rgba(16,185,129,0.08)',
        colorBorder: 'rgba(16,185,129,0.2)',
        sql: `SELECT * 
FROM table
LIMIT 1;`,
        tip: '👉 Very useful for "top 1", "first N" type problems',
        description: 'Restrict the number of rows returned. Often used with ORDER BY for top-N queries.',
        problems: [
            { lc: 586, title: 'Customer Placing the Largest Number of Orders', difficulty: 'Easy', url: 'https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/' },
            { lc: 176, title: 'Second Highest Salary', difficulty: 'Medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
        ]
    },
    {
        id: 'advanced-misc',
        title: 'Advanced / Miscellaneous',
        emoji: '💎',
        color: '#8b5cf6',
        colorBg: 'rgba(139,92,246,0.08)',
        colorBorder: 'rgba(139,92,246,0.2)',
        sql: `-- Combines multiple patterns:
-- JOINs + Subqueries + Window Functions
-- + Conditional Logic`,
        tip: '👉 Real interview problems often combine multiple patterns',
        description: 'Complex problems that combine multiple SQL patterns. Great for final-round interview prep.',
        problems: [
            { lc: 262, title: 'Trips and Users', difficulty: 'Hard', url: 'https://leetcode.com/problems/trips-and-users/' },
            { lc: 601, title: 'Human Traffic of Stadium', difficulty: 'Hard', url: 'https://leetcode.com/problems/human-traffic-of-stadium/' },
        ]
    }
];
