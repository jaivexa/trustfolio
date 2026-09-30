/**
 * `npx prisma db seed` / `npm run db:seed`
 *
 * 1. Admin user from ADMIN_EMAIL / ADMIN_PASSWORD (required; never printed).
 * 2. Trust profile + site settings singletons, created with official fields
 *    empty or marked "[Content pending official information]".
 * 3. Category lists (English + Tamil).
 * 4. DEMO dataset — fictional "Aram Community Trust", every row isDemo = true.
 *    On by default outside production. Control it with SEED_DEMO=true|false.
 *
 * Idempotent: every write is an upsert on a stable key, and nothing is ever
 * deleted here. To remove demo data use `npm run db:demo:clear`; to rebuild it
 * use `npm run db:reset-demo`.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { CategoryType } from "../src/generated/prisma/enums";
import { passwordSchema } from "../src/lib/validations/auth";
import { PENDING, printSummary, seedDemo } from "./demo/seed-demo";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type Row = [slug: string, en: string, ta: string];

const PROGRAMME_CATEGORIES: Row[] = [
  ["education", "Education", "கல்வி"],
  ["community-development", "Community Development", "சமூக மேம்பாடு"],
  ["youth", "Youth", "இளைஞர்கள்"],
  ["women-empowerment", "Women Empowerment", "பெண்கள் முன்னேற்றம்"],
  ["health", "Health", "சுகாதாரம்"],
  ["environment", "Environment", "சுற்றுச்சூழல்"],
  ["social-welfare", "Social Welfare", "சமூக நலன்"],
  ["events", "Events", "நிகழ்வுகள்"],
];

const CATEGORIES: Record<CategoryType, Row[]> = {
  ACTIVITY: [...PROGRAMME_CATEGORIES, ["other", "Other", "மற்றவை"]],
  PROJECT: [...PROGRAMME_CATEGORIES, ["other", "Other", "மற்றவை"]],
  GALLERY: [...PROGRAMME_CATEGORIES, ["other", "Other", "மற்றவை"]],
  NEWS: [...PROGRAMME_CATEGORIES, ["updates", "Updates", "புதிய தகவல்கள்"], ["announcements", "Announcements", "அறிவிப்புகள்"]],
  DOCUMENT: [
    ["trust-documents", "Trust Documents", "அறக்கட்டளை ஆவணங்கள்"],
    ["registration", "Registration", "பதிவு"],
    ["annual-reports", "Annual Reports", "ஆண்டு அறிக்கைகள்"],
    ["audit-reports", "Audit Reports", "தணிக்கை அறிக்கைகள்"],
    ["certificates", "Certificates", "சான்றிதழ்கள்"],
    ["policies", "Policies", "கொள்கைகள்"],
    ["publications", "Publications", "வெளியீடுகள்"],
    ["other", "Other", "மற்றவை"],
  ],
};

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set (see .env.example). The seed never uses a built-in password.");
  }
  const strength = passwordSchema.safeParse(password);
  if (!strength.success) {
    throw new Error(`ADMIN_PASSWORD is too weak: ${strength.error.issues.map((i) => i.message).join("; ")}.`);
  }
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Keep a password changed in the dashboard unless a reset is explicitly requested.
    const reset = process.env.ADMIN_RESET_PASSWORD === "true";
    await db.user.update({
      where: { email },
      data: { role: "ADMIN", name: existing.name ?? name, ...(reset ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
    });
    console.log(`✓ Admin user updated${reset ? " (password reset from ADMIN_PASSWORD)" : ""}`);
    return;
  }
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  console.log("✓ Admin user created");
}

async function seedSingletons() {
  await db.trustProfile.upsert({ where: { id: "default" }, update: {}, create: { id: "default", nameEn: PENDING } });
  await db.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", seoTitleEn: PENDING, seoDescriptionEn: PENDING, seoKeywords: [], navigation: [] },
  });
  console.log("✓ Trust profile & settings singletons");
}

async function seedCategories() {
  for (const [type, rows] of Object.entries(CATEGORIES) as [CategoryType, Row[]][]) {
    for (const [index, [slug, nameEn, nameTa]] of rows.entries()) {
      await db.category.upsert({
        where: { type_slug: { type, slug } },
        // Names are kept if an admin has edited them.
        update: {},
        create: { type, slug, nameEn, nameTa, sortOrder: index },
      });
    }
  }
  console.log("✓ Categories");
}

function demoEnabled() {
  const flag = process.env.SEED_DEMO?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}

async function main() {
  await seedAdmin();
  await seedSingletons();
  await seedCategories();
  if (demoEnabled()) {
    await seedDemo(db);
    console.log("✓ Demo data (fictional — remove with `npm run db:demo:clear`)");
  } else {
    console.log("• Demo data skipped (SEED_DEMO=false or NODE_ENV=production)");
  }
  await printSummary(db);
  console.log("\nA running site keeps cached pages: use “Refresh public website” on the admin dashboard to show the new data now.");
}

main()
  .catch((error: unknown) => {
    console.error(`✗ Seed failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
