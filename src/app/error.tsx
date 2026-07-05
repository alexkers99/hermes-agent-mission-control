"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-4 sm:p-6 max-w-[600px]" style={{ margin: "0 auto" }}>
      <div className="telemetry-card p-8 flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="w-8 h-8" style={{ color: "var(--red)" }} />
        <div className="text-[14px] font-[510]" style={{ color: "var(--ink-2)" }}>
          Something went wrong.
        </div>
        <div className="text-[12px]" style={{ color: "var(--ink-3)" }}>
          The dashboard hit an unexpected error rendering this page.
        </div>
        <button onClick={() => reset()} className="btn-primary mt-2">
          Try again
        </button>
      </div>
    </div>
  );
}
