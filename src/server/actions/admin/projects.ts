"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { projectSchema } from "@/lib/validations/content";
import { adminMutation, expire, logActivity, parseForm, technologyConnect } from "@/server/actions/admin-helpers";

export async function saveProject(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(projectSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { technologies, images, ...data } = parsed.data;

  return adminMutation(
    async (user) => {
      const imageRows = images.map((image, index) => ({
        url: image.url,
        alt: image.alt,
        caption: image.caption ?? null,
        sortOrder: index,
      }));

      if (id) {
        const existing = await db.project.findUniqueOrThrow({
          where: { id: idSchema.parse(id) },
          select: { isPublished: true, publishedAt: true },
        });
        const project = await db.$transaction(async (tx) => {
          await tx.projectImage.deleteMany({ where: { projectId: id } });
          return tx.project.update({
            where: { id },
            data: {
              ...data,
              publishedAt: data.isPublished ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
              technologies: { set: [], connectOrCreate: technologyConnect(technologies) },
              images: { create: imageRows },
            },
          });
        });
        await logActivity(user, "UPDATE", "Project", project.id, `Updated project "${project.title}"`);
        expire(CACHE_TAGS.projects, CACHE_TAGS.testimonials);
        return { status: "success", message: "Project saved", id: project.id };
      }

      const project = await db.project.create({
        data: {
          ...data,
          publishedAt: data.isPublished ? new Date() : null,
          technologies: { connectOrCreate: technologyConnect(technologies) },
          images: { create: imageRows },
        },
      });
      await logActivity(user, "CREATE", "Project", project.id, `Created project "${project.title}"`);
      expire(CACHE_TAGS.projects);
      return { status: "success", message: "Project created", id: project.id };
    },
    { values: parsed.values },
  );
}

export async function setProjectPublished(id: string, isPublished: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const current = await db.project.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } });
    const project = await db.project.update({
      where: { id },
      data: { isPublished, publishedAt: isPublished ? (current.publishedAt ?? new Date()) : current.publishedAt },
    });
    await logActivity(
      user,
      isPublished ? "PUBLISH" : "UNPUBLISH",
      "Project",
      id,
      `${isPublished ? "Published" : "Unpublished"} "${project.title}"`,
    );
    expire(CACHE_TAGS.projects);
    return { status: "success", message: isPublished ? "Project published" : "Project unpublished" };
  });
}

export async function setProjectFeatured(id: string, isFeatured: boolean): Promise<ActionState> {
  return adminMutation(async (user) => {
    const project = await db.project.update({ where: { id: idSchema.parse(id) }, data: { isFeatured } });
    await logActivity(
      user,
      isFeatured ? "FEATURE" : "UNFEATURE",
      "Project",
      id,
      `${isFeatured ? "Featured" : "Unfeatured"} "${project.title}"`,
    );
    expire(CACHE_TAGS.projects);
    return { status: "success", message: isFeatured ? "Marked as featured" : "Removed from featured" };
  });
}

export async function deleteProject(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const project = await db.project.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Project", id, `Deleted project "${project.title}"`);
    expire(CACHE_TAGS.projects, CACHE_TAGS.testimonials);
    return { status: "success", message: "Project deleted" };
  });
}
