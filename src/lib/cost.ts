import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CostRange = "24h" | "7d" | "30d";
export type CostGroupBy = "model" | "agent" | "day";

export interface CostSeriesEntry {
  key: string;
  provider: string;
  costUsd: string;
  inputTokens: number;
  outputTokens: number;
}

export interface CostTimelinePoint {
  date: string;
  costUsd: string;
}

export interface CostBreakdownResult {
  range: CostRange;
  totalUsd: string;
  series: CostSeriesEntry[];
  timeline: CostTimelinePoint[];
}

const EMPTY: CostBreakdownResult = { range: "7d", totalUsd: "0", series: [], timeline: [] };

export function rangeToStart(range: CostRange): Date {
  const now = Date.now();
  const ms = range === "24h" ? 86400000 : range === "7d" ? 7 * 86400000 : 30 * 86400000;
  return new Date(now - ms);
}

/**
 * Aggregate CostBreakdown rows into a per-key series plus a daily timeline.
 * All Decimal math stays in Prisma.Decimal until final serialization.
 */
export async function getCostBreakdown(opts: {
  range?: CostRange;
  agentId?: string;
  groupBy?: CostGroupBy;
}): Promise<CostBreakdownResult> {
  const range = opts.range || "7d";
  const groupBy = opts.groupBy || "model";
  try {
    const where: Prisma.CostBreakdownWhereInput = {
      windowStart: { gte: rangeToStart(range) },
      ...(opts.agentId ? { agentId: opts.agentId } : {}),
    };

    const rows = await prisma.costBreakdown.findMany({
      where,
      select: {
        agentId: true,
        model: true,
        provider: true,
        inputTokens: true,
        outputTokens: true,
        costUsd: true,
        windowStart: true,
        agent: { select: { name: true } },
      },
      orderBy: { windowStart: "asc" },
    });

    let total = new Prisma.Decimal(0);
    const series = new Map<string, { provider: string; cost: Prisma.Decimal; inTok: number; outTok: number }>();
    const timeline = new Map<string, Prisma.Decimal>();

    for (const r of rows) {
      total = total.add(r.costUsd);

      const key =
        groupBy === "agent" ? (r.agent?.name || r.agentId)
        : groupBy === "day" ? r.windowStart.toISOString().slice(0, 10)
        : r.model;
      const cur = series.get(key) || { provider: r.provider, cost: new Prisma.Decimal(0), inTok: 0, outTok: 0 };
      cur.cost = cur.cost.add(r.costUsd);
      cur.inTok += r.inputTokens;
      cur.outTok += r.outputTokens;
      series.set(key, cur);

      const day = r.windowStart.toISOString().slice(0, 10);
      timeline.set(day, (timeline.get(day) || new Prisma.Decimal(0)).add(r.costUsd));
    }

    return {
      range,
      totalUsd: total.toFixed(6),
      series: Array.from(series.entries())
        .map(([key, v]) => ({
          key,
          provider: v.provider,
          costUsd: v.cost.toFixed(6),
          inputTokens: v.inTok,
          outputTokens: v.outTok,
        }))
        .sort((a, b) => Number(b.costUsd) - Number(a.costUsd)),
      timeline: Array.from(timeline.entries())
        .map(([date, c]) => ({ date, costUsd: c.toFixed(6) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch {
    return { ...EMPTY, range };
  }
}

/** Cumulative all-time cost from CostBreakdown (falls back to 0 on error). */
export async function getCumulativeCost(): Promise<string> {
  try {
    const agg = await prisma.costBreakdown.aggregate({ _sum: { costUsd: true } });
    return (agg._sum.costUsd ?? new Prisma.Decimal(0)).toFixed(6);
  } catch {
    return "0";
  }
}
