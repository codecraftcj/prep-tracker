# prep-tracker

A small, single-user web app for tracking a 10-week software-engineering interview prep program: timed problem attempts with spaced re-solves, mocks, system-design reps, a portfolio checklist, an applications kanban, and the weekly plan. Built to be opened every morning on a phone.

![Today page on desktop](docs/today-desktop.png)

<img src="docs/today-phone.png" alt="Today page on a phone" width="320">

## Stack

- **Next.js 16** (App Router, Server Components, server actions) + TypeScript
- **shadcn/ui** + Tailwind CSS 4, **Recharts** for the four progress charts
- **Upstash Redis** holds the whole app state as one JSON document — no schema, no migrations. Falls back to a local JSON file in development.
- **Vitest** for the domain logic, GitHub Actions for lint / typecheck / test / build
- Deployed on **Vercel** (Hobby tier)

## How it works

- Every timed attempt is a row: pattern, difficulty, outcome, duration, what stopped me, talked-aloud.
- After an attempt, re-solves are scheduled at **+3 days** and **+14 days**. A re-solve counts if it's solved clean within target time (easy ≤ 8 min, medium ≤ 15, hard ≤ 30); otherwise the schedule restarts. Two clean re-solves = **mastered**. Due re-solves show first on the Today page.
- The domain rules live in [`src/lib/logic.ts`](src/lib/logic.ts) as pure functions with [tests](src/lib/__tests__/logic.test.ts); pages are Server Components that call them; all writes go through server actions in [`src/app/actions/`](src/app/actions/).
- Single password gate via [`src/proxy.ts`](src/proxy.ts); dates stored UTC, shown in Asia/Manila.

There is an in-app **Help** page (`/help`) describing the daily routine, outcome definitions, the re-solve/mastery rule, and how recommendations are prioritised.

## Development

```bash
npm install
npm run dev        # http://localhost:3000 — data in .data/state.json, no login
npm test           # vitest
npm run lint && npm run typecheck
```

## Deploy (Vercel Hobby)

1. Import the repo in Vercel.
2. Storage → Marketplace → **Upstash** → Redis (free). Connect it to the project; it injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) — both work.
3. Add `APP_PASSWORD`. Without it the app is open.
4. Deploy. Sign in once per device; the cookie lasts a year. Settings → Export JSON is the backup.

## Conventions

Conventional Commits, short-lived `feat/ fix/ chore/` branches, squash-merge to `main`, PR template in `.github/`. Full spec and working standards in [`CLAUDE.md`](CLAUDE.md).
