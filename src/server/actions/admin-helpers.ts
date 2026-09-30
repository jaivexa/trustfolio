import "server-only";
import { refresh, updateTag } from "next/cache";
import type { z } from "zod";
import { db } from "@/lib/db";
import { fieldErrorsFrom, formValues, type ActionState } from "@/lib/action-state";
import type { CacheTag } from "@/lib/constants";
import { Prisma } from "@/generated/prisma/client";
import type { ActivityAction, Role } from "@/generated/prisma/enums";
import { requireAdmin, UnauthorizedError, type AdminUser } from "@/server/auth-guard";

/**
 * Wraps every admin mutation: verifies the session server-side, maps known
 * failures (auth, unique constraints, missing rows) to user-facing messages and
 * never leaks internal errors to the client.
 */
export async function adminMutation(
  handler: (user: AdminUser) => Promise<ActionState>,
  options: { role?: Role; values?: Record<string, string> } = {},
): Promise<ActionState> {
  try {
    const user = await requireAdmin(options.role);
    return await handler(user);
  } catch (error) {
    const values = options.values;
    if (error instanceof UnauthorizedError) return { status: "error", message: error.message, values };
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = uniqueTarget(error);
        return {
          status: "error",
          message: "That value is already in use.",
          fieldErrors: target ? { [target]: ["Must be unique — this value is already taken"] } : undefined,
          values,
        };
      }
      if (error.code === "P2025") return { status: "error", message: "This item no longer exists.", values };
    }
    console.error("[admin] mutation failed", error);
    return { status: "error", message: "Something went wrong. Please try again.", values };
  }
}

function uniqueTarget(error: Prisma.PrismaClientKnownRequestError): string | undefined {
  const meta = error.meta as { target?: string[] | string; driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } } } | undefined;
  const fields = meta?.driverAdapterError?.cause?.constraint?.fields ?? meta?.target;
  const first = Array.isArray(fields) ? fields[0] : fields;
  return first?.replace(/"/g, "");
}

/** Parses FormData with a Zod schema, returning either data or an error state. */
export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData,
): { ok: true; data: z.infer<T>; values: Record<string, string> } | { ok: false; state: ActionState } {
  const values = formValues(formData);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: fieldErrorsFrom(parsed.error),
        values,
      },
    };
  }
  return { ok: true, data: parsed.data, values };
}

export async function logActivity(
  user: AdminUser,
  action: ActivityAction,
  entity: string,
  entityId: string | null,
  summary: string,
) {
  await db.activityLog
    .create({ data: { userId: user.id, action, entity, entityId, summary: summary.slice(0, 300) } })
    .catch((error: unknown) => console.error("[admin] activity log failed", error));
}

/**
 * Expires public caches so visitors see the change on their next request,
 * and refreshes the admin's current view with the new data.
 */
export function expire(...tags: CacheTag[]) {
  for (const tag of new Set(tags)) updateTag(tag);
  refresh();
}

/** Keeps the first publication date; sets it the first time content is published. */
export function publishedAtFor(status: string, current: Date | null | undefined): Date | null {
  if (status === "PUBLISHED") return current ?? new Date();
  return current ?? null;
}

/** `{ set: [...] }` / `{ connect: [...] }` for many-to-many relations from an id list. */
export const relationSet = (ids: string[]) => ({ set: ids.map((id) => ({ id })) });
export const relationConnect = (ids: string[]) => ({ connect: ids.map((id) => ({ id })) });
