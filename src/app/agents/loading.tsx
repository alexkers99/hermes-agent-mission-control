import { Skel } from "@/components/skeleton";

export default function AgentsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      <div className="mb-5 flex flex-col gap-2">
        <Skel className="h-6 w-32" />
        <Skel className="h-3 w-48" />
      </div>
      <div className="telemetry-card overflow-hidden">
        <div className="flex flex-col">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3"
              style={{ borderBottom: i < 7 ? "1px solid var(--line-subtle)" : "none" }}
            >
              <Skel className="w-6 h-6 rounded-full flex-none" />
              <Skel className="h-3 w-28" />
              <Skel className="h-3 w-16" />
              <Skel className="h-3 flex-1" />
              <Skel className="h-3 w-10" />
              <Skel className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
