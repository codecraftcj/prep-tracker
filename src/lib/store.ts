import "server-only";
import { Redis } from "@upstash/redis";
import { promises as fs } from "node:fs";
import path from "node:path";
import { AppState, SEED_ARTIFACTS, emptyState } from "./types";

const KEY = "prep-tracker:state";
const LOCAL_FILE = process.env.PREP_DATA_FILE ?? path.join(process.cwd(), ".data", "state.json");

/**
 * Supabase backend: one row in `public.app_state` (key text pk, data jsonb).
 * Uses the service-role key from the server only — never exposed to the client — so RLS is not needed.
 */
function supabase(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}
async function sbFetch(path: string, init: RequestInit = {}) {
  const sb = supabase()!;
  const res = await fetch(`${sb.url}/rest/v1/${path}`, {
    ...init, cache: "no-store",
    headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res;
}

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

/** Seed artifacts added after first launch are merged in by title; existing ones are left alone. */
function withSeeds(state: AppState): AppState {
  const have = new Set(state.artifacts.map((a) => a.title));
  const missing = SEED_ARTIFACTS.filter((a) => !have.has(a.title)).map((a, i) => ({ id: `artifact-${Date.now()}-${i}`, ...a }));
  return missing.length ? { ...state, artifacts: [...state.artifacts, ...missing] } : state;
}

export async function getState(): Promise<AppState> {
  if (supabase()) {
    const rows = (await (await sbFetch(`app_state?key=eq.${encodeURIComponent(KEY)}&select=data`)).json()) as { data: AppState }[];
    return withSeeds(rows[0]?.data ?? emptyState());
  }
  const r = redis();
  if (r) return withSeeds((await r.get<AppState>(KEY)) ?? emptyState());
  try {
    return withSeeds(JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as AppState);
  } catch {
    return emptyState();
  }
}

export async function setState(state: AppState): Promise<void> {
  if (supabase()) {
    await sbFetch("app_state", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ key: KEY, data: state, updated_at: new Date().toISOString() }) });
    return;
  }
  const r = redis();
  if (r) { await r.set(KEY, state); return; }
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(state, null, 2));
}

/** Read-modify-write. Single user, so last-write-wins on the whole doc is acceptable. */
export async function mutate(fn: (s: AppState) => void): Promise<void> {
  const s = await getState();
  fn(s);
  await setState(s);
}

export const storageBackend = () => (supabase() ? "supabase" : redis() ? "upstash-redis" : "local-file");
