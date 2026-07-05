import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

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
      prisma.mission.findMany({ where: { status: { in: ["pending", "active"] } }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.idea.findMany({ where: { status: "pending" }, orderBy: { timestamp: "desc" }, take: 5 }),
    ]);
  } catch {}

  return (
    <div className="p-6 max-w-[1000px]" style={{ margin: "0 auto" }}>
      <div className="mb-5">
        <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Schedule</h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>Upcoming work across your agent stack</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="telemetry-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <CalendarDays className="w-3 h-3" /> Pending
          </div>
          <div className="text-[20px] font-[510]" style={{ color: "var(--ink)" }}>{missions.length}</div>
        </div>
        <div className="telemetry-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <Clock className="w-3 h-3" /> Signals to review
          </div>
          <div className="text-[20px] font-[510]" style={{ color: "var(--ink)" }}>{ideas.length}</div>
        </div>
        <div className="telemetry-card p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-[510]" style={{ color: "var(--ink-4)" }}>
            <CalendarDays className="w-3 h-3" /> Agent status
          </div>
          <div className="text-[20px] font-[510]" style={{ color: "var(--ink)" }}>Active</div>
        </div>
      </div>

      {missions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3" style={{ color: "var(--ink-4)" }}>
            UPCOMING WORK
          </h2>
          <div className="telemetry-card flex flex-col">
            {missions.map((m, i) => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-4" style={{ borderBottom: i < missions.length - 1 ? "1px solid var(--line-subtle)" : "none" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-[510]" style={{ color: "var(--ink)" }}>{m.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>{m.agentId}</span>
                    <span className={`badge ${m.priority === "high" ? "badge-red" : m.priority === "medium" ? "badge-amber" : "badge-neutral"}`}>{m.priority}</span>
                  </div>
                </div>
                <div className="text-right flex-none">
                  <span className={`badge ${m.status === "active" ? "badge-blue" : "badge-neutral"}`}>{m.status}</span>
                  <div className="text-[10px] mt-1" style={{ color: "var(--ink-4)" }}>{timeAgo(m.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ideas.length > 0 && (
        <div>
          <h2 className="text-[10px] font-[510] uppercase tracking-[0.06em] mb-3" style={{ color: "var(--ink-4)" }}>
            SIGNALS TO REVIEW
          </h2>
          <div className="telemetry-card flex flex-col">
            {ideas.map((idea, i) => (
              <div key={idea.id} className="px-5 py-3" style={{ borderBottom: i < ideas.length - 1 ? "1px solid var(--line-subtle)" : "none" }}>
                <div className="text-[12px] font-[510]" style={{ color: "var(--ink)" }}>{idea.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  {idea.category && <span className="badge badge-blue">{idea.category}</span>}
                  {idea.source && <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>{idea.source}</span>}
                </div>
              </div>
            ))}
            <Link href="/ideas" className="px-5 py-2.5 text-[11px] font-[510] flex items-center justify-center gap-1" style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line-subtle)" }}>
              All signals <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}