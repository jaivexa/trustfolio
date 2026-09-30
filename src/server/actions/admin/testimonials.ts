"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { testimonialSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveTestimonial(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(testimonialSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      if (parsed.data.projectId) {
        const exists = await db.project.count({ where: { id: parsed.data.projectId } });
        if (!exists) return { status: "error", fieldErrors: { projectId: ["Project not found"] }, values: parsed.values };
      }
      const row = id
        ? await db.testimonial.update({ where: { id: idSchema.parse(id) }, data: parsed.data })
        : await db.testimonial.create({ data: parsed.data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Testimonial", row.id, `${id ? "Updated" : "Added"} testimonial from ${row.name}`);
      expire(CACHE_TAGS.testimonials, CACHE_TAGS.projects);
      return { status: "success", message: id ? "Testimonial saved" : "Testimonial added", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function setTestimonialPublished(id: string, isPublished: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.testimonial.update({ where: { id: idSchema.parse(id) }, data: { isPublished } });
    await logActivity(user, isPublished ? "PUBLISH" : "UNPUBLISH", "Testimonial", id, `${isPublished ? "Published" : "Unpublished"} testimonial from ${row.name}`);
    expire(CACHE_TAGS.testimonials, CACHE_TAGS.projects);
    return { status: "success", message: isPublished ? "Testimonial published" : "Testimonial unpublished" };
  });
}

export async function deleteTestimonial(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.testimonial.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Testimonial", id, `Deleted testimonial from ${row.name}`);
    expire(CACHE_TAGS.testimonials, CACHE_TAGS.projects);
    return { status: "success", message: "Testimonial deleted" };
  });
}
