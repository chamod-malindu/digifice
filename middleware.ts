import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Redirect to login if not authenticated (handled by withAuth by default, but explicit check here)
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const role = token.role;

        // Role-based protection
        if (path.startsWith("/student") && role !== "student") {
            return NextResponse.redirect(new URL("/login", req.url)); // Or unauthorized page
        }

        if (path.startsWith("/lecturer") && role !== "lecturer") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (path.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: ["/student/:path*", "/lecturer/:path*", "/admin/:path*"],
};
