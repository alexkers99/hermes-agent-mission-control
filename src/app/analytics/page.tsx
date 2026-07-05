import { prisma } from "@/lib/prisma";
import { getCostBreakdown, CostRange } from "@/lib/cost";
import { CostChart } from "@/components/charts/cost-chart";
import { ModelCostBar } from "@/components/charts/model-cost-bar";
import Link from "next/link";
import { DollarSign, Activity, TrendingUp, ListTodo, Cpu, LineChart } from "lucide-react";

export const dynamic = "force-dynamic";

const RANGES: { key: CostRange; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range: CostRange = sp.range === "24h" || sp.range === "30d" ? sp.range : "7d";

  let agents: any[] = [];
  let missions: any[] = [];
  let ideas: any[] = [];

  const [breakdown, byAgent] = await Promise.all([
    getCostBreakdown({ range, groupBy: "model" }),
    getCostBreakdown({ range, groupBy: "agent" }),
  ]);

  try {
    [agents, missions, ideas] = await Promise.all([
      prisma.agentState.findMany({ orderBy: { totalCost: "desc" } }),
      prisma.mission.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 100 }),
    ]);
  } catch {}

  // ── Compute metrics ────────────────────────

  const totalCost = agents.reduce((s, a) => s + (a.totalCost || 0), 0);
  const totalTasks = agents.reduce((s, a) => s + (a.tasksCompleted || 0), 0);
  const activeMissions = missions.filter((m) => m.status === "active").length;
  const completedMissions = missions.filter((m) => m.status === "completed").length;
  const failedMissions = missions.filter((m) => m.status === "failed").length;
  const pendingMissions = missions.filter((m) => m.status === "pending").length;

  const rangeCost = Number(breakdown.totalUsd);
  const totalIn = breakdown.series.reduce((s, e) => s + e.inputTokens, 0);
  const totalOut = breakdown.series.reduce((s, e) => s + e.outputTokens, 0);

  const maxCost = agents.length > 0 ? Math.max(...agents.map((a) => a.totalCost || 0)) : 1;
  const maxTasks = agents.length > 0 ? Math.max(...agents.map((a) => a.tasksCompleted || 0)) : 1;

  const missionStats = [
    { label: "Pending", value: pendingMissions, color: "var(--ink-4)" },
    { label: "Active", value: activeMissions, color: "var(--blue)" },
    { label: "Completed", value: completedMissions, color: "var(--green)" },
    { label: "Failed", value: failedMissions, color: "var(--red)" },
  ];

  const catCount: Record<string, number> = {};
  for (const idea of ideas) {
    const c = idea.category || "uncategorized";
    catCount[c] = (catCount[c] || 0) + 1;
  }
  const catMax = Math.max(...Object.values(catCount), 1);

  const avgCost = agents.length > 0 ? totalCost / agents.length : 0;
  const avgTasks = agents.length > 0 ? totalTasks / agents.length : 0;

  function fmtTok(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  }

  return (
    <div className="p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Analytics</h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>
            Cost, tokens, and performance across {agents.length} agents
          </p>
        </div>
        {/* Range toggle */}
        <div className="flex gap-1 p-0.5 rounded-md" style={{ background: "var(--surface-1)", border: "1px solid var(--line-subtle)" }}>
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/analytics?range=${r.key}`}
              className="px-3 py-1 rounded text-[11px] font-[510]"
              style={{
                background: r.key === range ? "var(--panel-elevated)" : "transparent",
                color: r.key === range ? "var(--ink)" : "var(--ink-4)",
              }}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Metric cards ─────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard icon={LineChart} label={`Cost ${range.toUpperCase()}`} value={`$${rangeCost.toFixed(2)}`} sub={`${fmtTok(totalIn)} in / ${fmtTok(totalOut)} out tokens`} />
        <MetricCard icon={DollarSign} label="Cost All-Time" value={`$${totalCost.toFixed(2)}`} sub={`avg $${avgCost.toFixed(2)}/agent`} />
        <MetricCard icon={Activity} label="Tasks Done" value={String(totalTasks)} sub={`avg ${avgTasks.toFixed(1)}/agent`} />
        <MetricCard icon={TrendingUp} label="Completion" value={missions.length > 0 ? `${Math.round((completedMissions / missions.length) * 100)}%` : "0%"} sub={`${activeMissions} active, ${failedMissions} failed`} />
      </div>

      {/* ── Cost over time + per-model ──────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <LineChart className="w-3 h-3" /> Cost Over Time ({range})
          </h2>
          <CostChart data={breakdown.timeline} />
        </div>

        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <Cpu className="w-3 h-3" /> Cost by Model ({range})
          </h2>
          <ModelCostBar data={breakdown.series} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── Cost by Agent (tracked) ────────── */}
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <DollarSign className="w-3 h-3" /> Cost by Agent ({range})
          </h2>
          {byAgent.series.length > 0 ? (
            <ModelCostBar data={byAgent.series} />
          ) : (
            <div className="flex flex-col gap-2.5">
              {agents.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="text-[11px] w-24 truncate flex-none" style={{ color: "var(--ink-2)" }}>{a.name}</span>
                  <div className="flex-1 h-5 rounded-sm" style={{ background: "var(--surface-0)" }}>
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{
                        width: `${(a.totalCost / maxCost) * 100}%`,
                        background: "var(--accent)",
                        minWidth: a.totalCost > 0 ? 2 : 0,
                      }}
                    />
                  </div>
                  <span className="data-metric text-[11px] w-16 text-right flex-none" style={{ color: "var(--ink-3)" }}>
                    ${(a.totalCost || 0).toFixed(2)}
                  </span>
                </div>
              ))}
              {agents.length === 0 && (
                <div className="text-[12px] py-4 text-center" style={{ color: "var(--ink-4)" }}>No agent data</div>
              )}
            </div>
          )}
        </div>

        {/* ── Tasks by Agent ─────────────────── */}
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <Activity className="w-3 h-3" /> Tasks by Agent
          </h2>
          <div className="flex flex-col gap-2.5">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-[11px] w-24 truncate flex-none" style={{ color: "var(--ink-2)" }}>{a.name}</span>
                <div className="flex-1 h-5 rounded-sm" style={{ background: "var(--surface-0)" }}>
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{
                      width: `${(a.tasksCompleted / maxTasks) * 100}%`,
                      background: "var(--green)",
                      minWidth: a.tasksCompleted > 0 ? 2 : 0,
                    }}
                  />
                </div>
                <span className="data-metric text-[11px] w-12 text-right flex-none" style={{ color: "var(--ink-3)" }}>
                  {a.tasksCompleted}
                </span>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="text-[12px] py-4 text-center" style={{ color: "var(--ink-4)" }}>No agent data</div>
            )}
          </div>
        </div>

        {/* ── Mission Status Distribution ────── */}
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <ListTodo className="w-3 h-3" /> Mission Status
          </h2>
          {missions.length > 0 ? (
            <>
              <div className="flex h-6 rounded-sm overflow-hidden mb-3">
                {missionStats.map((s) =>
                  s.value > 0 ? (
                    <div
                      key={s.label}
                      style={{
                        width: `${(s.value / missions.length) * 100}%`,
                        background: s.color,
                      }}
                      title={`${s.label}: ${s.value}`}
                    />
                  ) : null
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {missionStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span style={{ color: "var(--ink-2)" }}>{s.label}</span>
                    <span className="ml-auto font-[510]" style={{ color: "var(--ink)" }}>{s.value}</span>
                    <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>
                      ({missions.length > 0 ? Math.round((s.value / missions.length) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-[12px] py-4 text-center" style={{ color: "var(--ink-4)" }}>No missions</div>
          )}
        </div>

        {/* ── Signal Categories ──────────────── */}
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <TrendingUp className="w-3 h-3" /> Signal Categories
          </h2>
          {Object.keys(catCount).length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {Object.entries(catCount).sort(([, a], [, b]) => b - a).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[11px] w-24 truncate flex-none" style={{ color: "var(--ink-2)" }}>{cat}</span>
                  <div className="flex-1 h-5 rounded-sm" style={{ background: "var(--surface-0)" }}>
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{
                        width: `${(count / catMax) * 100}%`,
                        background: "var(--accent)",
                        opacity: 0.6 + (count / catMax) * 0.4,
                      }}
                    />
                  </div>
                  <span className="data-metric text-[11px] w-8 text-right flex-none" style={{ color: "var(--ink-3)" }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12px] py-4 text-center" style={{ color: "var(--ink-4)" }}>No signals</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: string; sub: string }) {
  return (
    <div className="telemetry-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
        <Icon className="w-3 h-3" style={{ color: "var(--ink-3)" }} />
        {label}
      </div>
      <div className="text-[22px] font-[510] tracking-[-0.01em] data-metric" style={{ color: "var(--ink)", fontSize: 22 }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--ink-4)" }}>{sub}</div>
    </div>
  );
}
