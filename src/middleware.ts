import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets, next internals, favicon, and api routes pass directly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes that don't need auth redirects
  if (
    pathname === "/login" ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/join")
  ) {
    return NextResponse.next();
  }

  // Check cookies for user session — used for routing only.
  // Actual data access is protected by server-side auth guards in API routes.
  const sessionCookie = request.cookies.get("homevault_session")?.value;
  const userId = request.cookies.get("homevault_user_id")?.value;

  let hasHousehold = false;
  let hasBusiness = false;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      hasHousehold = parsed.hasHouseholdMembership || Boolean(parsed.householdId);
      hasBusiness = parsed.hasBusinessMembership || Boolean(parsed.businessId);
    } catch {
      // ignore
    }
  } else {
    hasHousehold = Boolean(request.cookies.get("homevault_household_id")?.value);
    hasBusiness = Boolean(request.cookies.get("homevault_business_id")?.value);
  }

  const isAuthenticated = Boolean(userId || sessionCookie);

  // If NOT authenticated, redirect to login for ALL protected routes
  if (!isAuthenticated) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If visiting root "/"
  if (pathname === "/") {
    if (hasBusiness && !hasHousehold) {
      return NextResponse.redirect(new URL("/service-desk", request.url));
    }
    if (hasHousehold) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // If user is authenticated but has neither membership
  if (isAuthenticated && !hasHousehold && !hasBusiness) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // Protected route checking:
  // If user only has business membership, prevent accessing household routes
  if (isAuthenticated && hasBusiness && !hasHousehold) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/complaints") ||
      pathname.startsWith("/settings/members") ||
      pathname.startsWith("/household")
    ) {
      return NextResponse.redirect(new URL("/service-desk", request.url));
    }
  }

  // If user only has household membership, prevent accessing business routes
  if (isAuthenticated && hasHousehold && !hasBusiness) {
    if (
      pathname.startsWith("/service-desk") ||
      pathname.startsWith("/customers") ||
      pathname.startsWith("/settings/team") ||
      pathname.startsWith("/settings/profile") ||
      pathname.startsWith("/business")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
