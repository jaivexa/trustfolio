"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import type { ActionState } from "@/lib/action-state";
import { fieldErrorsFrom } from "@/lib/action-state";
import { loginSchema } from "@/lib/validations/auth";

/** Only allow redirects back into the admin area (prevents open redirects). */
function safeCallback(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin";
  try {
    const url = new URL(value, "http://local");
    const path = url.pathname;
    return path.startsWith("/admin") && !path.startsWith("/admin/login") ? `${path}${url.search}` : "/admin";
  } catch {
    return "/admin";
  }
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), values: { email } };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallback(formData.get("callbackUrl")),
    });
    return { status: "success" };
  } catch (error) {
    // A successful sign-in throws a redirect, which must propagate.
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Invalid email or password. After several failed attempts, sign-in is paused for 15 minutes.",
        values: { email },
      };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
