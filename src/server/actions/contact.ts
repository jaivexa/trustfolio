"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { getClientIp, hashIdentifier, rateLimit } from "@/lib/rate-limit";
import { contactSchema, contactSpamSchema, type ContactInput } from "@/lib/validations/contact";
import { fieldErrorsFrom, type ActionState } from "@/lib/action-state";
import { getSiteSettings } from "@/server/queries/public";

const MIN_FILL_TIME_MS = 3000;
const PER_IP_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 };
const PER_EMAIL_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 };

export type ContactState = ActionState<ContactInput>;

/**
 * Public contact form handler. Layers of protection:
 * Zod validation → honeypot + minimum fill time → per-IP and per-email
 * rate limits (Postgres-backed, shared across instances) → persistence.
 */
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const settings = await getSiteSettings();
  if (!settings.contactEnabled) {
    return { status: "error", message: "The contact form is currently closed. Please reach out by email.", values: raw };
  }

  const spam = contactSpamSchema.safeParse({
    company: formData.get("company") ?? "",
    startedAt: formData.get("startedAt"),
  });
  // Bots get a generic success so they learn nothing; nothing is stored.
  if (!spam.success || Date.now() - spam.data.startedAt < MIN_FILL_TIME_MS) {
    return { status: "success", message: "Thanks! Your message has been sent." };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: raw,
    };
  }
  const data = parsed.data;

  const ipHash = hashIdentifier(await getClientIp());
  const [ipLimit, emailLimit] = await Promise.all([
    rateLimit(`contact:ip:${ipHash}`, PER_IP_LIMIT),
    rateLimit(`contact:email:${hashIdentifier(data.email.toLowerCase())}`, PER_EMAIL_LIMIT),
  ]);
  if (!ipLimit.success || !emailLimit.success) {
    const minutes = Math.max(1, Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 60_000));
    return {
      status: "error",
      message: `You've sent several messages recently. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      values: raw,
    };
  }

  try {
    const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
    await db.contactMessage.create({ data: { ...data, ipHash, userAgent } });
  } catch (error) {
    console.error("[contact] Failed to store message", error);
    return { status: "error", message: "Something went wrong on our side. Please try again shortly.", values: raw };
  }

  // Notify the owner after the response is sent, so email latency never blocks the user.
  const notifyTo = env().CONTACT_NOTIFY_EMAIL;
  if (notifyTo) {
    after(() =>
      sendEmail({
        to: notifyTo,
        replyTo: data.email,
        subject: `New enquiry: ${data.subject}`,
        text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      }),
    );
  }

  return { status: "success", message: "Thanks! Your message has been sent. I usually reply within one business day." };
}
