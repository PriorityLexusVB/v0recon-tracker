import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicRoute =
    nextUrl.pathname === "/auth/signin" ||
    nextUrl.pathname === "/auth/signup" ||
    nextUrl.pathname === "/auth/forgot-password" ||
    nextUrl.pathname.startsWith("/auth/reset-password") ||
    nextUrl.pathname.startsWith("/api/webhooks") ||
    nextUrl.pathname.startsWith("/api/google-sheets")

  // Allow API routes and static files to pass through without authentication
  if (
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.startsWith("/_next/static/") ||
    nextUrl.pathname.startsWith("/_next/image/") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  if (isPublicRoute) {
    if (isLoggedIn) {
      // If logged in and trying to access a public route, redirect to dashboard
      return NextResponse.redirect(new URL("/recon/cards", nextUrl))
    }
    return NextResponse.next()
  }

  // If not logged in and trying to access a protected route, redirect to signin
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  // Role-based access control (example)
  const userRole = req.auth?.user?.role

  if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/recon/cards", nextUrl)) // Redirect non-admins from admin pages
  }

  if (nextUrl.pathname.startsWith("/analytics") && !["ADMIN", "MANAGER"].includes(userRole || "")) {
    return NextResponse.redirect(new URL("/recon/cards", nextUrl)) // Redirect non-managers/admins from analytics pages
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
