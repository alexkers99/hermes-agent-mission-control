import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Activity, DollarSign, ListTodo, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null) {
  if (!d) return "never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    online: "Online",
    working: "Working",
    idle: "Idle",
    error: "Error",
    offline: "Offline",
  };
  return map[s] || s;
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  let agent: any = null;
  let missions: any[] = [];
  let ideas: any[] = [];

  try {
    agent = await prisma.agentState.findUnique({ where: { id: decodedId } });
    if (agent) {
      [missions, ideas] = await Promise.all([
        prisma.mission.findMany({
          where: { agentId: decodedId },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.idea.findMany({
          where: { source: agent.name },
          orderBy: { timestamp: "desc" },
          take: 10,
        }),
      ]);
    }
  } catch {}

  if (!agent) {
    return (
      <div className="p-8 max-w-[900px]" style={{ margin: "0 auto" }}>
        <Link href="/agents" className="flex items-center gap-1.5 text-[13px] font-[510] mb-6" style={{ color: "var(--ink-3)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to agents
        </Link>
        <div className="card p-8 text-center">
          <div className="text-[14px] font-[510]" style={{ color: "var(--ink-2)" }}>
            Agent not found
          </div>
          <div className="text-[13px] mt-1" style={{ color: "var(--ink-3)" }}>
            The agent ID &quot;{decodedId}&quot; doesn&apos;t exist in the database.
          </div>
        </div>
      </div>
    );
  }

  const activity: { message: string; timestamp: Date }[] = Array.isArray(agent.recentActivity)
    ? agent.recentActivity
    : [];

  return (
    <div className="p-8 max-w-[900px]" style={{ margin: "0 auto" }}>
      {/* Back link */}
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-[13px] font-[510] mb-6" style={{ color: "var(--ink-3)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to agents
      </Link>

      {/* Agent header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="text-[42px] leading-none">{agent.emoji || "🤖"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
              {agent.name}
            </h1>
            <span className={`status-label ${agent.status}`}>{statusLabel(agent.status)}</span>
          </div>
          {agent.role && (
            <div className="text-[14px] mt-0.5" style={{ color: "var(--ink-3)" }}>
              {agent.role}
            </div>
          )}
          {agent.currentTask && (
            <div className="mt-2 px-3 py-2 rounded-md text-[13px] inline-flex items-center gap-2" style={{ background: "var(--surface-0)", border: "1px solid var(--line-subtle)", color: "var(--ink-2)" }}>
              <Activity className="w-3.5 h-3.5" style={{ color: "var(--green)" }} />
              {agent.currentTask}
            </div>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard icon={ListTodo} label="Tasks completed" value={String(agent.tasksCompleted)} />
        <StatCard icon={DollarSign} label="Total cost" value={`$${(agent.totalCost || 0).toFixed(2)}`} />
        <StatCard icon={Activity} label="Last active" value={formatDate(agent.lastActive)} />
      </div>

      {/* Activity Timeline */}
      <div className="mb-8">
        <h2 className="text-[13px] font-[510] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--ink-3)" }}>
          <Activity className="w-3.5 h-3.5" />
          Activity Log
        </h2>
        <div className="card">
          {activity.length > 0 ? (
            <div className="flex flex-col">
              {activity.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 text-[13px]"
                  style={{ borderBottom: i < activity.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-none mt-1.5" style={{ background: "var(--accent)" }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ color: "var(--ink)" }}>{e.message}</div>
                    <div style={{ color: "var(--ink-4)", fontSize: 11, marginTop: 2 }}>
                      {timeAgo(new Date(e.timestamp))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
              No activity recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Missions */}
      <div className="mb-8">
        <h2 className="text-[13px] font-[510] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--ink-3)" }}>
          <ListTodo className="w-3.5 h-3.5" />
          Missions ({missions.length})
        </h2>
        <div className="card">
          {missions.length > 0 ? (
            <div className="flex flex-col">
              {missions.map((m, i) => (
                <div
                  key={m.id}
                  className="px-5 py-3 flex items-center gap-3"
                  style={{ borderBottom: i < missions.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                >
                  <MisionStatusBadge status={m.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-[510]" style={{ color: "var(--ink)" }}>
                      {m.title}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>
                      {m.priority} priority
                    </div>
                  </div>
                  <div className="text-[11px] flex-none" style={{ color: "var(--ink-4)" }}>
                    {timeAgo(m.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
              No missions assigned.
            </div>
          )}
        </div>
      </div>

      {/* Ideas from this agent */}
      {ideas.length > 0 && (
        <div>
          <h2 className="text-[13px] font-[510] uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--ink-3)" }}>
            <Lightbulb className="w-3.5 h-3.5" />
            Ideas ({ideas.length})
          </h2>
          <div className="card flex flex-col">
            {ideas.map((idea, i) => (
              <div
                key={idea.id}
                className="px-5 py-3.5"
                style={{ borderBottom: i < ideas.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
              >
                <div className="text-[13px] font-[510]" style={{ color: "var(--ink)" }}>
                  {idea.title}
                </div>
                {idea.category && (
                  <span className="badge badge-blue mt-1 inline-block">{idea.category}</span>
                )}
                <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>
                  {timeAgo(idea.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--ink-3)" }} />
        {label}
      </div>
      <div className="text-[22px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

function MisionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "badge-neutral" },
    active: { label: "Active", cls: "badge-blue" },
    completed: { label: "Done", cls: "badge-green" },
    failed: { label: "Failed", cls: "badge-red" },
  };
  const m = map[status] || { label: status, cls: "badge-neutral" };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}