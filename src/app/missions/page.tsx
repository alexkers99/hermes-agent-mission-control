import { prisma } from "@/lib/prisma";

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

const STATUS_CONFIG: Record<string, { label: string; limit: number }> = {
  pending: { label: "Pending", limit: 8 },
  active: { label: "Active", limit: 8 },
  completed: { label: "Completed", limit: 8 },
  failed: { label: "Failed", limit: 8 },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "var(--red)", medium: "var(--amber)", low: "var(--ink-4)",
};

export default async function MissionsPage() {
  let missions: any[] = [];
  try {
    missions = await prisma.mission.findMany({ orderBy: { createdAt: "desc" }, take: 32 });
  } catch {}

  const columns: Record<string, any[]> = { pending: [], active: [], completed: [], failed: [] };
  for (const m of missions) {
    if (columns[m.status]) columns[m.status].push(m);
  }

  const total = missions.length;
  const failedCount = columns.failed.length;

  return (
    <div className="p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Missions</h1>
        <span className="badge badge-neutral">{total} total</span>
        {failedCount > 0 && <span className="badge badge-red">{failedCount} failed</span>}
      </div>

      <div className="grid grid-cols-4 gap-3" style={{ minHeight: "calc(100vh - 160px)" }}>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const items = columns[status] || [];
          return (
            <div key={status} className="kanban-col flex flex-col">
              {/* Column header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{
                    background: status === "pending" ? "var(--ink-4)" :
                                status === "active" ? "var(--blue)" :
                                status === "completed" ? "var(--green)" : "var(--red)"
                  }} />
                  <span className="text-[12px] font-[510]" style={{ color: "var(--ink-2)" }}>
                    {config.label}
                  </span>
                </div>
                <span className="text-[10px] font-[510]" style={{ color: "var(--ink-4)" }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
                {items.slice(0, config.limit).map((m) => (
                  <div
                    key={m.id}
                    className="telemetry-card p-3 flex flex-col gap-1.5"
                  >
                    <div className="text-[12px] font-[510] leading-snug" style={{ color: "var(--ink)" }}>
                      {m.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>{m.agentId}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: PRIORITY_COLORS[m.priority] || "var(--ink-4)" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_COLORS[m.priority] || "var(--ink-4)" }} />
                        {m.priority}
                      </span>
                    </div>
                    <div className="text-[9px]" style={{ color: "var(--ink-4)" }}>
                      {timeAgo(m.createdAt)}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="p-4 text-center text-[11px]" style={{ color: "var(--ink-4)" }}>
                    No missions
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}