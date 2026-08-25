import { describe, expect, it } from "vitest";
import { attemptsInWeek, currentWeek, dueResolves, googleWarnings, masteryByPattern, problemStatuses, slugFromUrl, streak } from "@/lib/logic";
import { Application, Attempt, AppState, emptyState } from "@/lib/types";

// All timestamps are 10:00 Manila (02:00Z) so the Manila date equals the ISO date.
const at = (ymd: string) => `${ymd}T02:00:00Z`;
let n = 0;
function attempt(over: Partial<Attempt>): Attempt {
  return {
    id: `a${++n}`, problem_slug: "two-sum", problem_title: "Two Sum", url: "", source: "leetcode",
    pattern: "hashing", difficulty: "easy", attempted_at: at("2026-08-20"), duration_seconds: 300,
    outcome: "solved_clean", blocker: "", talked_aloud: true, notes: "", ...over,
  };
}

describe("problemStatuses – re-solve schedule", () => {
  it("first attempt schedules +3d", () => {
    const [p] = problemStatuses([attempt({})]);
    expect(p.stage).toBe(0);
    expect(p.due).toBe("2026-08-23");
    expect(p.mastered).toBe(false);
  });

  it("clean in-target re-solve on/after +3d advances to +14d from the anchor", () => {
    const [p] = problemStatuses([attempt({}), attempt({ attempted_at: at("2026-08-23") })]);
    expect(p.stage).toBe(1);
    expect(p.due).toBe("2026-09-03"); // anchor 08-20 + 14
  });

  it("both re-solves clean and within target time → mastered", () => {
    const [p] = problemStatuses([
      attempt({}), attempt({ attempted_at: at("2026-08-23") }), attempt({ attempted_at: at("2026-09-03") }),
    ]);
    expect(p.mastered).toBe(true);
    expect(p.due).toBeNull();
  });

  it("re-solve that is clean but over target time resets the anchor", () => {
    const [p] = problemStatuses([attempt({}), attempt({ attempted_at: at("2026-08-24"), duration_seconds: 9 * 60 })]);
    expect(p.stage).toBe(0);
    expect(p.due).toBe("2026-08-27"); // new anchor 08-24 + 3
  });

  it("failed re-solve resets the anchor", () => {
    const [p] = problemStatuses([attempt({}), attempt({ attempted_at: at("2026-08-25"), outcome: "failed", blocker: "x" })]);
    expect(p.stage).toBe(0);
    expect(p.due).toBe("2026-08-28");
  });

  it("attempts before the due day are extra practice and don't move the schedule", () => {
    const [p] = problemStatuses([attempt({}), attempt({ attempted_at: at("2026-08-21") })]);
    expect(p.stage).toBe(0);
    expect(p.due).toBe("2026-08-23");
  });

  it("uses per-difficulty target times", () => {
    const hard = (d: string, secs: number) => attempt({ problem_slug: "h", difficulty: "hard", attempted_at: at(d), duration_seconds: secs });
    const [p] = problemStatuses([hard("2026-08-01", 1700), hard("2026-08-04", 1700), hard("2026-08-15", 1801)]);
    expect(p.stage).toBe(0); // 1801s > 30min → reset
  });
});

describe("dueResolves / streak / mastery", () => {
  it("lists overdue first and excludes future/mastered", () => {
    const s = problemStatuses([
      attempt({ problem_slug: "a", attempted_at: at("2026-08-10") }), // due 08-13, overdue
      attempt({ problem_slug: "b", attempted_at: at("2026-08-22") }), // due 08-25, today
      attempt({ problem_slug: "c", attempted_at: at("2026-08-24") }), // due 08-27, future
    ]);
    expect(dueResolves(s, "2026-08-25").map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("streak counts consecutive days ending today or yesterday", () => {
    const days = ["2026-08-22", "2026-08-23", "2026-08-24"].map((d) => attempt({ attempted_at: at(d) }));
    expect(streak(days, "2026-08-25")).toBe(3); // yesterday counts
    expect(streak(days, "2026-08-24")).toBe(3);
    expect(streak(days, "2026-08-27")).toBe(0);
  });

  it("mastery % by pattern", () => {
    const s = problemStatuses([
      attempt({ problem_slug: "m", attempted_at: at("2026-08-01") }), attempt({ problem_slug: "m", attempted_at: at("2026-08-04") }), attempt({ problem_slug: "m", attempted_at: at("2026-08-15") }),
      attempt({ problem_slug: "u", attempted_at: at("2026-08-01") }),
    ]);
    expect(masteryByPattern(s)).toEqual([{ pattern: "hashing", total: 2, mastered: 1, pct: 50 }]);
  });
});

describe("plan weeks", () => {
  const state: AppState = { ...emptyState(), plan_start: "2026-08-24" };
  it("currentWeek", () => {
    expect(currentWeek(state, "2026-08-23")).toBeNull();
    expect(currentWeek(state, "2026-08-24")).toBe(1);
    expect(currentWeek(state, "2026-08-30")).toBe(1);
    expect(currentWeek(state, "2026-08-31")).toBe(2);
    expect(currentWeek(state, "2026-11-02")).toBeNull(); // week 11
  });
  it("attemptsInWeek is inclusive of both ends", () => {
    const s = { ...state, attempts: ["2026-08-23", "2026-08-24", "2026-08-30", "2026-08-31"].map((d) => attempt({ attempted_at: at(d) })) };
    expect(attemptsInWeek(s, 1)).toHaveLength(2);
  });
});

describe("googleWarnings", () => {
  const g = (id: string, applied_at: string, role = "SWE"): Application => ({
    id, company: "Google", role, tier: "google", applied_at, referral: false, status: "applied", next_action: "", next_action_date: null, notes: "",
  });
  it("warns at 3 in rolling 30 days", () => {
    const apps = [g("1", "2026-08-01", "A"), g("2", "2026-08-10", "B"), g("3", "2026-08-20", "C")];
    expect(googleWarnings(apps, { role: "D", applied_at: "2026-08-25" })).toHaveLength(1);
    expect(googleWarnings(apps.slice(1), { role: "D", applied_at: "2026-08-25" })).toHaveLength(0);
  });
  it("warns on same role within 90 days, case-insensitive, and ignores itself when editing", () => {
    const apps = [g("1", "2026-06-01", "Software Engineer")];
    expect(googleWarnings(apps, { role: "software engineer", applied_at: "2026-08-25" })).toHaveLength(1);
    expect(googleWarnings(apps, { id: "1", role: "Software Engineer", applied_at: "2026-06-01" })).toHaveLength(0);
    expect(googleWarnings(apps, { role: "Software Engineer", applied_at: "2026-09-01" })).toHaveLength(0);
  });
});

describe("slugFromUrl", () => {
  it("prefers the URL slug, falls back to title", () => {
    expect(slugFromUrl("https://leetcode.com/problems/two-sum/description/", "whatever")).toBe("two-sum");
    expect(slugFromUrl("", "3Sum Closest!")).toBe("3sum-closest");
  });
});
