import { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export type VolunteerErrorKey =
  | "nameMin"
  | "emailInvalid"
  | "phoneInvalid"
  | "tooLong"
  | "motivationRequired"
  | "goalsRequired"
  | "activityInvalid";

const e = (key: VolunteerErrorKey) => ({ error: key });

export const volunteerSchema = z.object({
  activityId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),

  fullName: z
    .string(e("nameMin"))
    .trim()
    .min(2, e("nameMin"))
    .max(100, e("tooLong")),

  email: z
    .email(e("emailInvalid"))
    .trim()
    .max(254, e("tooLong"))
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(20, e("tooLong"))
    .regex(/^\+?[0-9\s()-]{7,20}$|^$/, e("phoneInvalid"))
    .optional()
    .transform((value) => (value ? value : undefined)),

  city: z
    .string()
    .trim()
    .max(100, e("tooLong"))
    .optional()
    .transform((value) => (value ? value : undefined)),

  interests: z
    .array(z.string().trim().min(1).max(100, e("tooLong")))
    .max(20, e("tooLong"))
    .optional()
    .default([]),

  skills: z
    .array(z.string().trim().min(1).max(100, e("tooLong")))
    .max(20, e("tooLong"))
    .optional()
    .default([]),

  availability: z
    .string()
    .trim()
    .max(200, e("tooLong"))
    .optional()
    .transform((value) => (value ? value : undefined)),

  message: z
    .string()
    .trim()
    .max(3000, e("tooLong"))
    .optional()
    .transform((value) => (value ? value : undefined)),

  motivation: z
    .string(e("motivationRequired"))
    .trim()
    .min(1, e("motivationRequired"))
    .max(3000, e("tooLong")),

  goals: z
    .string(e("goalsRequired"))
    .trim()
    .min(1, e("goalsRequired"))
    .max(3000, e("tooLong")),

  remarks: z
    .string()
    .trim()
    .max(3000, e("tooLong"))
    .optional()
    .transform((value) => (value ? value : undefined)),
});

/** Anti-spam fields validated only on the server. */
export const volunteerSpamSchema = z.object({
  company: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().int().positive(),
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;
export type VolunteerField = keyof VolunteerInput;

export function volunteerErrorText(
  dictionary: Dictionary,
  key: string,
): string {
  return (dictionary.volunteer.errors as Record<string, string>)[key] ?? key;
}
