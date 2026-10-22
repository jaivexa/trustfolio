import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getTrust } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

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
    return new Response("Certificate not found or applicant not yet approved", {
      status: 404,
    });
  }

  const trust = await getTrust();
  const trustName = trust.namePending ? "Trustfolio" : (trust.name.en || "Public Charitable Trust");
  const credentialId = `VOL-${volunteer.id.slice(-6).toUpperCase()}`;
  const issueDate = formatDate(volunteer.updatedAt || new Date());
  const activityTitle = volunteer.activity?.titleEn || "Community Engagement & Volunteering";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 56px",
          backgroundColor: "#fdfbf7",
          border: "16px solid #134e4a",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Inner Gold Border */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            bottom: 14,
            border: "2px solid #d97706",
            pointerEvents: "none",
          }}
        />

        {/* Certificate Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: 4,
              color: "#d97706",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            {trustName}
          </div>
          <div
            style={{
              fontSize: 42,
              letterSpacing: 2,
              fontWeight: 800,
              color: "#0f766e",
              marginTop: 12,
              textTransform: "uppercase",
            }}
          >
            Certificate of Volunteering
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#64748b",
              marginTop: 6,
              fontFamily: "sans-serif",
              letterSpacing: 1,
            }}
          >
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </div>
        </div>

        {/* Recipient Name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "18px 0",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#0f172a",
              borderBottom: "2px solid #cbd5e1",
              paddingBottom: 8,
              minWidth: 480,
              textAlign: "center",
            }}
          >
            {volunteer.fullName}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#475569",
              marginTop: 16,
              maxWidth: 820,
              textAlign: "center",
              lineHeight: 1.5,
              fontFamily: "sans-serif",
            }}
          >
            In grateful appreciation and recognition of your dedication, service, and valuable contributions as an official volunteer for:
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0f766e",
              marginTop: 10,
              fontFamily: "sans-serif",
            }}
          >
            {activityTitle}
          </div>
        </div>

        {/* Footer info: Credential, Seal, Signature */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 20px",
            marginBottom: 10,
            fontFamily: "sans-serif",
          }}
        >
          {/* Credential ID */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 14,
              color: "#64748b",
            }}
          >
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8" }}>
              Credential ID
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{credentialId}</span>
            <span style={{ fontSize: 12, marginTop: 4 }}>Issued: {issueDate}</span>
          </div>

          {/* Official Seal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              borderRadius: 999,
              backgroundColor: "#fef3c7",
              border: "3px solid #d97706",
              color: "#b45309",
              textAlign: "center",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              padding: 6,
            }}
          >
            <span>VERIFIED</span>
            <span style={{ fontSize: 14, margin: "2px 0" }}>★</span>
            <span>VOLUNTEER</span>
          </div>

          {/* Signature / Trust Stamp */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 160,
            }}
          >
            <div
              style={{
                width: 160,
                borderBottom: "1.5px solid #94a3b8",
                marginBottom: 6,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Board of Trustees</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{trustName}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    },
  );
}
