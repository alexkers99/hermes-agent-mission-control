import { prisma } from "@/lib/prisma";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export default async function CalendarPage() {
  let missions: any[] = [];
  let ideas: any[] = [];
  try {
    [missions, ideas] = await Promise.all([
      prisma.mission.findMany({
        where: { status: { in: ["pending", "active"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.idea.findMany({
        where: { status: "pending" },
        orderBy: { timestamp: "desc" },
        take: 5,
      }),
    ]);
  } catch {}

  const pendingCount = missions.length;
  const ideasPending = ideas.length;

  return (
    <div className="p-8 max-w-[1000px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-[510] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          Schedule
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ink-3)" }}>
          Upcoming work across your agent stack
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <CalendarDays className="w-3.5 h-3.5" />
            Pending missions
          </div>
          <div className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>
            {pendingCount}
          </div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <Clock className="w-3.5 h-3.5" />
            Ideas to review
          </div>
          <div className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>
            {ideasPending}
          </div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <CalendarDays className="w-3.5 h-3.5" />
            Agent status
          </div>
          <div className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>
            Active
          </div>
        </div>
      </div>

      {/* Upcoming missions */}
      <div className="mb-6">
        <h2 className="text-[13px] font-[510] uppercase tracking-wider mb-3" style={{ color: "var(--ink-3)" }}>
          Upcoming work
        </h2>
        <div className="card">
          {missions.length > 0 ? (
            <div className="flex flex-col">
              {missions.map((m, i) => (
                <div
                  key={m.id}
                  className="px-5 py-3 flex items-center gap-4"
                  style={{ borderBottom: i < missions.length - 1 ? "1px solid var(--line-subtle)" : "none" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-[510]" style={{ color: "var(--ink)" }}>
                      {m.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                        {m.agentId}
                      </span>
                      <span className={`badge ${m.priority === "high" ? "badge-red" : m.priority === "medium" ? "badge-amber" : "badge-neutral"}`}>
                        {m.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <span className={`badge ${m.status === "active" ? "badge-blue" : "badge-neutral"}`}>
                      {m.status}
                    </span>
                    <div className="text-[11px] mt-1" style={{ color: "var(--ink-4)" }}>
                      {timeAgo(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>
              No upcoming work scheduled.
            </div>
          )}
        </div>
      </div>

      {/* Ideas to review */}
      {ideas.length > 0 && (
        <div>
          <h2 className="text-[13px] font-[510] uppercase tracking-wider mb-3" style={{ color: "var(--ink-3)" }}>
            Signals to review
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
                <div className="flex items-center gap-2 mt-1">
                  {idea.category && <span className="badge badge-blue">{idea.category}</span>}
                  {idea.source && (
                    <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                      {idea.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <Link
              href="/ideas"
              className="px-5 py-3 text-[12px] font-[510] flex items-center justify-center gap-1.5"
              style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line-subtle)" }}
            >
              View all ideas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}