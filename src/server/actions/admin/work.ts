"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { activitySchema, metricSchema, projectSchema, storySchema, testimonialSchema } from "@/lib/validations/admin";
import { adminMutation, expire, logActivity, parseForm, publishedAtFor, relationConnect, relationSet } from "@/server/actions/admin-helpers";

export async function saveProject(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(projectSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { documentIds, ...data } = parsed.data;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.project.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const payload = { ...data, publishedAt: publishedAtFor(data.status, existing?.publishedAt) };
      const row = id
        ? await db.project.update({ where: { id }, data: { ...payload, documents: relationSet(documentIds) } })
        : await db.project.create({ data: { ...payload, documents: relationConnect(documentIds) } });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Project", row.id, `${id ? "Updated" : "Created"} project “${row.titleEn}”`);
      expire(CACHE_TAGS.projects, CACHE_TAGS.activities, CACHE_TAGS.documents);
      return { status: "success", message: id ? "Project saved" : "Project created", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveActivity(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(activitySchema, formData);
  if (!parsed.ok) return parsed.state;
  const { documentIds, ...data } = parsed.data;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.activity.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const payload = { ...data, publishedAt: publishedAtFor(data.status, existing?.publishedAt) };
      const row = id
        ? await db.activity.update({ where: { id }, data: { ...payload, documents: relationSet(documentIds) } })
        : await db.activity.create({ data: { ...payload, documents: relationConnect(documentIds) } });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Activity", row.id, `${id ? "Updated" : "Recorded"} activity “${row.titleEn}”`);
      expire(CACHE_TAGS.activities, CACHE_TAGS.projects, CACHE_TAGS.impact, CACHE_TAGS.documents);
      return { status: "success", message: id ? "Activity saved" : "Activity recorded", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveMetric(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(metricSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { activityIds, ...data } = parsed.data;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.impactMetric.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const payload = { ...data, publishedAt: publishedAtFor(data.status, existing?.publishedAt) };
      const row = id
        ? await db.impactMetric.update({ where: { id }, data: { ...payload, activities: relationSet(activityIds) } })
        : await db.impactMetric.create({ data: { ...payload, activities: relationConnect(activityIds) } });
      await logActivity(user, id ? "UPDATE" : "CREATE", "ImpactMetric", row.id, `${id ? "Updated" : "Added"} metric “${row.labelEn}” (${row.value})`);
      expire(CACHE_TAGS.impact, CACHE_TAGS.projects, CACHE_TAGS.reports);
      return { status: "success", message: "Impact metric saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveTestimonial(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(testimonialSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.testimonial.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.testimonial.update({ where: { id }, data }) : await db.testimonial.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Testimonial", row.id, `${id ? "Updated" : "Added"} testimonial from ${row.nameEn}`);
      expire(CACHE_TAGS.testimonials, CACHE_TAGS.projects, CACHE_TAGS.activities);
      return { status: "success", message: "Testimonial saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveStory(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(storySchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.story.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.story.update({ where: { id }, data }) : await db.story.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Story", row.id, `${id ? "Updated" : "Added"} story “${row.titleEn}”`);
      expire(CACHE_TAGS.stories, CACHE_TAGS.projects, CACHE_TAGS.activities);
      return { status: "success", message: "Story saved", id: row.id };
    },
    { values: parsed.values },
  );
}
