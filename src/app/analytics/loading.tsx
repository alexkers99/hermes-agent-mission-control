import { Skel } from "@/components/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
      <div className="mb-5 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skel className="h-6 w-28" />
          <Skel className="h-3 w-52" />
        </div>
        <Skel className="h-7 w-32" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="telemetry-card p-4 flex flex-col gap-2" style={{ animation: "none" }}>
            <Skel className="h-2.5 w-16" />
            <Skel className="h-5 w-14" />
            <Skel className="h-2.5 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="telemetry-card p-5" style={{ animation: "none" }}>
            <Skel className="h-2.5 w-32 mb-4" />
            <Skel className="h-[180px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
