/**
 * Production-safe seed. Creates ONLY structure — never trust facts:
 *   • the first admin user (from ADMIN_EMAIL / ADMIN_PASSWORD)
 *   • trust profile + site settings singletons, with every official field
 *     left empty or marked "[Content pending official information]"
 *   • category lists (activity, project, document, news, gallery)
 *
 * Official information (name, registration, trustees, objectives, figures…)
 * must be entered in the admin from the trust's own documents.
 * Safe to re-run. For layout previews see `npm run db:seed:demo`.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { CategoryType } from "../src/generated/prisma/enums";

const PENDING = "[Content pending official information]";
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const CATEGORIES: Record<CategoryType, [slug: string, en: string, ta: string][]> = {
  ACTIVITY: [
    ["education", "Education", "கல்வி"],
    ["social-welfare", "Social Welfare", "சமூக நலன்"],
    ["community", "Community", "சமூகம்"],
    ["health", "Health", "சுகாதாரம்"],
    ["events", "Events", "நிகழ்வுகள்"],
    ["other", "Other", "மற்றவை"],
  ],
  PROJECT: [
    ["education", "Education", "கல்வி"],
    ["social-welfare", "Social Welfare", "சமூக நலன்"],
    ["community-development", "Community Development", "சமூக மேம்பாடு"],
    ["health", "Health", "சுகாதாரம்"],
    ["other", "Other", "மற்றவை"],
  ],
  DOCUMENT: [
    ["trust-documents", "Trust Documents", "அறக்கட்டளை ஆவணங்கள்"],
    ["registration", "Registration", "பதிவு"],
    ["annual-reports", "Annual Reports", "ஆண்டறிக்கைகள்"],
    ["audit-reports", "Audit Reports", "தணிக்கை அறிக்கைகள்"],
    ["certificates", "Certificates", "சான்றிதழ்கள்"],
    ["policies", "Policies", "கொள்கைகள்"],
    ["publications", "Publications", "வெளியீடுகள்"],
    ["other", "Other", "மற்றவை"],
  ],
  NEWS: [
    ["updates", "Updates", "புதிய தகவல்கள்"],
    ["announcements", "Announcements", "அறிவிப்புகள்"],
    ["events", "Events", "நிகழ்வுகள்"],
  ],
  GALLERY: [
    ["education", "Education", "கல்வி"],
    ["social-welfare", "Social Welfare", "சமூக நலன்"],
    ["community", "Community", "சமூகம்"],
    ["health", "Health", "சுகாதாரம்"],
    ["events", "Events", "நிகழ்வுகள்"],
    ["other", "Other", "மற்றவை"],
  ],
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin ${email} already exists (unchanged).`);
    return;
  }
  await db.user.create({
    data: { email, name: process.env.ADMIN_NAME ?? "Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✓ Created admin ${email}`);
}

async function seedSingletons() {
  await db.trustProfile.upsert({
    where: { id: "default" },
    update: {},
    // Only the required name is set, and it is explicitly marked as pending.
    create: { id: "default", nameEn: PENDING },
  });
  await db.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      seoTitleEn: PENDING,
      seoDescriptionEn: PENDING,
      seoKeywords: [],
      navigation: [],
    },
  });
  console.log("✓ Trust profile & settings (pending official information)");
}

async function seedCategories() {
  for (const [type, rows] of Object.entries(CATEGORIES) as [CategoryType, (typeof CATEGORIES)[CategoryType]][]) {
    for (const [index, [slug, nameEn, nameTa]] of rows.entries()) {
      await db.category.upsert({
        where: { type_slug: { type, slug } },
        update: {},
        create: { type, slug, nameEn, nameTa, sortOrder: index },
      });
    }
  }
  console.log("✓ Categories");
}

async function main() {
  await seedAdmin();
  await seedSingletons();
  await seedCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
