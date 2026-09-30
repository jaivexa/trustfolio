"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { idSchema } from "@/lib/validations/common";
import { adminMutation, logActivity } from "@/server/actions/admin-helpers";

const statusSchema = z.enum(["UNREAD", "READ", "ARCHIVED"]);

export async function setMessageStatus(id: string, status: "UNREAD" | "READ" | "ARCHIVED"): Promise<ActionState> {
  return adminMutation(async () => {
    const next = statusSchema.parse(status);
    await db.contactMessage.update({
      where: { id: idSchema.parse(id) },
      data: { status: next, readAt: next === "UNREAD" ? null : new Date() },
    });
    refresh();
    const labels = { UNREAD: "Marked as unread", READ: "Marked as read", ARCHIVED: "Message archived" } as const;
    return { status: "success", message: labels[next] };
  });
}

/** Called when a message is opened; silent and idempotent. */
export async function markMessageRead(id: string): Promise<ActionState> {
  return adminMutation(async () => {
    await db.contactMessage.updateMany({
      where: { id: idSchema.parse(id), status: "UNREAD" },
      data: { status: "READ", readAt: new Date() },
    });
    refresh();
    return { status: "success" };
  });
}

export async function deleteMessage(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const message = await db.contactMessage.delete({ where: { id: idSchema.parse(id) } });
    await logActivity(user, "DELETE", "ContactMessage", id, `Deleted message from ${message.name}`);
    refresh();
    return { status: "success", message: "Message deleted" };
  });
}
