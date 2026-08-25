# CLAUDE.md — Prep Tracker

Personal web app for tracking a 10-week software-engineering interview preparation program. Single user (me). Optimize for daily use on desktop and phone, zero friction to log an entry, and honest visibility into whether the plan is on track.

## Goal

Land a software engineer role at an adjacent tier-1 company in Singapore (Grab, Shopee, Sea, Bytedance, Canonical, Zyte, Stripe) applying October–November 2026, with Google as a Q1 2027 target. The app exists to make the training measurable: problems solved under time, spaced re-solves, mocks, system design reps, portfolio artifacts, and applications.

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
Fixed list, each with status todo / in_progress / done, link, and completion date:
- Résumé v2 with numbers
- Non-scraping K8s project (shipped + README)
- Open-source PR merged (Scrapy / Playwright-Python / curl_cffi)
- Post: job-per-scrape K8s architecture
- Post: BigQuery time-travel recovery
- Post: anti-bot at scale (optional)
- LinkedIn headline + about rewritten
- 8 STAR behavioral stories written
- GitHub activity streak visible

### Applications
- `company`, `role`, `tier` (practice / target / google), `applied_at`, `referral` bool
- `status` — planned / applied / oa / phone_screen / onsite / offer / rejected / withdrawn
- `next_action`, `next_action_date`, `notes`
- Google-specific: enforce max 3 applications per rolling 30 days and 90-day same-role cooldown as a warning, not a block.

### Weekly plan
Ten fixed weeks with start dates and a short target string each. Seed data:
- W1–4: core patterns to medium fluency; résumé numbers; K8s project; post 1
- W5–8: graphs, DP, intervals, tries; weekly mocks; system design 1/week; OSS PR; post 2; LinkedIn
- W9–10: behavioral stories; résumé v2; apply practice tier (W9), target tier (W10)

## Screens (v1)

1. **Today** — due re-solves, today's target (2 problems), quick-add attempt form with a built-in timer, streak count. This is the page I open every morning. Must work well on a phone.
2. **Problems** — table of all problems with mastery state, filter by pattern/difficulty/outcome, per-pattern mastery %.
3. **Progress** — charts: attempts per day (last 30), median time by difficulty over time, mastery % by pattern (bar), outcome distribution. Keep to these four.
4. **Mocks & Design** — two simple lists with add forms.
5. **Artifacts** — checklist.
6. **Applications** — kanban by status, with the Google slot/cooldown warning.
7. **Plan** — the 10 weeks, current week highlighted, target vs. actual attempts this week.

## Conventions

- Server Components by default; client components only for the timer and forms.
- All writes through server actions in `app/actions/`. No API routes unless needed for the timer.
- Dates stored UTC, displayed in Asia/Manila.
- Every table has `id uuid`, `created_at`, `updated_at`. RLS: `user_id = auth.uid()`.
- Migrations are hand-written SQL, one per feature, never edited after applying.
- Keep components small; no premature abstraction. Three similar forms is fine.
- Commit messages: `feat:`, `fix:`, `chore:`. Small commits.

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
