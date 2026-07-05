"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--chart-6)",
];

interface SeriesEntry {
  key: string;
  provider: string;
  costUsd: string;
  inputTokens: number;
  outputTokens: number;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ModelCostBar({ data }: { data: SeriesEntry[] }) {
  const rows = data.map((d) => ({
    name: d.key,
    cost: Number(d.costUsd),
    provider: d.provider,
    tokens: `${fmtTokens(d.inputTokens)} in / ${fmtTokens(d.outputTokens)} out`,
  }));

  if (rows.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-[12px]" style={{ color: "var(--ink-4)" }}>
        No per-model data in this range.
      </div>
    );
  }

  const height = Math.max(120, rows.length * 40 + 30);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
        <XAxis
          type="number"
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v.toFixed(v >= 10 ? 0 : 2)}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={{ fill: "#a1a1aa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(value, _name, entry) => {
            const payload = entry?.payload as { tokens?: string; provider?: string } | undefined;
            return [`$${Number(value).toFixed(4)} · ${payload?.tokens || ""}`, payload?.provider || "cost"];
          }}
        />
        <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={18}>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
