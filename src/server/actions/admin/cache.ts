"use server";

import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { adminMutation, expire, logActivity } from "@/server/actions/admin-helpers";

/**
 * Expires every public cache. Needed after changing data outside the admin
 * (e.g. `npx prisma db seed` or `npm run db:demo:clear`), which cannot
 * notify the running site.
 */
export async function refreshPublicCache(): Promise<ActionState> {
  return adminMutation(
    async (user) => {
      expire(...Object.values(CACHE_TAGS));
      await logActivity(user, "UPDATE", "Cache", null, "Refreshed the public website cache");
      return { status: "success", message: "Public website refreshed" };
    },
    { role: "ADMIN" },
  );
}
