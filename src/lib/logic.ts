import { CURRICULUM, CURRICULUM_BY_PATTERN, CurriculumProblem } from "./curriculum";
import { addDays, diffDays, toManilaDate, todayManila } from "./dates";
import {
  Application, AppState, AppStatus, Attempt, DAILY_TARGET_ATTEMPTS, DESIGN_TOPICS, DIFFICULTIES, Difficulty, Pattern,
  RESOLVE_INTERVALS_DAYS, TARGET_SECONDS, WEEKS, label,
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

// ---------------------------------------------------------------------------
// Review: whole-program scorecard + realignment

export type Focus = { level: "now" | "soon" | "ok"; title: string; detail: string };

export type Review = {
  today: string;
  week: number | null;
  daysIntoProgram: number;
  daysToPracticeApply: number; // start of week 9
  daysToTargetApply: number; // start of week 10
  attempts: {
    total: number; problems: number; mastered: number;
    thisWeek: number; weekTarget: number; expectedByToday: number;
    cleanRate: number | null; talkAloudRate: number | null;
    medianRecent: Record<Difficulty, number | null>; // last 14 days, seconds
    perWeek: { week: number; attempts: number; target: number }[];
    overdue: number; dueToday: number;
  };
  patterns: { pattern: Pattern; week: number; problems: number; mastered: number; cleanRate: number | null; status: "untouched" | "weak" | "building" | "solid" }[];
  mocks: { total: number; thisWeek: number; weekTarget: number; expectedToDate: number; avgScoreRecent: number | null; lastFix: string | null };
  design: { total: number; thisWeek: number; weekTarget: number; expectedToDate: number; topicsCovered: number; topicsTotal: number };
  artifacts: { done: number; total: number; inProgress: number };
  applications: { total: number; active: number; overdueActions: number };
  focus: Focus[];
};

const ACTIVE_STATUSES: AppStatus[] = ["applied", "oa", "phone_screen", "onsite"];

export function buildReview(state: AppState, today = todayManila()): Review {
  const week = currentWeek(state, today);
  const daysInto = diffDays(today, state.plan_start);
  const statuses = problemStatuses(state.attempts);
  const due = dueResolves(statuses, today);
  const overdue = due.filter((p) => p.due! < today).length;

  // --- attempts
  const weekAttempts = week ? attemptsInWeek(state, week) : [];
  const dayOfWeek = week ? diffDays(today, weekRange(state, week).start) + 1 : 0; // 1..7
  const weekTarget = DAILY_TARGET_ATTEMPTS * 7;
  const expectedByToday = DAILY_TARGET_ATTEMPTS * dayOfWeek;
  const rate = (xs: Attempt[], pred: (a: Attempt) => boolean) => (xs.length ? Math.round((100 * xs.filter(pred).length) / xs.length) : null);
  const recent = state.attempts.filter((a) => diffDays(today, toManilaDate(a.attempted_at)) < 14);
  const medianRecent = Object.fromEntries(DIFFICULTIES.map((d) => [d, median(recent.filter((a) => a.difficulty === d && a.outcome !== "failed").map((a) => a.duration_seconds))])) as Record<Difficulty, number | null>;
  const perWeek = WEEKS.filter((w) => w.number <= (week ?? (daysInto >= 0 ? WEEKS.length : 0))).map((w) => ({ week: w.number, attempts: attemptsInWeek(state, w.number).length, target: weekTarget }));

  // --- patterns (only those the plan has introduced by now)
  const introduced = WEEKS.filter((w) => week === null ? daysInto > 0 : w.number <= week);
  const patterns = introduced.flatMap((w) => w.patterns.map((pattern) => {
    const ps = statuses.filter((p) => p.pattern === pattern);
    const all = ps.flatMap((p) => p.attempts);
    const mastered = ps.filter((p) => p.mastered).length;
    const cleanRate = rate(all, (a) => a.outcome === "solved_clean");
    const status = ps.length === 0 ? "untouched" : mastered >= 3 || (ps.length >= 4 && (cleanRate ?? 0) >= 70) ? "solid" : (cleanRate ?? 0) < 50 || ps.length < 3 ? "weak" : "building";
    return { pattern, week: w.number, problems: ps.length, mastered, cleanRate, status } as const;
  }));

  // --- mocks / design
  const inWeek = (ymd: string, w: number) => { const r = weekRange(state, w); return ymd >= r.start && ymd <= r.end; };
  const mocksThisWeek = week ? state.mocks.filter((m) => inWeek(m.mocked_at, week)).length : 0;
  const designThisWeek = week ? state.design_reps.filter((d) => inWeek(d.date, week)).length : 0;
  const expected = (key: "mocks" | "design") => introduced.reduce((n, w) => n + w[key], 0);
  const recentMocks = [...state.mocks].sort((a, b) => b.mocked_at.localeCompare(a.mocked_at)).slice(0, 3);
  const avgScoreRecent = recentMocks.length ? Math.round((10 * recentMocks.reduce((s, m) => s + m.self_score, 0)) / recentMocks.length) / 10 : null;
  const lastFix = recentMocks.find((m) => m.what_to_fix.trim())?.what_to_fix ?? null;
  const topicsCovered = new Set(state.design_reps.map((d) => d.topic).filter((t) => t !== "other")).size;

  // --- artifacts / applications
  const artifacts = { done: state.artifacts.filter((a) => a.status === "done").length, inProgress: state.artifacts.filter((a) => a.status === "in_progress").length, total: state.artifacts.length };
  const applications = {
    total: state.applications.length,
    active: state.applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
    overdueActions: state.applications.filter((a) => a.next_action_date && a.next_action_date < today && !["rejected", "withdrawn", "offer"].includes(a.status)).length,
  };

  // --- focus list (ordered by urgency)
  const focus: Focus[] = [];
  const now = (title: string, detail: string) => focus.push({ level: "now", title, detail });
  const soon = (title: string, detail: string) => focus.push({ level: "soon", title, detail });

  if (overdue) now(`Clear ${overdue} overdue re-solve${overdue > 1 ? "s" : ""}`, "Spaced re-solves are what turn solved problems into patterns you own. They come before new problems.");
  if (week && weekAttempts.length < expectedByToday) {
    const behind = expectedByToday - weekAttempts.length;
    now(`${behind} attempt${behind > 1 ? "s" : ""} behind pace this week`, `${weekAttempts.length} logged vs ${expectedByToday} expected by day ${dayOfWeek}. Two timed problems today, talk-aloud on.`);
  }
  for (const p of patterns.filter((p) => p.status === "untouched" && p.week < (week ?? 99))) now(`Start ${label(p.pattern)} — planned for week ${p.week}, no attempts yet`, "Pick two mediums from the NeetCode list for this pattern.");
  for (const p of patterns.filter((p) => p.status === "weak" && p.week < (week ?? 99))) {
    const coverage = p.problems < 3 && (p.cleanRate ?? 0) >= 70;
    soon(coverage ? `More ${label(p.pattern)} — only ${p.problems} problem${p.problems === 1 ? "" : "s"} so far` : `Drill ${label(p.pattern)}`,
      coverage ? `Going well (${p.cleanRate}% clean) but too thin to trust. Do ${3 - p.problems} more medium${3 - p.problems === 1 ? "" : "s"}.`
        : `${p.problems} problem${p.problems === 1 ? "" : "s"}, ${p.cleanRate ?? 0}% solved clean, ${p.mastered} mastered. Re-solve until clean under target time.`);
  }
  for (const d of DIFFICULTIES) {
    const m = medianRecent[d];
    if (m !== null && m > TARGET_SECONDS[d]) soon(`Speed on ${d}: median ${Math.round(m / 60)} min vs ${TARGET_SECONDS[d] / 60} min target`, "Restate → brute force → optimise out loud in the first 5 minutes; stop polishing after the first working solution.");
  }
  const talk = rate(recent, (a) => a.talked_aloud);
  if (talk !== null && talk < 80 && recent.length >= 4) soon(`Talk-aloud only ${talk}% of recent attempts`, "The interview is a conversation. Narrate every attempt, even the easy ones.");
  const cleanRate = rate(recent, (a) => a.outcome === "solved_clean");
  if (cleanRate !== null && cleanRate < 50 && recent.length >= 6) soon(`Only ${cleanRate}% solved clean in the last 14 days`, "Read the blockers you logged; most will be one or two recurring gaps.");
  if (week && WEEKS[week - 1].mocks > mocksThisWeek) {
    const missing = WEEKS[week - 1].mocks - mocksThisWeek;
    (dayOfWeek >= 5 ? now : soon)(`Book ${missing} mock${missing > 1 ? "s" : ""} this week`, "Pramp or interviewing.io. Log self-score and the single thing to fix.");
  }
  if (week && WEEKS[week - 1].design > designThisWeek) (dayOfWeek >= 5 ? now : soon)("System design rep this week", "45 min, fixed framework: requirements → estimates → API → data → high-level → deep dive → trade-offs.");
  if (lastFix) soon(`Last mock said: "${lastFix}"`, "Carry it into the next mock deliberately.");
  const star = state.artifacts.find((a) => a.title.toLowerCase().includes("star"));
  if (star && star.status !== "done" && week && week >= 3) (week >= 4 ? now : soon)("STAR stories not done", `Plan says all 8 written by week 4. Status: ${label(star.status)}.`);
  if (applications.overdueActions) now(`${applications.overdueActions} application follow-up${applications.overdueActions > 1 ? "s" : ""} overdue`, "Check the Applications board.");
  if (week && week >= 8) {
    const todo = state.artifacts.filter((a) => a.status !== "done" && !a.title.toLowerCase().includes("optional"));
    if (todo.length) soon(`${todo.length} artifact${todo.length > 1 ? "s" : ""} still open before applications start`, todo.map((a) => a.title).join(" · "));
  }
  if (week === null && daysInto < 0) soon("Program hasn't started", `Week 1 starts ${state.plan_start}. Use the time to set up the interview-prep repo and profile.`);
  if (!focus.length) focus.push({ level: "ok", title: "On track", detail: "Nothing is slipping. Keep the daily target and re-solve cadence." });

  const w9 = weekRange(state, 9).start, w10 = weekRange(state, 10).start;
  return {
    today, week, daysIntoProgram: daysInto, daysToPracticeApply: diffDays(w9, today), daysToTargetApply: diffDays(w10, today),
    attempts: {
      total: state.attempts.length, problems: statuses.length, mastered: statuses.filter((p) => p.mastered).length,
      thisWeek: weekAttempts.length, weekTarget, expectedByToday,
      cleanRate: rate(state.attempts, (a) => a.outcome === "solved_clean"), talkAloudRate: rate(state.attempts, (a) => a.talked_aloud),
      medianRecent, perWeek, overdue, dueToday: due.length - overdue,
    },
    patterns,
    mocks: { total: state.mocks.length, thisWeek: mocksThisWeek, weekTarget: week ? WEEKS[week - 1].mocks : 0, expectedToDate: expected("mocks"), avgScoreRecent, lastFix },
    design: { total: state.design_reps.length, thisWeek: designThisWeek, weekTarget: week ? WEEKS[week - 1].design : 0, expectedToDate: expected("design"), topicsCovered, topicsTotal: DESIGN_TOPICS.length - 1 },
    artifacts, applications, focus,
  };
}

// ---------------------------------------------------------------------------
// Curriculum recommendations

export type Recommendation = CurriculumProblem & { reason: string };

/** Plan-ordered pattern list: past weeks' weak/untouched first, then current week, then the rest of the plan. */
export function patternPriority(state: AppState, today = todayManila()): { pattern: Pattern; week: number; reason: string }[] {
  const week = currentWeek(state, today);
  const daysInto = diffDays(today, state.plan_start);
  const statuses = problemStatuses(state.attempts);
  const info = (pattern: Pattern) => {
    const ps = statuses.filter((p) => p.pattern === pattern);
    const all = ps.flatMap((p) => p.attempts);
    const clean = all.length ? all.filter((a) => a.outcome === "solved_clean").length / all.length : 0;
    return { problems: ps.length, mastered: ps.filter((p) => p.mastered).length, clean };
  };
  const rows = WEEKS.flatMap((w) => w.patterns.map((pattern) => ({ pattern, week: w.number })));
  const score = (r: { pattern: Pattern; week: number }) => {
    const i = info(r.pattern);
    const cur = week ?? (daysInto < 0 ? 0 : WEEKS.length + 1);
    if (r.week < cur && i.problems === 0) return [0, r.week, `planned for week ${r.week}, not started`] as const;
    if (r.week < cur && (i.clean < 0.5 || i.problems < 3) && !(i.mastered >= 3)) return [1, r.week, `week ${r.week} pattern still weak`] as const;
    if (r.week === cur) return [2, r.week, `this week's pattern`] as const;
    if (r.week < cur) return [4, r.week, `week ${r.week} — keep it warm`] as const;
    return [3, r.week, `coming up in week ${r.week}`] as const;
  };
  return rows.map((r) => ({ r, s: score(r) })).sort((a, b) => a.s[0] - b.s[0] || a.s[1] - b.s[1]).map(({ r, s }) => ({ ...r, reason: s[2] }));
}

/** Next unattempted curriculum problems, round-robin across patterns in priority order. */
export function recommendNext(state: AppState, n = 4, today = todayManila()): Recommendation[] {
  const attempted = new Set(state.attempts.map((a) => a.problem_slug));
  const queues = patternPriority(state, today).map((p) => ({ ...p, items: CURRICULUM_BY_PATTERN(p.pattern).filter((c) => !attempted.has(c.slug)) }));
  const out: Recommendation[] = [];
  // First pass: one per pattern for the top-priority tiers, so two problems a day hit two different gaps.
  for (let round = 0; out.length < n; round++) {
    let added = false;
    for (const q of queues) {
      const item = q.items[round];
      if (!item) continue;
      out.push({ ...item, reason: q.reason });
      added = true;
      if (out.length >= n) break;
    }
    if (!added) break;
  }
  return out;
}

export function curriculumStatus(state: AppState) {
  const statuses = new Map(problemStatuses(state.attempts).map((p) => [p.slug, p]));
  return CURRICULUM.map((c) => ({ ...c, status: statuses.get(c.slug) ?? null }));
}
