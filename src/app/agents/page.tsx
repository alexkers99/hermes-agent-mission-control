import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function AgentsPage() {
  let agents: any[] = [];
  try {
    agents = await prisma.agentState.findMany({ orderBy: { name: "asc" } });
  } catch {}

  const errorCount = agents.filter((a) => a.status === "error").length;
  const workingCount = agents.filter((a) => a.status === "working" || a.status === "online").length;

  return (
    <div className="p-8 max-w-[1200px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-[510] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
            Agents
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ink-3)" }}>
            {agents.length} agent{agents.length !== 1 ? "s" : ""} registered
            {workingCount > 0 && ` · ${workingCount} active`}
            {errorCount > 0 && (
              <span style={{ color: "var(--red)" }}>{` · ${errorCount} error${errorCount > 1 ? "s" : ""}`}</span>
            )}
          </p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
            No agents yet.
          </div>
          <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Run <code className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: "var(--surface-1)", color: "var(--accent)" }}>npm run seed:demo</code>{" "}
            or connect your Hermes agents via the heartbeat API.
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Agent</th>
                <th style={{ width: "12%" }}>Role</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "28%" }}>Current task</th>
                <th style={{ width: "8%", textAlign: "right" }}>Tasks</th>
                <th style={{ width: "7%", textAlign: "right" }}>Cost</th>
                <th style={{ width: "10%" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link
                      href={`/agents/${encodeURIComponent(a.id)}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <span className="text-[18px]">{a.emoji || "🤖"}</span>
                      <span
                        className="text-[13px] font-[510] group-hover:underline"
                        style={{ color: "var(--ink)" }}
                      >
                        {a.name}
                      </span>
                    </Link>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>{a.role || "-"}</td>
                  <td>
                    <span className={`status-label ${a.status}`}>{statusLabel(a.status)}</span>
                  </td>
                  <td>
                    <span className="truncate-text block max-w-[260px]" style={{ color: "var(--ink-2)" }}>
                      {a.currentTask || "-"}
                    </span>
                  </td>
                  <td className="text-right font-[510]" style={{ color: "var(--ink)" }}>
                    {a.tasksCompleted}
                  </td>
                  <td className="text-right font-mono text-[12px]" style={{ color: "var(--ink-3)" }}>
                    ${a.totalCost.toFixed(2)}
                  </td>
                  <td style={{ color: "var(--ink-4)", fontSize: 12 }}>
                    {formatDate(a.lastActive)}
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