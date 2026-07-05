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

function priorityBadge(p: string) {
  const map: Record<string, { label: string; cls: string }> = {
    high: { label: "High", cls: "badge-red" },
    medium: { label: "Medium", cls: "badge-amber" },
    low: { label: "Low", cls: "badge-neutral" },
  };
  const m = map[p] || { label: p, cls: "badge-neutral" };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

function statusBadge(s: string) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "badge-neutral" },
    active: { label: "Active", cls: "badge-blue" },
    completed: { label: "Completed", cls: "badge-green" },
    failed: { label: "Failed", cls: "badge-red" },
  };
  const m = map[s] || { label: s, cls: "badge-neutral" };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

export default async function MissionsPage() {
  let missions: any[] = [];
  try {
    missions = await prisma.mission.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  } catch {}

  const pendingCount = missions.filter((m) => m.status === "pending").length;
  const activeCount = missions.filter((m) => m.status === "active").length;
  const failedCount = missions.filter((m) => m.status === "failed").length;

  return (
    <div className="p-8 max-w-[1000px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-[510] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          Missions
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ink-3)" }}>
          {missions.length} mission{missions.length !== 1 ? "s" : ""} total
          {pendingCount > 0 && ` · ${pendingCount} pending`}
          {activeCount > 0 && ` · ${activeCount} active`}
          {failedCount > 0 && (
            <span style={{ color: "var(--red)" }}>{` · ${failedCount} failed`}</span>
          )}
        </p>
      </div>

      {missions.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
            No missions yet.
          </div>
          <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Your agents will pick up missions automatically once assigned.
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>Title</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "10%" }}>Priority</th>
                <th style={{ width: "15%" }}>Agent</th>
                <th style={{ width: "13%" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="font-[510] truncate-text max-w-[420px]" style={{ color: "var(--ink)" }}>
                      {m.title}
                    </div>
                  </td>
                  <td>{statusBadge(m.status)}</td>
                  <td>{priorityBadge(m.priority)}</td>
                  <td style={{ color: "var(--ink-3)" }}>{m.agentId}</td>
                  <td style={{ color: "var(--ink-4)", fontSize: 12 }}>
                    {timeAgo(m.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}