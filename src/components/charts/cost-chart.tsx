"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Point {
  date: string;
  cost: number;
}

export function CostChart({ data }: { data: { date: string; costUsd: string }[] }) {
  const points: Point[] = data.map((d) => ({ date: d.date.slice(5), cost: Number(d.costUsd) }));

  if (points.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-[12px]" style={{ color: "var(--ink-4)" }}>
        No cost data yet. Agents report via POST /api/cost-breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => `$${v.toFixed(v >= 10 ? 0 : 2)}`}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          fill="url(#costFill)"
          dot={false}
          activeDot={{ r: 3, fill: "var(--chart-1)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
