import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCostBreakdown, CostRange, CostGroupBy } from "@/lib/cost";

export const dynamic = "force-dynamic";

/**
 * Per-model cost attribution endpoint.
 *
 *   GET  /api/cost-breakdown?range=24h|7d|30d&agentId=<id>&groupBy=model|agent|day
 *   POST /api/cost-breakdown   -> agent-authenticated cost ingest
 *
 * POST body:
 * {
 *   "agentId": "echo", "model": "claude-sonnet-4.5", "provider": "anthropic",
 *   "inputTokens": 12000, "outputTokens": 3400, "cachedTokens": 8000,
 *   "costUsd": "0.184200",
 *   "windowStart": "2026-07-05T10:00:00Z", "windowEnd": "2026-07-05T11:00:00Z"
 * }
 */

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

const RANGES: CostRange[] = ["24h", "7d", "30d"];
const GROUPS: CostGroupBy[] = ["model", "agent", "day"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rangeParam = sp.get("range") as CostRange | null;
  const groupParam = sp.get("groupBy") as CostGroupBy | null;
  const result = await getCostBreakdown({
    range: rangeParam && RANGES.includes(rangeParam) ? rangeParam : "7d",
    groupBy: groupParam && GROUPS.includes(groupParam) ? groupParam : "model",
    agentId: sp.get("agentId") || undefined,
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    agentId, model, provider,
    inputTokens, outputTokens, cachedTokens,
    costUsd, windowStart, windowEnd,
  } = body || {};

  if (!agentId || !model || !provider || costUsd === undefined || !windowStart || !windowEnd) {
    return NextResponse.json(
      { error: "agentId, model, provider, costUsd, windowStart, windowEnd required" },
      { status: 400 }
    );
  }

  const start = new Date(String(windowStart));
  const end = new Date(String(windowEnd));
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "invalid windowStart/windowEnd" }, { status: 400 });
  }

  const cost = String(costUsd);
  if (!/^\d+(\.\d+)?$/.test(cost)) {
    return NextResponse.json({ error: "costUsd must be a non-negative decimal string" }, { status: 400 });
  }

  try {
    // Ensure the agent row exists so the FK holds even if cost lands before first heartbeat.
    await prisma.agentState.upsert({
      where: { id: String(agentId) },
      create: { id: String(agentId), name: String(agentId) },
      update: {},
    });

    const row = await prisma.costBreakdown.create({
      data: {
        agentId: String(agentId),
        model: String(model),
        provider: String(provider),
        inputTokens: Number.isFinite(inputTokens) ? Number(inputTokens) : 0,
        outputTokens: Number.isFinite(outputTokens) ? Number(outputTokens) : 0,
        cachedTokens: Number.isFinite(cachedTokens) ? Number(cachedTokens) : 0,
        costUsd: cost,
        windowStart: start,
        windowEnd: end,
      },
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch {
    return NextResponse.json({ error: "write failed" }, { status: 500 });
  }
}
