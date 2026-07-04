import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
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
