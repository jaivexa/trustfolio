import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth-guard";
import { logActivity } from "@/server/actions/admin-helpers";
import type { VolunteerApplicationStatus } from "@/generated/prisma/enums";
import { notifyVolunteerApproval } from "@/server/volunteer-approval";

const statusSchema = z.enum(["PENDING", "REVIEWING", "CONTACTED", "APPROVED", "REJECTED"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const volunteer = await db.volunteerApplication.findUnique({
    where: { id },
    include: {
      activity: {
        select: { id: true, titleEn: true, titleTa: true, slug: true },
      },
    },
  });

  if (!volunteer || volunteer.isDeleted) {
    return NextResponse.json({ error: "Volunteer application not found" }, { status: 404 });
  }

  return NextResponse.json(volunteer);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let nextStatus = "APPROVED";
  try {
    const body = await request.json().catch(() => ({}));
    if (body.status) {
      nextStatus = statusSchema.parse(body.status);
    }
  } catch {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updated = await db.volunteerApplication.update({
      where: { id },
      data: { status: nextStatus as VolunteerApplicationStatus },
    });

    let certificateInfo = null;
    if (nextStatus === "APPROVED") {
      certificateInfo = await notifyVolunteerApproval(id).catch((err) => {
        console.error("[api/admin/volunteers] approval notify error", err);
        return null;
      });
    }

    await logActivity(
      user,
      "UPDATE",
      "VolunteerApplication",
      id,
      `${nextStatus === "APPROVED" ? "Approved" : "Updated status of"} volunteer application for ${updated.fullName}`,
    );

    const emailSent = certificateInfo?.emailResult?.success ?? false;
    const emailNote = certificateInfo?.emailResult?.simulated
      ? "Email simulated in server console (RESEND_API_KEY is not set in .env)"
      : emailSent
        ? `Live email sent to ${updated.email}`
        : certificateInfo?.emailResult?.error ?? "Email not sent";

    return NextResponse.json({
      success: true,
      message: `Volunteer application status updated to ${nextStatus}`,
      data: updated,
      certificate: certificateInfo
        ? {
            credentialId: certificateInfo.credentialId,
            certificateUrl: certificateInfo.certificateUrl,
          }
        : null,
      email: {
        sent: emailSent,
        note: emailNote,
      },
    });
  } catch (error) {
    console.error("[api/admin/volunteers] update error", error);
    return NextResponse.json({ error: "Failed to update volunteer application" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const volunteer = await db.volunteerApplication.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await logActivity(
      user,
      "DELETE",
      "VolunteerApplication",
      id,
      `Deleted volunteer application for ${volunteer.fullName}`,
    );

    return NextResponse.json({
      success: true,
      message: "Volunteer application deleted successfully",
    });
  } catch (error) {
    console.error("[api/admin/volunteers] delete error", error);
    return NextResponse.json({ error: "Failed to delete volunteer application" }, { status: 500 });
  }
}
