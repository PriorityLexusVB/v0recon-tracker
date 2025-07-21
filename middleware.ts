import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments the `request` object with the user's token.
  function middleware(req) {
    // Example: Only admins can access /admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/auth/signin?message=You are not authorized!", req.url))
    }
    // Example: Only managers and admins can access /recon routes
    if (req.nextUrl.pathname.startsWith("/recon") && !["ADMIN", "MANAGER"].includes(req.nextauth.token?.role || "")) {
      return NextResponse.rewrite(new URL("/auth/signin?message=You are not authorized!", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/recon/:path*",
    "/timeline/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/mobile/:path*",
  ],
}
