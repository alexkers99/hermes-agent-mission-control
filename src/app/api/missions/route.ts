import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = form.get("title") as string;
  const agentId = form.get("agentId") as string;
  const priority = form.get("priority") as string || "medium";

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  await prisma.mission.create({
    data: {
      title,
      agentId: agentId || "any",
      description: "",
      priority,
      status: "pending",
    },
  });

  revalidatePath("/");
  revalidatePath("/missions");
  return NextResponse.redirect(new URL("/missions", req.url));
}