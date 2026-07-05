import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Agent state endpoint.
 *
 *   GET  /api/agents/state              -> list all agents
 *   POST /api/agents/state              -> upsert one agent's state (agents, bearer-auth)
 *   POST /api/agents/state (form)       -> operator stop/resume control (dashboard, session-auth via middleware)
 *
 * Hermes agents call POST here every N seconds with their current status.
 * Auth: requires `Authorization: Bearer <INTERNAL_API_SECRET>` header so
 * random internet traffic can't write to your dashboard.
 */

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function GET() {
  const agents = await prisma.agentState.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ agents });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // Operator control from the dashboard: stop/resume an agent as a kill switch.
  // Reaches here only with a valid NextAuth session cookie (enforced by middleware).
  if (!contentType.includes("application/json")) {
    const form = await req.formData();
    const id = form.get("id") as string;
    const action = form.get("action") as string;
    if (!id || (action !== "stop" && action !== "resume")) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await prisma.agentState.update({
      where: { id },
      data: { status: action === "stop" ? "stopped" : "idle" },
    });
    revalidatePath("/");
    revalidatePath("/agents");
    revalidatePath(`/agents/${id}`);
    return NextResponse.redirect(new URL(`/agents/${encodeURIComponent(id)}`, req.url));
  }

  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    id,
    name,
    emoji,
    role,
    status,
    tasksCompleted,
    totalCost,
    currentTask,
    recentActivity,
  } = body || {};

  if (!id || !name) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }

  const updated = await prisma.agentState.upsert({
    where: { id: String(id) },
    create: {
      id: String(id),
      name: String(name),
      emoji: emoji ? String(emoji) : null,
      role: role ? String(role) : null,
      status: status ? String(status) : "offline",
      lastActive: new Date(),
      tasksCompleted: Number.isFinite(tasksCompleted) ? Number(tasksCompleted) : 0,
      totalCost: Number.isFinite(totalCost) ? Number(totalCost) : 0,
      currentTask: currentTask ? String(currentTask) : null,
      recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
    },
    update: {
      name: String(name),
      ...(emoji !== undefined && { emoji: emoji ? String(emoji) : null }),
      ...(role !== undefined && { role: role ? String(role) : null }),
      ...(status !== undefined && { status: String(status) }),
      lastActive: new Date(),
      ...(Number.isFinite(tasksCompleted) && { tasksCompleted: Number(tasksCompleted) }),
      ...(Number.isFinite(totalCost) && { totalCost: Number(totalCost) }),
      ...(currentTask !== undefined && { currentTask: currentTask ? String(currentTask) : null }),
      ...(Array.isArray(recentActivity) && { recentActivity }),
    },
  });

  return NextResponse.json({ agent: updated });
}
