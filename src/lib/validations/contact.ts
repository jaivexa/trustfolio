import { z } from "zod";
import { requiredText } from "./common";

/** Shared by the client form (instant feedback) and the server action (authoritative). */
export const contactSchema = z.object({
  name: requiredText("Name", 100, 2),
  email: z.email("Enter a valid email address").trim().max(254),
  subject: requiredText("Subject", 150, 3),
  message: requiredText("Message", 5000, 20),
});

/** Anti-spam fields that are validated only on the server. */
export const contactSpamSchema = z.object({
  // Honeypot: real users never see or fill this field.
  company: z.string().max(0).optional().or(z.literal("")),
  // Timestamp (ms) when the form was rendered; bots submit implausibly fast.
  startedAt: z.coerce.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;
