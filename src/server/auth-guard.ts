import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";

export class UnauthorizedError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type AdminUser = { id: string; email: string; name: string | null; role: Role };

/**
 * Resolves the signed-in user and confirms they still exist in the database,
 * so deleting a user revokes access immediately even with a valid JWT.
 * Memoized per request.
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return db.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
});

/** For admin pages/layouts: redirects to login when unauthenticated. */
export async function requireAdminPage(role?: Role): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (role === "ADMIN" && user.role !== "ADMIN") redirect("/admin");
  return user;
}

/** For server actions and route handlers: throws when unauthorized. */
export async function requireAdmin(role?: Role): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) throw new UnauthorizedError("Your session has expired. Please sign in again.");
  if (role === "ADMIN" && user.role !== "ADMIN") throw new UnauthorizedError();
  return user;
}
