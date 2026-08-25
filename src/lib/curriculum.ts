import { Difficulty, Pattern } from "./types";

export type CurriculumProblem = {
  slug: string; // matches slugFromUrl(url)
  title: string;
  url: string;
  difficulty: Difficulty;
  pattern: Pattern;
  /** What this problem teaches / why it is in this position. */
  teaches: string;
};

const lc = (slug: string) => `https://leetcode.com/problems/${slug}/`;
const nc = (slug: string) => `https://neetcode.io/problems/${slug}`; // LeetCode-premium problems, free on NeetCode

type Row = [slug: string, title: string, difficulty: Difficulty, teaches: string, url?: string];

/**
 * NeetCode-150-based curriculum, ordered within each pattern from "teaches the
 * core move" to "combines it with something else". Do them in order.
 */
const GROUPS: Record<Pattern, Row[]> = {
  hashing: [
    ["contains-duplicate", "Contains Duplicate", "easy", "Set membership — the simplest hash use"],
    ["valid-anagram", "Valid Anagram", "easy", "Frequency counting"],
    ["two-sum", "Two Sum", "easy", "Complement lookup in one pass"],
    ["group-anagrams", "Group Anagrams", "medium", "Canonical key → bucket"],
    ["top-k-frequent-elements", "Top K Frequent Elements", "medium", "Counting + bucket sort (heap alternative)"],
    ["longest-consecutive-sequence", "Longest Consecutive Sequence", "medium", "Set as O(1) neighbour lookup; only start from sequence heads"],
  ],
  arrays: [
    ["valid-sudoku", "Valid Sudoku", "medium", "Index arithmetic for sub-boxes; sets per row/col/box"],
    ["product-of-array-except-self", "Product of Array Except Self", "medium", "Prefix and suffix passes"],
    ["string-encode-and-decode", "Encode and Decode Strings", "medium", "Length-prefix framing; a design-flavoured array problem", nc("string-encode-and-decode")],
    ["merge-sorted-array", "Merge Sorted Array", "easy", "Fill from the back to avoid overwrites"],
    ["majority-element", "Majority Element", "easy", "Boyer–Moore voting"],
    ["sort-colors", "Sort Colors", "medium", "Dutch national flag partitioning"],
  ],
  two_pointers: [
    ["valid-palindrome", "Valid Palindrome", "easy", "Converging pointers"],
    ["two-sum-ii-input-array-is-sorted", "Two Sum II", "medium", "Sorted input → move the pointer that helps"],
    ["remove-duplicates-from-sorted-array", "Remove Duplicates from Sorted Array", "easy", "Slow/fast writer pointer"],
    ["3sum", "3Sum", "medium", "Fix one, two-pointer the rest; dedupe carefully"],
    ["container-with-most-water", "Container With Most Water", "medium", "Greedy pointer move justified by a bound"],
    ["trapping-rain-water", "Trapping Rain Water", "hard", "Track max from each side"],
  ],
  sliding_window: [
    ["best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "easy", "Running minimum — the degenerate window"],
    ["longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "medium", "Grow right, shrink left on violation"],
    ["minimum-size-subarray-sum", "Minimum Size Subarray Sum", "medium", "Shrink while the condition still holds"],
    ["longest-repeating-character-replacement", "Longest Repeating Character Replacement", "medium", "Window valid iff len − maxFreq ≤ k"],
    ["permutation-in-string", "Permutation in String", "medium", "Fixed-size window with a count array"],
    ["minimum-window-substring", "Minimum Window Substring", "hard", "Need/have counters; shrink to minimum"],
    ["sliding-window-maximum", "Sliding Window Maximum", "hard", "Monotonic deque"],
  ],
  stack: [
    ["valid-parentheses", "Valid Parentheses", "easy", "Matching with a stack"],
    ["min-stack", "Min Stack", "medium", "Auxiliary stack carrying running min"],
    ["evaluate-reverse-polish-notation", "Evaluate Reverse Polish Notation", "medium", "Operand stack"],
    ["generate-parentheses", "Generate Parentheses", "medium", "Backtracking with open/close counts (stack-shaped recursion)"],
    ["daily-temperatures", "Daily Temperatures", "medium", "Monotonic stack — next greater element"],
    ["car-fleet", "Car Fleet", "medium", "Sort by position; stack of arrival times"],
    ["largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "hard", "Monotonic stack with widths"],
  ],
  binary_search: [
    ["binary-search", "Binary Search", "easy", "Get the loop invariant exactly right"],
    ["first-bad-version", "First Bad Version", "easy", "Search for a boundary, not a value"],
    ["search-a-2d-matrix", "Search a 2D Matrix", "medium", "Flatten 2D index into 1D"],
    ["koko-eating-bananas", "Koko Eating Bananas", "medium", "Binary search on the answer"],
    ["find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "medium", "Which half is sorted?"],
    ["search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "medium", "Same idea, now find a target"],
    ["time-based-key-value-store", "Time Based Key-Value Store", "medium", "Binary search inside a hash map"],
    ["median-of-two-sorted-arrays", "Median of Two Sorted Arrays", "hard", "Partition search"],
  ],
  linked_list: [
    ["reverse-linked-list", "Reverse Linked List", "easy", "Three-pointer reversal; also recursively"],
    ["merge-two-sorted-lists", "Merge Two Sorted Lists", "easy", "Dummy head"],
    ["middle-of-the-linked-list", "Middle of the Linked List", "easy", "Slow/fast pointers"],
    ["linked-list-cycle", "Linked List Cycle", "easy", "Floyd's cycle detection"],
    ["reorder-list", "Reorder List", "medium", "Find middle + reverse + merge"],
    ["remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "medium", "Two pointers with a gap"],
    ["copy-list-with-random-pointer", "Copy List with Random Pointer", "medium", "Old→new map, or interleaving trick"],
    ["add-two-numbers", "Add Two Numbers", "medium", "Carry handling"],
    ["find-the-duplicate-number", "Find the Duplicate Number", "medium", "Floyd's on an array as implicit list"],
    ["lru-cache", "LRU Cache", "medium", "Hash map + doubly linked list — a real design question"],
    ["merge-k-sorted-lists", "Merge k Sorted Lists", "hard", "Heap or divide and conquer"],
    ["reverse-nodes-in-k-group", "Reverse Nodes in k-Group", "hard", "Segment reversal with careful relinking"],
  ],
  trees: [
    ["invert-binary-tree", "Invert Binary Tree", "easy", "Simplest recursion on a tree"],
    ["maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "easy", "Post-order returning a value"],
    ["diameter-of-binary-tree", "Diameter of Binary Tree", "easy", "Compute one thing, return another"],
    ["balanced-binary-tree", "Balanced Binary Tree", "easy", "Bubble up height with a failure sentinel"],
    ["same-tree", "Same Tree", "easy", "Parallel recursion"],
    ["subtree-of-another-tree", "Subtree of Another Tree", "easy", "Reuse Same Tree at every node"],
    ["lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a BST", "medium", "Use the BST ordering"],
    ["binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "medium", "BFS with level sizes"],
    ["binary-tree-right-side-view", "Binary Tree Right Side View", "medium", "BFS, last node per level"],
    ["count-good-nodes-in-binary-tree", "Count Good Nodes in Binary Tree", "medium", "Pass state down (max so far)"],
    ["validate-binary-search-tree", "Validate Binary Search Tree", "medium", "Pass bounds down"],
    ["kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "medium", "In-order traversal, iterative"],
    ["construct-binary-tree-from-preorder-and-inorder-traversal", "Construct Binary Tree from Preorder and Inorder", "medium", "Root from preorder, split by inorder"],
    ["binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "hard", "Return best downward path, track best global"],
    ["serialize-and-deserialize-binary-tree", "Serialize and Deserialize Binary Tree", "hard", "Preorder with null markers"],
  ],
  tries: [
    ["implement-trie-prefix-tree", "Implement Trie", "medium", "The data structure itself"],
    ["design-add-and-search-words-data-structure", "Design Add and Search Words", "medium", "Trie + DFS for wildcards"],
    ["word-search-ii", "Word Search II", "hard", "Trie-guided backtracking on a grid"],
  ],
  heaps: [
    ["kth-largest-element-in-a-stream", "Kth Largest Element in a Stream", "easy", "Min-heap of size k"],
    ["last-stone-weight", "Last Stone Weight", "easy", "Max-heap simulation"],
    ["k-closest-points-to-origin", "K Closest Points to Origin", "medium", "Heap on a key"],
    ["kth-largest-element-in-an-array", "Kth Largest Element in an Array", "medium", "Heap vs quickselect — know both"],
    ["task-scheduler", "Task Scheduler", "medium", "Greedy with heap + cooldown queue"],
    ["design-twitter", "Design Twitter", "medium", "Merge k feeds with a heap"],
    ["find-median-from-data-stream", "Find Median from Data Stream", "hard", "Two heaps"],
  ],
  backtracking: [
    ["subsets", "Subsets", "medium", "Include/exclude recursion — the template"],
    ["combination-sum", "Combination Sum", "medium", "Reuse allowed; prune on sum"],
    ["permutations", "Permutations", "medium", "Used-set / swap approach"],
    ["subsets-ii", "Subsets II", "medium", "Sort + skip duplicates"],
    ["combination-sum-ii", "Combination Sum II", "medium", "Same dedupe trick, no reuse"],
    ["word-search", "Word Search", "medium", "Grid DFS with visited marking"],
    ["palindrome-partitioning", "Palindrome Partitioning", "medium", "Choose cut points"],
    ["letter-combinations-of-a-phone-number", "Letter Combinations of a Phone Number", "medium", "Cartesian product"],
    ["n-queens", "N-Queens", "hard", "Constraint sets per column/diagonal"],
  ],
  graphs: [
    ["number-of-islands", "Number of Islands", "medium", "Grid DFS/BFS flood fill"],
    ["max-area-of-island", "Max Area of Island", "medium", "Flood fill returning a size"],
    ["clone-graph", "Clone Graph", "medium", "Visited map old→new"],
    ["rotting-oranges", "Rotting Oranges", "medium", "Multi-source BFS"],
    ["islands-and-treasure", "Walls and Gates", "medium", "Multi-source BFS from targets", nc("islands-and-treasure")],
    ["pacific-atlantic-water-flow", "Pacific Atlantic Water Flow", "medium", "Reverse DFS from the borders"],
    ["surrounded-regions", "Surrounded Regions", "medium", "Mark from the border, then flip"],
    ["course-schedule", "Course Schedule", "medium", "Cycle detection / topological sort"],
    ["course-schedule-ii", "Course Schedule II", "medium", "Kahn's algorithm"],
    ["count-connected-components", "Number of Connected Components", "medium", "Union-Find", nc("count-connected-components")],
    ["redundant-connection", "Redundant Connection", "medium", "Union-Find finds the cycle edge"],
    ["valid-tree", "Graph Valid Tree", "medium", "n−1 edges and connected", nc("valid-tree")],
    ["word-ladder", "Word Ladder", "hard", "BFS over implicit graph with wildcard buckets"],
    ["network-delay-time", "Network Delay Time", "medium", "Dijkstra"],
    ["min-cost-to-connect-all-points", "Min Cost to Connect All Points", "medium", "Prim's MST"],
    ["cheapest-flights-within-k-stops", "Cheapest Flights Within K Stops", "medium", "Bellman-Ford with k rounds"],
    ["reconstruct-itinerary", "Reconstruct Itinerary", "hard", "Eulerian path (Hierholzer)"],
    ["swim-in-rising-water", "Swim in Rising Water", "hard", "Dijkstra on a grid / binary search + BFS"],
    ["foreign-dictionary", "Alien Dictionary", "hard", "Build graph from ordering, then topo sort", nc("foreign-dictionary")],
  ],
  dp_1d: [
    ["climbing-stairs", "Climbing Stairs", "easy", "The Fibonacci recurrence"],
    ["min-cost-climbing-stairs", "Min Cost Climbing Stairs", "easy", "Same shape with a cost"],
    ["house-robber", "House Robber", "medium", "Take/skip recurrence"],
    ["house-robber-ii", "House Robber II", "medium", "Circular → run twice"],
    ["longest-palindromic-substring", "Longest Palindromic Substring", "medium", "Expand around centre"],
    ["palindromic-substrings", "Palindromic Substrings", "medium", "Same expansion, count them"],
    ["decode-ways", "Decode Ways", "medium", "Recurrence with validity checks"],
    ["coin-change", "Coin Change", "medium", "Unbounded knapsack, min"],
    ["maximum-product-subarray", "Maximum Product Subarray", "medium", "Track max and min"],
    ["word-break", "Word Break", "medium", "dp[i] = any dp[j] with a word in between"],
    ["longest-increasing-subsequence", "Longest Increasing Subsequence", "medium", "O(n²) dp, then patience sort"],
    ["partition-equal-subset-sum", "Partition Equal Subset Sum", "medium", "0/1 knapsack as a reachable-sum set"],
  ],
  dp_2d: [
    ["unique-paths", "Unique Paths", "medium", "Grid dp — the template"],
    ["longest-common-subsequence", "Longest Common Subsequence", "medium", "Two-string dp table"],
    ["best-time-to-buy-and-sell-stock-with-cooldown", "Best Time to Buy and Sell Stock with Cooldown", "medium", "State machine dp"],
    ["coin-change-ii", "Coin Change II", "medium", "Unbounded knapsack, count ways"],
    ["target-sum", "Target Sum", "medium", "Memoised (index, sum)"],
    ["interleaving-string", "Interleaving String", "medium", "dp[i][j] over two prefixes"],
    ["longest-increasing-path-in-a-matrix", "Longest Increasing Path in a Matrix", "hard", "DFS + memo on a grid"],
    ["edit-distance", "Edit Distance", "medium", "Classic two-string dp with three moves"],
    ["distinct-subsequences", "Distinct Subsequences", "hard", "Count matchings"],
    ["burst-balloons", "Burst Balloons", "hard", "Interval dp — pick the last one"],
    ["regular-expression-matching", "Regular Expression Matching", "hard", "dp with the * case"],
  ],
  greedy: [
    ["maximum-subarray", "Maximum Subarray", "medium", "Kadane's"],
    ["jump-game", "Jump Game", "medium", "Track furthest reach"],
    ["jump-game-ii", "Jump Game II", "medium", "BFS-like levels over the array"],
    ["gas-station", "Gas Station", "medium", "Reset start when tank goes negative"],
    ["hand-of-straights", "Hand of Straights", "medium", "Greedy from the smallest with counts"],
    ["merge-triplets-to-form-target-triplet", "Merge Triplets to Form Target", "medium", "Filter then check coverage"],
    ["partition-labels", "Partition Labels", "medium", "Last occurrence bound"],
    ["valid-parenthesis-string", "Valid Parenthesis String", "medium", "Track a range of open counts"],
  ],
  intervals: [
    ["insert-interval", "Insert Interval", "medium", "Three phases: before, merge, after"],
    ["merge-intervals", "Merge Intervals", "medium", "Sort by start, merge overlapping"],
    ["non-overlapping-intervals", "Non-overlapping Intervals", "medium", "Sort by end, greedy keep"],
    ["meeting-schedule", "Meeting Rooms", "easy", "Sort and check adjacent overlap", nc("meeting-schedule")],
    ["meeting-schedule-ii", "Meeting Rooms II", "medium", "Sweep line or min-heap of end times", nc("meeting-schedule-ii")],
    ["minimum-interval-to-include-each-query", "Minimum Interval to Include Each Query", "hard", "Sort queries + heap"],
  ],
  math: [
    ["rotate-image", "Rotate Image", "medium", "Transpose + reverse, or layer by layer"],
    ["spiral-matrix", "Spiral Matrix", "medium", "Shrinking boundaries"],
    ["set-matrix-zeroes", "Set Matrix Zeroes", "medium", "Use first row/col as markers"],
    ["happy-number", "Happy Number", "easy", "Cycle detection on a sequence"],
    ["plus-one", "Plus One", "easy", "Carry from the end"],
    ["powx-n", "Pow(x, n)", "medium", "Fast exponentiation"],
    ["multiply-strings", "Multiply Strings", "medium", "Digit-by-digit with positions"],
    ["detect-squares", "Detect Squares", "medium", "Count points, iterate diagonals"],
  ],
  bit_manipulation: [
    ["single-number", "Single Number", "easy", "XOR cancels pairs"],
    ["number-of-1-bits", "Number of 1 Bits", "easy", "n & (n−1) drops the lowest bit"],
    ["counting-bits", "Counting Bits", "easy", "dp on bits: dp[i] = dp[i>>1] + (i&1)"],
    ["reverse-bits", "Reverse Bits", "easy", "Bit-by-bit build"],
    ["missing-number", "Missing Number", "easy", "XOR or sum formula"],
    ["sum-of-two-integers", "Sum of Two Integers", "medium", "XOR + carry via AND"],
    ["reverse-integer", "Reverse Integer", "medium", "Overflow checks"],
  ],
};

export const CURRICULUM: CurriculumProblem[] = (Object.keys(GROUPS) as Pattern[]).flatMap((pattern) =>
  GROUPS[pattern].map(([slug, title, difficulty, teaches, url]) => ({ slug, title, difficulty, pattern, teaches, url: url ?? lc(slug) })),
);

export const CURRICULUM_BY_PATTERN = (pattern: Pattern) => GROUPS[pattern].map(([slug]) => CURRICULUM.find((p) => p.slug === slug)!);
