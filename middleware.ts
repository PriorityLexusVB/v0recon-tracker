import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get the session token from cookies
    const sessionToken =
      request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

    const isLoggedIn = !!sessionToken

    const isApiAuthRoute = pathname.startsWith("/api/auth")
    const isPublicRoute = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/mobile")
    const isProtectedRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/recon") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/timeline") ||
      pathname.startsWith("/integrations")

    // Allow API auth routes
    if (isApiAuthRoute) {
      return NextResponse.next()
    }

    // Redirect to login if accessing protected routes without auth
    if (isProtectedRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Default redirect to login for non-authenticated users
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (
          req.nextUrl.pathname.startsWith("/auth") ||
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/mobile")
        ) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
