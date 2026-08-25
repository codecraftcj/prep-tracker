import { addDays, diffDays, toManilaDate, todayManila } from "./dates";
import {
  Application, AppState, Attempt, Difficulty, Pattern, RESOLVE_INTERVALS_DAYS, TARGET_SECONDS, WEEKS,
} from "./types";

export type ProblemStatus = {
  slug: string;
  title: string;
  url: string;
  pattern: Pattern;
  difficulty: Difficulty;
  attempts: Attempt[];
  last: Attempt;
  /** 0 = waiting for +3d, 1 = waiting for +14d, 2 = mastered */
  stage: 0 | 1 | 2;
  due: string | null; // YYYY-MM-DD of next re-solve
  mastered: boolean;
};

function passes(a: Attempt): boolean {
  return a.outcome === "solved_clean" && a.duration_seconds <= TARGET_SECONDS[a.difficulty];
}

/**
 * Re-solve schedule. Anchor = an attempt; reviews due at anchor+3d and anchor+14d.
 * A review attempt (on/after the due day) that is solved_clean within target time
 * advances the stage; any other review resets the anchor. Attempts before a due
 * day are extra practice and don't affect the schedule.
 */
export function problemStatuses(attempts: Attempt[]): ProblemStatus[] {
  const bySlug = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const list = bySlug.get(a.problem_slug) ?? [];
    list.push(a);
    bySlug.set(a.problem_slug, list);
  }
  const out: ProblemStatus[] = [];
  for (const [slug, list] of bySlug) {
    list.sort((x, y) => x.attempted_at.localeCompare(y.attempted_at));
    let anchor = list[0];
    let stage: 0 | 1 | 2 = 0;
    for (const a of list.slice(1)) {
      if (stage === 2) break;
      const due = addDays(toManilaDate(anchor.attempted_at), RESOLVE_INTERVALS_DAYS[stage]);
      if (toManilaDate(a.attempted_at) < due) continue;
      if (passes(a)) stage = (stage + 1) as 0 | 1 | 2;
      else { anchor = a; stage = 0; }
    }
    const last = list[list.length - 1];
    const due = stage === 2 ? null : addDays(toManilaDate(anchor.attempted_at), RESOLVE_INTERVALS_DAYS[stage]);
    out.push({
      slug, title: last.problem_title, url: last.url, pattern: last.pattern, difficulty: last.difficulty,
      attempts: list, last, stage, due, mastered: stage === 2,
    });
  }
  return out.sort((a, b) => b.last.attempted_at.localeCompare(a.last.attempted_at));
}

export function dueResolves(statuses: ProblemStatus[], today = todayManila()): ProblemStatus[] {
  return statuses
    .filter((p) => p.due !== null && p.due <= today)
    .sort((a, b) => a.due!.localeCompare(b.due!));
}

export function attemptsOn(attempts: Attempt[], ymd: string): Attempt[] {
  return attempts.filter((a) => toManilaDate(a.attempted_at) === ymd);
}

export function streak(attempts: Attempt[], today = todayManila()): number {
  const days = new Set(attempts.map((a) => toManilaDate(a.attempted_at)));
  let day = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(day)) { n++; day = addDays(day, -1); }
  return n;
}

export function masteryByPattern(statuses: ProblemStatus[]): { pattern: Pattern; total: number; mastered: number; pct: number }[] {
  const m = new Map<Pattern, { total: number; mastered: number }>();
  for (const p of statuses) {
    const e = m.get(p.pattern) ?? { total: 0, mastered: 0 };
    e.total++; if (p.mastered) e.mastered++;
    m.set(p.pattern, e);
  }
  return [...m].map(([pattern, e]) => ({ pattern, ...e, pct: Math.round((100 * e.mastered) / e.total) }))
    .sort((a, b) => a.pattern.localeCompare(b.pattern));
}

export function currentWeek(state: AppState, today = todayManila()): number | null {
  const d = diffDays(today, state.plan_start);
  if (d < 0) return null;
  const w = Math.floor(d / 7) + 1;
  return w > WEEKS.length ? null : w;
}
export function weekRange(state: AppState, week: number): { start: string; end: string } {
  const start = addDays(state.plan_start, (week - 1) * 7);
  return { start, end: addDays(start, 6) };
}
export function attemptsInWeek(state: AppState, week: number): Attempt[] {
  const { start, end } = weekRange(state, week);
  return state.attempts.filter((a) => { const d = toManilaDate(a.attempted_at); return d >= start && d <= end; });
}

/** Google slot / cooldown warnings. Warning only, never a block. */
export function googleWarnings(apps: Application[], candidate: { role: string; applied_at: string | null; id?: string }, today = todayManila()): string[] {
  const ref = candidate.applied_at ?? today;
  const google = apps.filter((a) => a.tier === "google" && a.applied_at && a.id !== candidate.id && a.status !== "planned");
  const out: string[] = [];
  const recent = google.filter((a) => { const d = diffDays(ref, a.applied_at!); return d >= 0 && d < 30; });
  if (recent.length >= 3) out.push(`Google: ${recent.length} applications already in the 30 days before ${ref} (max 3).`);
  const same = google.filter((a) => a.role.trim().toLowerCase() === candidate.role.trim().toLowerCase() && Math.abs(diffDays(ref, a.applied_at!)) < 90);
  if (same.length) out.push(`Google: same role "${candidate.role}" applied within 90 days (${same.map((a) => a.applied_at).join(", ")}).`);
  return out;
}

export function slugFromUrl(url: string, title: string): string {
  const m = url.match(/problems\/([a-z0-9-]+)/i);
  if (m) return m[1].toLowerCase();
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled";
}

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
