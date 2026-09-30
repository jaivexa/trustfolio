import "server-only";
import { env } from "@/lib/env";

type Email = { to: string; subject: string; text: string; replyTo?: string };

/**
 * Sends transactional email through Resend's HTTP API when configured.
 * Returns `false` (and never throws) when email is disabled or fails, so
 * callers can treat notifications as best-effort.
 */
export async function sendEmail({ to, subject, text, replyTo }: Email): Promise<boolean> {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  if (!RESEND_API_KEY || !EMAIL_FROM) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`[email] Resend responded ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Failed to send", error);
    return false;
  }
}
