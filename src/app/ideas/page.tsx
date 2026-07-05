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

const CAT: Record<string, string> = {
  trend: "badge-blue",
  growth: "badge-green",
  content: "badge-indigo",
  product: "badge-purple",
  competitor: "badge-red",
  strategy: "badge-amber",
};

export default async function IdeasPage() {
  let ideas: any[] = [];
  try {
    ideas = await prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 50 });
  } catch {}

  const pending = ideas.filter((i) => i.status === "pending" || !i.status).length;
  const approved = ideas.filter((i) => i.status === "approved").length;
  const rejected = ideas.filter((i) => i.status === "rejected").length;

  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h1 className="text-[22px] font-[510]" style={{ color: "var(--ink)" }}>Signals</h1>
        <span className="badge badge-amber">{pending} pending</span>
        <span className="badge badge-green">{approved} approved</span>
        {rejected > 0 && <span className="badge badge-red">{rejected} rejected</span>}
      </div>

      {ideas.length === 0 ? (
        <div className="telemetry-card p-8 text-center">
          <div className="text-[14px] font-[510] mb-2" style={{ color: "var(--ink-2)" }}>No signals yet.</div>
          <div className="text-[12px]" style={{ color: "var(--ink-3)" }}>
            Growth Scout signals appear here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ideas.map((idea) => (
            <div key={idea.id} className="telemetry-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-[510] leading-snug" style={{ color: "var(--ink)" }}>
                    {idea.title}
                  </div>
                  {idea.description && (
                    <div className="text-[12px] mt-1.5 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      {idea.description}
                    </div>
                  )}
                </div>
                <StatusDot status={idea.status || "pending"} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {idea.category && (
                  <span className={`badge ${CAT[idea.category.toLowerCase()] || "badge-neutral"}`}>
                    {idea.category}
                  </span>
                )}
                {idea.source && (
                  <span className="text-[10px]" style={{ color: "var(--ink-4)" }}>{idea.source}</span>
                )}
                <span className="text-[10px] ml-auto" style={{ color: "var(--ink-4)" }}>
                  {timeAgo(idea.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid var(--line-subtle)" }}>
                <form action="/api/ideas" method="POST">
                  <input type="hidden" name="id" value={idea.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="btn-ghost text-[11px] px-3" style={{ color: "var(--green)" }}>
                    Approve
                  </button>
                </form>
                <form action="/api/ideas" method="POST">
                  <input type="hidden" name="id" value={idea.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="btn-ghost text-[11px] px-3" style={{ color: "var(--red)" }}>
                    Reject
                  </button>
                </form>
                {idea.status === "approved" && (
                  <span className="badge badge-green ml-auto">Approved</span>
                )}
                {idea.status === "rejected" && (
                  <span className="badge badge-red ml-auto">Rejected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = { pending: "var(--ink-4)", approved: "var(--green)", rejected: "var(--red)" };
  return <div className="w-2 h-2 rounded-full flex-none mt-1" style={{ background: colors[status] || "var(--ink-4)" }} />;
}