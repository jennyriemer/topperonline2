import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the PIN entry page and static assets
  if (
    pathname === "/auth/pin" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    /\.(?:png|svg|ico|jpg|jpeg|webp|gif)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated via cookie
  const authCookie = request.cookies.get("suburban_toppers_auth");

  if (!authCookie || authCookie.value !== "authenticated") {
    // Redirect to PIN entry page
    return NextResponse.redirect(new URL("/auth/pin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|svg|ico|webp|gif)$).*)",
  ],
};
