"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { RESOURCE_KEYS, RESOURCES, type BulkOperation, type ResourceKey } from "@/lib/admin-resources";
import { CACHE_TAGS, type CacheTag } from "@/lib/constants";
import type { ContentStatus } from "@/generated/prisma/enums";
import { adminMutation, expire, logActivity } from "@/server/actions/admin-helpers";

/**
 * Minimal structural view of a Prisma delegate for status/bulk operations.
 * Every content model has `id`, `status` and `publishedAt`, so these calls are
 * valid for each of them; the cast is confined to this map.
 */
type Where = Record<string, unknown>;
type BulkDelegate = {
  updateMany(args: { where: Where; data: { status?: ContentStatus; publishedAt?: Date } }): Promise<{ count: number }>;
  deleteMany(args: { where: Where }): Promise<{ count: number }>;
  count(args: { where: Where }): Promise<number>;
};

const DELEGATES: Record<ResourceKey, BulkDelegate> = {
  trustees: db.trustee as unknown as BulkDelegate,
  objectives: db.trustObjective as unknown as BulkDelegate,
  history: db.historyEvent as unknown as BulkDelegate,
  activities: db.activity as unknown as BulkDelegate,
  projects: db.project as unknown as BulkDelegate,
  metrics: db.impactMetric as unknown as BulkDelegate,
  testimonials: db.testimonial as unknown as BulkDelegate,
  stories: db.story as unknown as BulkDelegate,
  documents: db.document as unknown as BulkDelegate,
  reports: db.annualReport as unknown as BulkDelegate,
  certificates: db.certificate as unknown as BulkDelegate,
  verification: db.verificationRecord as unknown as BulkDelegate,
  albums: db.galleryAlbum as unknown as BulkDelegate,
  news: db.newsPost as unknown as BulkDelegate,
  faqs: db.faq as unknown as BulkDelegate,
};

/** Rows must satisfy these before they can be published (same rules as the forms). */
const PUBLISH_GUARDS: Partial<Record<ResourceKey, Where>> = {
  trustees: { publicationConsent: true },
  testimonials: { consentObtained: true },
  stories: { consentObtained: true },
  documents: {
    AND: [
      { OR: [{ visibility: "PRIVATE" }, { containsPersonalData: false }, { isRedacted: true }] },
      { OR: [{ visibility: "PRIVATE" }, { fileId: { not: null } }] },
    ],
  },
  metrics: { OR: [{ methodologyEn: { not: null } }, { sourceDocumentId: { not: null } }, { reportId: { not: null } }] },
  verification: { OR: [{ documentId: { not: null } }, { externalUrl: { not: null } }] },
};

const TAGS: Record<ResourceKey, CacheTag[]> = {
  trustees: [CACHE_TAGS.trustees],
  objectives: [CACHE_TAGS.objectives],
  history: [CACHE_TAGS.history, CACHE_TAGS.trustees],
  activities: [CACHE_TAGS.activities, CACHE_TAGS.projects, CACHE_TAGS.impact],
  projects: [CACHE_TAGS.projects, CACHE_TAGS.activities],
  metrics: [CACHE_TAGS.impact, CACHE_TAGS.projects, CACHE_TAGS.reports],
  testimonials: [CACHE_TAGS.testimonials, CACHE_TAGS.projects],
  stories: [CACHE_TAGS.stories, CACHE_TAGS.projects, CACHE_TAGS.activities],
  documents: [CACHE_TAGS.documents, CACHE_TAGS.trust],
  reports: [CACHE_TAGS.reports, CACHE_TAGS.impact],
  certificates: [CACHE_TAGS.certificates],
  verification: [CACHE_TAGS.verification],
  albums: [CACHE_TAGS.gallery, CACHE_TAGS.projects, CACHE_TAGS.activities],
  news: [CACHE_TAGS.news],
  faqs: [CACHE_TAGS.faqs],
};

const inputSchema = z.object({
  resource: z.enum(RESOURCE_KEYS as [ResourceKey, ...ResourceKey[]]),
  ids: z.array(z.string().min(1).max(64)).min(1).max(200),
  op: z.enum(["publish", "draft", "archive", "delete"]),
});

export async function bulkAction(resource: ResourceKey, ids: string[], op: BulkOperation): Promise<ActionState> {
  const parsed = inputSchema.safeParse({ resource, ids, op });
  if (!parsed.success) return { status: "error", message: "Invalid request." };

  return adminMutation(async (user) => {
    const delegate = DELEGATES[resource];
    const where: Where = { id: { in: parsed.data.ids } };
    const label = RESOURCES[resource].label.toLowerCase();
    let message: string;

    if (op === "delete") {
      const { count } = await delegate.deleteMany({ where });
      await logActivity(user, "DELETE", RESOURCES[resource].singular, null, `Deleted ${count} ${label}`);
      message = `Deleted ${count}`;
    } else if (op === "publish") {
      const guard = PUBLISH_GUARDS[resource];
      const eligible = guard ? { AND: [where, guard] } : where;
      const { count } = await delegate.updateMany({ where: eligible, data: { status: "PUBLISHED" } });
      await delegate.updateMany({ where: { AND: [eligible, { publishedAt: null }] }, data: { publishedAt: new Date() } });
      const skipped = parsed.data.ids.length - count;
      await logActivity(user, "PUBLISH", RESOURCES[resource].singular, null, `Published ${count} ${label}`);
      message = skipped
        ? `Published ${count}. ${skipped} skipped — they need consent, a source or a redacted file first.`
        : `Published ${count}`;
    } else {
      const next: ContentStatus = op === "archive" ? "ARCHIVED" : "DRAFT";
      const { count } = await delegate.updateMany({ where, data: { status: next } });
      await logActivity(user, op === "archive" ? "ARCHIVE" : "UNPUBLISH", RESOURCES[resource].singular, null, `${op === "archive" ? "Archived" : "Unpublished"} ${count} ${label}`);
      message = op === "archive" ? `Archived ${count}` : `Moved ${count} to draft`;
    }

    expire(...TAGS[resource]);
    return { status: "success", message };
  });
}
