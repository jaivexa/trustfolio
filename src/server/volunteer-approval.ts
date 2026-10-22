import "server-only";
import { db } from "@/lib/db";
import { getTrust } from "@/server/queries/public";
import { sendTransactionalEmail } from "@/lib/email";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { generateVolunteerCertificatePdf } from "@/lib/volunteer-certificate-pdf";

export async function notifyVolunteerApproval(volunteerId: string) {
  const volunteer = await db.volunteerApplication.findUnique({
    where: { id: volunteerId },
    include: {
      activity: {
        select: { titleEn: true },
      },
    },
  });

  if (!volunteer || volunteer.isDeleted) return null;

  const trust = await getTrust();
  const trustName = trust.namePending ? "Trustfolio" : (trust.name.en || "Our Trust");
  const credentialId = `VOL-${volunteer.id.slice(-6).toUpperCase()}`;
  const activityTitle = volunteer.activity?.titleEn || "Community Volunteering";
  const issueDate = formatDate(volunteer.updatedAt || new Date());
  const pdfDownloadUrl = absoluteUrl(`/api/volunteers/${volunteer.id}/certificate/pdf`);

  // Generate the official PDF certificate
  let pdfBytes: Uint8Array | null = null;
  try {
    pdfBytes = await generateVolunteerCertificatePdf({
      volunteerName: volunteer.fullName,
      activityTitle,
      trustName,
      credentialId,
      issueDate,
    });
  } catch (err) {
    console.error("[volunteer-approval] Failed to generate PDF certificate:", err);
  }

  const safeFilename = `${volunteer.fullName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Volunteer_Certificate.pdf`;

  const emailSubject = `Application Approved: Welcome to ${trustName}!`;

  const emailBody = `Dear ${volunteer.fullName},

Congratulations! We are delighted to inform you that your volunteer application with ${trustName} has been officially APPROVED.

Details of your participation:
• Role / Activity: ${activityTitle}
• Credential ID: ${credentialId}
• Issue Date: ${issueDate}

Your Official Certificate (PDF):
Your verified Certificate of Volunteering is attached directly to this email as a PDF document (${safeFilename}).

You can also download a fresh copy of your certificate PDF anytime using this direct link:
${pdfDownloadUrl}

Thank you for dedicating your time, skills, and energy to support our community mission. Our team will be in touch with you shortly with further details.

Warm regards,
${trustName}
${trust.contact.email ? `Email: ${trust.contact.email}` : ""}
${trust.contact.phone ? `Phone: ${trust.contact.phone}` : ""}
`;

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f7f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0d9488; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
                Application Approved
              </h1>
              <p style="margin: 6px 0 0; color: #ccfbf1; font-size: 14px;">
                Welcome to ${trustName}
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5;">
                Dear <strong>${volunteer.fullName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                Congratulations! We are delighted to inform you that your volunteer application has been officially <strong>APPROVED</strong>.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; padding: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                      Volunteer Details
                    </p>
                    <table role="presentation" width="100%" style="font-size: 14px; color: #1e293b;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 120px;">Role:</td>
                        <td style="padding: 4px 0; font-weight: 600;">${activityTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Credential ID:</td>
                        <td style="padding: 4px 0; font-family: monospace; font-weight: 600; color: #0d9488;">${credentialId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Issue Date:</td>
                        <td style="padding: 4px 0;">${issueDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Certificate Download Callout -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 600; color: #166534;">
                  Your Volunteer Certificate is Ready!
                </p>
                <p style="margin: 0 0 16px; font-size: 13px; color: #15803d; line-height: 1.4;">
                  Your official PDF certificate is attached to this email (<strong>${safeFilename}</strong>). You can also download it directly anytime below:
                </p>
                <a href="${pdfDownloadUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Download Certificate (PDF)
                </a>
              </div>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Thank you for your generosity and commitment to making a positive difference. Our coordinators will reach out shortly with next steps.
              </p>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 14px; color: #6b7280;">
                <p style="margin: 0; font-weight: 600; color: #111827;">${trustName}</p>
                ${trust.contact.email ? `<p style="margin: 4px 0 0;">Email: <a href="mailto:${trust.contact.email}" style="color: #0d9488; text-decoration: none;">${trust.contact.email}</a></p>` : ""}
                ${trust.contact.phone ? `<p style="margin: 4px 0 0;">Phone: ${trust.contact.phone}</p>` : ""}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const emailResult = await sendTransactionalEmail({
    to: volunteer.email,
    subject: emailSubject,
    text: emailBody,
    html: emailHtml,
    attachments: pdfBytes
      ? [
          {
            filename: safeFilename,
            content: Buffer.from(pdfBytes).toString("base64"),
          },
        ]
      : undefined,
  });

  return {
    credentialId,
    certificateUrl: pdfDownloadUrl,
    pdfDownloadUrl,
    volunteer,
    emailResult,
  };
}
