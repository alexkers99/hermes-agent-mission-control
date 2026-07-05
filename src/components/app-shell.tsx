"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

interface AgentMini {
  id: string;
  name: string;
  emoji: string | null;
  status: string;
  totalCost: number;
}

export function AppShell({ agents, children }: { agents: AgentMini[]; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Mobile top bar */}
      <div
        className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
        style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}
      >
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ color: "var(--ink-2)" }}>
          <Menu className="w-5 h-5" />
        </button>
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-[600] flex-none"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          H
        </div>
        <span className="text-[13px] font-[510]" style={{ color: "var(--ink)" }}>
          Mission Control
        </span>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar agents={agents} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-h-screen min-w-0">{children}</main>
    </div>
  );
}
