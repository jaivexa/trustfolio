/**
 * Idempotent demo seeding for Trustfolio (FICTIONAL data, `isDemo: true`).
 *
 * - Every demo row gets a deterministic id (`demo-<type>-<key>`) and is
 *   upserted, so running the seed again updates rather than duplicates.
 * - Real (non-demo) records are never modified: the trust profile, site
 *   settings and social links are only filled while they are empty, still
 *   pending or already demo; slugs taken by real records are skipped.
 * - `clearDemo()` removes demo rows only. It is never called by the normal seed.
 */
import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "../../src/generated/prisma/client";
import type { CategoryType, ContentStatus } from "../../src/generated/prisma/enums";
import {
  ACTIVITIES,
  ALBUMS,
  CERTIFICATE_TEXT,
  CERTIFICATES,
  COUNTED,
  DEMO_METHOD,
  DEMO_NOTE,
  DEMO_SOURCE,
  DOCUMENTS,
  FAQS,
  HISTORY,
  MEDIA,
  MESSAGES,
  METRICS,
  NEWS,
  OBJECTIVES,
  PERSONA,
  PROFILE,
  PROJECT_METRICS,
  PROJECTS,
  REPORTS,
  SETTINGS,
  SOCIAL_LINKS,
  STORIES,
  TESTIMONIALS,
  TRUSTEES,
  VERIFICATION,
  VERIFICATION_TEXT,
  type DemoMediaKey,
} from "./content";

export const PENDING = "[Content pending official information]";

const id = (type: string, key: string) => `demo-${type}-${key}`;
const day = (iso: string) => new Date(`${iso.length === 10 ? `${iso}T00:00:00Z` : iso}`);
const withNote = (text: { en: string; ta: string | null }) => ({
  en: `${text.en}\n\n${DEMO_NOTE.en}`,
  ta: text.ta ? `${text.ta}\n\n${DEMO_NOTE.ta}` : null,
});
const published = (status: ContentStatus, date: string) => ({ status, publishedAt: status === "PUBLISHED" ? day(date) : null });

type Db = PrismaClient;

/** Skips a record whose slug is already used by real (non-demo) content. */
async function slugFree(
  lookup: (slug: string) => Promise<{ id: string; isDemo: boolean } | null>,
  slug: string,
  demoId: string,
  label: string,
): Promise<boolean> {
  const existing = await lookup(slug);
  if (existing && (existing.id !== demoId || !existing.isDemo)) {
    console.warn(`  ↷ Skipped demo ${label} "${slug}": the slug is used by a non-demo record.`);
    return false;
  }
  return true;
}

// ─── Media ──────────────────────────────────────────────────────────────────

async function seedMedia(db: Db) {
  const ids = {} as Record<DemoMediaKey, string>;
  const dir = path.join(process.cwd(), "public", "demo");
  for (const [key, def] of Object.entries(MEDIA) as [DemoMediaKey, (typeof MEDIA)[DemoMediaKey]][]) {
    const file = path.join(dir, def.file);
    if (!fs.existsSync(file)) throw new Error(`Missing demo asset public/demo/${def.file}. Run: node scripts/generate-demo-assets.mjs`);
    const isPdf = def.file.endsWith(".pdf");
    const size = fs.statSync(file).size;
    const [width, height] = isPdf ? [null, null] : key.startsWith("person-") ? [400, 480] : key === "certificate" ? [900, 640] : [1200, 675];
    const data = {
      url: `/demo/${def.file}`,
      filename: def.file,
      mimeType: isPdf ? "application/pdf" : "image/svg+xml",
      size,
      width,
      height,
      altEn: def.alt.en,
      altTa: def.alt.ta,
      captionEn: isPdf ? null : "Demo illustration",
      captionTa: isPdf ? null : "மாதிரி விளக்கப்படம்",
      visibility: "PUBLIC" as const,
      isDemo: true,
    };
    const row = await db.media.upsert({
      where: { storageKey: `demo/${def.file}` },
      create: { id: id("media", key), storageKey: `demo/${def.file}`, ...data },
      update: data,
    });
    ids[key] = row.id;
  }
  return ids;
}

// ─── Main ───────────────────────────────────────────────────────────────────

export async function seedDemo(db: Db) {
  console.log("• Seeding DEMO data (fictional, isDemo = true)…");
  const media = await seedMedia(db);

  const categories = await db.category.findMany();
  const cat = (type: CategoryType, slug: string | null) => (slug ? (categories.find((c) => c.type === type && c.slug === slug)?.id ?? null) : null);

  // Documents
  const docIds: Record<string, string> = {};
  for (const [index, d] of DOCUMENTS.entries()) {
    const docId = id("document", d.key);
    if (!(await slugFree((slug) => db.document.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), d.slug, docId, "document"))) continue;
    const data = {
      slug: d.slug,
      titleEn: d.title.en,
      titleTa: d.title.ta,
      descriptionEn: d.description.en,
      descriptionTa: d.description.ta,
      sourceEn: DEMO_SOURCE.en,
      sourceTa: DEMO_SOURCE.ta,
      categoryId: cat("DOCUMENT", d.category),
      language: "EN" as const,
      year: d.year,
      documentDate: day(d.date),
      fileId: media[d.file],
      thumbnailId: media[d.thumbnail],
      version: "demo-1",
      isRedacted: false,
      containsPersonalData: false,
      visibility: "PUBLIC" as const,
      sortOrder: index,
      ...published("PUBLISHED", d.date),
      isDemo: true,
    };
    await db.document.upsert({ where: { id: docId }, create: { id: docId, ...data }, update: data });
    docIds[d.key] = docId;
  }
  const docs = (keys: readonly string[]) => keys.flatMap((k) => (docIds[k] ? [{ id: docIds[k] }] : []));

  // Trustees
  const trusteeIds: Record<string, string> = {};
  for (const [index, t] of TRUSTEES.entries()) {
    const trusteeId = id("trustee", t.key);
    if (!(await slugFree((slug) => db.trustee.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), t.slug, trusteeId, "trustee"))) continue;
    // Keep a single founder: a real founder takes precedence over the demo one.
    const realFounder = t.isFounder ? await db.trustee.findFirst({ where: { isFounder: true, isDemo: false } }) : null;
    const data = {
      slug: t.slug,
      nameEn: t.name.en,
      nameTa: t.name.ta,
      positionEn: t.position.en,
      positionTa: t.position.ta,
      bioEn: t.bio.en,
      bioTa: t.bio.ta,
      visionEn: t.vision?.en ?? null,
      visionTa: t.vision?.ta ?? null,
      responsibilitiesEn: [...t.responsibilities.en],
      responsibilitiesTa: [...t.responsibilities.ta],
      photoId: media[t.photo],
      joinedAt: day("2022-06-15"),
      isFounder: t.isFounder && !realFounder,
      // Fictional person: there is nobody to ask, so the publication flag is set for the demo.
      publicationConsent: true,
      sortOrder: index,
      ...published("PUBLISHED", "2026-01-10"),
      isDemo: true,
    };
    await db.trustee.upsert({ where: { id: trusteeId }, create: { id: trusteeId, ...data }, update: data });
    trusteeIds[t.key] = trusteeId;
  }

  // Objectives
  for (const [index, o] of OBJECTIVES.entries()) {
    const data = {
      titleEn: o.title.en,
      titleTa: o.title.ta,
      descriptionEn: o.description.en,
      descriptionTa: o.description.ta,
      icon: o.icon,
      sourceReference: "Demo objective — no trust deed was provided",
      sourceDocumentId: null,
      sortOrder: index,
      ...published("PUBLISHED", "2026-01-10"),
      isDemo: true,
    };
    await db.trustObjective.upsert({ where: { id: id("objective", o.key) }, create: { id: id("objective", o.key), ...data }, update: data });
  }

  // History
  for (const h of HISTORY) {
    const data = {
      date: day(h.date),
      dateLabelEn: h.key,
      dateLabelTa: h.key,
      titleEn: h.title.en,
      titleTa: h.title.ta,
      descriptionEn: h.description.en,
      descriptionTa: h.description.ta,
      trusteeId: h.trustee ? (trusteeIds[h.trustee] ?? null) : null,
      documentId: h.document ? (docIds[h.document] ?? null) : null,
      ...published("PUBLISHED", h.date),
      isDemo: true,
    };
    await db.historyEvent.upsert({ where: { id: id("history", h.key) }, create: { id: id("history", h.key), ...data }, update: data });
  }

  // Projects
  const projectIds: Record<string, string> = {};
  for (const [index, p] of PROJECTS.entries()) {
    const projectId = id("project", p.key);
    if (!(await slugFree((slug) => db.project.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), p.slug, projectId, "project"))) continue;
    const content = withNote(p.content);
    const data = {
      slug: p.slug,
      titleEn: p.title.en,
      titleTa: p.title.ta,
      summaryEn: p.summary.en,
      summaryTa: p.summary.ta,
      contentEn: content.en,
      contentTa: content.ta,
      needEn: p.need.en,
      needTa: p.need.ta,
      approachEn: p.approach.en,
      approachTa: p.approach.ta,
      outcomeEn: p.outcome.en,
      outcomeTa: p.outcome.ta,
      categoryId: cat("PROJECT", p.category),
      phase: p.phase,
      startDate: day(p.start),
      endDate: p.end ? day(p.end) : null,
      locationEn: p.place.en,
      locationTa: p.place.ta,
      coverId: media[p.cover],
      isFeatured: p.featured,
      sortOrder: index,
      ...published(p.status, p.start),
      isDemo: true,
    };
    await db.project.upsert({
      where: { id: projectId },
      create: { id: projectId, ...data, documents: { connect: docs(p.documents) } },
      update: { ...data, documents: { set: docs(p.documents) } },
    });
    projectIds[p.key] = projectId;
  }

  // Activities
  const activityIds: Record<string, string> = {};
  for (const a of ACTIVITIES) {
    const activityId = id("activity", a.key);
    if (!(await slugFree((slug) => db.activity.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), a.slug, activityId, "activity"))) continue;
    const description = withNote(a.description);
    const data = {
      slug: a.slug,
      titleEn: a.title.en,
      titleTa: a.title.ta,
      summaryEn: a.summary.en,
      summaryTa: a.summary.ta,
      descriptionEn: description.en,
      descriptionTa: description.ta,
      impactEn: a.impact.en,
      impactTa: a.impact.ta,
      date: day(a.date),
      endDate: a.end ? day(a.end) : null,
      locationEn: a.place.en,
      locationTa: a.place.ta,
      categoryId: cat("ACTIVITY", a.category),
      coverId: media[a.cover],
      beneficiaries: a.beneficiaries,
      beneficiariesNoteEn: COUNTED.en,
      beneficiariesNoteTa: COUNTED.ta,
      projectId: a.project ? (projectIds[a.project] ?? null) : null,
      ...published("PUBLISHED", a.date),
      isDemo: true,
    };
    await db.activity.upsert({
      where: { id: activityId },
      create: { id: activityId, ...data, documents: { connect: docs(a.documents) } },
      update: { ...data, documents: { set: docs(a.documents) } },
    });
    activityIds[a.key] = activityId;
  }
  const acts = (keys: readonly string[] | undefined) => (keys ?? []).flatMap((k) => (activityIds[k] ? [{ id: activityIds[k] }] : []));

  // Annual reports
  const reportIds: Record<string, string> = {};
  for (const r of REPORTS) {
    const reportId = id("report", r.key);
    if (!(await slugFree((slug) => db.annualReport.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), r.slug, reportId, "report"))) continue;
    const data = {
      slug: r.slug,
      periodLabel: r.periodLabel,
      startYear: r.startYear,
      titleEn: r.title.en,
      titleTa: r.title.ta,
      summaryEn: r.summary.en,
      summaryTa: r.summary.ta,
      highlightsEn: r.highlights.en,
      highlightsTa: r.highlights.ta,
      impactEn: r.impact.en,
      impactTa: r.impact.ta,
      financialEn: r.financial.en,
      financialTa: r.financial.ta,
      coverId: media[r.cover],
      // No PDF for 2024–25 on purpose: the site shows "document not uploaded".
      documentEnId: r.document ? (docIds[r.document] ?? null) : null,
      documentTaId: null,
      ...published("PUBLISHED", `${r.startYear + 1}-06-01`),
      isDemo: true,
    };
    await db.annualReport.upsert({ where: { id: reportId }, create: { id: reportId, ...data }, update: data });
    reportIds[r.key] = reportId;
  }

  // Impact metrics (organisation-wide + per project)
  const PERIODS = {
    "2024-25": { start: "2024-04-01", end: "2025-03-31", en: "2024–25", ta: "2024–25" },
    "2025-26": { start: "2025-04-01", end: "2026-03-31", en: "2025–26", ta: "2025–26" },
  } as const;
  for (const [index, m] of [...METRICS, ...PROJECT_METRICS].entries()) {
    const project = m.project ? PROJECTS.find((p) => p.key === m.project) : undefined;
    const period =
      m.period === "project"
        ? {
            start: project!.start,
            end: project!.end ?? "2026-03-31",
            en: project!.end ? `${project!.start.slice(0, 4)}–${project!.end.slice(2, 4)}` : `Since ${project!.start.slice(0, 4)}`,
            ta: project!.end ? `${project!.start.slice(0, 4)}–${project!.end.slice(2, 4)}` : `${project!.start.slice(0, 4)} முதல்`,
          }
        : PERIODS[m.period];
    const data = {
      metricKey: m.metricKey,
      labelEn: m.label.en,
      labelTa: m.label.ta,
      value: m.value,
      unitEn: m.unit?.en ?? null,
      unitTa: m.unit?.ta ?? null,
      periodStart: day(period.start),
      periodEnd: day(period.end),
      periodLabelEn: period.en,
      periodLabelTa: period.ta,
      methodologyEn: DEMO_METHOD.en,
      methodologyTa: DEMO_METHOD.ta,
      categoryId: cat("ACTIVITY", m.category),
      reportId: m.period === "project" ? null : (reportIds[m.period] ?? null),
      sourceDocumentId:
        m.period === "2025-26" ? (docIds["annual-report"] ?? null) : m.project === "learning-hub" ? (docIds["project-report-learning-hub"] ?? null) : null,
      projectId: m.project ? (projectIds[m.project] ?? null) : null,
      isHeadline: Boolean(m.headline),
      sortOrder: index,
      ...published("PUBLISHED", period.end),
      isDemo: true,
    };
    const metricId = id("metric", m.key);
    await db.impactMetric.upsert({
      where: { id: metricId },
      create: { id: metricId, ...data, activities: { connect: acts(m.activities) } },
      update: { ...data, activities: { set: acts(m.activities) } },
    });
  }

  // Testimonials
  for (const [index, t] of TESTIMONIALS.entries()) {
    const data = {
      nameEn: t.name.en,
      nameTa: t.name.ta,
      roleEn: t.role.en,
      roleTa: t.role.ta,
      organizationEn: null,
      organizationTa: null,
      relationshipEn: PERSONA.en,
      relationshipTa: PERSONA.ta,
      contentEn: t.content.en,
      contentTa: t.content.ta,
      date: day(t.date),
      photoId: t.photo ? media[t.photo] : null,
      // Never claim a verified relationship for invented people.
      relationshipVerified: false,
      consentObtained: true,
      projectId: projectIds[t.project] ?? null,
      activityId: activityIds[t.activity] ?? null,
      sortOrder: index,
      ...published(t.status, t.date),
      isDemo: true,
    };
    await db.testimonial.upsert({ where: { id: id("testimonial", t.key) }, create: { id: id("testimonial", t.key), ...data }, update: data });
  }

  // Gallery albums
  const albumIds: Record<string, string> = {};
  for (const [index, a] of ALBUMS.entries()) {
    const albumId = id("album", a.key);
    if (!(await slugFree((slug) => db.galleryAlbum.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), a.slug, albumId, "album"))) continue;
    const data = {
      slug: a.slug,
      titleEn: a.title.en,
      titleTa: a.title.ta,
      descriptionEn: a.description.en,
      descriptionTa: a.description.ta,
      categoryId: cat("GALLERY", a.category),
      date: day(a.date),
      coverId: media[a.cover],
      projectId: a.project ? (projectIds[a.project] ?? null) : null,
      activityId: a.activity ? (activityIds[a.activity] ?? null) : null,
      sortOrder: index,
      ...published("PUBLISHED", a.date),
      isDemo: true,
    };
    await db.galleryAlbum.upsert({ where: { id: albumId }, create: { id: albumId, ...data }, update: data });
    const mediaIds = a.images.map((k) => media[k]);
    await db.galleryImage.deleteMany({ where: { albumId, mediaId: { notIn: mediaIds } } });
    for (const [sortOrder, mediaId] of mediaIds.entries()) {
      await db.galleryImage.upsert({
        where: { albumId_mediaId: { albumId, mediaId } },
        create: { id: `${albumId}-${sortOrder}`, albumId, mediaId, sortOrder },
        update: { sortOrder },
      });
    }
    albumIds[a.key] = albumId;
  }

  // Stories (Challenge → Response → Journey → Outcome, with linked evidence)
  for (const s of STORIES) {
    const storyId = id("story", s.key);
    if (!(await slugFree((slug) => db.story.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), s.slug, storyId, "story"))) continue;
    const outcome = {
      en: `${s.outcome.en}\n\n**Evidence:** the linked activity and photo album (demo records).\n\n${DEMO_NOTE.en}`,
      ta: `${s.outcome.ta}\n\n**ஆதாரம்:** இணைக்கப்பட்ட செயல்பாடும் புகைப்படத் தொகுப்பும் (மாதிரிப் பதிவுகள்).\n\n${DEMO_NOTE.ta}`,
    };
    const data = {
      slug: s.slug,
      titleEn: s.title.en,
      titleTa: s.title.ta,
      summaryEn: s.summary.en,
      summaryTa: s.summary.ta,
      subjectEn: s.subject.en,
      subjectTa: s.subject.ta,
      challengeEn: s.challenge.en,
      challengeTa: s.challenge.ta,
      supportEn: s.response.en,
      supportTa: s.response.ta,
      journeyEn: s.journey.en,
      journeyTa: s.journey.ta,
      outcomeEn: outcome.en,
      outcomeTa: outcome.ta,
      coverId: media[s.cover],
      albumId: albumIds[s.album] ?? null,
      activityId: activityIds[s.activity] ?? null,
      projectId: s.project ? (projectIds[s.project] ?? null) : null,
      consentObtained: true,
      anonymized: true,
      ...published("PUBLISHED", "2026-02-01"),
      isDemo: true,
    };
    await db.story.upsert({ where: { id: storyId }, create: { id: storyId, ...data }, update: data });
  }

  // Certificates
  for (const [index, c] of CERTIFICATES.entries()) {
    const data = {
      kind: c.kind,
      titleEn: c.title.en,
      titleTa: c.title.ta,
      issuerEn: CERTIFICATE_TEXT.issuer.en,
      issuerTa: CERTIFICATE_TEXT.issuer.ta,
      descriptionEn: CERTIFICATE_TEXT.description.en,
      descriptionTa: CERTIFICATE_TEXT.description.ta,
      issuedAt: day(c.issuedAt),
      expiresAt: null,
      credentialId: c.credentialId,
      verificationUrl: null,
      imageId: media.certificate,
      documentId: c.document ? (docIds[c.document] ?? null) : null,
      sortOrder: index,
      ...published("PUBLISHED", c.issuedAt),
      isDemo: true,
    };
    const certificateId = id("certificate", c.key);
    await db.certificate.upsert({ where: { id: certificateId }, create: { id: certificateId, ...data }, update: data });
  }

  // Evidence Center records (method OTHER: they point to demo files, nothing is "verified")
  for (const [index, v] of VERIFICATION.entries()) {
    const data = {
      area: v.area,
      method: "OTHER" as const,
      titleEn: v.title.en,
      titleTa: v.title.ta,
      descriptionEn: VERIFICATION_TEXT.en,
      descriptionTa: VERIFICATION_TEXT.ta,
      referenceNumber: null,
      externalUrl: null,
      documentId: docIds[v.document] ?? null,
      projectId: v.project ? (projectIds[v.project] ?? null) : null,
      sortOrder: index,
      ...published(docIds[v.document] ? "PUBLISHED" : "DRAFT", "2026-01-10"),
      isDemo: true,
    };
    await db.verificationRecord.upsert({ where: { id: id("verification", v.key) }, create: { id: id("verification", v.key), ...data }, update: data });
  }

  // News & events
  for (const n of NEWS) {
    const newsId = id("news", n.key);
    if (!(await slugFree((slug) => db.newsPost.findUnique({ where: { slug }, select: { id: true, isDemo: true } }), n.slug, newsId, "news post"))) continue;
    const content = withNote(n.content);
    const data = {
      slug: n.slug,
      kind: n.kind,
      titleEn: n.title.en,
      titleTa: n.title.ta,
      excerptEn: n.excerpt.en,
      excerptTa: n.excerpt.ta,
      contentEn: content.en,
      contentTa: content.ta,
      date: day(n.date),
      eventStart: n.event ? day(n.event.start) : null,
      eventEnd: n.event?.end ? day(n.event.end) : null,
      eventLocationEn: n.event?.place.en ?? null,
      eventLocationTa: n.event?.place.ta ?? null,
      authorName: "Demo Editorial Team",
      categoryId: cat("NEWS", n.category),
      coverId: media[n.cover],
      projectId: n.project ? (projectIds[n.project] ?? null) : null,
      activityId: n.activity ? (activityIds[n.activity] ?? null) : null,
      ...published(n.status, n.date),
      isDemo: true,
    };
    await db.newsPost.upsert({ where: { id: newsId }, create: { id: newsId, ...data }, update: data });
  }

  // FAQ
  for (const [index, f] of FAQS.entries()) {
    const data = {
      questionEn: f.question.en,
      questionTa: f.question.ta,
      answerEn: f.answer.en,
      answerTa: f.answer.ta,
      sortOrder: index,
      ...published("PUBLISHED", "2026-01-10"),
      isDemo: true,
    };
    await db.faq.upsert({ where: { id: id("faq", f.key) }, create: { id: id("faq", f.key), ...data }, update: data });
  }

  // Contact messages (example.com addresses only)
  for (const m of MESSAGES) {
    const createdAt = day(m.at);
    const data = {
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      message: m.message,
      locale: m.locale,
      status: m.status,
      readAt: m.status === "UNREAD" ? null : new Date(createdAt.getTime() + 86_400_000),
      createdAt,
      isDemo: true,
    };
    await db.contactMessage.upsert({ where: { id: id("message", m.key) }, create: { id: id("message", m.key), ...data }, update: data });
  }

  await seedIdentity(db, media);
}

/** Trust profile, SEO settings and social links — only while no official data exists. */
async function seedIdentity(db: Db, media: Record<DemoMediaKey, string>) {
  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  if (!profile || profile.isDemo || profile.nameEn === PENDING) {
    const data = {
      nameEn: PROFILE.name.en,
      nameTa: PROFILE.name.ta,
      shortNameEn: PROFILE.shortName.en,
      shortNameTa: PROFILE.shortName.ta,
      taglineEn: PROFILE.tagline.en,
      taglineTa: PROFILE.tagline.ta,
      heroTextEn: PROFILE.heroText.en,
      heroTextTa: PROFILE.heroText.ta,
      aboutEn: PROFILE.about.en,
      aboutTa: PROFILE.about.ta,
      historyEn: PROFILE.history.en,
      historyTa: PROFILE.history.ta,
      purposeEn: PROFILE.purpose.en,
      purposeTa: PROFILE.purpose.ta,
      geographicFocusEn: PROFILE.geographicFocus.en,
      geographicFocusTa: PROFILE.geographicFocus.ta,
      visionEn: PROFILE.vision.en,
      visionTa: PROFILE.vision.ta,
      missionEn: PROFILE.mission.en,
      missionTa: PROFILE.mission.ta,
      // Deliberately empty: no registration number, office, date, legal status or document is invented.
      registrationNumber: null,
      registrationOfficeEn: null,
      registrationOfficeTa: null,
      registrationDate: null,
      legalStatusEn: null,
      legalStatusTa: null,
      registrationDocumentId: null,
      officialAddressEn: PROFILE.officialAddress.en,
      officialAddressTa: PROFILE.officialAddress.ta,
      establishedDate: day(PROFILE.establishedDate),
      publicEmail: PROFILE.publicEmail,
      publicPhone: PROFILE.publicPhone,
      officeHoursEn: PROFILE.officeHours.en,
      officeHoursTa: PROFILE.officeHours.ta,
      mapUrl: null,
      logoId: null,
      heroImageId: media.community,
      isDemo: true,
    };
    await db.trustProfile.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
  } else {
    console.log("  ↷ Official trust profile present — left unchanged.");
  }

  const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
  if (!settings || settings.isDemo || settings.seoTitleEn === PENDING) {
    const data = {
      seoTitleEn: SETTINGS.seoTitle.en,
      seoTitleTa: SETTINGS.seoTitle.ta,
      seoDescriptionEn: SETTINGS.seoDescription.en,
      seoDescriptionTa: SETTINGS.seoDescription.ta,
      seoKeywords: SETTINGS.seoKeywords,
      footerNoteEn: SETTINGS.footerNote.en,
      footerNoteTa: SETTINGS.footerNote.ta,
      contactEnabled: true,
      isDemo: true,
    };
    await db.siteSetting.upsert({
      where: { id: "default" },
      create: { id: "default", ...data, navigation: [] },
      update: data,
    });
  } else {
    console.log("  ↷ Official site settings present — left unchanged.");
  }

  for (const [index, link] of SOCIAL_LINKS.entries()) {
    const existing = await db.socialLink.findUnique({ where: { platform: link.platform } });
    if (existing && !existing.isDemo) continue;
    const data = { label: link.label, url: link.url, isVisible: true, sortOrder: index, isDemo: true };
    await db.socialLink.upsert({ where: { platform: link.platform }, create: { id: id("social", link.platform), platform: link.platform, ...data }, update: data });
  }
}

// ─── Removal ────────────────────────────────────────────────────────────────

/** Deletes demo rows only (isDemo = true) and resets demo identity to placeholders. */
export async function clearDemo(db: Db) {
  const demo = { where: { isDemo: true } };
  const results = await db.$transaction([
    db.galleryAlbum.deleteMany(demo),
    db.story.deleteMany(demo),
    db.newsPost.deleteMany(demo),
    db.testimonial.deleteMany(demo),
    db.impactMetric.deleteMany(demo),
    db.verificationRecord.deleteMany(demo),
    db.certificate.deleteMany(demo),
    db.annualReport.deleteMany(demo),
    db.activity.deleteMany(demo),
    db.project.deleteMany(demo),
    db.historyEvent.deleteMany(demo),
    db.trustObjective.deleteMany(demo),
    db.faq.deleteMany(demo),
    db.trustee.deleteMany(demo),
    db.document.deleteMany(demo),
    db.contactMessage.deleteMany(demo),
    db.socialLink.deleteMany(demo),
    db.media.deleteMany(demo),
  ]);

  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  if (profile?.isDemo) {
    const cleared: Record<string, null> = {};
    for (const [key, value] of Object.entries(profile)) {
      if (!["id", "nameEn", "isDemo", "createdAt", "updatedAt"].includes(key) && value !== null) cleared[key] = null;
    }
    await db.trustProfile.update({ where: { id: "default" }, data: { ...cleared, nameEn: PENDING, isDemo: false } });
  }
  const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
  if (settings?.isDemo) {
    await db.siteSetting.update({
      where: { id: "default" },
      data: {
        seoTitleEn: PENDING,
        seoTitleTa: null,
        seoDescriptionEn: PENDING,
        seoDescriptionTa: null,
        seoKeywords: [],
        footerNoteEn: null,
        footerNoteTa: null,
        isDemo: false,
      },
    });
  }
  return results.reduce((sum, r) => sum + r.count, 0);
}

// ─── Summary ────────────────────────────────────────────────────────────────

/** Counts only — never credentials or personal data. */
export async function printSummary(db: Db) {
  const demo = { where: { isDemo: true } };
  const [profile, founders, trustees, objectives, history, activities, projects, orgMetrics, projectMetrics, testimonials, stories, documents, reports, certificates, verification, albums, news, faqs, messages, media, categories, admins] =
    await Promise.all([
      db.trustProfile.count(demo),
      db.trustee.count({ where: { isDemo: true, isFounder: true } }),
      db.trustee.count(demo),
      db.trustObjective.count(demo),
      db.historyEvent.count(demo),
      db.activity.count(demo),
      db.project.count(demo),
      db.impactMetric.count({ where: { isDemo: true, projectId: null } }),
      db.impactMetric.count({ where: { isDemo: true, projectId: { not: null } } }),
      db.testimonial.count(demo),
      db.story.count(demo),
      db.document.count(demo),
      db.annualReport.count(demo),
      db.certificate.count(demo),
      db.verificationRecord.count(demo),
      db.galleryAlbum.count(demo),
      db.newsPost.count(demo),
      db.faq.count(demo),
      db.contactMessage.count(demo),
      db.media.count(demo),
      db.category.count(),
      db.user.count({ where: { role: "ADMIN" } }),
    ]);
  const rows: [string, number][] = [
    ["Trust Profiles (demo)", profile],
    ["Founders", founders],
    ["Trustees", trustees],
    ["Objectives", objectives],
    ["History Events", history],
    ["Activities", activities],
    ["Projects", projects],
    ["Impact Metrics (organisation)", orgMetrics],
    ["Impact Metrics (per project)", projectMetrics],
    ["Testimonials", testimonials],
    ["Stories", stories],
    ["Documents", documents],
    ["Reports", reports],
    ["Certificates", certificates],
    ["Verification Records", verification],
    ["Gallery Albums", albums],
    ["News Posts", news],
    ["FAQs", faqs],
    ["Contact Messages", messages],
    ["Demo Media Files", media],
    ["Categories (all)", categories],
    ["Admin Users", admins],
  ];
  const width = Math.max(...rows.map(([label]) => label.length));
  console.log("\nSeed summary (demo records are marked isDemo = true):");
  for (const [label, count] of rows) console.log(`  ${label.padEnd(width)}  ${count}`);
}
