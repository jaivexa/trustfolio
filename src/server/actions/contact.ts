"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { format } from "@/lib/i18n/localized";
import { getClientIp, hashIdentifier, rateLimit } from "@/lib/rate-limit";
import { contactErrorText, contactSchema, contactSpamSchema, type ContactInput } from "@/lib/validations/contact";
import type { ActionState } from "@/lib/action-state";
import { getSettings } from "@/server/queries/public";

const MIN_FILL_TIME_MS = 3000;
const PER_IP_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 };
const PER_EMAIL_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 };

export type ContactState = ActionState<ContactInput>;

/**
 * Public contact form handler, bound to a locale so every message comes back
 * in the visitor's language. Protection layers: Zod → honeypot + minimum fill
 * time → per-IP and per-email rate limits (Postgres-backed) → persistence.
 */
export async function submitContact(locale: Locale, _prev: ContactState, formData: FormData): Promise<ContactState> {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const t = getDictionary(lang);
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const settings = await getSettings();
  if (!settings.contactEnabled) return { status: "error", message: t.contact.closed, values: raw };

  const spam = contactSpamSchema.safeParse({ company: formData.get("company") ?? "", startedAt: formData.get("startedAt") });
  // Bots get a generic success so they learn nothing; nothing is stored.
  if (!spam.success || Date.now() - spam.data.startedAt < MIN_FILL_TIME_MS) {
    return { status: "success", message: t.contact.success };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string[]>> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      (fieldErrors[key] ??= []).push(contactErrorText(t, issue.message));
    }
    return { status: "error", message: t.contact.fixFields, fieldErrors, values: raw };
  }
  const data = parsed.data;

  const ipHash = hashIdentifier(await getClientIp());
  const [ipLimit, emailLimit] = await Promise.all([
    rateLimit(`contact:ip:${ipHash}`, PER_IP_LIMIT),
    rateLimit(`contact:email:${hashIdentifier(data.email.toLowerCase())}`, PER_EMAIL_LIMIT),
  ]);
  if (!ipLimit.success || !emailLimit.success) {
    const resetAt = Math.max(ipLimit.resetAt.getTime(), emailLimit.success ? 0 : emailLimit.resetAt.getTime());
    const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
    return { status: "error", message: format(t.contact.rateLimited, { minutes }), values: raw };
  }

  try {
    const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
    await db.contactMessage.create({ data: { ...data, phone: data.phone ?? null, locale: lang, ipHash, userAgent } });
  } catch (error) {
    console.error("[contact] Failed to store message", error);
    return { status: "error", message: t.contact.serverError, values: raw };
  }

  const notifyTo = env().CONTACT_NOTIFY_EMAIL;
  if (notifyTo) {
    after(() =>
      sendEmail({
        to: notifyTo,
        replyTo: data.email,
        subject: `New enquiry: ${data.subject}`,
        text: `From: ${data.name} <${data.email}>${data.phone ? `\nPhone: ${data.phone}` : ""}\nLanguage: ${lang}\n\n${data.message}`,
      }),
    );
  }

  return { status: "success", message: t.contact.success };
}
