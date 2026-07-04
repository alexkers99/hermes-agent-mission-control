import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, res: any) {
  return handler(req, res);
}

export async function POST(req: NextRequest, res: any) {
  return handler(req, res);
}
