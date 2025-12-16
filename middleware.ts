import { NextRequest, NextResponse } from "next/server";

// Lightweight cookie check - avoids importing any heavy dependencies
// Admin routes are fully protected by requireAdmin() in app/admin/layout.tsx
// This middleware just does a quick cookie check to redirect obvious non-authenticated requests
function hasSessionCookie(request: NextRequest): boolean {
  const sessionToken = request.cookies.get("next-auth.session-token");
  return !!sessionToken;
}

// Lightweight authentication middleware - cookie check only
// Full auth verification happens in admin layout via requireAdmin()
async function authMiddleware(request: NextRequest) {
  // Simple cookie check - if no session cookie, redirect to login
  // The admin layout will handle full auth verification with requireAdmin()
  if (!hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow request to proceed - admin layout will verify auth properly
  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and API routes (API routes handle their own auth)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

// Main middleware function
export default async function middleware(request: NextRequest) {
  // Skip middleware for API routes (they handle their own authentication)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply Arcjet protection if available (optional)
  if (process.env.ARCJET_KEY) {
    try {
      const { default: arcjet, detectBot } = await import("@arcjet/next");
      
      const aj = arcjet({
        key: process.env.ARCJET_KEY,
        rules: [
          detectBot({
            mode: "LIVE",
            allow: [
              "CATEGORY:SEARCH_ENGINE",
              "CATEGORY:MONITOR",
              "CATEGORY:PREVIEW",
              "STRIPE_WEBHOOK",
            ],
          }),
        ],
      });

      // Run Arcjet protection
      const arcjetResult = await aj.protect(request);
      
      // If Arcjet blocked the request, return forbidden
      if (arcjetResult.isDenied()) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    } catch (error) {
      // If Arcjet fails, log and continue (don't block the request)
      console.warn("Arcjet protection error, continuing without protection:", error);
    }
  }

  // Only apply auth middleware to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(request);
  }

  // For all other routes (including /courses and /dashboard), allow access
  // They will handle their own authentication at the page/layout level
  return NextResponse.next();
}
