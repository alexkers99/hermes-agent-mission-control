import { Skel } from "@/components/skeleton";

export default function TimelineLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-[1200px]" style={{ margin: "0 auto" }}>
      <div className="mb-5 flex flex-col gap-2">
        <Skel className="h-6 w-24" />
        <Skel className="h-3 w-48" />
      </div>
      <Skel className="h-8 w-full mb-5 rounded-md" />
      <div className="flex flex-col gap-4">
        <Skel className="h-3 w-24" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-1">
            <Skel className="h-2.5 w-2.5 rounded-full flex-none mt-1" />
            <Skel className="h-3 flex-1" />
            <Skel className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
