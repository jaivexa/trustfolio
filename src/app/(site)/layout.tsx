import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getProfile, getSiteSettings } from "@/server/queries/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader
        name={profile?.fullName ?? settings.siteName}
        ctaHref="/#contact"
        isAvailable={profile?.isAvailable ?? false}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter profile={profile} settings={settings} />
    </>
  );
}
