import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Hermes Mission Control",
  description: "Command center for your Hermes AI agents.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let agents: { id: string; name: string; emoji: string | null; status: string; totalCost: number }[] = [];
  try {
    agents = await prisma.agentState.findMany({
      select: { id: true, name: true, emoji: true, status: true, totalCost: true },
      orderBy: { name: "asc" },
    });
  } catch {}

  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.className} ${geistMono.variable} min-h-screen scan-effect`}
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <AppShell agents={agents}>{children}</AppShell>
      </body>
    </html>
  );
}