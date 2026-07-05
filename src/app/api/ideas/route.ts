import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // Agent API: create a signal
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const { title, description, category, source } = body;
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const idea = await prisma.idea.create({
      data: {
        title: String(title),
        description: description ? String(description) : null,
        category: category ? String(category) : null,
        source: source ? String(source) : null,
        status: "pending",
      },
    });
    return NextResponse.json({ idea });
  }

  // Form POST from dashboard: approve/reject a signal
  const form = await req.formData();
  const id = form.get("id") as string;
  const status = form.get("status") as string;

  if (id && status) {
    await prisma.idea.update({ where: { id }, data: { status } });
    revalidatePath("/ideas");
    return NextResponse.redirect(new URL("/ideas", req.url));
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
