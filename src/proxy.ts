import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Optimistic gate for /admin: unauthenticated visitors are redirected to the
 * login page before any admin code runs. This is a UX layer only — every admin
 * page and server action re-verifies the session against the database.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*"],
};
