import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const expected = await sessionToken();
  if (!expected) return NextResponse.next(); // no APP_PASSWORD set → open (local dev)
  const { pathname } = request.nextUrl;
  const ok = request.cookies.get(SESSION_COOKIE)?.value === expected;
  if (pathname === "/login") return ok ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  if (!ok) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json).*)"],
};
