import { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/**
 * Error messages are dictionary keys (see `contact.errors`), so the same
 * schema yields English or Tamil messages on both client and server.
 */
export type ContactErrorKey = keyof Dictionary["contact"]["errors"];

const e = (key: ContactErrorKey) => ({ error: key });

export const contactSchema = z.object({
  name: z.string(e("nameMin")).trim().min(2, e("nameMin")).max(100, e("tooLong")),
  email: z.email(e("emailInvalid")).trim().max(254, e("tooLong")),
  phone: z
    .string()
    .trim()
    .max(20, e("tooLong"))
    .regex(/^$|^\+?[0-9\s()-]{7,20}$/, e("phoneInvalid"))
    .optional()
    .transform((value) => (value ? value : undefined)),
  subject: z.string(e("subjectMin")).trim().min(3, e("subjectMin")).max(150, e("tooLong")),
  message: z.string(e("messageMin")).trim().min(20, e("messageMin")).max(5000, e("tooLong")),
});

/** Anti-spam fields validated only on the server. */
export const contactSpamSchema = z.object({
  company: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export function contactErrorText(dictionary: Dictionary, key: string): string {
  return (dictionary.contact.errors as Record<string, string>)[key] ?? key;
}
