// DSA Patterns - Java Skeletons and Details

export const DSA_PATTERNS = {
    "Binary Search": [
        {
            title: "Binary Search on Answer",
            emoji: "🎯",
            color: "#10b981", // Emerald
            colorBg: "rgba(16,185,129,0.08)",
            colorBorder: "rgba(16,185,129,0.2)",
            description: "Used to find a min/max valid answer by repeatedly halving the search space of correct answers.",
            code: `// Use when: answer lies in range & condition is monotonic

int solve(int[] arr) {
    int low = 1, high = 1_000_000; // define search space

    int ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;

        if (isPossible(arr, mid)) {
            ans = mid; // update possible answer
            high = mid - 1; // minimize (or maximize accordingly)
        } else {
            low = mid + 1;
        }
    }
    return ans; 
}

// Check function (core logic)
boolean isPossible(int[] arr, int mid) {
    return true; // problem specific
}`,
            howToIdentify: "The problem asks for 'minimum maximum' or 'maximum minimum', or you can easily verify an answer but hard to construct it directly.",
            killerProblems: "LC 875 (Koko Eating Bananas), LC 410 (Split Array Largest Sum)",
            commonMistakes: "Using `low = 0` or `high = arr.length` blindly instead of finding actual boundaries. Missing the `= ans` update pattern, leading to edge-case failures."
        }
    ],
    "Dynamic Programming": [
        {
            title: "1D DP",
            emoji: "📏",
            color: "#f59e0b", // Amber
            colorBg: "rgba(245,158,11,0.08)",
            colorBorder: "rgba(245,158,11,0.2)",
            description: "State depends only on a single shifting variable, often representing an index or current state.",
            code: `int solve(int n, int[] arr) {
    int[] dp = new int[n + 1];
    Arrays.fill(dp, -1);
    return memo(n - 1, arr, dp);
}

int memo(int index, int[] arr, int[] dp) {
    if (index == 0) return arr[0]; // base case
    if (index < 0) return 0;
    
    if (dp[index] != -1) return dp[index];
    
    int pick = arr[index] + memo(index - 2, arr, dp);
    int notPick = 0 + memo(index - 1, arr, dp);
    
    return dp[index] = Math.max(pick, notPick);
}`,
            howToIdentify: "Finding max/min ways, counting steps on arrays where the state at `i` depends strictly on `i-1`, `i-2`, etc.",
            killerProblems: "LC 70 (Climbing Stairs), LC 198 (House Robber)",
            commonMistakes: "Forgetting base cases like out-of-bounds `index < 0`. Not converting the recursive structure to space-optimized DP."
        },
        {
            title: "Grid DP (2D)",
            emoji: "🔲",
            color: "#3b82f6", // Blue
            colorBg: "rgba(59,130,246,0.08)",
            colorBorder: "rgba(59,130,246,0.2)",
            description: "DP where the state represents a cell `(i, j)` in a 2D matrix.",
            code: `int memo(int i, int j, int[][] grid, int[][] dp) {
    if (i == 0 && j == 0) return grid[0][0]; // reached start
    if (i < 0 || j < 0) return 1e9; // boundaries (for max/min problems)
    
    if (dp[i][j] != -1) return dp[i][j];
    
    int up = grid[i][j] + memo(i - 1, j, grid, dp);
    int left = grid[i][j] + memo(i, j - 1, grid, dp);
    
    return dp[i][j] = Math.min(up, left);
}`,
            howToIdentify: "Given a 2D grid/maze, move right or down to reach bottom-right corner while minimizing, maximizing, or counting ways.",
            killerProblems: "LC 62 (Unique Paths), LC 64 (Minimum Path Sum)",
            commonMistakes: "Writing overlapping base cases incorrectly. Using `Integer.MAX_VALUE` which overflows when adding `grid[i][j]`. Use `1e9` instead."
        },
        {
            title: "0/1 Knapsack",
            emoji: "🎒",
            color: "#a855f7", // Purple
            colorBg: "rgba(168,85,247,0.08)",
            colorBorder: "rgba(168,85,247,0.2)",
            description: "Standard pick/not-pick pattern bounded by a max capacity where each item is chosen zero or one time.",
            code: `int memo(int index, int W, int[] wt, int[] val, int[][] dp) {
    if (index == 0) {
        if (wt[0] <= W) return val[0];
        return 0;
    }
    
    if (dp[index][W] != -1) return dp[index][W];
    
    int notTake = 0 + memo(index - 1, W, wt, val, dp);
    int take = Integer.MIN_VALUE;
    if (wt[index] <= W) {
        take = val[index] + memo(index - 1, W - wt[index], wt, val, dp);
    }
    
    return dp[index][W] = Math.max(take, notTake);
}`,
            howToIdentify: "Finding subset sums, partitioning arrays into subset sums, or maximizing value with bounded weight limits.",
            killerProblems: "LC 416 (Partition Equal Subset Sum), LC 494 (Target Sum)",
            commonMistakes: "Failing to account for the capacity `W` hitting exact zero differently from index hitting zero. Passing down the wrong weight capacity."
        },
        {
            title: "Unbounded Knapsack",
            emoji: "♾️",
            color: "#ec4899", // Pink
            colorBg: "rgba(236,72,153,0.08)",
            colorBorder: "rgba(236,72,153,0.2)",
            description: "Knapsack where an item can be picked infinitely many times.",
            code: `int memo(int index, int W, int[] wt, int[] val, int[][] dp) {
    if (index == 0) {
        return (W / wt[0]) * val[0];
    }
    
    if (dp[index][W] != -1) return dp[index][W];
    
    int notTake = 0 + memo(index - 1, W, wt, val, dp);
    int take = Integer.MIN_VALUE;
    if (wt[index] <= W) {
        // Notice we do NOT do index - 1 here
        take = val[index] + memo(index, W - wt[index], wt, val, dp);
    }
    
    return dp[index][W] = Math.max(take, notTake);
}`,
            howToIdentify: "Infinite supply of items, coin change where you have infinite coins, or cutting rods.",
            killerProblems: "LC 322 (Coin Change), LC 518 (Coin Change II)",
            commonMistakes: "Moving to `index - 1` even after picking the item. In unbounded, we stay at `index` so it can be picked again."
        },
        {
            title: "Longest Common Subsequence (LCS)",
            emoji: "🔗",
            color: "#ef4444", // Red
            colorBg: "rgba(239,68,68,0.08)",
            colorBorder: "rgba(239,68,68,0.2)",
            description: "DP matching two strings index by index.",
            code: `int memo(int i, int j, String s1, String s2, int[][] dp) {
    if (i < 0 || j < 0) return 0;
    
    if (dp[i][j] != -1) return dp[i][j];
    
    if (s1.charAt(i) == s2.charAt(j)) {
        return dp[i][j] = 1 + memo(i - 1, j - 1, s1, s2, dp);
    }
    
    return dp[i][j] = Math.max(
        memo(i - 1, j, s1, s2, dp), 
        memo(i, j - 1, s1, s2, dp)
    );
}`,
            howToIdentify: "Two strings are given, tasks involve matching subsequences, deletions/insertions to match strings, or finding palindromes (LCS with reversed string).",
            killerProblems: "LC 1143 (Longest Common Subsequence), LC 516 (Longest Palindromic Subsequence)",
            commonMistakes: "Using 1-based indexing for tabulation but forgetting to map it back properly to 0-based indexing or returning out-of-bounds."
        },
        {
            title: "Longest Increasing Subsequence (LIS)",
            emoji: "📈",
            color: "#8b5cf6", // Violet
            colorBg: "rgba(139,92,246,0.08)",
            colorBorder: "rgba(139,92,246,0.2)",
            description: "Finding strict increasing sequences. Usually solved in O(N^2) DP or O(N log N) using binary search.",
            code: `// O(N^2) DP Approach
int memo(int index, int prev_index, int[] arr, int[][] dp) {
    if (index == arr.length) return 0;
    
    if (dp[index][prev_index + 1] != -1) return dp[index][prev_index + 1];
    
    int len = 0 + memo(index + 1, prev_index, arr, dp); // not take
    
    if (prev_index == -1 || arr[index] > arr[prev_index]) {
        len = Math.max(len, 1 + memo(index + 1, index, arr, dp)); // take
    }
    
    return dp[index][prev_index + 1] = len;
}`,
            howToIdentify: "Finding max length of increasing sequences. Can be strings, envelopes, building bridges, or Russian doll envelopes.",
            killerProblems: "LC 300 (Longest Increasing Subsequence), LC 368 (Largest Divisible Subset), LC 354 (Russian Doll Envelopes)",
            commonMistakes: "State tracking requires `prev_index + 1` in the memo array because `prev_index` can explicitly be -1 initially."
        },
        {
            title: "DP on Stocks",
            emoji: "💹",
            color: "#22c55e", // Green
            colorBg: "rgba(34,197,94,0.08)",
            colorBorder: "rgba(34,197,94,0.2)",
            description: "A state machine simulating buying, selling, or waiting on a stock market over days.",
            code: `int memo(int index, int buy, int cap, int[] prices, int[][][] dp) {
    if (index == prices.length || cap == 0) return 0;
    
    if (dp[index][buy][cap] != -1) return dp[index][buy][cap];
    
    if (buy == 1) { // Allowed to buy
        return dp[index][buy][cap] = Math.max(
            -prices[index] + memo(index + 1, 0, cap, prices, dp), // buy
            0 + memo(index + 1, 1, cap, prices, dp) // wait
        );
    } else { // Allowed to sell
        return dp[index][buy][cap] = Math.max(
            prices[index] + memo(index + 1, 1, cap - 1, prices, dp), // sell
            0 + memo(index + 1, 0, cap, prices, dp) // wait
        );
    }
}`,
            howToIdentify: "Buying or selling array elements (stocks/assets) sequentially with transaction caps, cooldowns, or fees.",
            killerProblems: "LC 122 (Best Time to Buy and Sell Stock II), LC 123 (Best Time to Buy and Sell Stock III)",
            commonMistakes: "Decreasing the `cap` logic on buy instead of sell, mismatching the `buy=0/1` states, or failing to add transaction fee or cooldown properly."
        },
        {
            title: "Matrix Chain Multiplication (MCM)",
            emoji: "⛓️",
            color: "#f97316", // Orange
            colorBg: "rgba(249,115,22,0.08)",
            colorBorder: "rgba(249,115,22,0.2)",
            description: "Partitioning an array into two pieces across a range [i ... j], evaluated recursively.",
            code: `int memo(int i, int j, int[] arr, int[][] dp) {
    if (i == j) return 0; // base case (single element/matrix)
    
    if (dp[i][j] != -1) return dp[i][j];
    
    int mini = Integer.MAX_VALUE;
    // Partitioning loop
    for (int k = i; k < j; k++) {
        int steps = (arr[i-1] * arr[k] * arr[j]) 
                    + memo(i, k, arr, dp) 
                    + memo(k + 1, j, arr, dp);
        mini = Math.min(mini, steps);
    }
    
    return dp[i][j] = mini;
}`,
            howToIdentify: "Finding optimal ways to parenthesize, balloon bursts, cutting sticks, or merging items optimally.",
            killerProblems: "LC 312 (Burst Balloons), LC 1547 (Minimum Cost to Cut a Stick)",
            commonMistakes: "Setting `i` and `j` boundaries incorrectly. Getting the limits of `k` wrong (e.g., `k < j` vs `k <= j`). Using `Integer.MAX_VALUE` and returning an overflow."
        },
        {
            title: "Front Partition DP",
            emoji: "✂️",
            color: "#06b6d4", // Cyan
            colorBg: "rgba(6,182,212,0.08)",
            colorBorder: "rgba(6,182,212,0.2)",
            description: "Given a string or array, partition it from the front and recursively solve the rest.",
            code: `int memo(int i, String s, int[] dp) {
    if (i == s.length()) return 0;
    
    if (dp[i] != -1) return dp[i];
    
    int minCost = Integer.MAX_VALUE;
    // Try cutting at every possible location from current index
    for (int j = i; j < s.length(); j++) {
        if (isValid(s, i, j)) {
            int cost = 1 + memo(j + 1, s, dp);
            minCost = Math.min(minCost, cost);
        }
    }
    
    return dp[i] = minCost;
}`,
            howToIdentify: "Making minimal or maximal valid partitions forming valid prefixes (Palindrome partitions, Word Break).",
            killerProblems: "LC 132 (Palindrome Partitioning II), LC 139 (Word Break)",
            commonMistakes: "Returning `1` on `i == s.length()` instead of `0`. Off-by-one bounds inside the `isValid` logic."
        }
    ],
    "Two Pointers": [
        {
            title: "Opposite Ends",
            emoji: "👉👈",
            color: "#6366f1", // Indigo
            colorBg: "rgba(99,102,241,0.08)",
            colorBorder: "rgba(99,102,241,0.2)",
            description: "Two pointers starting at extreme ends of a sorted array, moving towards each other.",
            code: `int solve(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return 1;
        else if (sum < target) left++;
        else right--;
    }
    return 0;
}`,
            howToIdentify: "Finding pairs/triplets in sorted arrays, checking palindromes, or dealing with sorted properties.",
            killerProblems: "LC 167 (Two Sum II), LC 15 (3Sum), LC 11 (Container With Most Water)",
            commonMistakes: "Not checking `left < right` correctly. Trying to use it on an unsorted array without sorting first."
        }
    ],
    "Sliding Window": [
        {
            title: "Variable Window",
            emoji: "🪟",
            color: "#14b8a6", // Teal
            colorBg: "rgba(20,184,166,0.08)",
            colorBorder: "rgba(20,184,166,0.2)",
            description: "Expand window by moving `right`, shrink by moving `left` when condition invalidates.",
            code: `int maxSubarray(int[] arr, int k) {
    int left = 0, right = 0;
    int sum = 0, maxLen = 0;
    
    while (right < arr.length) {
        sum += arr[right]; // expand
        
        while (sum > k) { // shrink condition
            sum -= arr[left];
            left++;
        }
        
        if (sum == k) { // check valid
            maxLen = Math.max(maxLen, right - left + 1);
        }
        right++;
    }
    return maxLen;
}`,
            howToIdentify: "Finding max/min contiguous subarray or substring that satisfies a certain condition.",
            killerProblems: "LC 3 (Longest Substring Without Repeating Characters), LC 209 (Minimum Size Subarray Sum)",
            commonMistakes: "Updating the 'answer' inside the invalid `while` loop instead of outside, or off-by-one errors with `right - left + 1`."
        }
    ],
    "Prefix Sum & Hashing": [
        {
            title: "Subarray Sums with Hashmap",
            emoji: "➕",
            color: "#d946ef", // Fuchsia
            colorBg: "rgba(217,70,239,0.08)",
            colorBorder: "rgba(217,70,239,0.2)",
            description: "Store prefix sums logically in a map to find subarrays matching `target`.",
            code: `int subarraySum(int[] nums, int k) {
    int count = 0, sum = 0;
    HashMap<Integer, Integer> map = new HashMap<>(); // prefix sum -> frequency
    map.put(0, 1); // base case
    
    for (int num : nums) {
        sum += num;
        if (map.containsKey(sum - k)) {
            count += map.get(sum - k);
        }
        map.put(sum, map.getOrDefault(sum, 0) + 1);
    }
    return count;
}`,
            howToIdentify: "Counting/finding contiguous subarrays equal to K when array contains negative numbers.",
            killerProblems: "LC 560 (Subarray Sum Equals K), LC 525 (Contiguous Array)",
            commonMistakes: "Forgetting the base case `map.put(0, 1)`. Searching for `sum + k` instead of `sum - k`."
        }
    ],
    "Stack & Monotonic Stack": [
        {
            title: "Next Greater Element",
            emoji: "🥞",
            color: "#f43f5e", // Rose
            colorBg: "rgba(244,63,94,0.08)",
            colorBorder: "rgba(244,63,94,0.2)",
            description: "Maintain a monotonic stack (decreasing) to find the next strictly greater element in O(N).",
            code: `int[] nextGreaterElement(int[] arr) {
    int n = arr.length;
    int[] nge = new int[n];
    Stack<Integer> st = new Stack<>();
    
    // Traverse backwards
    for (int i = n - 1; i >= 0; i--) {
        while (!st.isEmpty() && st.peek() <= arr[i]) {
            st.pop(); // remove smaller elements
        }
        
        nge[i] = st.isEmpty() ? -1 : st.peek();
        st.push(arr[i]);
    }
    return nge;
}`,
            howToIdentify: "Given an array, for each element find the nearest smaller/greater to the right/left in O(N).",
            killerProblems: "LC 496 (Next Greater Element I), LC 739 (Daily Temperatures), LC 84 (Largest Rectangle in Histogram)",
            commonMistakes: "Traversing forwards instead of backwards. Pushing indices vs values improperly."
        }
    ],
    "Linked List": [
        {
            title: "Fast & Slow Pointers (Tortoise & Hare)",
            emoji: "🐢",
            color: "#84cc16", // Lime
            colorBg: "rgba(132,204,22,0.08)",
            colorBorder: "rgba(132,204,22,0.2)",
            description: "Two pointers iterating at different speeds to detect cycles or find middle.",
            code: `ListNode findMiddle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    
    // Detect cycle or find middle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
            howToIdentify: "Finding middle node, cycle detection (Linked List / Arrays matching graphs).",
            killerProblems: "LC 141 (Linked List Cycle), LC 876 (Middle of the Linked List)",
            commonMistakes: "Checking `fast.next != null` without checking `fast != null` first, causing a NullPointerException."
        }
    ],
    "Queue & Deque": [
        {
            title: "Sliding Window Maximum (Monotonic Deque)",
            emoji: "🛒",
            color: "#eab308", // Yellow
            colorBg: "rgba(234,179,8,0.08)",
            colorBorder: "rgba(234,179,8,0.2)",
            description: "Maintain a strictly decreasing Deque storing indices to get window maximum in O(1).",
            code: `int[] maxSlidingWindow(int[] arr, int k) {
    int n = arr.length;
    int[] res = new int[n - k + 1];
    Deque<Integer> q = new ArrayDeque<>();
    
    for (int i = 0; i < n; i++) {
        // remove out of bounds elements 
        if (!q.isEmpty() && q.peekFirst() == i - k) {
            q.pollFirst();
        }
        // maintain decreasing order
        while (!q.isEmpty() && arr[q.peekLast()] <= arr[i]) {
            q.pollLast();
        }
        q.offerLast(i);
        
        // record answer
        if (i >= k - 1) {
            res[i - k + 1] = arr[q.peekFirst()];
        }
    }
    return res;
}`,
            howToIdentify: "Finding running minimums or maximums over a fixed size sliding window.",
            killerProblems: "LC 239 (Sliding Window Maximum)",
            commonMistakes: "Polling out values instead of indices from the Deque. Adding to `res` before the window has reached size `k`."
        }
    ],
    "Heap / Priority Queue": [
        {
            title: "Top K Elements / Min-Heap",
            emoji: "🏔️",
            color: "#60a5fa", // Blue-400
            colorBg: "rgba(96,165,250,0.08)",
            colorBorder: "rgba(96,165,250,0.2)",
            description: "Maintain a Min-Heap of size K. When over K, remove the smallest. Leaves K largest elements.",
            code: `int findKthLargest(int[] arr, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>(); // Min-Heap
    for (int val : arr) {
        pq.offer(val);
        if (pq.size() > k) {
            pq.poll(); // remove the smallest
        }
    }
    return pq.peek(); // Kth largest is at the top
}`,
            howToIdentify: "Finding Top K, Kth Largest/Smallest, or frequently merging lowest values.",
            killerProblems: "LC 215 (Kth Largest Element in an Array), LC 347 (Top K Frequent Elements)",
            commonMistakes: "Using a Max-Heap instead of a Min-Heap for finding 'Kth Largest'. Recreating PQ unnecessarily."
        }
    ],
    "Merge Intervals": [
        {
            title: "Overlapping Intervals",
            emoji: "📏",
            color: "#a3e635", // Lime-400
            colorBg: "rgba(163,230,53,0.08)",
            colorBorder: "rgba(163,230,53,0.2)",
            description: "Sort intervals by start time. Merge if the current start <= previous end.",
            code: `int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;
    
    // Sort by start time
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    
    List<int[]> res = new ArrayList<>();
    int[] current = intervals[0];
    res.add(current);
    
    for (int[] interval : intervals) {
        int currStart = current[0], currEnd = current[1];
        int nextStart = interval[0], nextEnd = interval[1];
        
        if (nextStart <= currEnd) {
            current[1] = Math.max(currEnd, nextEnd); // Merge
        } else {
            current = interval; // Disjoint, push new
            res.add(current);
        }
    }
    return res.toArray(new int[res.size()][]);
}`,
            howToIdentify: "Determining overlapping points, scheduling meetings, or merging line segments.",
            killerProblems: "LC 56 (Merge Intervals), LC 57 (Insert Interval)",
            commonMistakes: "Not sorting beforehand. Forgetting to expand the `current[1]` to `Math.max(currEnd, nextEnd)` instead of just `nextEnd`."
        }
    ],
    "Cyclic Sort": [
        {
            title: "Index Mapping",
            emoji: "🔄",
            color: "#f87171", // Red-400
            colorBg: "rgba(248,113,113,0.08)",
            colorBorder: "rgba(248,113,113,0.2)",
            description: "When given an array containing numbers in range `1...N`, sort them in O(N) by placing them at their correct index `i-1`.",
            code: `void cyclicSort(int[] arr) {
    int i = 0;
    while (i < arr.length) {
        int correctIndex = arr[i] - 1;
        // Ignore out of bounds and duplicates
        if (arr[i] > 0 && arr[i] <= arr.length && arr[i] != arr[correctIndex]) {
            swap(arr, i, correctIndex);
        } else {
            i++;
        }
    }
}

void swap(int[] arr, int i, int j) {
    int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
}`,
            howToIdentify: "Finding missing or duplicate numbers strictly constrained within `1 to N` or `0 to N`.",
            killerProblems: "LC 268 (Missing Number), LC 442 (Find All Duplicates in an Array)",
            commonMistakes: "Swapping incorrectly causing an infinite loop. Incrementing `i` inside the swap block instead of letting it retry the swapped element."
        }
    ],
    "Greedy": [
        {
            title: "Interval Scheduling / Greedy choice",
            emoji: "🤑",
            color: "#fbbf24", // Amber-400
            colorBg: "rgba(251,191,36,0.08)",
            colorBorder: "rgba(251,191,36,0.2)",
            description: "Always pick the local optimal choice. Often requires sorting by end-times to maximize scheduled events.",
            code: `int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) return 0;
    // Sort by END time
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));
    
    int count = 1;
    int end = intervals[0][1];
    
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= end) {
            count++;
            end = intervals[i][1];
        }
    }
    return intervals.length - count; // Number of overlaps
}`,
            howToIdentify: "Finding minimum changes needed, assigning cookies, or scheduling max events.",
            killerProblems: "LC 435 (Non-overlapping Intervals), LC 455 (Assign Cookies)",
            commonMistakes: "Sorting intervals by start time instead of end time when trying to maximize the number of non-overlapping events."
        }
    ],
    "Backtracking": [
        {
            title: "Subsets / Combinations",
            emoji: "🔙",
            color: "#c084fc", // Purple-400
            colorBg: "rgba(192,132,252,0.08)",
            colorBorder: "rgba(192,132,252,0.2)",
            description: "Explore all possible states by choosing an item, recursing, and then removing the choice (backtracking).",
            code: `void backtrack(int start, int[] nums, List<Integer> current, List<List<Integer>> res) {
    res.add(new ArrayList<>(current)); // capture current state
    
    for (int i = start; i < nums.length; i++) {
        // Skip duplicates if array is sorted
        if (i > start && nums[i] == nums[i-1]) continue;
        
        current.add(nums[i]); // Choose
        backtrack(i + 1, nums, current, res); // Explore
        current.remove(current.size() - 1); // Un-choose
    }
}`,
            howToIdentify: "Generating subsets, permutations, combinations, or placing N-Queens on a board.",
            killerProblems: "LC 78 (Subsets), LC 46 (Permutations), LC 39 (Combination Sum)",
            commonMistakes: "Adding the literal `current` reference to the result instead of a deep copy `new ArrayList<>(current)`. Not sorting prior to duplicate skipping."
        }
    ],
    "Hashmap & String": [
        {
            title: "Anagram / Palindrome Frequencies",
            emoji: "🔤",
            color: "#6ee7b7", // Emerald-300
            colorBg: "rgba(110,231,183,0.08)",
            colorBorder: "rgba(110,231,183,0.2)",
            description: "Count character frequencies using a fixed size array of 26 integers to quickly compare strings.",
            code: `boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    
    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}`,
            howToIdentify: "Comparing strings irrespective of letter ordering, grouping similar characters, or tracking odd/even char counts.",
            killerProblems: "LC 242 (Valid Anagram), LC 49 (Group Anagrams)",
            commonMistakes: "Using `HashMap<Character, Integer>` which is much slower and uses more memory than a simple `int[26]` frequency array."
        }
    ],
    "Trees": [
        {
            title: "Depth First Search (DFS)",
            emoji: "🌳",
            color: "#4ade80", // Green-400
            colorBg: "rgba(74,222,128,0.08)",
            colorBorder: "rgba(74,222,128,0.2)",
            description: "Recursive traversal visiting nodes depth-first. Commonly used to check properties flowing up/down.",
            code: `int maxDepth(TreeNode root) {
    if (root == null) return 0; // base case
    
    int leftDepth = maxDepth(root.left);
    int rightDepth = maxDepth(root.right);
    
    // Process current node
    return Math.max(leftDepth, rightDepth) + 1;
}`,
            howToIdentify: "Finding max path sums, heights, lowest common ancestors, or flattening a tree structure.",
            killerProblems: "LC 104 (Maximum Depth of Binary Tree), LC 124 (Binary Tree Maximum Path Sum)",
            commonMistakes: "Failing to account for `null` nodes correctly. Not maintaining an overarching global `max` variable for path sum problems."
        },
        {
            title: "Breadth First Search (BFS)",
            emoji: "📶",
            color: "#67e8f9", // Cyan-300
            colorBg: "rgba(103,232,249,0.08)",
            colorBorder: "rgba(103,232,249,0.2)",
            description: "Level order traversal using a Queue to visit nodes layer by layer.",
            code: `List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    
    while (!q.isEmpty()) {
        int levelSize = q.size(); // strict size of current level
        List<Integer> level = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}`,
            howToIdentify: "Traversing level-by-level, finding shortest paths in unweighted trees/graphs, or finding nodes at a specific depth.",
            killerProblems: "LC 102 (Binary Tree Level Order Traversal), LC 199 (Binary Tree Right Side View)",
            commonMistakes: "Forgetting to capture the `q.size()` BEFORE the `for` loop, causing the loop bounds to change dynamically."
        }
    ],
    "Binary Search Tree": [
        {
            title: "Validate BST & Inorder Traversal",
            emoji: "🌲",
            color: "#2dd4bf", // Teal-400
            colorBg: "rgba(45,212,191,0.08)",
            colorBorder: "rgba(45,212,191,0.2)",
            description: "Pass a strict `min` and `max` bound down the tree. Inorder traversal yields a sorted sequence.",
            code: `boolean isValidBST(TreeNode root) {
    return isValid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

boolean isValid(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    
    return isValid(node.left, min, node.val) && 
           isValid(node.right, node.val, max);
}`,
            howToIdentify: "Validating properties based strictly on > left and < right recursively, or returning the sorted Kth smallest value.",
            killerProblems: "LC 98 (Validate Binary Search Tree), LC 230 (Kth Smallest Element in a BST)",
            commonMistakes: "Comparing left and right children instead of carrying complete min/max boundaries. Using `Integer.MIN_VALUE` which overflows on Edge Cases."
        }
    ],
    "Graphs": [
        {
            title: "Topological Sort (Kahn's Algorithm)",
            emoji: "🕸️",
            color: "#a78bfa", // Violet-400
            colorBg: "rgba(167,139,250,0.08)",
            colorBorder: "rgba(167,139,250,0.2)",
            description: "Orders directed acyclic graphs linearly based on in-degrees of nodes recursively zeroed.",
            code: `int[] topoSort(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    int[] inDegree = new int[numCourses];
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    
    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
        inDegree[pre[0]]++;
    }
    
    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) q.offer(i);
    }
    
    int[] order = new int[numCourses];
    int idx = 0;
    while (!q.isEmpty()) {
        int curr = q.poll();
        order[idx++] = curr;
        for (int neighbor : adj.get(curr)) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0) q.offer(neighbor);
        }
    }
    return idx == numCourses ? order : new int[0]; // check cycle
}`,
            howToIdentify: "Problems mapping dependencies, schedules where Task A must complete before Task B (Course Schedule).",
            killerProblems: "LC 207 (Course Schedule), LC 210 (Course Schedule II)",
            commonMistakes: "Creating the adjacency list backwards (A -> B vs B -> A) breaking expected execution flows."
        },
        {
            title: "Dijkstra's Algorithm (Shortest Path)",
            emoji: "🛣️",
            color: "#fb923c", // Orange-400
            colorBg: "rgba(251,146,60,0.08)",
            colorBorder: "rgba(251,146,60,0.2)",
            description: "Finds the shortest paths from a source node to all other reachable nodes in a weighted graph without negative cycles.",
            code: `// O(E log V) algorithm using a Min-Priority Queue
int[] dijkstra(int V, List<List<int[]>> adj, int src) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    
    // Add source: [node, distance]
    pq.offer(new int[]{src, 0});
    dist[src] = 0;
    
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[0];
        int d = curr[1];
        
        // Skip stale pairs
        if (d > dist[u]) continue;
        
        for (int[] edge : adj.get(u)) {
            int v = edge[0]; // neighbor
            int weight = edge[1];
            
            // Relaxation step
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.offer(new int[]{v, dist[v]});
            }
        }
    }
    return dist;
}`,
            howToIdentify: "Finding minimum time, distance, or cost moving through a graph with positive weighted edges.",
            killerProblems: "LC 743 (Network Delay Time), LC 787 (Cheapest Flights Within K Stops)",
            commonMistakes: "Applying this to graphs with negative weight cycles. Forgetting to skip stale nodes by omitting `if (d > dist[u]) continue;`."
        },
        {
            title: "Floyd Warshall (All-Pairs Shortest Path)",
            emoji: "🌐",
            color: "#db2777", // Pink-600
            colorBg: "rgba(219,39,119,0.08)",
            colorBorder: "rgba(219,39,119,0.2)",
            description: "Calculates the shortest paths between ALL pairs of nodes in a graph using DP.",
            code: `// O(V^3) algorithm to find all-pairs shortest paths
void floydWarshall(int[][] matrix) {
    int V = matrix.length;
    // Map unreachable vertices to a very high finite number (like 1e9)
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            if (matrix[i][j] == -1) matrix[i][j] = (int)(1e9); 
            if (i == j) matrix[i][j] = 0;
        }
    }
    
    // Trying all intermediate nodes 'k'
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                // If path via 'k' is strictly shorter, update it
                matrix[i][j] = Math.min(matrix[i][j], 
                               matrix[i][k] + matrix[k][j]);
            }
        }
    }
}`,
            howToIdentify: "Queries requiring shortest cost between any two arbitrary nodes, or detecting negative cycles universally.",
            killerProblems: "LC 1334 (Find the City With the Smallest Number of Neighbors at a Threshold Distance)",
            commonMistakes: "Using `Integer.MAX_VALUE` directly, which overflows to negative values when `matrix[i][k] + matrix[k][j]` is computed. Use `1e9`."
        },
        {
            title: "Breadth-First Search (BFS Graph)",
            emoji: "🌊",
            color: "#0ea5e9", // Sky-500
            colorBg: "rgba(14,165,233,0.08)",
            colorBorder: "rgba(14,165,233,0.2)",
            description: "Explores all neighbor nodes at the present depth before moving deeper, providing the shortest path in unweighted graphs.",
            code: `// O(V + E) level-order traversal using a Queue
List<Integer> bfsGraph(int V, List<List<Integer>> adj) {
    List<Integer> bfs = new ArrayList<>();
    boolean[] vis = new boolean[V];
    Queue<Integer> q = new LinkedList<>();
    
    // Starting from node 0 (assume 0-indexed connected graph)
    q.offer(0);
    vis[0] = true;
    
    while (!q.isEmpty()) {
        int node = q.poll();
        bfs.add(node);
        
        // Traverse all direct neighbors
        for (int neighbor : adj.get(node)) {
            if (!vis[neighbor]) {
                vis[neighbor] = true; // Mark visited early to avoid pushing duplicates
                q.offer(neighbor);
            }
        }
    }
    return bfs;
}`,
            howToIdentify: "Finding whether a path exists, searching broadly, or shortest paths where all edges equal weight 1.",
            killerProblems: "LC 994 (Rotting Oranges), LC 1091 (Shortest Path in Binary Matrix)",
            commonMistakes: "Marking elements visited when *popping* instead of when *pushing* to the queue. This inflates queue size."
        },
        {
            title: "Depth-First Search (DFS Graph)",
            emoji: "🧗",
            color: "#65a30d", // Lime-600
            colorBg: "rgba(101,163,13,0.08)",
            colorBorder: "rgba(101,163,13,0.2)",
            description: "Recursive search prioritizing deep dives along unique pathways until dead ends are hit.",
            code: `// O(V + E) depth-first recursive traversal
List<Integer> dfsGraph(int V, List<List<Integer>> adj) {
    boolean[] vis = new boolean[V];
    List<Integer> res = new ArrayList<>();
    
    // Handle disconnected components
    for (int i = 0; i < V; i++) {
        if (!vis[i]) {
            dfs(i, vis, adj, res);
        }
    }
    return res;
}

void dfs(int node, boolean[] vis, List<List<Integer>> adj, List<Integer> res) {
    vis[node] = true; // mark current as visited
    res.add(node);    // process the node
    
    // Go deep into each unvisited neighbor
    for (int neighbor : adj.get(node)) {
        if (!vis[neighbor]) {
            dfs(neighbor, vis, adj, res);
        }
    }
}`,
            howToIdentify: "Finding connected components, checking bipartiteness, detecting cycles, exploring mazes/grids completely.",
            killerProblems: "LC 547 (Number of Provinces), LC 802 (Find Eventual Safe States)",
            commonMistakes: "Forgetting to wrap the DFS call in a `for` loop to cover disconnected graph components."
        },
        {
            title: "Kosaraju's Algorithm (SCC)",
            emoji: "🔄",
            color: "#ef4444", // Red-500
            colorBg: "rgba(239,68,68,0.08)",
            colorBorder: "rgba(239,68,68,0.2)",
            description: "Locates all Strongly Connected Components (SCCs) using two passes of DFS, flipping edges centrally.",
            code: `// O(V + E) algorithm to find Strongly Connected Components
int kosaraju(int V, List<List<Integer>> adj) {
    int[] vis = new int[V];
    Stack<Integer> st = new Stack<>();
    
    // Step 1: Sort nodes by finish time inside a stack
    for (int i = 0; i < V; i++) {
        if (vis[i] == 0) dfsSort(i, vis, adj, st);
    }
    
    // Step 2: Reverse graph edges
    List<List<Integer>> adjRev = new ArrayList<>();
    for (int i = 0; i < V; i++) adjRev.add(new ArrayList<>());
    
    for (int i = 0; i < V; i++) {
        vis[i] = 0; // reset visited array
        for (int neighbor : adj.get(i)) {
            // Reverse direction: i -> neighbor becomes neighbor -> i
            adjRev.get(neighbor).add(i); 
        }
    }
    
    // Step 3: Second DFS pass according to finish time (pop from stack)
    int sccCount = 0;
    while (!st.isEmpty()) {
        int node = st.pop();
        if (vis[node] == 0) {
            sccCount++;
            dfsSCC(node, vis, adjRev);
        }
    }
    return sccCount;
}

void dfsSort(int node, int[] vis, List<List<Integer>> adj, Stack<Integer> st) {
    vis[node] = 1;
    for (int n : adj.get(node)) if (vis[n] == 0) dfsSort(n, vis, adj, st);
    st.push(node); // Push to stack when perfectly finished (leaves)
}

void dfsSCC(int node, int[] vis, List<List<Integer>> adjRev) {
    vis[node] = 1;
    for (int n : adjRev.get(node)) if (vis[n] == 0) dfsSCC(n, vis, adjRev);
}
`,
            howToIdentify: "Finding node clusters where every node can reach every other node, shrinking big cyclic graphs.",
            killerProblems: "Kosaraju's algorithm directly applied to find SSCs, related loosely to LC 1192 (Critical Connections in a Network / Bridges).",
            commonMistakes: "Executing DFS on `adj` during Step 3 instead of `adjRev`. Not handling disconnected components at the initial sorting step."
        }
    ],
    "Matrix": [
        {
            title: "2D Grid Traversal (DFS/BFS)",
            emoji: "🗺️",
            color: "#f472b6", // Pink-400
            colorBg: "rgba(244,114,182,0.08)",
            colorBorder: "rgba(244,114,182,0.2)",
            description: "Navigating matrices using direction vectors avoiding out of bounds edges.",
            code: `void dfs(int[][] grid, int r, int c) {
    int rows = grid.length, cols = grid[0].length;
    // Boundary checks & visited
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] == 0) return;
    
    grid[r][c] = 0; // Mark visited
    
    int[] dirR = {-1, 1, 0, 0};
    int[] dirC = {0, 0, -1, 1};
    
    for (int i = 0; i < 4; i++) {
        dfs(grid, r + dirR[i], c + dirC[i]);
    }
}`,
            howToIdentify: "Finding number of islands, max areas connected by 1s, rotting oranges, word searches.",
            killerProblems: "LC 200 (Number of Islands), LC 695 (Max Area of Island)",
            commonMistakes: "Failing to mark cells visited leading to StackOverflow/Infinite loops. Boundary condition sequence mismatching."
        }
    ],
    "Bit Manipulation": [
        {
            title: "Bitwise XOR / Subsets",
            emoji: "0️⃣",
            color: "#6b7280", // Gray-500
            colorBg: "rgba(107,114,128,0.08)",
            colorBorder: "rgba(107,114,128,0.2)",
            description: "Using bits `(1 << i)` to represent states, sets, toggles, or utilizing XOR to cancel duplicates.",
            code: `int singleNumber(int[] nums) {
    int res = 0;
    for (int num : nums) {
        res ^= num; // XOR cancels out matching pairs
    }
    return res;
}

// Generate subsets using Bitmasking
List<List<Integer>> generateSubsets(int[] nums) {
    int n = nums.length;
    List<List<Integer>> res = new ArrayList<>();
    
    // 1 << n equals 2^n
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            // Check if the i-th bit is set
            if ((mask & (1 << i)) != 0) {
                subset.add(nums[i]);
            }
        }
        res.add(subset);
    }
    return res;
}`,
            howToIdentify: "Missing numbers from pairs, counting set bits (Hamming weight), or generating O(1) space subsets.",
            killerProblems: "LC 136 (Single Number), LC 78 (Subsets), LC 338 (Counting Bits)",
            commonMistakes: "Operator precedence errors; always wrap bitwise checks in parentheses `(mask & (1 << i)) != 0`."
        }
    ],
    "Trie": [
        {
            title: "Prefix Tree",
            emoji: "🔠",
            color: "#fca5a5", // Red-300
            colorBg: "rgba(252,165,165,0.08)",
            colorBorder: "rgba(252,165,165,0.2)",
            description: "A tree where each node represents a character mapping to its subsequent character nodes.",
            code: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

class Trie {
    TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            if (node.children[c - 'a'] == null) {
                node.children[c - 'a'] = new TrieNode();
            }
            node = node.children[c - 'a'];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node = node.children[c - 'a'];
            if (node == null) return false;
        }
        return node.isEnd;
    }
}`,
            howToIdentify: "Heavy prefix lookups, autocorrect, searching dictionaries of words quickly, word search II.",
            killerProblems: "LC 208 (Implement Trie), LC 212 (Word Search II)",
            commonMistakes: "Allocating too many large TrieNode arrays causing memory bloat, or forgetting the `isEnd` flag at the end of insertions."
        }
    ],
    "Segment tree": [
        {
            title: "Range Queries",
            emoji: "📊",
            color: "#1d4ed8", // Blue-700
            colorBg: "rgba(29,78,216,0.08)",
            colorBorder: "rgba(29,78,216,0.2)",
            description: "Binary tree used to store information about array intervals to map logs of range sum/min queries.",
            code: `int[] tree;
int n;

void build(int[] arr, int node, int start, int end) {
    if (start == end) {
        tree[node] = arr[start];
    } else {
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}

void update(int node, int start, int end, int idx, int val) {
    if (start == end) {
        tree[node] = val;
    } else {
        int mid = (start + end) / 2;
        if (start <= idx && idx <= mid) {
            update(2 * node, start, mid, idx, val);
        } else {
            update(2 * node + 1, mid + 1, end, idx, val);
        }
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
}`,
            howToIdentify: "Querying properties across varying ranges/subarrays (Min, Max, Sum) with periodic point or range updates.",
            killerProblems: "LC 307 (Range Sum Query - Mutable), LC 315 (Count of Smaller Numbers After Self)",
            commonMistakes: "Making the tree array too short (`new int[4 * n]` is required). Going out of bounds on large inputs."
        }
    ]
};
