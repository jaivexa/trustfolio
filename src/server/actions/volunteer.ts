"use server";

import { db } from "@/lib/db";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { format } from "@/lib/i18n/localized";
import { getClientIp, hashIdentifier, rateLimit } from "@/lib/rate-limit";
import {
  volunteerErrorText,
  volunteerSchema,
  volunteerSpamSchema,
  type VolunteerInput,
} from "@/lib/validations/volunteer";
import type { ActionState } from "@/lib/action-state";

const MIN_FILL_TIME_MS = 3000;
const PER_IP_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 };
const PER_EMAIL_LIMIT = { limit: 5, windowMs: 24 * 60 * 60 * 1000 };

export type VolunteerState = ActionState<VolunteerInput>;

export async function submitVolunteer(
  locale: Locale,
  _prev: VolunteerState,
  formData: FormData,
): Promise<VolunteerState> {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const t = getDictionary(lang);

  const raw = {
    activityId: String(formData.get("activityId") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? ""),
    interests: formData.getAll("interests").map(String),
    skills: formData.getAll("skills").map(String),
    availability: String(formData.get("availability") ?? ""),
    message: String(formData.get("message") ?? ""),
    motivation: String(formData.get("motivation") ?? ""),
    goals: String(formData.get("goals") ?? ""),
    remarks: String(formData.get("remarks") ?? ""),
  };
  const spam = volunteerSpamSchema.safeParse({
    company: formData.get("company") ?? "",
    startedAt: formData.get("startedAt"),
  });

  // Treat likely bots as successful submissions without storing anything.
  if (!spam.success || Date.now() - spam.data.startedAt < MIN_FILL_TIME_MS) {
    return { status: "success", message: t.volunteer.success };
  }

  const parsed = volunteerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string[]>> = {};

    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      (fieldErrors[key] ??= []).push(volunteerErrorText(t, issue.message));
    }

    return {
      status: "error",
      message: t.volunteer.fixFields,
      fieldErrors,
      values: raw,
    };
  }

  const data = parsed.data;
  const ipHash = hashIdentifier(await getClientIp());

  const [ipLimit, emailLimit] = await Promise.all([
    rateLimit(`volunteer:ip:${ipHash}`, PER_IP_LIMIT),
    rateLimit(
      `volunteer:email:${hashIdentifier(data.email.toLowerCase())}`,
      PER_EMAIL_LIMIT,
    ),
  ]);

  if (!ipLimit.success || !emailLimit.success) {
    const resetAt = Math.max(
      ipLimit.success ? 0 : ipLimit.resetAt.getTime(),
      emailLimit.success ? 0 : emailLimit.resetAt.getTime(),
    );

    const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));

    return {
      status: "error",
      message: format(t.volunteer.rateLimited, { minutes }),
      values: raw,
    };
  }

  if (data.activityId) {
    const activity = await db.activity.findFirst({
      where: {
        id: data.activityId,
        status: "PUBLISHED",
        isDemo: false,
      },
      select: { id: true },
    });

    if (!activity) {
      return {
        status: "error",
        message: t.volunteer.fixFields,
        fieldErrors: {
          activityId: ["Please select a valid activity."],
        },
        values: raw,
      };
    }
  }

  try {
    await db.volunteerApplication.create({
      data: {
        activityId: data.activityId ?? null,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        city: data.city ?? null,
        interests: data.interests,
        skills: data.skills,
        availability: data.availability ?? null,
        message: data.message ?? null,
        motivation: data.motivation,
        goals: data.goals,
        remarks: data.remarks ?? null,
      },
    });
  } catch (error) {
    console.error("[volunteer] Failed to store application", error);

    return {
      status: "error",
      message: t.volunteer.serverError,
      values: raw,
    };
  }

  return { status: "success", message: t.volunteer.success };
}
