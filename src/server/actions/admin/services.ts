"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { serviceSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveService(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(serviceSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      const service = id
        ? await db.service.update({ where: { id: idSchema.parse(id) }, data: parsed.data })
        : await db.service.create({ data: parsed.data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Service", service.id, `${id ? "Updated" : "Created"} service "${service.title}"`);
      expire(CACHE_TAGS.services);
      return { status: "success", message: id ? "Service saved" : "Service created", id: service.id };
    },
    { values: parsed.values },
  );
}

export async function setServicePublished(id: string, isPublished: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const service = await db.service.update({ where: { id: idSchema.parse(id) }, data: { isPublished } });
    await logActivity(user, isPublished ? "PUBLISH" : "UNPUBLISH", "Service", id, `${isPublished ? "Published" : "Unpublished"} "${service.title}"`);
    expire(CACHE_TAGS.services);
    return { status: "success", message: isPublished ? "Service published" : "Service hidden" };
  });
}

export async function deleteService(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const service = await db.service.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Service", id, `Deleted service "${service.title}"`);
    expire(CACHE_TAGS.services);
    return { status: "success", message: "Service deleted" };
  });
}
