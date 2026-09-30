"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { passwordSchema } from "@/lib/validations/auth";
import { profileSchema, siteSettingsSchema, socialLinksSchema } from "@/lib/validations/settings";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      await db.profile.upsert({ where: { id: "default" }, update: parsed.data, create: { id: "default", ...parsed.data } });
      await logActivity(user, "UPDATE", "Profile", "default", "Updated profile");
      expire(CACHE_TAGS.profile);
      return { status: "success", message: "Profile saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function saveSocialLinks(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(socialLinksSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      const profile = await db.profile.findUnique({ where: { id: "default" }, select: { id: true } });
      if (!profile) return { status: "error", message: "Save your profile first." };
      await db.$transaction([
        db.socialLink.deleteMany({ where: { profileId: profile.id } }),
        db.socialLink.createMany({
          data: parsed.data.links.map((link, index) => ({ ...link, profileId: profile.id, sortOrder: index })),
        }),
      ]);
      await logActivity(user, "UPDATE", "SocialLink", null, `Updated social links (${parsed.data.links.length})`);
      expire(CACHE_TAGS.profile);
      return { status: "success", message: "Social links saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function saveSiteSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(siteSettingsSchema, formData);
  if (!parsed.ok) return parsed.state;

  return adminMutation(
    async (user) => {
      await db.siteSetting.upsert({
        where: { id: "default" },
        update: parsed.data,
        create: { id: "default", ...parsed.data },
      });
      await logActivity(user, "UPDATE", "SiteSetting", "default", "Updated site settings");
      expire(CACHE_TAGS.settings);
      return { status: "success", message: "Settings saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return { ...parsed.state, values: undefined };

  return adminMutation(async (user) => {
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
    const valid = await bcrypt.compare(parsed.data.currentPassword, record.passwordHash);
    if (!valid) return { status: "error", fieldErrors: { currentPassword: ["Current password is incorrect"] } };
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
    await logActivity(user, "UPDATE", "User", user.id, "Changed password");
    return { status: "success", message: "Password updated" };
  });
}
