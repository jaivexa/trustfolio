/**
 * Removes every record created by `npm run db:seed:demo`.
 * Demo rows are identified by `demo-` slugs, `demo/` media keys, "Sample"
 * titles and "[DEMO]" profile text — official content is never touched.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const demoSlug = { slug: { startsWith: "demo-" } };
const sampleTitle = { titleEn: { startsWith: "Sample " } };

async function main() {
  const results = await db.$transaction([
    db.galleryAlbum.deleteMany({ where: demoSlug }),
    db.story.deleteMany({ where: demoSlug }),
    db.newsPost.deleteMany({ where: demoSlug }),
    db.impactMetric.deleteMany({ where: { metricKey: { startsWith: "demo-" } } }),
    db.testimonial.deleteMany({ where: { nameEn: "Sample Person" } }),
    db.verificationRecord.deleteMany({ where: sampleTitle }),
    db.certificate.deleteMany({ where: sampleTitle }),
    db.annualReport.deleteMany({ where: demoSlug }),
    db.activity.deleteMany({ where: demoSlug }),
    db.project.deleteMany({ where: demoSlug }),
    db.historyEvent.deleteMany({ where: { titleEn: { startsWith: "Sample milestone" } } }),
    db.trustObjective.deleteMany({ where: { titleEn: { startsWith: "Sample objective" } } }),
    db.faq.deleteMany({ where: { questionEn: "Sample question?" } }),
    db.trustee.deleteMany({ where: demoSlug }),
    db.document.deleteMany({ where: demoSlug }),
    db.media.deleteMany({ where: { storageKey: { startsWith: "demo/" } } }),
  ]);

  const profile = await db.trustProfile.findUnique({ where: { id: "default" } });
  if (profile) {
    const cleared: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(profile)) {
      if (typeof value === "string" && value.startsWith("[DEMO]")) {
        cleared[key] = key === "nameEn" ? "[Content pending official information]" : null;
      }
    }
    if (Object.keys(cleared).length) await db.trustProfile.update({ where: { id: "default" }, data: cleared });
  }

  console.log(`✓ Removed ${results.reduce((sum, r) => sum + r.count, 0)} demo records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
