import "server-only";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { getClientIp, hashIdentifier, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

// Compared against when the user does not exist, so response timing does not
// reveal which emails are registered.
const DUMMY_HASH = "$2b$12$yAqHVRbfGlhaz1gGNwfhguG.jKao.UEfyUzbifJ6KfHNevN7tx.oC";

export const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const limiterKey = `login:${hashIdentifier(`${await getClientIp()}:${email}`)}`;
        const limit = await rateLimit(limiterKey, LOGIN_RATE_LIMIT);
        if (!limit.success) return null;

        const user = await db.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) return null;

        await resetRateLimit(limiterKey);
        await db.$transaction([
          db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
          db.activityLog.create({
            data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, summary: "Signed in" },
          }),
        ]);

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
});
