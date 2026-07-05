import { prisma } from "@/lib/prisma";
import { getCostBreakdown } from "@/lib/cost";
import { CostChart } from "@/components/charts/cost-chart";
import { ModelCostBar } from "@/components/charts/model-cost-bar";
import Link from "next/link";
import { ArrowLeft, Activity, DollarSign, ListTodo, Clock, LineChart, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(d: Date | null) {
  if (!d) return "never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusClass(s: string) {
  const m: Record<string, string> = { online: "online", working: "working", idle: "idle", error: "error", offline: "offline" };
  return m[s] || "offline";
}

function statusLabel(s: string) {
  const m: Record<string, string> = { online: "Active", working: "Working", idle: "Idle", error: "Error", offline: "Offline" };
  return m[s] || s;
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  let agent: any = null;
  let missions: any[] = [];
  let ideas: any[] = [];

  try {
    agent = await prisma.agentState.findUnique({ where: { id: decoded } });
    if (agent) {
      [missions, ideas] = await Promise.all([
        prisma.mission.findMany({ where: { agentId: decoded }, orderBy: { createdAt: "desc" }, take: 20 }),
        prisma.idea.findMany({ where: { source: agent.name }, orderBy: { timestamp: "desc" }, take: 10 }),
      ]);
    }
  } catch {}

  const costs = agent ? await getCostBreakdown({ range: "7d", agentId: decoded, groupBy: "model" }) : null;

  if (!agent) {
    return (
      <div className="p-6 max-w-[900px]" style={{ margin: "0 auto" }}>
        <Link href="/agents" className="inline-flex items-center gap-1.5 text-[12px] font-[510] mb-5" style={{ color: "var(--ink-3)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="telemetry-card p-8 text-center">
          <div className="text-[14px] font-[510]" style={{ color: "var(--ink-2)" }}>Agent not found</div>
        </div>
      </div>
    );
  }

  const activity: { message: string; timestamp: string }[] = Array.isArray(agent.recentActivity)
    ? (agent.recentActivity as Array<{ message?: string; timestamp?: string }>).map((e) => ({
        message: e.message || "No message",
        timestamp: e.timestamp || agent.updatedAt?.toISOString() || new Date().toISOString(),
      }))
    : [];

  return (
    <div className="p-6 max-w-[900px]" style={{ margin: "0 auto" }}>
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-[12px] font-[510] mb-5" style={{ color: "var(--ink-3)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to agents
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="text-[40px] leading-none">{agent.emoji || "🤖"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>{agent.name}</h1>
            <span className={`telemetry-badge ${statusClass(agent.status)}`}>
              <div className={`telemetry-dot ${statusClass(agent.status)}`} style={{ width: 5, height: 5 }} />
              {statusLabel(agent.status)}
            </span>
          </div>
          {agent.role && <div className="text-[13px] mt-0.5" style={{ color: "var(--ink-3)" }}>{agent.role}</div>}
          {agent.currentTask && (
            <div className="mt-2 px-3 py-1.5 rounded-md text-[12px] inline-flex items-center gap-1.5" style={{ background: "var(--surface-0)", border: "1px solid var(--line-subtle)", color: "var(--ink-2)" }}>
              <Activity className="w-3 h-3" style={{ color: "var(--green)" }} />
              {agent.currentTask}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat icon={ListTodo} label="Tasks" value={String(agent.tasksCompleted)} />
        <Stat icon={DollarSign} label="Cost" value={`$${(agent.totalCost || 0).toFixed(2)}`} />
        <Stat icon={Clock} label="Last active" value={timeAgo(agent.lastActive)} />
      </div>

      {/* Cost history (7d) */}
      {costs && (Number(costs.totalUsd) > 0 || costs.timeline.length > 0) && (
        <div className="mb-6">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            <LineChart className="w-3 h-3" /> COST HISTORY (7D) - ${Number(costs.totalUsd).toFixed(2)}
          </h2>
          <div className="telemetry-card p-5">
            <CostChart data={costs.timeline} />
          </div>
          {costs.series.length > 0 && (
            <div className="telemetry-card p-5 mt-3">
              <h3 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
                <Cpu className="w-3 h-3" /> BY MODEL
              </h3>
              <ModelCostBar data={costs.series} />
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      <div className="mb-6">
        <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
          <Activity className="w-3 h-3" /> ACTIVITY LOG
        </h2>
        <div className="telemetry-card">
          {activity.length > 0 ? (
            <div className="flex flex-col">
              {activity.map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-2.5 text-[12px]" style={{ borderBottom: i < activity.length - 1 ? "1px solid var(--line-subtle)" : "none" }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-none mt-1.5" style={{ background: "var(--accent)" }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ color: "var(--ink)" }}>{e.message}</div>
                    <div style={{ color: "var(--ink-4)", fontSize: 10, marginTop: 1 }}>{timeAgo(new Date(e.timestamp))}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[12px]" style={{ color: "var(--ink-4)" }}>No activity recorded.</div>
          )}
        </div>
      </div>

      {/* Missions */}
      <div className="mb-6">
        <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
          <ListTodo className="w-3 h-3" /> MISSIONS ({missions.length})
        </h2>
        <div className="telemetry-card">
          {missions.length > 0 ? (
            <div className="flex flex-col">
              {missions.map((m, i) => (
                <div key={m.id} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: i < missions.length - 1 ? "1px solid var(--line-subtle)" : "none" }}>
                  <MissionBadge status={m.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-[510]" style={{ color: "var(--ink)" }}>{m.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-4)" }}>{m.priority} priority</div>
                  </div>
                  <div className="text-[10px] flex-none" style={{ color: "var(--ink-4)" }}>{timeAgo(m.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[12px]" style={{ color: "var(--ink-4)" }}>No missions assigned.</div>
          )}
        </div>
      </div>

      {/* Ideas */}
      {ideas.length > 0 && (
        <div>
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5" style={{ color: "var(--ink-4)" }}>
            SIGNALS ({ideas.length})
          </h2>
          <div className="telemetry-card flex flex-col">
            {ideas.map((idea, i) => (
              <div key={idea.id} className="px-5 py-3" style={{ borderBottom: i < ideas.length - 1 ? "1px solid var(--line-subtle)" : "none" }}>
                <div className="text-[12px] font-[510]" style={{ color: "var(--ink)" }}>{idea.title}</div>
                {idea.category && <span className="badge badge-blue mt-1 inline-block">{idea.category}</span>}
                <div className="text-[10px] mt-0.5" style={{ color: "var(--ink-4)" }}>{timeAgo(idea.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: string }) {
  return (
    <div className="telemetry-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
        <Icon className="w-3 h-3" style={{ color: "var(--ink-3)" }} />
        {label}
      </div>
      <div className="text-[20px] font-[510]" style={{ color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

function MissionBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: "badge-neutral", active: "badge-blue", completed: "badge-green", failed: "badge-red" };
  return <span className={`badge ${map[status] || "badge-neutral"}`}>{status}</span>;
}