import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateVolunteerCertificatePdf({
  volunteerName,
  activityTitle,
  trustName,
  credentialId,
  issueDate,
}: {
  volunteerName: string;
  activityTitle: string;
  trustName: string;
  credentialId: string;
  issueDate: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // A4 Landscape: 841.89 x 595.28 points
  const width = 842;
  const height = 595;
  const page = doc.addPage([width, height]);

  // Embed standard fonts
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Palette
  const colorTeal = rgb(0.06, 0.35, 0.32);
  const colorGold = rgb(0.85, 0.52, 0.08);
  const colorDark = rgb(0.09, 0.12, 0.16);
  const colorMuted = rgb(0.42, 0.48, 0.54);
  const colorBg = rgb(0.99, 0.985, 0.97);

  // 1. Warm Ivory Background Fill
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: colorBg,
  });

  // 2. Outer Decorative Teal Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: colorTeal,
    borderWidth: 6,
  });

  // 3. Inner Decorative Gold Border
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: colorGold,
    borderWidth: 1.5,
  });

  // Helper to center text horizontally
  const drawCentered = (
    text: string,
    y: number,
    size: number,
    font: typeof helvetica,
    color: typeof colorDark,
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // 4. Header: Trust Name
  drawCentered(trustName.toUpperCase(), 515, 14, helveticaBold, colorGold);

  // 5. Main Title: Certificate of Volunteering
  drawCentered("CERTIFICATE OF VOLUNTEERING", 465, 32, timesBold, colorTeal);

  // 6. Subheading
  drawCentered("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 430, 11, helvetica, colorMuted);

  // 7. Volunteer Full Name
  const nameSize = volunteerName.length > 30 ? 28 : 34;
  drawCentered(volunteerName, 375, nameSize, timesBold, colorDark);

  // Decorative Underline for Name
  const nameWidth = timesBold.widthOfTextAtSize(volunteerName, nameSize);
  const underlineWidth = Math.max(340, nameWidth + 60);
  page.drawLine({
    start: { x: (width - underlineWidth) / 2, y: 362 },
    end: { x: (width + underlineWidth) / 2, y: 362 },
    thickness: 1.5,
    color: colorGold,
  });

  // 8. Citation / Body
  drawCentered(
    "In grateful recognition of your voluntary service, dedication, and valuable contributions to:",
    325,
    13,
    helvetica,
    colorMuted,
  );

  // 9. Activity Title
  drawCentered(activityTitle, 290, 18, timesBold, colorTeal);

  // 10. Verified Badge
  const badgeText = "OFFICIAL VERIFIED VOLUNTEER RECORD";
  drawCentered(badgeText, 255, 10, helveticaBold, colorGold);

  // 11. Footer Line
  page.drawLine({
    start: { x: 60, y: 160 },
    end: { x: width - 60, y: 160 },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.90),
  });

  // 12. Footer Left: Credential ID & Issue Date
  page.drawText("CREDENTIAL ID", {
    x: 70,
    y: 135,
    size: 9,
    font: helveticaBold,
    color: colorMuted,
  });
  page.drawText(credentialId, {
    x: 70,
    y: 118,
    size: 13,
    font: helveticaBold,
    color: colorDark,
  });
  page.drawText(`Issued: ${issueDate}`, {
    x: 70,
    y: 100,
    size: 10,
    font: helvetica,
    color: colorMuted,
  });

  // 13. Footer Center: Seal
  const sealCenterX = width / 2;
  const sealCenterY = 110;
  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: 34,
    borderColor: colorGold,
    borderWidth: 2,
    color: rgb(0.99, 0.96, 0.90),
  });
  page.drawCircle({
    x: sealCenterX,
    y: sealCenterY,
    size: 30,
    borderColor: colorGold,
    borderWidth: 0.8,
  });
  const sealTopText = "VERIFIED";
  const sealTopW = helveticaBold.widthOfTextAtSize(sealTopText, 8);
  page.drawText(sealTopText, {
    x: sealCenterX - sealTopW / 2,
    y: sealCenterY + 10,
    size: 8,
    font: helveticaBold,
    color: colorGold,
  });
  const sealMidText = "TRUST";
  const sealMidW = helveticaBold.widthOfTextAtSize(sealMidText, 7);
  page.drawText(sealMidText, {
    x: sealCenterX - sealMidW / 2,
    y: sealCenterY - 3,
    size: 7,
    font: helveticaBold,
    color: colorGold,
  });
  const sealBotText = "VOLUNTEER";
  const sealBotW = helveticaBold.widthOfTextAtSize(sealBotText, 7.5);
  page.drawText(sealBotText, {
    x: sealCenterX - sealBotW / 2,
    y: sealCenterY - 16,
    size: 7.5,
    font: helveticaBold,
    color: colorGold,
  });

  // 14. Footer Right: Board of Trustees Signature Block
  const sigX = width - 230;
  page.drawLine({
    start: { x: sigX, y: 125 },
    end: { x: sigX + 160, y: 125 },
    thickness: 1,
    color: colorDark,
  });
  page.drawText("Board of Trustees", {
    x: sigX + 25,
    y: 110,
    size: 11,
    font: timesItalic,
    color: colorMuted,
  });
  const trustSubW = helvetica.widthOfTextAtSize(trustName, 9);
  page.drawText(trustName, {
    x: sigX + 80 - trustSubW / 2,
    y: 95,
    size: 9,
    font: helvetica,
    color: colorMuted,
  });

  return doc.save();
}
