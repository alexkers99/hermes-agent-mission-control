"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, ListTodo, Lightbulb, Calendar } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/missions", label: "Missions", icon: ListTodo },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="flex flex-col gap-1 p-3 sticky top-0 h-screen"
      style={{ width: 220, borderRight: "1px solid var(--line-subtle)" }}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 mb-6">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-[600]"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          H
        </div>
        <div className="text-[14px] font-[510] tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
          Mission Control
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-[510] transition-all"
              style={{
                background: active ? "var(--surface-1)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-3)",
                border: active ? "1px solid var(--line-subtle)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--surface-0)";
                  e.currentTarget.style.color = "var(--ink-2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink-3)";
                }
              }}
            >
              <Icon className="w-4 h-4 flex-none" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3 py-2">
        <div className="text-[11px] font-[510]" style={{ color: "var(--ink-4)" }}>
          Hermes Agent OS
        </div>
        <div className="text-[10px]" style={{ color: "var(--ink-4)", opacity: 0.6 }}>
          Somnia Operations
        </div>
      </div>
    </aside>
  );
}