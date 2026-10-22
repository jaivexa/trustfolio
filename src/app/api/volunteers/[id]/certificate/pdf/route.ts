import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getTrust } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";
import { generateVolunteerCertificatePdf } from "@/lib/volunteer-certificate-pdf";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const volunteer = await db.volunteerApplication.findUnique({
    where: { id },
    include: {
      activity: {
        select: { titleEn: true },
      },
    },
  });

  if (!volunteer || volunteer.isDeleted || volunteer.status !== "APPROVED") {
    return new NextResponse("Certificate not found or applicant not yet approved", {
      status: 404,
    });
  }

  const trust = await getTrust();
  const trustName = trust.namePending ? "Trustfolio" : (trust.name.en || "Public Charitable Trust");
  const credentialId = `VOL-${volunteer.id.slice(-6).toUpperCase()}`;
  const issueDate = formatDate(volunteer.updatedAt || new Date());
  const activityTitle = volunteer.activity?.titleEn || "Community Engagement & Volunteering";

  try {
    const pdfBytes = await generateVolunteerCertificatePdf({
      volunteerName: volunteer.fullName,
      activityTitle,
      trustName,
      credentialId,
      issueDate,
    });

    const safeFilename = `${volunteer.fullName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Certificate.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[api/volunteers/certificate/pdf] Failed to generate PDF:", err);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
