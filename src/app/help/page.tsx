import Link from "next/link";
import { PageTitle } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAILY_TARGET_ATTEMPTS, RESOLVE_INTERVALS_DAYS, TARGET_SECONDS } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_b]:font-medium">{children}</CardContent>
    </Card>
  );
}
const L = ({ href, children }: { href: string; children: React.ReactNode }) => <Link href={href} className="underline underline-offset-2">{children}</Link>;

export default function HelpPage() {
  const [d1, d2] = RESOLVE_INTERVALS_DAYS;
  return (
    <div className="space-y-4 max-w-2xl">
      <PageTitle>Help</PageTitle>

      <Section title="The daily routine (≈ 45 min)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open <L href="/review">Review</L>. <b>Today&apos;s problems</b> lists due re-solves then Next up; <b>Reminders &amp; sites</b> has every external site with why you&apos;re going there; <b>Focus now</b> says what&apos;s slipping.</li>
          <li>Go to <L href="/">Today</L>. If anything is under <b>Due re-solves</b>, do those first — tap <b>Re-solve</b> to prefill the form.</li>
          <li>Then pick from <b>Next up</b> (tap <b>Start</b>) until you have {DAILY_TARGET_ATTEMPTS} attempts for the day.</li>
          <li>For each problem: press <b>Start</b> on the timer, solve <b>out loud</b>, press <b>Log attempt</b>. Be honest about the outcome; if it wasn&apos;t clean, write what stopped you.</li>
          <li>Once a week (Sunday works) go through Review&apos;s scorecards properly and book the week&apos;s mock.</li>
        </ol>
      </Section>

      <Section title="Outcomes — pick honestly">
        <ul>
          <li><b>solved clean</b> — no hints, no peeking, working solution.</li>
          <li><b>solved with hint</b> — needed a nudge (a tag, a comment, a hint button).</li>
          <li><b>solved after solution</b> — read the solution, then wrote it yourself.</li>
          <li><b>failed</b> — didn&apos;t get a working solution in the time.</li>
        </ul>
        <p>Anything other than <i>solved clean</i> requires a <b>blocker</b>: one sentence on what stopped you. Those sentences are the most useful data in the app — Review reads them back to you.</p>
      </Section>

      <Section title="Re-solves and mastery">
        <p>After your first attempt at a problem, it comes back <b>+{d1} days</b> later, then <b>+{d2} days</b> after the original. A re-solve <b>passes</b> only if it is <i>solved clean</i> within target time:</p>
        <ul>
          <li>easy ≤ {TARGET_SECONDS.easy / 60} min · medium ≤ {TARGET_SECONDS.medium / 60} min · hard ≤ {TARGET_SECONDS.hard / 60} min</li>
        </ul>
        <p>Pass both re-solves → <b>mastered</b>. Fail either (wrong, hinted, or too slow) → the schedule restarts from that attempt. Solving a problem again <i>before</i> its due day is fine but doesn&apos;t count as the re-solve.</p>
        <p>Re-solves that are due show at the top of Today, oldest first. Overdue ones are also the first item in Review&apos;s Focus list.</p>
      </Section>

      <Section title="Curriculum and Next up">
        <p><L href="/curriculum">Curriculum</L> is a NeetCode-150-based list, one column per pattern, in learning order (top = teaches the core move). Each row shows a one-line &quot;what it teaches&quot; and your status: <i>new</i>, last time + outcome + next due, or <i>mastered</i>.</p>
        <p><b>Next up</b> (on Today, ★ on Curriculum) picks the next unattempted problem from each pattern, in this priority:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Patterns from past weeks you haven&apos;t started</li>
          <li>Past-week patterns still weak (under 50% clean or fewer than 3 problems)</li>
          <li>This week&apos;s patterns</li>
          <li>Upcoming weeks</li>
          <li>Solid past patterns, to keep warm</li>
        </ol>
        <p>Use the app&apos;s links to open problems — the URL is what ties an attempt to its curriculum entry.</p>
      </Section>

      <Section title="Other screens">
        <ul>
          <li><L href="/problems">Problems</L> — every problem you&apos;ve logged, with filters; tap a row to see its attempt history and delete mistakes.</li>
          <li><L href="/review">Review</L> — where you are in the program, days until applications open, <b>Focus now</b> (what&apos;s slipping and why), and scorecards for coding, patterns, mocks/design, portfolio.</li>
          <li><L href="/progress">Progress</L> — four charts: attempts per day, median time by difficulty, mastery by pattern, outcomes.</li>
          <li><L href="/mocks">Mocks &amp; Design</L> — log each mock with a 1–5 self-score and <b>one thing to fix</b>; log each 45-min system design rep with weak areas. The plan expects 1 mock/week from week 2 and 1 design rep/week from week 3.</li>
          <li><L href="/artifacts">Artifacts</L> — the portfolio checklist (résumé, GitHub, showcase repo, STAR stories…). Set status and paste a link when done.</li>
          <li><L href="/applications">Applications</L> — kanban by status. Google applications get a warning at 3 per 30 days or the same role within 90 days; it never blocks.</li>
          <li><L href="/plan">Plan</L> — the 10 weeks and their targets, with actual vs {DAILY_TARGET_ATTEMPTS * 7} attempts per week.</li>
          <li><L href="/settings">Settings</L> — week-1 start date, dark mode, <b>Export JSON</b> (your backup — do it weekly), Import, sign out.</li>
        </ul>
      </Section>

      <Section title="Good habits">
        <ul>
          <li>Talk-aloud stays on unless you genuinely solved in silence. Review warns under 80%.</li>
          <li>Log the attempt even when it&apos;s embarrassing. A failed attempt with a good blocker note is worth more than an unlogged one.</li>
          <li>Don&apos;t edit the past. If an entry is wrong, delete it from Problems and re-log.</li>
          <li>Two problems a day beats ten on Sunday — the streak and the re-solve schedule both assume daily practice.</li>
        </ul>
      </Section>
    </div>
  );
}
