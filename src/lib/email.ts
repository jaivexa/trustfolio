import "server-only";
import { env } from "@/lib/env";

export type EmailAttachment = {
  filename: string;
  content: string; // Base64 encoded string
};

export type Email = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

export type SendEmailResult = {
  success: boolean;
  simulated: boolean;
  error?: string;
};

/**
 * Sends transactional email through Resend's HTTP API when configured.
 * When RESEND_API_KEY or EMAIL_FROM is not configured, logs the email to the
 * server console for local development and returns simulated: true.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
  replyTo,
  attachments,
}: Email): Promise<SendEmailResult> {
  const { RESEND_API_KEY, EMAIL_FROM } = env();

  if (!RESEND_API_KEY || !EMAIL_FROM) {
    const attachNotice =
      attachments && attachments.length > 0
        ? `Attachments (${attachments.length}): ${attachments.map((a) => a.filename).join(", ")}\n`
        : "";
    console.log(
      `\n==================== [EMAIL: DEV SIMULATION] ====================\n` +
      `To: ${to}\n` +
      `From: ${EMAIL_FROM || "(Not configured)"}\n` +
      `Subject: ${subject}\n` +
      attachNotice +
      `─────────────────────────────────────────────────────────────────\n` +
      `${text}\n` +
      `=================================================================\n` +
      `[Notice] To deliver real emails with attachments to inboxes, add your RESEND_API_KEY in .env.\n`,
    );
    return {
      success: false,
      simulated: true,
      error: "RESEND_API_KEY or EMAIL_FROM is not set in .env",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[email] Resend error (${response.status}): ${errText}`);
      return {
        success: false,
        simulated: false,
        error: `Resend error (${response.status}): ${errText}`,
      };
    }

    console.log(`[email] Successfully sent live email to ${to} via Resend.`);
    return { success: true, simulated: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[email] Failed to send email:", msg);
    return { success: false, simulated: false, error: msg };
  }
}

/**
 * Sends transactional email through Resend's HTTP API when configured.
 * Backward-compatible helper returning boolean.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const result = await sendTransactionalEmail(email);
  return result.success;
}
