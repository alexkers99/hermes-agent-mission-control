import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Bot, ListTodo, Lightbulb, Activity, AlertTriangle,
  TrendingUp, Zap, DollarSign, ArrowRight, Clock, Server
} from "lucide-react";

export const dynamic = "force-dynamic";

/* ── Utilities ─────────────────────────────────── */

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusClass(s: string) {
  const m: Record<string, string> = {
    online: "online", working: "working", idle: "idle", error: "error", offline: "offline",
  };
  return m[s] || "offline";
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    online: "Active", working: "Working", idle: "Idle", error: "Error", offline: "Offline",
  };
  return m[s] || s;
}

/* ── Data ─────────────────────────────────────── */

async function getData() {
  try {
    const [agents, pendingMissions, pendingIdeas] = await Promise.all([
      prisma.agentState.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.mission.count({ where: { status: "pending" } }),
      prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 5 }),
    ]);
    const online = agents.filter((a) => a.status === "online" || a.status === "working").length;
    const errors = agents.filter((a) => a.status === "error").length;
    const totalCost = agents.reduce((s, a) => s + (a.totalCost || 0), 0);
    const totalTasks = agents.reduce((s, a) => s + (a.tasksCompleted || 0), 0);

    const activity: { agent: string; emoji: string; message: string; ts: Date; status: string }[] = [];
    for (const a of agents) {
      if (a.recentActivity && Array.isArray(a.recentActivity)) {
        const raw = a.recentActivity as Array<{ message?: string; timestamp?: string }>;
        for (const entry of raw) {
          activity.push({
            agent: a.name, emoji: a.emoji || "🤖",
            message: entry.message || "No message",
            ts: new Date(entry.timestamp || a.updatedAt),
            status: a.status,
          });
        }
      }
    }
    activity.sort((a, b) => b.ts.getTime() - a.ts.getTime());

    return { agents, online, errors, total: agents.length, totalCost, totalTasks, pendingMissions, pendingIdeas: pendingIdeas, activity: activity.slice(0, 15) };
  } catch {
    return { agents: [], online: 0, errors: 0, total: 0, totalCost: 0, totalTasks: 0, pendingMissions: 0, pendingIdeas: [], activity: [] };
  }
}

/* ── Page ─────────────────────────────────────── */

export default async function HomePage() {
  const s = await getData();
  const empty = s.total === 0;
  const hasError = s.errors > 0;

  return (
    <>
      {/* ============ TELEMETRY STRIP ============ */}
      <div className="telemetry-strip px-6 py-2.5 flex items-center gap-6 text-[12px]">
        <TelemetryItem icon={<Bot className="w-3.5 h-3.5" />} label="AGENTS" value={`${s.online}/${s.total}`} status="green" />
        <TelemetryItem icon={<Zap className="w-3.5 h-3.5" />} label="TASKS" value={String(s.totalTasks)} />
        <TelemetryItem icon={<DollarSign className="w-3.5 h-3.5" />} label="COST" value={`$${s.totalCost.toFixed(2)}`} />
        {hasError ? (
          <TelemetryItem icon={<AlertTriangle className="w-3.5 h-3.5" />} label="ERRORS" value={String(s.errors)} status="red" />
        ) : (
          <TelemetryItem icon={<Activity className="w-3.5 h-3.5" />} label="MISSIONS" value={String(s.pendingMissions)} />
        )}
        <TelemetryItem icon={<Lightbulb className="w-3.5 h-3.5" />} label="SIGNALS" value={String(s.pendingIdeas.length)} />
        <div className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: "var(--ink-4)" }}>
          <Clock className="w-3 h-3" />
          {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
        {/* ============ EMPTY STATE ============ */}
        {empty && (
          <div className="telemetry-card p-6 mb-6 text-center animate-fade-in-up">
            <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
              No agents detected.
            </div>
            <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
              Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--surface-1)", color: "var(--accent)" }}>npm run seed:demo</code>{" "}
              or connect Hermes agents via <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--surface-1)" }}>POST /api/agents/state</code>.
            </div>
          </div>
        )}

        {/* ============ ERROR ALERT ============ */}
        {hasError && (
          <div
            className="mb-4 px-5 py-3 rounded-lg flex items-center gap-3 animate-fade-in-up"
            style={{ background: "var(--red-subtle)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <AlertTriangle className="w-4 h-4 flex-none" style={{ color: "var(--red)" }} />
            <span className="text-[13px] font-[510]" style={{ color: "#fca5a5" }}>
              {s.errors} agent{s.errors > 1 ? "s" : ""} in error state.
            </span>
            <Link
              href="/agents"
              className="ml-auto text-[12px] font-[510] flex items-center gap-1"
              style={{ color: "var(--ink-3)" }}
            >
              Investigate <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-4 gap-4" style={{ minHeight: "calc(100vh - 140px)" }}>

          {/* ─── LEFT: Activity + Agent Grid ─── */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Activity Feed */}
            <SectionHeader icon={Zap} title="RECENT ACTIVITY" />
            <div className="telemetry-card overflow-hidden">
              {s.activity.length > 0 ? (
                <div className="flex flex-col max-h-[240px] overflow-y-auto">
                  {s.activity.map((a, i) => (
                    <div
                      key={i}
                      className="activity-row flex items-start gap-3 px-5 py-2.5"
                      style={{ borderBottom: i < s.activity.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                    >
                      <div className="text-[16px] flex-none mt-0.5">{a.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] truncate" style={{ color: "var(--ink)" }}>
                          {a.message}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-[510]" style={{ color: "var(--ink-4)" }}>{a.agent}</span>
                          <div className={`telemetry-dot ${statusClass(a.status)}`} style={{ width: 4, height: 4 }} />
                          <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>{timeAgo(a.ts)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-[12px]" style={{ color: "var(--ink-4)" }}>
                  Agent activity feeds in here once they start reporting.
                </div>
              )}
            </div>

            {/* Agent Telemetry Grid */}
            <SectionHeader icon={Bot} title="AGENT TELEMETRY" href="/agents" linkLabel="View all" />
            <div className="telemetry-grid">
              {s.agents.length > 0 ? (
                s.agents.map((a) => (
                  <AgentTelemetryCard key={a.id} agent={a} />
                ))
              ) : (
                <div className="telemetry-card p-6 col-span-full text-center text-[12px]" style={{ color: "var(--ink-4)" }}>
                  Waiting for agents to connect...
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT: Signals + Health ─── */}
          <div className="col-span-1 flex flex-col gap-4">

            {/* Signals Intelligence */}
            <SectionHeader icon={TrendingUp} title="SIGNALS" />
            <div className="telemetry-card flex flex-col" style={{ flex: 1 }}>
              {s.pendingIdeas.length > 0 ? (
                <>
                  {s.pendingIdeas.map((idea, i) => (
                    <div
                      key={idea.id}
                      className="px-4 py-3"
                      style={{ borderBottom: i < s.pendingIdeas.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                    >
                      <div className="text-[12px] font-[510] leading-snug" style={{ color: "var(--ink)" }}>
                        {idea.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {idea.category && <span className="badge badge-blue">{idea.category}</span>}
                        <span className="text-[9px]" style={{ color: "var(--ink-4)" }}>
                          {idea.source || "scout"}
                        </span>
                      </div>
                      <div className="text-[9px] mt-1" style={{ color: "var(--ink-4)" }}>
                        {timeAgo(idea.timestamp)}
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/ideas"
                    className="px-4 py-2.5 text-[11px] font-[510] flex items-center justify-center gap-1"
                    style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line-subtle)" }}
                  >
                    All signals <ArrowRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <div className="p-6 text-center text-[12px] flex flex-col items-center gap-2" style={{ color: "var(--ink-4)" }}>
                  <TrendingUp className="w-5 h-5" style={{ opacity: 0.4 }} />
                  Growth Scout signals appear here.
                </div>
              )}
            </div>

            {/* System Health */}
            <SectionHeader icon={Server} title="SYSTEM" />
            <div className="telemetry-card p-4">
              <HealthRow label="Database" status="ok" since="Connected" />
              <HealthRow label="API" status="ok" since="Responding" />
              <HealthRow label="Agents" status={s.total > 0 ? "ok" : "empty"} since={`${s.online}/${s.total} online`} />
              <HealthRow label="Last Sync" status="ok" since={new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Telemetry Strip Item ────────────────────── */

function TelemetryItem({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status?: string }) {
  const dotColor = status === "green" ? "var(--green)" : status === "red" ? "var(--red)" : "var(--ink-4)";
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: status === "red" ? "var(--red)" : status === "green" ? "var(--green)" : "var(--ink-3)" }}>
        {icon}
      </span>
      <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-4)" }}>
        {label}:
      </span>
      <span className="data-metric text-[12px]" style={{ color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

/* ── Agent Telemetry Card ────────────────────── */

function AgentTelemetryCard({ agent: a }: { agent: any }) {
  return (
    <Link
      href={`/agents/${encodeURIComponent(a.id)}`}
      className="telemetry-card p-4 flex items-center gap-3"
    >
      <div className="text-[24px] flex-none">{a.emoji || "🤖"}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-[510] truncate" style={{ color: "var(--ink)" }}>
            {a.name}
          </div>
          <div className={`telemetry-dot ${statusClass(a.status)}`} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          {a.status && (
            <span className={`telemetry-badge ${statusClass(a.status)}`}>
              {statusLabel(a.status)}
            </span>
          )}
          {a.role && (
            <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>
              {a.role}
            </span>
          )}
        </div>
        {a.currentTask && (
          <div className="text-[11px] mt-1.5 truncate flex items-center gap-1" style={{ color: "var(--ink-3)" }}>
            <Activity className="w-3 h-3 flex-none" style={{ color: "var(--ink-4)" }} />
            {a.currentTask}
          </div>
        )}
      </div>
      <div className="text-right flex flex-col gap-0.5 flex-none" style={{ color: "var(--ink-4)" }}>
        <div className="text-[10px] font-[510]">{a.tasksCompleted} tasks</div>
        <div className="text-[10px] data-metric">${(a.totalCost || 0).toFixed(2)}</div>
      </div>
    </Link>
  );
}

/* ── Health Row ──────────────────────────────── */

function HealthRow({ label, status, since }: { label: string; status: string; since: string }) {
  const dotClass = status === "ok" ? "online" : "offline";
  return (
    <div className="flex items-center gap-2 py-1.5 text-[11px]">
      <div className={`telemetry-dot ${dotClass}`} style={{ width: 5, height: 5 }} />
      <span style={{ color: "var(--ink-2)" }}>{label}</span>
      <span className="ml-auto text-[10px]" style={{ color: "var(--ink-4)" }}>{since}</span>
    </div>
  );
}

/* ── Section Header ──────────────────────────── */

function SectionHeader({ icon: Icon, title, href, linkLabel }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color: "var(--ink-4)" }} />
        <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em]" style={{ color: "var(--ink-4)" }}>
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="text-[10px] font-[510] flex items-center gap-0.5" style={{ color: "var(--ink-4)" }}>
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}