import { prisma } from "@/lib/prisma";
import { DollarSign, Activity, TrendingUp, BarChart3, Bot, ListTodo } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let agents: any[] = [];
  let missions: any[] = [];
  let ideas: any[] = [];

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

  const maxCost = agents.length > 0 ? Math.max(...agents.map((a) => a.totalCost || 0)) : 1;
  const maxTasks = agents.length > 0 ? Math.max(...agents.map((a) => a.tasksCompleted || 0)) : 1;

  // Mission status distribution
  const missionStats = [
    { label: "Pending", value: pendingMissions, color: "var(--ink-4)" },
    { label: "Active", value: activeMissions, color: "var(--blue)" },
    { label: "Completed", value: completedMissions, color: "var(--green)" },
    { label: "Failed", value: failedMissions, color: "var(--red)" },
  ];

  // Idea category distribution
  const catCount: Record<string, number> = {};
  for (const idea of ideas) {
    const c = idea.category || "uncategorized";
    catCount[c] = (catCount[c] || 0) + 1;
  }
  const catMax = Math.max(...Object.values(catCount), 1);

  const avgCost = agents.length > 0 ? totalCost / agents.length : 0;
  const avgTasks = agents.length > 0 ? totalTasks / agents.length : 0;

  return (
    <div className="p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
      <div className="mb-5">
        <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Analytics</h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>
          Performance metrics across {agents.length} agents
        </p>
      </div>

      {/* ── Metric cards ─────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard icon={DollarSign} label="Total Cost" value={`$${totalCost.toFixed(2)}`} sub={`avg $${avgCost.toFixed(2)}/agent`} />
        <MetricCard icon={Activity} label="Tasks Done" value={String(totalTasks)} sub={`avg ${avgTasks.toFixed(1)}/agent`} />
        <MetricCard icon={ListTodo} label="Missions" value={String(missions.length)} sub={`${activeMissions} active, ${pendingMissions} pending`} />
        <MetricCard icon={TrendingUp} label="Completion" value={missions.length > 0 ? `${Math.round((completedMissions / missions.length) * 100)}%` : "0%"} sub={`${failedMissions} failed`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ── Cost by Agent ──────────────────── */}
        <div className="telemetry-card p-5">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-4 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <DollarSign className="w-3 h-3" /> Cost by Agent
          </h2>
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
                {missions.length === 0 && <div style={{ width: "100%", background: "var(--surface-0)" }} />}
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
      <div className="text-[22px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>{value}</div>
      <div className="text-[10px]" style={{ color: "var(--ink-4)" }}>{sub}</div>
    </div>
  );
}