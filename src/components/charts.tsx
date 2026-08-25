"use client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ChartData = {
  perDay: { day: string; attempts: number }[];
  medianByDifficulty: { week: string; easy: number | null; medium: number | null; hard: number | null }[];
  mastery: { pattern: string; pct: number; mastered: number; total: number }[];
  outcomes: { outcome: string; count: number }[];
};

const C = { a: "var(--chart-1)", b: "var(--chart-2)", c: "var(--chart-3)", d: "var(--chart-4)" };

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="h-56 pl-0">{children}</CardContent>
    </Card>
  );
}

export function Charts({ data }: { data: ChartData }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Panel title="Attempts per day (last 30)">
        <ResponsiveContainer>
          <BarChart data={data.perDay}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={10} interval={4} />
            <YAxis allowDecimals={false} fontSize={10} width={28} />
            <Tooltip />
            <Bar dataKey="attempts" fill={C.a} radius={2} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Median minutes by difficulty (per week)">
        <ResponsiveContainer>
          <LineChart data={data.medianByDifficulty}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" fontSize={10} />
            <YAxis fontSize={10} width={28} />
            <Tooltip />
            <Line dataKey="easy" stroke={C.b} connectNulls dot={false} />
            <Line dataKey="medium" stroke={C.a} connectNulls dot={false} />
            <Line dataKey="hard" stroke={C.c} connectNulls dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Mastery % by pattern">
        <ResponsiveContainer>
          <BarChart data={data.mastery} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" domain={[0, 100]} fontSize={10} />
            <YAxis type="category" dataKey="pattern" fontSize={10} width={80} />
            <Tooltip formatter={(v, _n, p) => [`${v}% (${p.payload.mastered}/${p.payload.total})`, "mastered"]} />
            <Bar dataKey="pct" fill={C.d} radius={2} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Outcome distribution">
        <ResponsiveContainer>
          <BarChart data={data.outcomes}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="outcome" fontSize={10} />
            <YAxis allowDecimals={false} fontSize={10} width={28} />
            <Tooltip />
            <Bar dataKey="count" fill={C.b} radius={2} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
