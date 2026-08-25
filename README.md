# prep-tracker

Single-user tracker for a 10-week SWE interview prep program. Next.js 16 + shadcn/ui, deployed on Vercel free tier. No database: the whole app state is one JSON document in Upstash Redis (free tier), with a JSON file fallback for local dev. Spec: `CLAUDE.md`.

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000, data in .data/state.json, no login
```

## Deploy (Vercel Hobby)

1. Push to GitHub, import the repo in Vercel.
2. Storage → Marketplace → **Upstash** → Redis (free). Connect it to the project; it injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) — both are supported.
3. Add env var `APP_PASSWORD` (any string). Without it the app is public.
4. Deploy. Open the URL on your phone, sign in once — the cookie lasts a year.

## Notes

- Dates are stored UTC and displayed in Asia/Manila.
- Settings → Export JSON is the backup; Import replaces everything.
- Rotating `APP_PASSWORD` logs out all devices.
