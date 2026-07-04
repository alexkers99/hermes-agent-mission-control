import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  if (token) {
    // If user is logged in and tries to go to login page, send them to dashboard
    if (pathname.startsWith("/api/auth/signin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // If user is NOT logged in, protect everything EXCEPT auth routes
    if (!pathname.startsWith("/api/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
