/**
 * DEMO CONTENT — for previewing layouts only. Never official information.
 *
 *   npm run db:seed:demo        # add clearly labelled sample content
 *   npm run db:demo:clear       # remove every demo record
 *
 * Every record is prefixed "Sample" / "மாதிரி", uses a `demo-` slug and
 * `/demo/…` media, so it is obvious on the site and removable in one command.
 * Refuses to run when NODE_ENV=production unless `--force` is passed.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const NOTE_EN = "Sample content for previewing the design. Replace with official information before launch.";
const NOTE_TA = "வடிவமைப்பை முன்னோட்டமிடுவதற்கான மாதிரி உள்ளடக்கம். வெளியீட்டிற்கு முன் அதிகாரப்பூர்வ தகவல்களால் மாற்றவும்.";
const PUBLISHED = { status: "PUBLISHED" as const, publishedAt: new Date() };

async function media(key: string, mimeType: string, altEn: string, altTa: string, width?: number, height?: number) {
  const url = `/demo/${key}`;
  return db.media.upsert({
    where: { storageKey: `demo/${key}` },
    update: {},
    create: { url, storageKey: `demo/${key}`, filename: key, mimeType, size: 4096, width, height, altEn, altTa, captionEn: "Sample image", captionTa: "மாதிரிப் படம்" },
  });
}

async function category(type: "ACTIVITY" | "PROJECT" | "DOCUMENT" | "NEWS" | "GALLERY", slug: string) {
  return db.category.findUnique({ where: { type_slug: { type, slug } } });
}

async function main() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
    throw new Error("Refusing to seed demo content in production. Pass --force if you really mean it.");
  }
  if (await db.project.findFirst({ where: { slug: { startsWith: "demo-" } } })) {
    console.log("✓ Demo content already present.");
    return;
  }

  const covers = await Promise.all(
    [1, 2, 3, 4, 5, 6].map((n) => media(`cover-${n}.svg`, "image/svg+xml", `Sample illustration ${n}`, `மாதிரி விளக்கப்படம் ${n}`, 1200, 630)),
  );
  const details = await Promise.all([
    media("detail-a.svg", "image/svg+xml", "Sample detail illustration", "மாதிரி விளக்கப்படம்", 1200, 630),
    media("detail-b.svg", "image/svg+xml", "Sample diagram", "மாதிரி வரைபடம்", 1200, 630),
  ]);
  const people = await Promise.all([1, 2, 3].map((n) => media(`person-${n}.svg`, "image/svg+xml", "Placeholder portrait", "மாதிரி உருவப்படம்", 400, 480)));
  const certImage = await media("certificate.svg", "image/svg+xml", "Sample certificate", "மாதிரிச் சான்றிதழ்", 600, 420);
  const pdf = await media("sample-document.pdf", "application/pdf", "Sample document", "மாதிரி ஆவணம்");

  // Profile: only fill fields that are still empty, and mark them as demo.
  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  const fill = <T,>(current: T | null | undefined, value: T) => (current == null || String(current).includes("pending") ? value : current);
  await db.trustProfile.update({
    where: { id: "default" },
    data: {
      nameEn: fill(profile?.nameEn, "[DEMO] Sample Charitable Trust"),
      nameTa: fill(profile?.nameTa, "[DEMO] மாதிரி அறக்கட்டளை"),
      taglineEn: fill(profile?.taglineEn, "[DEMO] Serving communities with care, transparency and accountability."),
      taglineTa: fill(profile?.taglineTa, "[DEMO] அக்கறை, வெளிப்படைத்தன்மை மற்றும் பொறுப்புணர்வுடன் சமூகத்திற்குச் சேவை."),
      heroTextEn: fill(profile?.heroTextEn, `[DEMO] ${NOTE_EN}`),
      heroTextTa: fill(profile?.heroTextTa, `[DEMO] ${NOTE_TA}`),
      aboutEn: fill(profile?.aboutEn, `[DEMO] ${NOTE_EN}`),
      aboutTa: fill(profile?.aboutTa, `[DEMO] ${NOTE_TA}`),
      visionEn: fill(profile?.visionEn, "[DEMO] A sample vision statement will appear here."),
      visionTa: fill(profile?.visionTa, "[DEMO] மாதிரி நோக்க அறிக்கை இங்கே தோன்றும்."),
      missionEn: fill(profile?.missionEn, "[DEMO] A sample mission statement will appear here."),
      missionTa: fill(profile?.missionTa, "[DEMO] மாதிரி செயல்நோக்க அறிக்கை இங்கே தோன்றும்."),
      heroImageId: profile?.heroImageId ?? covers[1]!.id,
    },
  });

  const [catEdu, catHealth, catCommunity] = await Promise.all([
    category("PROJECT", "education"),
    category("PROJECT", "health"),
    category("PROJECT", "community-development"),
  ]);
  const [aEdu, aHealth, aCommunity, aEvents] = await Promise.all([
    category("ACTIVITY", "education"),
    category("ACTIVITY", "health"),
    category("ACTIVITY", "community"),
    category("ACTIVITY", "events"),
  ]);
  const docReports = await category("DOCUMENT", "annual-reports");
  const docPolicies = await category("DOCUMENT", "policies");
  const galleryCat = await category("GALLERY", "education");
  const newsCat = await category("NEWS", "updates");

  for (const [i, [en, ta, icon]] of [
    ["Sample objective: education support", "மாதிரிக் குறிக்கோள்: கல்வி ஆதரவு", "graduation-cap"],
    ["Sample objective: community health", "மாதிரிக் குறிக்கோள்: சமூக சுகாதாரம்", "stethoscope"],
    ["Sample objective: social welfare", "மாதிரிக் குறிக்கோள்: சமூக நலன்", "hand-heart"],
  ].entries()) {
    await db.trustObjective.create({
      data: { titleEn: en!, titleTa: ta, descriptionEn: NOTE_EN, descriptionTa: NOTE_TA, icon: icon!, sortOrder: i, sourceReference: "Sample reference — replace with the trust deed clause", ...PUBLISHED },
    });
  }

  const founder = await db.trustee.create({
    data: {
      slug: "demo-founder",
      nameEn: "Sample Founder",
      nameTa: "மாதிரி நிறுவனர்",
      positionEn: "Founder & Managing Trustee (sample)",
      positionTa: "நிறுவனர் & நிர்வாக அறங்காவலர் (மாதிரி)",
      photoId: people[0]!.id,
      bioEn: NOTE_EN,
      bioTa: NOTE_TA,
      isFounder: true,
      visionEn: NOTE_EN,
      visionTa: NOTE_TA,
      contributionEn: NOTE_EN,
      contributionTa: NOTE_TA,
      responsibilitiesEn: ["Sample responsibility one", "Sample responsibility two"],
      responsibilitiesTa: ["மாதிரிப் பொறுப்பு ஒன்று", "மாதிரிப் பொறுப்பு இரண்டு"],
      publicationConsent: true,
      sortOrder: 0,
      ...PUBLISHED,
    },
  });
  for (const [i, [en, ta]] of [
    ["Sample Trustee A", "மாதிரி அறங்காவலர் அ"],
    ["Sample Trustee B", "மாதிரி அறங்காவலர் ஆ"],
  ].entries()) {
    await db.trustee.create({
      data: {
        slug: `demo-trustee-${i + 1}`,
        nameEn: en!,
        nameTa: ta,
        positionEn: "Trustee (sample)",
        positionTa: "அறங்காவலர் (மாதிரி)",
        photoId: people[i + 1]!.id,
        bioEn: NOTE_EN,
        bioTa: i === 0 ? NOTE_TA : null,
        responsibilitiesEn: ["Sample responsibility"],
        responsibilitiesTa: [],
        publicationConsent: true,
        sortOrder: i + 1,
        ...PUBLISHED,
      },
    });
  }

  for (const [i, [year, en, ta]] of [
    [2019, "Sample milestone: foundation", "மாதிரி மைல்கல்: தொடக்கம்"],
    [2020, "Sample milestone: registration", "மாதிரி மைல்கல்: பதிவு"],
    [2023, "Sample milestone: first major programme", "மாதிரி மைல்கல்: முதல் பெரிய திட்டம்"],
    [2026, "Sample milestone: current period", "மாதிரி மைல்கல்: தற்போதைய காலம்"],
  ].entries()) {
    await db.historyEvent.create({
      data: {
        date: new Date(`${year}-0${i + 2}-01`),
        titleEn: String(en),
        titleTa: String(ta),
        descriptionEn: NOTE_EN,
        descriptionTa: NOTE_TA,
        imageId: i === 2 ? covers[2]!.id : null,
        trusteeId: i < 2 ? founder.id : null,
        ...PUBLISHED,
      },
    });
  }

  const policy = await db.document.create({
    data: {
      slug: "demo-sample-policy",
      titleEn: "Sample policy document",
      titleTa: "மாதிரிக் கொள்கை ஆவணம்",
      descriptionEn: NOTE_EN,
      descriptionTa: NOTE_TA,
      categoryId: docPolicies?.id,
      language: "BILINGUAL",
      year: 2026,
      documentDate: new Date("2026-04-01"),
      fileId: pdf.id,
      version: "1.0",
      sourceEn: "Sample source",
      ...PUBLISHED,
    },
  });
  const reportDoc = await db.document.create({
    data: {
      slug: "demo-annual-report-2025-26",
      titleEn: "Sample annual report 2025–26 (PDF)",
      titleTa: "மாதிரி ஆண்டறிக்கை 2025–26 (PDF)",
      descriptionEn: NOTE_EN,
      categoryId: docReports?.id,
      language: "EN",
      year: 2026,
      documentDate: new Date("2026-06-30"),
      fileId: pdf.id,
      version: "1.0",
      ...PUBLISHED,
    },
  });

  const projectDefs = [
    ["demo-education-support", "Sample project: education support", "மாதிரித் திட்டம்: கல்வி ஆதரவு", catEdu?.id, "ONGOING" as const, covers[0]!.id, true],
    ["demo-community-health", "Sample project: community health", "மாதிரித் திட்டம்: சமூக சுகாதாரம்", catHealth?.id, "COMPLETED" as const, covers[1]!.id, false],
    ["demo-community-development", "Sample project: community development", "மாதிரித் திட்டம்: சமூக மேம்பாடு", catCommunity?.id, "PLANNED" as const, covers[2]!.id, false],
  ] as const;
  const projects: { id: string }[] = [];
  for (const [i, [slug, en, ta, categoryId, phase, coverId, featured]] of projectDefs.entries()) {
    projects.push(
      await db.project.create({
        data: {
          slug,
          titleEn: en,
          titleTa: ta,
          summaryEn: NOTE_EN,
          summaryTa: NOTE_TA,
          contentEn: `${NOTE_EN}\n\nThis paragraph demonstrates how long-form content is laid out.`,
          contentTa: NOTE_TA,
          needEn: NOTE_EN,
          needTa: i === 0 ? NOTE_TA : null,
          approachEn: NOTE_EN,
          objectivesEn: "- Sample objective one\n- Sample objective two",
          objectivesTa: "- மாதிரிக் குறிக்கோள் ஒன்று\n- மாதிரிக் குறிக்கோள் இரண்டு",
          categoryId,
          phase,
          startDate: new Date(`202${3 + i}-01-15`),
          locationEn: "Sample location",
          locationTa: "மாதிரி இடம்",
          coverId,
          isFeatured: featured,
          sortOrder: i,
          documents: { connect: i === 0 ? [{ id: reportDoc.id }, { id: policy.id }] : [] },
          ...PUBLISHED,
        },
      }),
    );
  }

  const activityDefs = [
    ["demo-activity-1", "Sample activity: study materials distribution", "மாதிரிச் செயல்பாடு: கல்விப் பொருட்கள் வழங்குதல்", aEdu?.id, 0, "2026-03-10", 120],
    ["demo-activity-2", "Sample activity: health awareness camp", "மாதிரிச் செயல்பாடு: சுகாதார விழிப்புணர்வு முகாம்", aHealth?.id, 1, "2026-01-22", 80],
    ["demo-activity-3", "Sample activity: community meeting", "மாதிரிச் செயல்பாடு: சமூகக் கூட்டம்", aCommunity?.id, 2, "2025-11-05", null],
    ["demo-activity-4", "Sample activity: annual event", "மாதிரிச் செயல்பாடு: ஆண்டு விழா", aEvents?.id, null, "2025-08-15", 150],
  ] as const;
  const activities: { id: string }[] = [];
  for (const [i, [slug, en, ta, categoryId, projectIndex, date, beneficiaries]] of activityDefs.entries()) {
    activities.push(
      await db.activity.create({
        data: {
          slug,
          titleEn: en,
          titleTa: ta,
          summaryEn: NOTE_EN,
          summaryTa: NOTE_TA,
          descriptionEn: NOTE_EN,
          descriptionTa: NOTE_TA,
          date: new Date(date),
          locationEn: "Sample location",
          locationTa: "மாதிரி இடம்",
          categoryId,
          coverId: covers[(i + 3) % 6]!.id,
          beneficiaries,
          beneficiariesNoteEn: beneficiaries ? "Sample figure — not real data" : null,
          projectId: projectIndex === null ? null : projects[projectIndex]!.id,
          documents: { connect: i === 0 ? [{ id: policy.id }] : [] },
          ...PUBLISHED,
        },
      }),
    );
  }

  const album = await db.galleryAlbum.create({
    data: {
      slug: "demo-album",
      titleEn: "Sample album",
      titleTa: "மாதிரிப் புகைப்படத் தொகுப்பு",
      descriptionEn: NOTE_EN,
      descriptionTa: NOTE_TA,
      categoryId: galleryCat?.id,
      date: new Date("2026-03-10"),
      locationEn: "Sample location",
      locationTa: "மாதிரி இடம்",
      activityId: activities[0]!.id,
      projectId: projects[0]!.id,
      images: { create: [...covers.slice(0, 4), ...details].map((m, i) => ({ mediaId: m.id, sortOrder: i })) },
      ...PUBLISHED,
    },
  });

  const report = await db.annualReport.create({
    data: {
      slug: "demo-2025-26",
      periodLabel: "2025–26",
      startYear: 2025,
      titleEn: "Sample annual report",
      titleTa: "மாதிரி ஆண்டறிக்கை",
      summaryEn: NOTE_EN,
      summaryTa: NOTE_TA,
      highlightsEn: "- Sample highlight one\n- Sample highlight two",
      highlightsTa: "- மாதிரிச் சிறப்பம்சம் ஒன்று\n- மாதிரிச் சிறப்பம்சம் இரண்டு",
      impactEn: NOTE_EN,
      financialEn: "Sample accountability section — no real financial data.",
      coverId: covers[4]!.id,
      documentEnId: reportDoc.id,
      ...PUBLISHED,
    },
  });

  const metric = (data: {
    key: string;
    en: string;
    ta: string;
    value: number;
    year: number;
    headline: boolean;
    categoryId?: string;
  }) =>
    db.impactMetric.create({
      data: {
        metricKey: data.key,
        labelEn: data.en,
        labelTa: data.ta,
        value: data.value,
        suffix: "+",
        periodStart: new Date(`${data.year - 1}-04-01`),
        periodEnd: new Date(`${data.year}-03-31`),
        periodLabelEn: `FY ${data.year - 1}–${String(data.year).slice(2)}`,
        periodLabelTa: `நிதியாண்டு ${data.year - 1}–${String(data.year).slice(2)}`,
        methodologyEn: "Sample methodology — demo figure, not real data.",
        methodologyTa: "மாதிரி முறை — இது உண்மையான தரவு அல்ல.",
        sourceDocumentId: reportDoc.id,
        reportId: data.year === 2026 ? report.id : null,
        projectId: projects[0]!.id,
        categoryId: data.categoryId,
        isHeadline: data.headline,
        activities: { connect: activities.slice(0, 2).map((a) => ({ id: a.id })) },
        ...PUBLISHED,
      },
    });
  await metric({ key: "demo-people", en: "Sample: people reached", ta: "மாதிரி: சென்றடைந்த மக்கள்", value: 350, year: 2026, headline: true, categoryId: aEdu?.id });
  await metric({ key: "demo-people", en: "Sample: people reached", ta: "மாதிரி: சென்றடைந்த மக்கள்", value: 210, year: 2025, headline: true, categoryId: aEdu?.id });
  await metric({ key: "demo-activities", en: "Sample: activities conducted", ta: "மாதிரி: நடத்தப்பட்ட செயல்பாடுகள்", value: 12, year: 2026, headline: true, categoryId: aHealth?.id });
  await metric({ key: "demo-communities", en: "Sample: communities supported", ta: "மாதிரி: ஆதரிக்கப்பட்ட சமூகங்கள்", value: 5, year: 2026, headline: true, categoryId: aCommunity?.id });

  await db.certificate.create({
    data: {
      kind: "CERTIFICATE",
      titleEn: "Sample certificate",
      titleTa: "மாதிரிச் சான்றிதழ்",
      issuerEn: "Sample issuing body",
      issuerTa: "மாதிரி வழங்கும் அமைப்பு",
      issuedAt: new Date("2025-02-01"),
      descriptionEn: NOTE_EN,
      imageId: certImage.id,
      ...PUBLISHED,
    },
  });
  await db.verificationRecord.create({
    data: {
      area: "REGISTRATION",
      method: "OFFICIAL_DOCUMENT",
      titleEn: "Sample verification record",
      titleTa: "மாதிரிச் சரிபார்ப்புப் பதிவு",
      descriptionEn: "Demonstrates how a registration record and its source are shown. Not a real record.",
      referenceNumber: "SAMPLE-0000",
      issuingAuthorityEn: "Sample authority",
      documentId: policy.id,
      lastCheckedAt: new Date(),
      ...PUBLISHED,
    },
  });

  await db.testimonial.create({
    data: {
      nameEn: "Sample Person",
      nameTa: "மாதிரி நபர்",
      roleEn: "Sample role",
      contentEn: "This is a sample testimonial used to preview the layout. It is not a real quotation.",
      contentTa: "இது வடிவமைப்பை முன்னோட்டமிடப் பயன்படுத்தப்படும் மாதிரிச் சான்றுரை. இது உண்மையான மேற்கோள் அல்ல.",
      date: new Date("2026-02-01"),
      relationshipEn: "Sample relationship",
      consentObtained: true,
      projectId: projects[0]!.id,
      ...PUBLISHED,
    },
  });

  await db.story.create({
    data: {
      slug: "demo-story",
      titleEn: "Sample story",
      titleTa: "மாதிரிக் கதை",
      summaryEn: NOTE_EN,
      summaryTa: NOTE_TA,
      subjectEn: "A sample community",
      challengeEn: NOTE_EN,
      supportEn: NOTE_EN,
      journeyEn: NOTE_EN,
      outcomeEn: NOTE_EN,
      coverId: covers[5]!.id,
      albumId: album.id,
      projectId: projects[0]!.id,
      consentObtained: true,
      anonymized: true,
      ...PUBLISHED,
    },
  });

  await db.newsPost.create({
    data: {
      slug: "demo-news",
      kind: "NEWS",
      titleEn: "Sample news update",
      titleTa: "மாதிரிச் செய்தி",
      excerptEn: NOTE_EN,
      excerptTa: NOTE_TA,
      contentEn: `${NOTE_EN}\n\nSample body paragraph.`,
      contentTa: NOTE_TA,
      date: new Date("2026-09-01"),
      categoryId: newsCat?.id,
      coverId: covers[3]!.id,
      activityId: activities[0]!.id,
      ...PUBLISHED,
    },
  });
  await db.newsPost.create({
    data: {
      slug: "demo-event",
      kind: "EVENT",
      titleEn: "Sample upcoming event",
      titleTa: "மாதிரி நிகழ்வு",
      excerptEn: NOTE_EN,
      excerptTa: NOTE_TA,
      contentEn: NOTE_EN,
      date: new Date("2026-09-15"),
      eventStart: new Date("2026-11-14T04:30:00Z"),
      eventLocationEn: "Sample venue",
      eventLocationTa: "மாதிரி அரங்கம்",
      coverId: covers[4]!.id,
      ...PUBLISHED,
    },
  });

  await db.faq.create({
    data: {
      questionEn: "Sample question?",
      questionTa: "மாதிரிக் கேள்வி?",
      answerEn: NOTE_EN,
      answerTa: NOTE_TA,
      ...PUBLISHED,
    },
  });

  console.log("✓ Demo content created. Remove it with: npm run db:demo:clear");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
