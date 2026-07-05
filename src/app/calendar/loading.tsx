import { Skel } from "@/components/skeleton";

export default function CalendarLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1000px]" style={{ margin: "0 auto" }}>
      <div className="mb-5 flex flex-col gap-2">
        <Skel className="h-6 w-24" />
        <Skel className="h-3 w-56" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="telemetry-card p-4 flex flex-col gap-2" style={{ animation: "none" }}>
            <Skel className="h-2.5 w-14" />
            <Skel className="h-5 w-10" />
          </div>
        ))}
      </div>
      <Skel className="h-2.5 w-40 mb-3" />
      <div className="telemetry-card p-2 flex flex-col gap-2" style={{ animation: "none" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
