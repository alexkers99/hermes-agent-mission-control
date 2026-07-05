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

function categoryBadge(cat: string | null) {
  if (!cat) return null;
  const map: Record<string, string> = {
    trend: "badge-blue",
    growth: "badge-green",
    content: "badge-indigo",
    product: "badge-amber",
    strategy: "badge-neutral",
    competitor: "badge-red",
  };
  return <span className={`badge ${map[cat.toLowerCase()] || "badge-neutral"}`}>{cat}</span>;
}

function statusBadge(status: string | null) {
  const map: Record<string, string> = {
    pending: "badge-neutral",
    approved: "badge-green",
    rejected: "badge-red",
  };
  return <span className={`badge ${map[status || "pending"] || "badge-neutral"}`}>{status || "pending"}</span>;
}

export default async function IdeasPage() {
  let ideas: any[] = [];
  try {
    ideas = await prisma.idea.findMany({ orderBy: { timestamp: "desc" }, take: 50 });
  } catch {}

  return (
    <div className="p-8 max-w-[1000px]" style={{ margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-[510] tracking-[-0.02em]" style={{ color: "var(--ink)" }}>
          Ideas
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ink-3)" }}>
          {ideas.length} signal{ideas.length !== 1 ? "s" : ""} detected by your agents
        </p>
      </div>

      {ideas.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-[14px] font-[510] mb-1" style={{ color: "var(--ink-2)" }}>
            No ideas yet.
          </div>
          <div className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Ideas appear here when your agents detect trends, growth opportunities, or content angles.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-[510] leading-snug" style={{ color: "var(--ink)" }}>
                    {idea.title}
                  </div>
                  {idea.description && (
                    <div className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      {idea.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {categoryBadge(idea.category)}
                {statusBadge(idea.status)}
                {idea.source && (
                  <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                    {idea.source}
                  </span>
                )}
                <span className="text-[11px] ml-auto" style={{ color: "var(--ink-4)" }}>
                  {timeAgo(idea.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}