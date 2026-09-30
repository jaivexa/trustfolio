import { renderOgImage, truncate } from "@/lib/og";
import { getProfile, getSiteSettings } from "@/server/queries/public";

/**
 * Default Open Graph card for the site. Used when no custom OG image is set
 * in Admin → Settings → SEO. Statically generated and revalidated with the
 * profile/settings cache tags.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  return renderOgImage({
    eyebrow: profile?.heroEyebrow ?? settings.siteName,
    title: truncate(profile?.headline ?? settings.seoTitle, 90),
    subtitle: truncate(profile?.tagline ?? settings.seoDescription, 150),
    footer: profile?.fullName ?? settings.siteName,
  });
}
