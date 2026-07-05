import { prisma } from "@/lib/prisma";
import { Bot, ListTodo, Lightbulb, Activity, TrendingUp, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [agents, pendingMissions, pendingIdeas] = await Promise.all([
      prisma.agentState.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.mission.count({ where: { status: "pending" } }),
      prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 4 }),
    ]);
    const online = agents.filter(
      (a) => a.status === "online" || a.status === "working"
    ).length;
    const error = agents.filter((a) => a.status === "error").length;
    const totalCost = agents.reduce((s, a) => s + (a.totalCost || 0), 0);
    const totalTasks = agents.reduce((s, a) => s + (a.tasksCompleted || 0), 0);
    return { agents, online, error, total: agents.length, totalCost, totalTasks, pendingMissions, pendingIdeas };
  } catch {
    return { agents: [], online: 0, error: 0, total: 0, totalCost: 0, totalTasks: 0, pendingMissions: 0, pendingIdeas: [] };
  }
}

function collectActivity(agents: any[]) {
  const entries: { agent: string; emoji: string; message: string; timestamp: Date; status: string }[] = [];
  for (const a of agents) {
    if (a.recentActivity && Array.isArray(a.recentActivity)) {
      for (const act of a.recentActivity) {
        entries.push({
          agent: a.name,
          emoji: a.emoji || "🤖",
          message: act.message || "No message",
          timestamp: new Date(act.timestamp || a.updatedAt),
          status: a.status,
        });
      }
    }
  }
  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return entries.slice(0, 12);
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function HomePage() {
  const s = await getStats();
  const empty = s.total === 0;
  const activity = collectActivity(s.agents);

  const hasErrors = s.error > 0;
  const hasSignals = !empty && s.agents.some((a) =>
    Array.isArray(a.recentActivity) && a.recentActivity.length > 0
  );

  return (
    <div className="p-8 max-w-[1200px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-[510] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          Mission Control
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ink-3)" }}>
          Every agent in your Hermes stack, at a glance.
        </p>
      </div>

      {/* Error Alert Banner */}
      {hasErrors && (
        <div
          className="mb-6 px-5 py-3.5 rounded-lg flex items-center gap-3"
          style={{ background: "var(--red-subtle)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--red)" }} />
          <span className="text-[13px] font-[510]" style={{ color: "#fca5a5" }}>
            {s.error} agent{s.error > 1 ? "s are" : " is"} in error state.
          </span>
          <Link
            href="/agents"
            className="text-[13px] ml-auto flex items-center gap-1"
            style={{ color: "var(--ink-2)" }}
          >
            View agents <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Empty state */}
      {empty && (
        <div className="card p-6 mb-8 text-center">
          <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
            No agents yet.
          </div>
          <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Run{" "}
            <code
              className="px-1.5 py-0.5 rounded text-[12px]"
              style={{ background: "var(--surface-1)", color: "var(--accent)" }}
            >
              npm run seed:demo
            </code>{" "}
            to populate sample data, or wire your Hermes agents to{" "}
            <code
              className="px-1.5 py-0.5 rounded text-[12px]"
              style={{ background: "var(--surface-1)" }}
            >
              POST /api/agents/state
            </code>
            .
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <KpiCard
          icon={<Bot className="w-4 h-4" />}
          label="Agents Online"
          value={`${s.online} / ${s.total}`}
          accent="var(--green)"
        />
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="Tasks Completed"
          value={s.totalTasks.toLocaleString()}
          accent="var(--accent)"
        />
        <KpiCard
          icon={<ListTodo className="w-4 h-4" />}
          label="Pending Missions"
          value={String(s.pendingMissions)}
          accent="var(--amber)"
        />
        <KpiCard
          icon={<Lightbulb className="w-4 h-4" />}
          label="Ideas to Review"
          value={String(s.pendingIdeas.length)}
          accent="var(--blue)"
        />
      </div>

      {/* Main grid: Activity + Signals */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Activity Feed - takes 2 columns */}
        <div className="col-span-2">
          <SectionHeader
            title="Activity"
            icon={Zap}
            href={activity.length > 0 ? "/agents" : undefined}
            linkLabel="All agents"
          />
          <div className="card">
            {activity.length > 0 ? (
              <div className="flex flex-col">
                {activity.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-5 py-3"
                    style={{ borderBottom: i < activity.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                  >
                    <div className="text-[18px] mt-0.5 flex-none">{a.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-[510] truncate" style={{ color: "var(--ink)" }}>
                        {a.message}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                          {a.agent}
                        </span>
                        <span className={`status-dot ${a.status}`} />
                        <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                          {timeAgo(a.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
                {empty
                  ? "Agents will appear here once they start reporting."
                  : "No recent activity recorded. Agents self-report via their heartbeat."}
              </div>
            )}
          </div>
        </div>

        {/* Signals Panel - takes 1 column */}
        <div>
          <SectionHeader title="Recent Signals" icon={TrendingUp} />
          <div className="card flex flex-col">
            {s.pendingIdeas.length > 0 ? (
              s.pendingIdeas.map((idea, i) => (
                <div
                  key={i}
                  className="px-5 py-3.5"
                  style={{ borderBottom: i < s.pendingIdeas.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                >
                  <div className="text-[13px] font-[510] leading-snug" style={{ color: "var(--ink)" }}>
                    {idea.title}
                  </div>
                  {idea.category && (
                    <span className="badge badge-blue mt-1.5 inline-block">{idea.category}</span>
                  )}
                  {idea.timestamp && (
                    <div className="text-[10px] mt-1" style={{ color: "var(--ink-4)" }}>
                      {timeAgo(new Date(idea.timestamp))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
                Growth Scout signals will appear here.
              </div>
            )}
            {!empty && (
              <Link
                href="/ideas"
                className="px-5 py-3 text-[12px] font-[510] flex items-center justify-center gap-1.5"
                style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line-subtle)" }}
              >
                View all ideas <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Agents Overview */}
      <SectionHeader title="Agents" icon={Bot} href="/agents" linkLabel="View all" />
      <div className="grid grid-cols-2 gap-3">
        {s.agents.slice(0, 6).map((a) => (
          <Link
            key={a.id}
            href={`/agents/${encodeURIComponent(a.id)}`}
            className="card p-4 flex items-center gap-3.5 hover:!bg-[var(--panel-hover)] transition-all"
          >
            <div className="text-[22px] flex-none">{a.emoji || "🤖"}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[510] truncate" style={{ color: "var(--ink)" }}>
                  {a.name}
                </div>
                <div className={`status-dot ${a.status}`} />
              </div>
              <div className="text-[12px] mt-0.5 truncate" style={{ color: "var(--ink-3)" }}>
                {a.currentTask || a.role || "Idle"}
              </div>
            </div>
            <div className="text-right flex flex-col gap-0.5 flex-none" style={{ color: "var(--ink-4)" }}>
              <div className="text-[11px] font-[510]">
                {a.tasksCompleted} tasks
              </div>
              <div className="text-[11px]">
                ${(a.totalCost || 0).toFixed(2)}
              </div>
            </div>
          </Link>
        ))}
        {s.agents.length > 6 && (
          <Link
            href="/agents"
            className="card p-4 flex items-center justify-center gap-2 text-[13px]"
            style={{ color: "var(--ink-3)" }}
          >
            View all {s.agents.length} agents <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="text-[26px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  href,
  linkLabel,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: "var(--ink-3)" }} />
        <h2 className="text-[13px] font-[510] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-[12px] font-[510] flex items-center gap-1"
          style={{ color: "var(--ink-4)" }}
        >
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}