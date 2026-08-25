# CLAUDE.md — Prep Tracker

Personal web app for tracking a 10-week software-engineering interview preparation program. Single user (me). Optimize for daily use on desktop and phone, zero friction to log an entry, and honest visibility into whether the plan is on track.

## Goal

Land a software engineer role at an adjacent tier-1 company in Singapore (Grab, Shopee, Sea, Bytedance, Canonical, Zyte, Stripe) applying October–November 2026, with Google as a Q1 2027 target. The app exists to make the training measurable: problems solved under time, spaced re-solves, mocks, system design reps, portfolio artifacts, and applications.

### Two skill buckets — weight toward interviews

I have ~7 years as a working developer. The technical bucket (shipping, systems, tooling) is already strong and is proven by the résumé and existing work. The gap is the **interview bucket**: solving unfamiliar problems under a 15–30 min clock while talking, structured system-design conversations, and crisp behavioral answers. The plan, the daily target, and the metrics prioritise the interview bucket. Portfolio artifacts are background work (≤ 2 h/week), never something that displaces a timed set or a mock.

Interview-bucket skills to train deliberately:
- Timed problem solving with talk-aloud (default on). Pace: restate → brute force → optimise → code → test, out loud.
- Recognising the pattern in < 2 min; blockers logged honestly.
- Spaced re-solves so patterns stick (+3d / +14d).
- Weekly mocks from **week 2**, not week 5. Self-score + interviewer feedback + one thing to fix.
- System design as a conversation: 45-min reps with a fixed framework (requirements → estimates → API → data → high-level → deep dive → trade-offs).
- Behavioral: 8 STAR stories written by week 4 and rehearsed aloud in mocks.

## Non-goals

- Not a product. No auth beyond a single login, no multi-tenant, no marketing pages.
- Not a LeetCode clone. It does not host problems or run code; it logs attempts against external problem links.
- No AI features in v1.

## Stack

- **Next.js 15** (App Router, TypeScript), deployed on Vercel
- **Supabase** (Postgres, Auth for single-user login, Row Level Security on)
- **Tailwind** + shadcn/ui, minimal styling
- **Recharts** for the few charts that matter
- No ORM beyond the Supabase client. Plain SQL migrations in `supabase/migrations/`.

Chosen because I already ship Next.js + Supabase (nir-u.com). Keep the same conventions as that repo.

## Core domain

### Problem attempts (the heart of the app)
Every timed attempt at a problem is a row. Fields:
- `problem_slug`, `problem_title`, `url`, `source` (neetcode / leetcode / other)
- `pattern` — enum: arrays, two_pointers, sliding_window, hashing, stack, binary_search, linked_list, trees, tries, heaps, backtracking, graphs, dp_1d, dp_2d, intervals, greedy, bit_manipulation, math
- `difficulty` — easy / medium / hard
- `attempted_at`, `duration_seconds`
- `outcome` — solved_clean / solved_with_hint / solved_after_solution / failed
- `blocker` — free text, required when outcome ≠ solved_clean ("what stopped me")
- `talked_aloud` — bool
- `notes`

**Spaced repetition:** after any attempt, schedule re-solves at +3 days and +14 days. A problem is "mastered" when it has a solved_clean attempt at both re-solve intervals within target time (medium ≤ 15 min, hard ≤ 30 min, easy ≤ 8 min). Due re-solves appear on the daily view first.

### Mocks
- `mocked_at`, `platform` (pramp / interviewing.io / peer), `type` (coding / design / behavioral)
- `self_score` 1–5, `interviewer_feedback` text, `what_to_fix` text

### System design reps
- `topic` (rate limiter, URL shortener, news feed, distributed cache, notification system, log pipeline, web crawler, warehouse ingestion, other)
- `date`, `duration_minutes`, `notes`, `weak_areas` text

### Artifacts (portfolio checklist)
Positioning: **entry-to-mid-level SWE**. The 7 freelance years are supporting evidence (reliability, real-world exposure), not the pitch. The profile must show fundamentals, clean tested code, consistency, and finished projects — not architecture or scale. Fixed list, each with status todo / in_progress / done, link, and completion date:
- Résumé with numbers, framed entry/mid-level
- GitHub profile: bio, README, 3 pinned repos (interview-prep, prep-tracker, showcase), noise archived
- interview-prep repo organised by pattern, fed daily from attempts (this also produces the streak)
- prep-tracker public: tests + CI + README screenshots
- Showcase project public (clean README, tests, design notes) — replaces the K8s project
- Open-source PR merged (Scrapy / Playwright-Python / curl_cffi)
- LinkedIn headline + about rewritten
- 8 STAR behavioral stories written
- GitHub activity streak visible (10 weeks)
- Post: one technical write-up (optional)

### Applications
- `company`, `role`, `tier` (practice / target / google), `applied_at`, `referral` bool
- `status` — planned / applied / oa / phone_screen / onsite / offer / rejected / withdrawn
- `next_action`, `next_action_date`, `notes`
- Google-specific: enforce max 3 applications per rolling 30 days and 90-day same-role cooldown as a warning, not a block.

### Weekly plan
Ten fixed weeks, defined as a constant in `src/lib/types.ts` (not stored data; edit in code, ship with a commit). Week 1 starts on the Monday set in Settings. Daily target: 2 timed problems, talk-aloud. Portfolio artifacts capped at ~2 h/week.
- W1: arrays, two pointers, sliding window, hashing. Establish the talk-aloud pacing ritual. Résumé numbers (bg).
- W2: stack, binary search, linked list. **First mock (coding).** Draft 4 STAR stories.
- W3: trees, heaps. Mock. **First system design rep** (URL shortener) using the framework. 4 more STAR stories.
- W4: backtracking + re-solve sweep of W1–3. Mock (behavioral). Design rep. All 8 STAR stories written.
- W5: graphs. Mock (coding). Design rep. K8s project shipped (bg).
- W6: 1D DP, tries. Mock. Design rep. Post 1 (bg).
- W7: 2D DP, intervals. Mock (design). Design rep. OSS PR opened (bg).
- W8: greedy, bit manipulation, math + mixed timed sets. Mock. Design rep. LinkedIn + résumé v2.
- W9: mixed timed sets daily, 2 mocks (coding + behavioral). Apply practice tier.
- W10: mixed timed sets daily, 2 mocks. Apply target tier.

## Screens (v1)

1. **Today** — due re-solves, today's target (2 problems), quick-add attempt form with a built-in timer, streak count. This is the page I open every morning. Must work well on a phone.
2. **Problems** — table of all problems with mastery state, filter by pattern/difficulty/outcome, per-pattern mastery %.
3. **Progress** — charts: attempts per day (last 30), median time by difficulty over time, mastery % by pattern (bar), outcome distribution. Keep to these four.
4. **Mocks & Design** — two simple lists with add forms.
5. **Artifacts** — checklist.
6. **Applications** — kanban by status, with the Google slot/cooldown warning.
7. **Plan** — the 10 weeks, current week highlighted, target vs. actual attempts this week.
8. **Review** — the whole program on one page: where I am (week, days to application windows), a rule-based **Focus now** list (overdue re-solves, pace, untouched/weak planned patterns, speed vs target, talk-aloud, mocks/design reps owed this week, STAR stories, overdue follow-ups), then coding / pattern / mock / portfolio scorecards. Logic in `buildReview()`; each week in `WEEKS` carries `patterns`, `mocks`, `design` targets that drive it.

## Conventions

- Server Components by default; client components only for the timer and forms.
- All writes through server actions in `app/actions/`. No API routes unless needed for the timer.
- Dates stored UTC, displayed in Asia/Manila.
- Every table has `id uuid`, `created_at`, `updated_at`. RLS: `user_id = auth.uid()`.
- Migrations are hand-written SQL, one per feature, never edited after applying.
- Keep components small; no premature abstraction. Three similar forms is fine.
- Commit messages: `feat:`, `fix:`, `chore:`. Small commits.

## Working standards

How I work, so that collaborators (human or AI) can match it.

**Branches.** `main` is always deployable. Work on short-lived branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. Squash-merge to `main`; delete the branch.

**Commits.** Conventional Commits, imperative mood, ≤ 72-char subject, no trailing period:
`<type>(<scope>)?: <subject>` with types `feat | fix | chore | refactor | docs | test | perf`. Scope is optional and is the screen or module (`today`, `problems`, `store`, `logic`). Body explains *why* when it isn't obvious. One logical change per commit; a commit should build and lint on its own.

**Pull requests.** Use `.github/PULL_REQUEST_TEMPLATE.md`. Title follows the commit format. Body: what/why, how it was verified (screenshots for UI, the exact command for logic), anything out of scope. PRs stay under ~400 lines of diff; split otherwise. Self-review before requesting review.

**Quality gate before any commit.** `npm run lint`, `npm run typecheck`, and `npm test` clean (CI runs the same on every push/PR); `npm run build` for anything touching routing, actions, or config. No `any`, no unused exports, no console noise.

**Code style.** Prettier defaults (2-space, double quotes, semicolons). Server Components by default; `"use client"` only where there is state or browser APIs. Pure domain logic lives in `src/lib/logic.ts`, has no React or I/O in it, and is covered by `src/lib/__tests__/logic.test.ts` (Vitest). Prefer a native element over a library component when it works better on a phone (e.g. `<select>`).

**Changes to the plan or the mastery rule** are code changes to `src/lib/types.ts` / `src/lib/logic.ts` with a `docs:` or `feat(logic):` commit that also updates this file.

## Definition of done for v1

- Can log a timed attempt from my phone in under 20 seconds.
- Today page correctly surfaces +3d and +14d re-solves.
- Mastery % by pattern is accurate and matches the rule above.
- Applications kanban with the Google warning.
- Deployed on Vercel, seeded with the 10-week plan and the artifact checklist.

Build the Today page and the attempts table first. Everything else is secondary.

## Out of scope until v1 ships

Import from LeetCode/NeetCode, export, dark mode polish, notifications, any AI-assisted review of blockers.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
