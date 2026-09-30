/**
 * Creates an admin user or resets an existing user's password.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name"
 *
 * The password is read from ADMIN_PASSWORD or prompted interactively (hidden).
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { passwordSchema } from "../src/lib/validations/auth";

async function promptHidden(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const output = rl as unknown as { _writeToOutput: (s: string) => void };
  let muted = false;
  const original = output._writeToOutput.bind(rl);
  output._writeToOutput = (s: string) => (muted ? original("") : original(s));
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      role: { type: "string", default: "ADMIN" },
    },
  });

  const email = (values.email ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase();
  if (!email) throw new Error("Provide --email or set ADMIN_EMAIL");
  const role = values.role === "EDITOR" ? "EDITOR" : "ADMIN";

  const password = process.env.ADMIN_PASSWORD || (await promptHidden("Password: "));
  const checked = passwordSchema.safeParse(password);
  if (!checked.success) {
    throw new Error(`Weak password:\n${checked.error.issues.map((i) => `  • ${i.message}`).join("\n")}`);
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.upsert({
      where: { email },
      update: { passwordHash, role, ...(values.name ? { name: values.name } : {}) },
      create: { email, passwordHash, role, name: values.name ?? process.env.ADMIN_NAME ?? null },
    });
    console.log(`✓ ${user.email} is ready (role: ${user.role}).`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
