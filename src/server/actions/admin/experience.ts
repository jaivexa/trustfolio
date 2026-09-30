"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { experienceSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm, technologyConnect } from "@/server/actions/admin-helpers";

export async function saveExperience(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(experienceSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { technologies, ...data } = parsed.data;

  return adminMutation(
    async (user) => {
      const row = id
        ? await db.experience.update({
            where: { id: idSchema.parse(id) },
            data: { ...data, technologies: { set: [], connectOrCreate: technologyConnect(technologies) } },
          })
        : await db.experience.create({
            data: { ...data, technologies: { connectOrCreate: technologyConnect(technologies) } },
          });
      await logActivity(
        user,
        id ? "UPDATE" : "CREATE",
        "Experience",
        row.id,
        `${id ? "Updated" : "Added"} ${row.position} at ${row.company}`,
      );
      expire(CACHE_TAGS.experience, CACHE_TAGS.profile);
      return { status: "success", message: id ? "Experience saved" : "Experience added", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function setExperiencePublished(id: string, isPublished: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.experience.update({ where: { id: idSchema.parse(id) }, data: { isPublished } });
    await logActivity(user, isPublished ? "PUBLISH" : "UNPUBLISH", "Experience", id, `${isPublished ? "Published" : "Hid"} ${row.position} at ${row.company}`);
    expire(CACHE_TAGS.experience, CACHE_TAGS.profile);
    return { status: "success", message: isPublished ? "Now visible" : "Hidden from site" };
  });
}

export async function deleteExperience(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.experience.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Experience", id, `Deleted ${row.position} at ${row.company}`);
    expire(CACHE_TAGS.experience, CACHE_TAGS.profile);
    return { status: "success", message: "Experience deleted" };
  });
}
