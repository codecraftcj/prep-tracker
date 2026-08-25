export const TZ = "Asia/Manila";
const DAY_MS = 86_400_000;

/** YYYY-MM-DD for an instant, in Manila time. */
export function toManilaDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function todayManila(): string {
  return toManilaDate(new Date());
}
export function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-SG", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
export function fmtDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-SG", { timeZone: "UTC", dateStyle: "medium" }).format(new Date(Date.UTC(y, m - 1, d)));
}
/** Add days to a YYYY-MM-DD string. */
export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}
export function diffDays(a: string, b: string): number {
  const p = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(a) - p(b)) / DAY_MS);
}
export function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
