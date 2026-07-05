"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, ListTodo, Lightbulb, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Command Center", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/missions", label: "Missions", icon: ListTodo },
  { href: "/ideas", label: "Signals", icon: Lightbulb },
  { href: "/calendar", label: "Schedule", icon: Calendar },
];

interface AgentMini {
  id: string;
  name: string;
  emoji: string | null;
  status: string;
  totalCost: number;
}

export function Sidebar({ agents = [] }: { agents?: AgentMini[] }) {
  const pathname = usePathname();
  const [agentsOpen, setAgentsOpen] = useState(true);

  const online = agents.filter((a) => a.status === "online" || a.status === "working").length;
  const totalCost = agents.reduce((s, a) => s + (a.totalCost || 0), 0);

  return (
    <aside
      className="flex flex-col gap-0 sticky top-0 h-screen"
      style={{ width: 220, borderRight: "1px solid var(--line)" }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-[600]"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          H
        </div>
        <div>
          <div className="text-[13px] font-[510] leading-tight" style={{ color: "var(--ink)" }}>
            Mission Control
          </div>
          <div className="text-[10px]" style={{ color: "var(--ink-4)" }}>
            Hermes Agent OS
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-[11px]"
        style={{ borderBottom: "1px solid var(--line-subtle)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="telemetry-dot online" style={{ width: 6, height: 6 }} />
          <span style={{ color: "var(--ink-3)" }}>
            {online}/{agents.length}
          </span>
        </div>
        <div style={{ color: "var(--ink-4)" }}>
          ${totalCost.toFixed(2)}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2" style={{ flex: 1 }}>
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[12.5px] font-[510]"
              style={{
                background: active ? "var(--surface-1)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-3)",
              }}
            >
              <Icon className="w-4 h-4 flex-none" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Agent list */}
        {agents.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setAgentsOpen(!agentsOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-[510]"
              style={{ color: "var(--ink-4)" }}
            >
              <span>Agents</span>
              <ChevronDown
                className="w-3 h-3"
                style={{ transform: agentsOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
              />
            </button>
            {agentsOpen && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {agents.slice(0, 8).map((a) => (
                  <Link
                    key={a.id}
                    href={`/agents/${encodeURIComponent(a.id)}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px]"
                    style={{ color: "var(--ink-3)" }}
                  >
                    <div className={`telemetry-dot ${a.status}`} style={{ width: 5, height: 5 }} />
                    <span className="truncate-text flex-1">{a.name}</span>
                    <span style={{ color: "var(--ink-4)", fontSize: 10 }}>
                      ${(a.totalCost || 0).toFixed(1)}
                    </span>
                  </Link>
                ))}
                {agents.length > 8 && (
                  <Link
                    href="/agents"
                    className="px-3 py-1 text-[11px]"
                    style={{ color: "var(--ink-4)" }}
                  >
                    +{agents.length - 8} more
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}