import { Skel } from "@/components/skeleton";

export default function IdeasLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      <div className="flex items-center gap-3 mb-5">
        <Skel className="h-6 w-20" />
        <Skel className="h-5 w-20 rounded-full" />
        <Skel className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="telemetry-card p-4 flex flex-col gap-3" style={{ animation: "none" }}>
            <Skel className="h-3 w-3/4" />
            <Skel className="h-2.5 w-full" />
            <Skel className="h-2.5 w-1/2" />
            <div className="flex gap-2 pt-1" style={{ borderTop: "1px solid var(--line-subtle)" }}>
              <Skel className="h-6 w-16 mt-1" />
              <Skel className="h-6 w-16 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
