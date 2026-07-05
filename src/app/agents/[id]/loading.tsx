import { Skel } from "@/components/skeleton";

export default function AgentDetailLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[900px]" style={{ margin: "0 auto" }}>
      <Skel className="h-3 w-24 mb-5" />

      <div className="flex items-start gap-4 mb-6">
        <Skel className="w-10 h-10 rounded-full flex-none" />
        <div className="flex-1 flex flex-col gap-2">
          <Skel className="h-5 w-40" />
          <Skel className="h-3 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="telemetry-card p-4 flex flex-col gap-2" style={{ animation: "none" }}>
            <Skel className="h-2.5 w-16" />
            <Skel className="h-5 w-20" />
          </div>
        ))}
      </div>

      <div className="telemetry-card p-5 mb-6" style={{ animation: "none" }}>
        <Skel className="h-2.5 w-32 mb-4" />
        <Skel className="h-[180px] w-full" />
      </div>

      <div className="telemetry-card p-2 flex flex-col gap-2" style={{ animation: "none" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
