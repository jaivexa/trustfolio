/**
 * Removes every demo record (isDemo = true) and resets a demo trust profile
 * and demo site settings back to "[Content pending official information]".
 * Official (non-demo) records are never touched.
 *
 *   npm run db:demo:clear
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { clearDemo } from "../prisma/demo/seed-demo";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

clearDemo(db)
  .then((count) => console.log(`✓ Removed ${count} demo records.`))
  .catch((error: unknown) => {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
