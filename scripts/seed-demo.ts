/**
 * Adds (or refreshes) the fictional demo dataset only.
 *
 *   npm run db:seed:demo      # add/update demo rows (isDemo = true)
 *   npm run db:demo:clear     # remove every demo row
 *   npm run db:reset-demo     # clear, then seed demo again
 *
 * Refuses to run with NODE_ENV=production unless `--force` is passed.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { printSummary, seedDemo } from "../prisma/demo/seed-demo";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
    throw new Error("Refusing to seed demo content with NODE_ENV=production. Pass --force if you really mean it.");
  }
  if (!(await db.category.count())) throw new Error("Run `npm run db:seed` first (categories are missing).");
  await seedDemo(db);
  await printSummary(db);
}

main()
  .catch((error: unknown) => {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
