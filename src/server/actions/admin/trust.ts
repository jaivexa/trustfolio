"use server";

import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { idSchema } from "@/lib/validations/common";
import { categorySchema, faqSchema, historySchema, objectiveSchema, trusteeSchema, trustProfileSchema } from "@/lib/validations/admin";
import { adminMutation, expire, logActivity, parseForm, publishedAtFor, relationConnect, relationSet } from "@/server/actions/admin-helpers";

/** Official identity & legal information — administrators only. */
export async function saveTrustProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(trustProfileSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      await db.trustProfile.upsert({ where: { id: "default" }, update: parsed.data, create: { id: "default", ...parsed.data } });
      await logActivity(user, "UPDATE", "TrustProfile", "default", "Updated trust profile");
      expire(CACHE_TAGS.trust);
      return { status: "success", message: "Trust profile saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function saveTrustee(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(trusteeSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { documentIds, ...data } = parsed.data;
  return adminMutation(
    async (user) => {
      // Only one founder at a time.
      if (data.isFounder) await db.trustee.updateMany({ where: { isFounder: true, ...(id ? { id: { not: id } } : {}) }, data: { isFounder: false } });
      const existing = id ? await db.trustee.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const payload = { ...data, publishedAt: publishedAtFor(data.status, existing?.publishedAt) };
      const row = id
        ? await db.trustee.update({ where: { id }, data: { ...payload, documents: relationSet(documentIds) } })
        : await db.trustee.create({ data: { ...payload, documents: relationConnect(documentIds) } });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Trustee", row.id, `${id ? "Updated" : "Added"} ${row.nameEn}`);
      expire(CACHE_TAGS.trustees, CACHE_TAGS.history);
      return { status: "success", message: id ? "Trustee saved" : "Trustee added", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveObjective(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(objectiveSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.trustObjective.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.trustObjective.update({ where: { id }, data }) : await db.trustObjective.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Objective", row.id, `${id ? "Updated" : "Added"} objective “${row.titleEn}”`);
      expire(CACHE_TAGS.objectives);
      return { status: "success", message: "Objective saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveHistoryEvent(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(historySchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.historyEvent.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.historyEvent.update({ where: { id }, data }) : await db.historyEvent.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "HistoryEvent", row.id, `${id ? "Updated" : "Added"} timeline event “${row.titleEn}”`);
      expire(CACHE_TAGS.history, CACHE_TAGS.trustees);
      return { status: "success", message: "Timeline event saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveFaq(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(faqSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = id ? await db.faq.findUniqueOrThrow({ where: { id: idSchema.parse(id) }, select: { publishedAt: true } }) : null;
      const data = { ...parsed.data, publishedAt: publishedAtFor(parsed.data.status, existing?.publishedAt) };
      const row = id ? await db.faq.update({ where: { id }, data }) : await db.faq.create({ data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Faq", row.id, `${id ? "Updated" : "Added"} FAQ`);
      expire(CACHE_TAGS.faqs);
      return { status: "success", message: "Question saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function saveCategory(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(categorySchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const row = id
        ? await db.category.update({ where: { id: idSchema.parse(id) }, data: parsed.data })
        : await db.category.create({ data: parsed.data });
      await logActivity(user, id ? "UPDATE" : "CREATE", "Category", row.id, `${id ? "Updated" : "Added"} category “${row.nameEn}”`);
      expire(CACHE_TAGS.categories, CACHE_TAGS.activities, CACHE_TAGS.projects, CACHE_TAGS.documents, CACHE_TAGS.news, CACHE_TAGS.gallery);
      return { status: "success", message: "Category saved", id: row.id };
    },
    { values: parsed.values },
  );
}

export async function deleteCategory(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const row = await db.category.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "Category", id, `Deleted category “${row.nameEn}”`);
    expire(CACHE_TAGS.categories, CACHE_TAGS.activities, CACHE_TAGS.projects, CACHE_TAGS.documents, CACHE_TAGS.news, CACHE_TAGS.gallery);
    return { status: "success", message: "Category deleted" };
  });
}
