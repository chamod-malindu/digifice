import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path.startsWith("/admin") && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        if (path.startsWith("/lecturer") && token?.role !== "lecturer") {
            // Allow admin to access lecturer view maybe? No, strict.
            if (token?.role !== "admin") return NextResponse.redirect(new URL("/login", req.url))
        }
        if (path.startsWith("/student") && token?.role !== "student") {
            if (token?.role !== "admin") return NextResponse.redirect(new URL("/login", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: ["/admin/:path*", "/student/:path*", "/lecturer/:path*"]
}
