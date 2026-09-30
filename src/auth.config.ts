import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

/**
 * Provider-free config shared by `auth.ts` and `proxy.ts`.
 * Authorization is *also* enforced server-side in every admin page and action;
 * the proxy check only provides a fast redirect.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      const isLoggedIn = Boolean(auth?.user);
      if (isLoginPage) {
        return isLoggedIn ? Response.redirect(new URL("/admin", request.nextUrl)) : true;
      }
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = (token.role as Role | undefined) ?? "EDITOR";
      return session;
    },
  },
} satisfies NextAuthConfig;
