import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
    online: "Active", working: "Working", idle: "Idle", error: "Error", offline: "Offline", stopped: "Stopped",
  };
  return m[s] || s;
}

export default async function AgentsPage() {
  let agents: any[] = [];
  try {
    agents = await prisma.agentState.findMany({ orderBy: { name: "asc" } });
  } catch {}

  const errorCount = agents.filter((a) => a.status === "error").length;
  const activeCount = agents.filter((a) => a.status === "working" || a.status === "online").length;

  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
            Agents
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "var(--ink-3)" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
            {activeCount > 0 && <span> &middot; {activeCount} active</span>}
            {errorCount > 0 && <span style={{ color: "var(--red)" }}> &middot; {errorCount} error</span>}
          </p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="telemetry-card p-8 text-center">
          <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
            No agents yet.
          </div>
          <div className="text-[12px]" style={{ color: "var(--ink-3)" }}>
            Run <code className="px-1.5 py-0.5 rounded" style={{ background: "var(--surface-1)", color: "var(--accent)" }}>npm run seed:demo</code>{" "}
            or connect agents via the heartbeat API.
          </div>
        </div>
      ) : (
        <div className="telemetry-card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Role</th>
                <th>Status</th>
                <th>Current task</th>
                <th style={{ textAlign: "right" }}>Tasks</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/agents/${encodeURIComponent(a.id)}`} className="flex items-center gap-2.5 group">
                      <span className="text-[18px]">{a.emoji || "🤖"}</span>
                      <span className="text-[13px] font-[510] group-hover:underline" style={{ color: "var(--ink)" }}>
                        {a.name}
                      </span>
                    </Link>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>{a.role || "-"}</td>
                  <td>
                    <span className={`telemetry-badge ${statusClass(a.status)}`}>
                      <div className={`telemetry-dot ${statusClass(a.status)}`} style={{ width: 4, height: 4 }} />
                      {statusLabel(a.status)}
                    </span>
                  </td>
                  <td>
                    <span className="truncate-text block max-w-[260px]" style={{ color: "var(--ink-2)" }}>
                      {a.currentTask || "-"}
                    </span>
                  </td>
                  <td className="text-right font-[510]" style={{ color: "var(--ink)" }}>
                    {a.tasksCompleted}
                  </td>
                  <td className="text-right data-metric text-[12px]" style={{ color: "var(--ink-3)" }}>
                    ${a.totalCost.toFixed(2)}
                  </td>
                  <td style={{ color: "var(--ink-4)", fontSize: 11 }}>
                    {timeAgo(a.lastActive)}
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