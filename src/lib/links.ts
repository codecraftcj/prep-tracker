/** External sites that are part of the routine. Shown on Review under "Set up for the day". */
export type ExternalLink = { label: string; url: string; note: string; group: "daily" | "weekly" | "background" };

export const LINKS: ExternalLink[] = [
  { group: "daily", label: "NeetCode 150", url: "https://neetcode.io/practice?tab=neetcode150", note: "Problem list by pattern; videos when a re-solve fails" },
  { group: "daily", label: "LeetCode", url: "https://leetcode.com/problemset/", note: "Solve here, timer running, talking out loud" },
  { group: "daily", label: "interview-prep repo", url: "https://github.com/codecraftcj/my-leetcode-solutions", note: "Commit today's solutions — this is the streak" },
  { group: "weekly", label: "Pramp", url: "https://www.pramp.com/", note: "Free peer mocks — book this week's slot early" },
  { group: "weekly", label: "interviewing.io", url: "https://interviewing.io/", note: "Mocks with real engineers; use for behavioral + design rounds" },
  { group: "weekly", label: "Hello Interview (system design)", url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", note: "Framework reference before a design rep" },
  { group: "background", label: "Snowflake trial", url: "https://signup.snowflake.com/", note: "Try one BigQuery → Snowflake mapping per session" },
  { group: "background", label: "PySpark docs", url: "https://spark.apache.org/docs/latest/api/python/getting_started/index.html", note: "DataFrame API + explain() for the job README" },
  { group: "background", label: "GitHub profile", url: "https://github.com/codecraftcj", note: "Pins, bio, README — artifact #2" },
  { group: "background", label: "LinkedIn", url: "https://www.linkedin.com/in/", note: "Keep headline/about aligned with the résumé" },
];
