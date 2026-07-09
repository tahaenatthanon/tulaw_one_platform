import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const roles = req.nextauth.token?.roles as string[] | undefined;

    // Super Admin / System Admin only — Users module
    if (pathname.startsWith("/users") && roles && !roles.includes("super_admin") && !roles.includes("system_admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Super Admin / System Admin / Dean only — Audit Log
    if (pathname.startsWith("/audit-log") && roles && !roles.includes("super_admin") && !roles.includes("system_admin") && !roles.includes("dean")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Super Admin / System Admin only — Settings
    if (pathname.startsWith("/settings") && roles && !roles.includes("super_admin") && !roles.includes("system_admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
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
  matcher: [
    "/dashboard/:path*",
    "/application-hub/:path*",
    "/intranet/:path*",
    "/book-meeting/:path*",
    "/documents/:path*",
    "/projects/:path*",
    "/users/:path*",
    "/audit-log/:path*",
    "/settings/:path*",
  ],
};
