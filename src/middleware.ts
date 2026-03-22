import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt")?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Allow root path redirection
  if (request.nextUrl.pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Skip middleware for internal API routes
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect to login if user is not authenticated and trying to access protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if user is already authenticated and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
