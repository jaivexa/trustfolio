import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

/**
 * Fixed-window rate limiter backed by Postgres so limits hold across
 * serverless instances without extra infrastructure. The upsert is a single
 * atomic statement, so concurrent requests cannot race past the limit.
 */
export async function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  const [row] = await db.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
    RETURNING "count", "expiresAt"
  `;

  // Opportunistic cleanup keeps the table small without a cron job.
  if (Math.random() < 0.02) {
    await db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => undefined);
  }

  const count = Number(row?.count ?? limit + 1);
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: row?.expiresAt ?? expiresAt,
  };
}

/** Clears a limiter key, e.g. after a successful login. */
export async function resetRateLimit(key: string) {
  await db.rateLimit.delete({ where: { key } }).catch(() => undefined);
}

/** Best-effort client IP from standard proxy headers. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** One-way hash so raw IPs are never persisted. */
export function hashIdentifier(value: string): string {
  return createHash("sha256")
    .update(`${value}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}
