import { prisma } from "@/lib/prisma";
import { Activity, Filter, Clock, Bot, Search } from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-GB");
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" });
}

interface ActivityEntry {
  id: string;
  agent: string;
  emoji: string;
  message: string;
  ts: Date;
  status: string;
  type: "activity" | "mission" | "signal" | "error";
}

export default async function TimelinePage() {
  let agents: any[] = [];
  let missions: any[] = [];
  let ideas: any[] = [];

  try {
    [agents, missions, ideas] = await Promise.all([
      prisma.agentState.findMany({ orderBy: { name: "asc" } }),
      prisma.mission.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 50 }),
    ]);
  } catch {}

  // Build timeline entries from all sources
  const entries: ActivityEntry[] = [];

  // Agent activity
  for (const a of agents) {
    if (a.recentActivity && Array.isArray(a.recentActivity)) {
      const raw = a.recentActivity as Array<{ message?: string; timestamp?: string }>;
      for (const act of raw) {
        entries.push({
          id: `${a.id}-${act.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
          agent: a.name, emoji: a.emoji || "🤖",
          message: act.message || "No message",
          ts: new Date(act.timestamp || a.updatedAt),
          status: a.status,
          type: a.status === "error" ? "error" : "activity",
        });
      }
    }
  }

  // Mission events
  for (const m of missions) {
    entries.push({
      id: `mission-${m.id}`,
      agent: m.agentId, emoji: "📋",
      message: m.status === "completed" ? `Completed mission: ${m.title}` :
               m.status === "failed" ? `Failed mission: ${m.title}` :
               m.status === "active" ? `Started mission: ${m.title}` :
               `Assigned mission: ${m.title}`,
      ts: m.completedAt || m.createdAt,
      status: m.status === "failed" ? "error" : m.status,
      type: "mission",
    });
  }

  // Idea events
  for (const idea of ideas) {
    entries.push({
      id: `idea-${idea.id}`,
      agent: idea.source || "scout", emoji: "💡",
      message: idea.title,
      ts: idea.timestamp,
      status: idea.status === "pending" ? "idle" : idea.status === "approved" ? "online" : "error",
      type: "signal",
    });
  }

  // Sort: newest first
  entries.sort((a, b) => b.ts.getTime() - a.ts.getTime());

  // Group by date
  const groups: { date: string; dateObj: Date; entries: ActivityEntry[] }[] = [];
  for (const e of entries) {
    const dateKey = e.ts.toLocaleDateString("en-GB");
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) {
      last.entries.push(e);
    } else {
      groups.push({ date: dateKey, dateObj: e.ts, entries: [e] });
    }
  }

  const totalEntries = entries.length;
  const errorCount = agents.filter((a) => a.status === "error").length;
  const agentNames = agents.map((a) => a.name);

  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Timeline</h1>
            <p className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>
              {totalEntries} events &middot; {agents.length} agents
              {errorCount > 0 && <span style={{ color: "var(--red)" }}> &middot; {errorCount} errors</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px]" style={{ background: "var(--surface-0)", border: "1px solid var(--line-subtle)" }}>
              <Filter className="w-3 h-3" style={{ color: "var(--ink-4)" }} />
              <span style={{ color: "var(--ink-3)" }}>All events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Type legend */}
      <div className="flex items-center gap-4 mb-5 px-4 py-2 rounded-md text-[10px]" style={{ background: "var(--surface-0)" }}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} /> Activity</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} /> Completed</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--red)" }} /> Error / Failed</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--amber)" }} /> Signal</span>
      </div>

      {/* Timeline */}
      {groups.length > 0 ? (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-[11px] font-[510]" style={{ color: "var(--ink-2)" }}>
                  {formatDate(group.dateObj)}
                </div>
                <div className="flex-1" style={{ borderTop: "1px solid var(--line-subtle)" }} />
                <div className="text-[10px]" style={{ color: "var(--ink-4)" }}>
                  {group.entries.length} events
                </div>
              </div>

              {/* Timeline entries */}
              <div className="flex flex-col">
                {group.entries.slice(0, 50).map((e, i) => (
                  <div
                    key={e.id}
                    className="activity-row flex items-start gap-4 px-4 py-2.5 rounded-md"
                    style={{ marginLeft: 8, borderLeft: "2px solid var(--line-subtle)", marginBottom: 2 }}
                  >
                    {/* Timeline dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-none -ml-[17px] mt-1.5"
                      style={{
                        background: e.type === "error" ? "var(--red)" :
                                    e.type === "mission" ? "var(--green)" :
                                    e.type === "signal" ? "var(--amber)" : "var(--accent)",
                        boxShadow: e.type === "error" ? "0 0 6px var(--red-glow)" : "none",
                      }}
                    />
                    {/* Emoji */}
                    <div className="text-[14px] flex-none mt-0.5">{e.emoji}</div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px]" style={{ color: "var(--ink)" }}>
                        {e.message}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-[510]" style={{ color: "var(--ink-3)" }}>
                          {e.agent}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>
                          {formatTime(e.ts)}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>
                          {timeAgo(e.ts)}
                        </span>
                      </div>
                    </div>
                    {/* Type badge */}
                    <span className={`badge ${
                      e.type === "error" ? "badge-red" :
                      e.type === "signal" ? "badge-amber" :
                      e.type === "mission" ? "badge-green" : "badge-blue"
                    }`} style={{ fontSize: 9 }}>
                      {e.type}
                    </span>
                  </div>
                ))}
                {group.entries.length > 50 && (
                  <div className="text-[11px] text-center py-2" style={{ color: "var(--ink-4)", marginLeft: 8 }}>
                    +{group.entries.length - 50} more events on this day
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="telemetry-card p-8 text-center">
          <Activity className="w-8 h-8 mb-3" style={{ color: "var(--ink-4)", margin: "0 auto", opacity: 0.4 }} />
          <div className="text-[14px] font-[510]" style={{ color: "var(--ink-2)" }}>No timeline events yet</div>
          <div className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>Events appear here as agents start reporting.</div>
        </div>
      )}
    </div>
  );
}