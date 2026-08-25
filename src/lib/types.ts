export const PATTERNS = [
  "arrays", "two_pointers", "sliding_window", "hashing", "stack", "binary_search",
  "linked_list", "trees", "tries", "heaps", "backtracking", "graphs", "dp_1d", "dp_2d",
  "intervals", "greedy", "bit_manipulation", "math",
] as const;
export type Pattern = (typeof PATTERNS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const OUTCOMES = ["solved_clean", "solved_with_hint", "solved_after_solution", "failed"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const SOURCES = ["neetcode", "leetcode", "other"] as const;
export type Source = (typeof SOURCES)[number];

/** Target time in seconds per difficulty (mastery rule). */
export const TARGET_SECONDS: Record<Difficulty, number> = { easy: 8 * 60, medium: 15 * 60, hard: 30 * 60 };
export const RESOLVE_INTERVALS_DAYS = [3, 14] as const;
export const DAILY_TARGET_ATTEMPTS = 2;

export type Attempt = {
  id: string;
  problem_slug: string;
  problem_title: string;
  url: string;
  source: Source;
  pattern: Pattern;
  difficulty: Difficulty;
  attempted_at: string; // ISO UTC
  duration_seconds: number;
  outcome: Outcome;
  blocker: string;
  talked_aloud: boolean;
  notes: string;
};

export const MOCK_PLATFORMS = ["pramp", "interviewing.io", "peer"] as const;
export const MOCK_TYPES = ["coding", "design", "behavioral"] as const;
export type Mock = {
  id: string;
  mocked_at: string;
  platform: (typeof MOCK_PLATFORMS)[number];
  type: (typeof MOCK_TYPES)[number];
  self_score: number; // 1-5
  interviewer_feedback: string;
  what_to_fix: string;
};

export const DESIGN_TOPICS = [
  "rate limiter", "URL shortener", "news feed", "distributed cache", "notification system",
  "log pipeline", "web crawler", "warehouse ingestion", "other",
] as const;
export type DesignRep = {
  id: string;
  topic: (typeof DESIGN_TOPICS)[number];
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  notes: string;
  weak_areas: string;
};

export const ARTIFACT_STATUSES = ["todo", "in_progress", "done"] as const;
export type Artifact = {
  id: string;
  title: string;
  status: (typeof ARTIFACT_STATUSES)[number];
  link: string;
  completed_at: string | null; // YYYY-MM-DD
};

export const TIERS = ["practice", "target", "google"] as const;
export const APP_STATUSES = ["planned", "applied", "oa", "phone_screen", "onsite", "offer", "rejected", "withdrawn"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];
export type Application = {
  id: string;
  company: string;
  role: string;
  tier: (typeof TIERS)[number];
  applied_at: string | null; // YYYY-MM-DD
  referral: boolean;
  status: AppStatus;
  next_action: string;
  next_action_date: string | null;
  notes: string;
};

export type Week = { number: number; target: string };

export type AppState = {
  version: 1;
  plan_start: string; // YYYY-MM-DD, Monday of week 1
  attempts: Attempt[];
  mocks: Mock[];
  design_reps: DesignRep[];
  artifacts: Artifact[];
  applications: Application[];
};

/** The 10-week plan. Interview-bucket first; portfolio work is background (bg). */
export const WEEKS: Week[] = [
  { number: 1, target: "Arrays, two pointers, sliding window, hashing. Establish talk-aloud pacing. Résumé numbers (bg)." },
  { number: 2, target: "Stack, binary search, linked list. First mock (coding). Draft 4 STAR stories." },
  { number: 3, target: "Trees, heaps. Mock. First system design rep (URL shortener). 4 more STAR stories." },
  { number: 4, target: "Backtracking + re-solve sweep of W1–3. Mock (behavioral). Design rep. All 8 STAR stories written." },
  { number: 5, target: "Graphs. Mock (coding). Design rep. K8s project shipped (bg)." },
  { number: 6, target: "1D DP, tries. Mock. Design rep. Post 1 (bg)." },
  { number: 7, target: "2D DP, intervals. Mock (design). Design rep. OSS PR opened (bg)." },
  { number: 8, target: "Greedy, bit manipulation, math + mixed timed sets. Mock. Design rep. LinkedIn + résumé v2." },
  { number: 9, target: "Mixed timed sets daily. 2 mocks (coding + behavioral). Apply practice tier." },
  { number: 10, target: "Mixed timed sets daily. 2 mocks. Apply target tier." },
];

export const SEED_ARTIFACTS: Omit<Artifact, "id">[] = [
  "Résumé v2 with numbers",
  "Non-scraping K8s project (shipped + README)",
  "Open-source PR merged (Scrapy / Playwright-Python / curl_cffi)",
  "Post: job-per-scrape K8s architecture",
  "Post: BigQuery time-travel recovery",
  "Post: anti-bot at scale (optional)",
  "LinkedIn headline + about rewritten",
  "8 STAR behavioral stories written",
  "GitHub activity streak visible",
].map((title) => ({ title, status: "todo" as const, link: "", completed_at: null }));

export function emptyState(): AppState {
  return {
    version: 1,
    plan_start: "2026-08-24",
    attempts: [],
    mocks: [],
    design_reps: [],
    artifacts: SEED_ARTIFACTS.map((a, i) => ({ id: `artifact-${i + 1}`, ...a })),
    applications: [],
  };
}

export const label = (s: string) => s.replace(/_/g, " ");
