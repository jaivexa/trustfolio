import type { NextRequest } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import { text } from "@/lib/i18n/localized";
import { renderOgImage, truncate } from "@/lib/og";
import { getSettings, getTrust } from "@/server/queries/public";

/**
 * Default Open Graph card, used when no custom share image is set in
 * Admin → Settings → SEO. Only published trust data is shown.
 */
export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(param) ? param : "en";
  const [trust, settings] = await Promise.all([getTrust(), getSettings()]);
  const name = trust.namePending ? "Trustfolio" : text(trust.name, locale);
  return renderOgImage({
    eyebrow: locale === "ta" ? "நம்பிக்கை · வெளிப்படைத்தன்மை · தாக்கம்" : "Trust · Transparency · Impact",
    title: truncate(name, 90),
    subtitle: truncate(text(trust.tagline, locale) || text(settings.seoDescription, locale) || "", 150) || undefined,
    footer: locale === "ta" ? "ஆதாரங்களுடன் கூடிய நம்பிக்கை" : "Trust built on evidence",
  });
}
