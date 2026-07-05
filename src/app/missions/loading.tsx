import { Skel } from "@/components/skeleton";

export default function MissionsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
      <div className="flex items-center gap-4 mb-5">
        <Skel className="h-6 w-24" />
        <Skel className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="kanban-col flex flex-col">
            <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <Skel className="h-3 w-16" />
            </div>
            <div className="flex-1 p-2 flex flex-col gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="telemetry-card p-3 flex flex-col gap-2" style={{ animation: "none" }}>
                  <Skel className="h-3 w-full" />
                  <Skel className="h-2.5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
