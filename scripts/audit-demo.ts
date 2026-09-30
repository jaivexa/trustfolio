/**
 * Audits the seeded database for demo-data integrity:
 * relations, Tamil coverage, demo flags, absence of official claims or
 * sensitive data, and the project → activity → metric → evidence chain.
 *
 *   npm run db:audit-demo      (exits with code 1 when a check fails)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

let failures = 0;
const check = (ok: boolean, label: string, detail?: unknown) => {
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${label}${!ok && detail !== undefined ? ` — ${JSON.stringify(detail).slice(0, 400)}` : ""}`);
};

/** English-filled fields whose Tamil twin is empty. */
function missingTamil(row: Record<string, unknown>) {
  return Object.keys(row)
    .filter((k) => k.endsWith("En") && typeof row[k] === "string" && (row[k] as string).trim())
    .map((k) => k.slice(0, -2))
    .filter((stem) => `${stem}Ta` in row && !(typeof row[`${stem}Ta`] === "string" && (row[`${stem}Ta`] as string).trim()));
}

const FORBIDDEN = [
  /\bgovernment[- ]approved\b/i,
  /\bofficially registered\b/i,
  /\b(?:80G|12A|FCRA|CSR-1)\b/,
  /(?<!not |any |the )\baudited\b/i, // affirmative "audited" claims only
  /\bverified (?:client|testimonial|by)\b/i,
  /\baadhaa?r\b/i,
  /\b\d{4}\s?\d{4}\s?\d{4}\b/, // 12-digit ID-like numbers
  /\b[6-9]\d{9}\b/, // Indian mobile numbers
  /@(?!example\.(?:com|org)\b|trustfolio\.example\b)[a-z0-9-]+\.[a-z]{2,}/i, // e-mail outside reserved demo domains
];

async function main() {
  const demo = { where: { isDemo: true } };

  // 10. Demo flags: every content row created by the seed carries isDemo.
  const tables = {
    trustee: await db.trustee.findMany(),
    objective: await db.trustObjective.findMany(),
    history: await db.historyEvent.findMany(),
    project: await db.project.findMany({ include: { documents: true, activities: true, impactMetrics: true, testimonials: true, albums: true } }),
    activity: await db.activity.findMany({ include: { documents: true, albums: true } }),
    metric: await db.impactMetric.findMany({ include: { activities: true } }),
    testimonial: await db.testimonial.findMany(),
    story: await db.story.findMany(),
    document: await db.document.findMany(),
    report: await db.annualReport.findMany(),
    certificate: await db.certificate.findMany(),
    verification: await db.verificationRecord.findMany(),
    album: await db.galleryAlbum.findMany({ include: { images: true } }),
    news: await db.newsPost.findMany(),
    faq: await db.faq.findMany(),
    message: await db.contactMessage.findMany(),
    media: await db.media.findMany(),
    social: await db.socialLink.findMany(),
  };
  for (const [name, rows] of Object.entries(tables)) {
    const nonDemo = rows.filter((r) => !r.isDemo);
    check(rows.length > 0, `${name}: ${rows.length} rows (${nonDemo.length} non-demo)`);
    if (nonDemo.length) console.log(`   note: ${nonDemo.length} ${name} row(s) are real (isDemo = false) and are not audited as demo`);
  }
  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  check(Boolean(profile?.isDemo), "Trust profile is marked isDemo");

  // 1–2. Relations populated as designed.
  const projects = tables.project.filter((p) => p.isDemo);
  const activities = tables.activity.filter((a) => a.isDemo);
  check(activities.every((a) => a.categoryId), "Every demo activity has a category");
  check(projects.every((p) => p.categoryId && p.coverId), "Every demo project has a category and cover");
  check(tables.news.filter((n) => n.isDemo).every((n) => n.categoryId && n.coverId), "Every demo news post has a category and cover");
  check(tables.album.filter((a) => a.isDemo).every((a) => a.images.length >= 3 && a.coverId), "Every demo album has ≥3 images and a cover");
  check(tables.trustee.filter((t) => t.isDemo && t.isFounder).length === 1, "Exactly one demo founder");
  check(tables.story.filter((s) => s.isDemo).every((s) => s.albumId && s.activityId), "Every demo story links an album and activity (evidence)");
  check(tables.metric.filter((m) => m.isDemo && !m.projectId).every((m) => m.reportId), "Organisation metrics link an annual report");

  // 15. Project → activity → metric → evidence chain (Community Learning Hub).
  const hub = projects.find((p) => p.slug === "community-learning-hub");
  check(
    Boolean(hub && hub.activities.length === 2 && hub.impactMetrics.length === 2 && hub.testimonials.length === 1 && hub.albums.length === 1 && hub.documents.length === 1),
    "Community Learning Hub: 2 activities, 2 metrics, 1 testimonial, 1 album, 1 document",
    hub && { activities: hub.activities.length, metrics: hub.impactMetrics.length, testimonials: hub.testimonials.length, albums: hub.albums.length, documents: hub.documents.length },
  );
  const hubMetric = tables.metric.find((m) => m.metricKey === "learning-hub-participants");
  check(Boolean(hubMetric && hubMetric.activities.length === 2 && hubMetric.sourceDocumentId), "Hub participants metric → 2 activities + source document");
  const published = projects.filter((p) => p.status === "PUBLISHED" && p.phase !== "PLANNED");
  check(published.every((p) => p.activities.length > 0 && p.impactMetrics.length > 0), "Every active published demo project has activities and metrics");

  // 3. Tamil present (the draft "Annual Activity Review" is intentionally untranslated).
  const tamilGaps: string[] = [];
  for (const [name, rows] of Object.entries(tables)) {
    for (const row of rows as Record<string, unknown>[]) {
      if (!row.isDemo || row.slug === "annual-activity-review") continue;
      const gaps = missingTamil(row);
      if (gaps.length) tamilGaps.push(`${name}:${String(row.slug ?? row.id)}:${gaps.join(",")}`);
    }
  }
  if (profile) tamilGaps.push(...missingTamil(profile as unknown as Record<string, unknown>).map((g) => `profile:${g}`));
  check(tamilGaps.length === 0, "All demo English fields have Tamil (except the intentional draft)", tamilGaps);
  const draft = tables.news.find((n) => n.slug === "annual-activity-review");
  check(Boolean(draft && draft.status === "DRAFT" && !draft.contentTa), "Draft news keeps Tamil missing on purpose (admin test case)");

  // 6–8. No fake official claims, sensitive data or verification.
  check(!profile?.registrationNumber && !profile?.registrationDate && !profile?.legalStatusEn && !profile?.registrationDocumentId, "No registration number/date/legal status/document on demo profile");
  check(tables.certificate.filter((c) => c.isDemo).every((c) => !c.verificationUrl && c.credentialId?.startsWith("DEMO-CERT-") && /Demo/.test(c.issuerEn)), "Demo certificates: DEMO-CERT ids, fictional issuer, no verification link");
  check(tables.verification.filter((v) => v.isDemo).every((v) => v.method === "OTHER" && !v.referenceNumber && !v.externalUrl), "Demo verification records claim no registry/issuer check");
  check(tables.testimonial.filter((t) => t.isDemo).every((t) => !t.relationshipVerified), "No demo testimonial marked relationship-verified");
  check(tables.document.filter((d) => d.isDemo).every((d) => !/official|government|registered|audited/i.test(d.titleEn)), "No demo document titled official/government/registered/audited");
  check(tables.report.filter((r) => r.isDemo).every((r) => /No financial statements/.test(r.financialEn ?? "")), "Demo reports contain no financial statements");
  check(tables.social.filter((s) => s.isDemo).every((s) => /^https:\/\/example\.com|^mailto:demo@trustfolio\.example$/.test(s.url)), "Demo social links point to placeholders only");
  check(tables.message.filter((m) => m.isDemo).every((m) => /@example\.com$/.test(m.email) && (!m.phone || m.phone === "+91 00000 00000")), "Demo messages use example.com and placeholder phones");

  const texts: string[] = [];
  for (const rows of Object.values(tables)) for (const row of rows as Record<string, unknown>[]) if (row.isDemo) for (const v of Object.values(row)) if (typeof v === "string") texts.push(v);
  for (const v of Object.values(profile ?? {})) if (typeof v === "string") texts.push(v);
  const hits = texts.flatMap((t) => FORBIDDEN.filter((re) => re.test(t)).map((re) => `${re} in "${t.slice(0, 80)}"`));
  check(hits.length === 0, "No official-claim, ID-number, mobile-number or real-email patterns in demo text", hits);

  // 4. Slugs unique (also enforced by the schema).
  for (const [name, rows] of Object.entries(tables)) {
    const slugs = (rows as { slug?: string }[]).map((r) => r.slug).filter(Boolean);
    check(new Set(slugs).size === slugs.length, `${name}: slugs unique`);
  }

  // 9. Deterministic ids (no random duplicates).
  const randomIds = Object.entries(tables).flatMap(([name, rows]) =>
    (rows as { id: string; isDemo: boolean }[]).filter((r) => r.isDemo && name !== "social" && !r.id.startsWith("demo-")).map((r) => `${name}:${r.id}`),
  );
  check(randomIds.length === 0, "Every demo row has a deterministic demo-… id", randomIds);
  check((await db.media.count(demo)) === (await db.media.count({ where: { isDemo: true, storageKey: { startsWith: "demo/" } } })), "Demo media all use demo/ storage keys");

  console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
  process.exitCode = failures ? 1 : 0;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
