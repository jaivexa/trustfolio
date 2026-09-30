"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { CACHE_TAGS } from "@/lib/constants";
import { passwordSchema } from "@/lib/validations/auth";
import { idSchema } from "@/lib/validations/common";
import { navigationSchema, siteSettingsSchema, socialLinksSchema, userSchema } from "@/lib/validations/admin";
import { adminMutation, expire, logActivity, parseForm } from "@/server/actions/admin-helpers";

export async function saveSiteSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(siteSettingsSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      const existing = await db.siteSetting.findUnique({ where: { id: "default" }, select: { isDemo: true, seoTitleEn: true } });
      const isDemo = Boolean(existing?.isDemo && existing.seoTitleEn === parsed.data.seoTitleEn);
      await db.siteSetting.upsert({ where: { id: "default" }, update: { ...parsed.data, isDemo }, create: { id: "default", ...parsed.data, navigation: [] } });
      await logActivity(user, "UPDATE", "SiteSetting", "default", "Updated SEO & site settings");
      expire(CACHE_TAGS.settings);
      return { status: "success", message: "Settings saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function saveNavigation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(navigationSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      await db.siteSetting.update({ where: { id: "default" }, data: { navigation: parsed.data.navigation } });
      await logActivity(user, "UPDATE", "SiteSetting", "default", "Updated navigation");
      expire(CACHE_TAGS.settings);
      return { status: "success", message: "Navigation saved" };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function saveSocialLinks(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(socialLinksSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (user) => {
      await db.$transaction([
        db.socialLink.deleteMany({}),
        db.socialLink.createMany({ data: parsed.data.links.map((link, index) => ({ ...link, sortOrder: index })) }),
      ]);
      await logActivity(user, "UPDATE", "SocialLink", null, `Updated social links (${parsed.data.links.length})`);
      expire(CACHE_TAGS.trust);
      return { status: "success", message: "Social links saved" };
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
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return { ...parsed.state, values: undefined };
  return adminMutation(async (user) => {
    const record = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
    if (!(await bcrypt.compare(parsed.data.currentPassword, record.passwordHash))) {
      return { status: "error", fieldErrors: { currentPassword: ["Current password is incorrect"] } };
    }
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } });
    await logActivity(user, "UPDATE", "User", user.id, "Changed password");
    return { status: "success", message: "Password updated" };
  });
}

/**
 * Invites a user with a one-time temporary password shown once to the admin.
 * (No email is sent automatically; share it through a trusted channel.)
 */
export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(userSchema, formData);
  if (!parsed.ok) return parsed.state;
  return adminMutation(
    async (admin) => {
      const temporary = `${randomBytes(9).toString("base64url")}A7!`;
      const row = await db.user.create({
        data: { email: parsed.data.email, name: parsed.data.name, role: parsed.data.role, passwordHash: await bcrypt.hash(temporary, 12) },
      });
      await logActivity(admin, "CREATE", "User", row.id, `Added ${row.role.toLowerCase()} ${row.email}`);
      return { status: "success", message: `User created. Temporary password (shown once): ${temporary}`, id: row.id };
    },
    { role: "ADMIN", values: parsed.values },
  );
}

export async function updateUserRole(id: string, role: "ADMIN" | "EDITOR"): Promise<ActionState> {
  return adminMutation(
    async (admin) => {
      const target = idSchema.parse(id);
      if (target === admin.id) return { status: "error", message: "You can't change your own role." };
      const next = z.enum(["ADMIN", "EDITOR"]).parse(role);
      if (next === "EDITOR") {
        const admins = await db.user.count({ where: { role: "ADMIN", id: { not: target } } });
        if (!admins) return { status: "error", message: "At least one administrator is required." };
      }
      const row = await db.user.update({ where: { id: target }, data: { role: next } });
      await logActivity(admin, "UPDATE", "User", row.id, `Changed ${row.email} to ${next.toLowerCase()}`);
      expire();
      return { status: "success", message: "Role updated" };
    },
    { role: "ADMIN" },
  );
}

export async function deleteUser(id: string): Promise<ActionState> {
  return adminMutation(
    async (admin) => {
      const target = idSchema.parse(id);
      if (target === admin.id) return { status: "error", message: "You can't delete your own account." };
      const row = await db.user.delete({ where: { id: target } });
      await logActivity(admin, "DELETE", "User", target, `Removed ${row.email}`);
      expire();
      return { status: "success", message: "User removed" };
    },
    { role: "ADMIN" },
  );
}
