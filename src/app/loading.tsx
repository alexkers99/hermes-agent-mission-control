import { Skel } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <div className="telemetry-strip px-6 py-2.5 flex items-center gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skel key={i} className="h-3.5 w-16" />
        ))}
      </div>

      <div className="p-4 sm:p-6 max-w-[1400px]" style={{ margin: "0 auto" }}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Skel className="h-3 w-32" />
            <div className="telemetry-card p-4 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skel key={i} className="h-4 w-full" />
              ))}
            </div>

            <Skel className="h-3 w-32 mt-2" />
            <div className="telemetry-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="telemetry-card p-4 flex items-center gap-3" style={{ animation: "none" }}>
                  <Skel className="w-8 h-8 rounded-full flex-none" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skel className="h-3 w-2/3" />
                    <Skel className="h-2.5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-4">
            <Skel className="h-3 w-20" />
            <div className="telemetry-card p-4 flex flex-col gap-3" style={{ flex: 1 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skel key={i} className="h-10 w-full" />
              ))}
            </div>
            <Skel className="h-3 w-20 mt-2" />
            <div className="telemetry-card p-4 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skel key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
