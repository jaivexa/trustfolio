"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { idSchema } from "@/lib/validations/common";
import { adminMutation, logActivity } from "@/server/actions/admin-helpers";
import type { VolunteerApplicationStatus } from "@/generated/prisma/enums";
import { notifyVolunteerApproval } from "@/server/volunteer-approval";

const statusSchema = z.enum(["PENDING", "REVIEWING", "CONTACTED", "APPROVED", "REJECTED"]);

const STATUS_MESSAGES: Record<VolunteerApplicationStatus, string> = {
  PENDING: "Application reset to pending",
  REVIEWING: "Application marked as reviewing",
  CONTACTED: "Volunteer marked as contacted",
  APPROVED: "Volunteer application approved",
  REJECTED: "Volunteer application rejected",
};

export async function setVolunteerStatus(
  id: string,
  status: VolunteerApplicationStatus,
): Promise<ActionState> {
  return adminMutation(async (user) => {
    const validId = idSchema.parse(id);
    const validStatus = statusSchema.parse(status);

    const updated = await db.volunteerApplication.update({
      where: { id: validId },
      data: { status: validStatus },
    });

    let message = STATUS_MESSAGES[validStatus];

    if (validStatus === "APPROVED") {
      const approval = await notifyVolunteerApproval(validId).catch((err) => {
        console.error("[volunteer-approval] Failed to send approval email", err);
        return null;
      });

      if (approval?.emailResult.success) {
        message = `Volunteer approved! Approval email and certificate sent to ${updated.email}`;
      } else if (approval?.emailResult.simulated) {
        message = `Volunteer approved & certificate issued! (Email logged to console — set RESEND_API_KEY in .env for inbox delivery)`;
      } else {
        message = `Volunteer approved & certificate issued! (Email delivery failed: ${approval?.emailResult.error ?? "check server logs"})`;
      }
    }

    await logActivity(
      user,
      "UPDATE",
      "VolunteerApplication",
      validId,
      `${validStatus === "APPROVED" ? "Approved" : "Updated status of"} volunteer application for ${updated.fullName}`,
    );

    refresh();
    return { status: "success", message };
  });
}

export async function approveVolunteer(id: string): Promise<ActionState> {
  return setVolunteerStatus(id, "APPROVED");
}

export async function deleteVolunteer(id: string): Promise<ActionState> {
  return adminMutation(async (user) => {
    const validId = idSchema.parse(id);

    const volunteer = await db.volunteerApplication.update({
      where: { id: validId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await logActivity(
      user,
      "DELETE",
      "VolunteerApplication",
      validId,
      `Deleted volunteer application for ${volunteer.fullName}`,
    );

    refresh();
    return { status: "success", message: "Volunteer application deleted" };
  });
}
