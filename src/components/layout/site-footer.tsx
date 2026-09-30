import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Tx } from "@/components/i18n/tx";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SocialIcon } from "@/components/shared/social-icon";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localePath, ROUTES } from "@/lib/i18n/paths";
import type { SettingsDTO, TrustDTO } from "@/server/queries/public";

export function SiteFooter({
  locale,
  t,
  trust,
  settings,
  brand,
  nav,
}: {
  locale: Locale;
  t: Dictionary;
  trust: TrustDTO;
  settings: SettingsDTO;
  brand: { name: string; lang?: string };
  nav: { key: string; label: string; href: string }[];
}) {
  const year = new Date().getFullYear();
  const href = (key: keyof typeof ROUTES) => localePath(locale, ROUTES[key]);
  const evidenceLinks = [
    { label: t.nav.verification, href: href("verification") },
    { label: t.nav.documents, href: href("documents") },
    { label: t.nav.reports, href: href("reports") },
    { label: t.nav.certificates, href: href("certificates") },
    { label: t.registration.title, href: localePath(locale, "/verification/registration") },
  ];

  return (
    <footer className="bg-kolam relative mt-8 border-t bg-muted/40">
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p lang={brand.lang} className="font-display text-xl font-semibold">
            {brand.name}
          </p>
          <Tx value={trust.tagline} locale={locale} as="p" className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground" />
          {trust.socialLinks.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social">
              {trust.socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="grid size-9 place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t.footer.language}</p>
            <LanguageSwitcher locale={locale} label={t.header.language} size="md" />
          </div>
        </div>

        <nav aria-label={t.nav.footer} className="lg:col-span-2">
          <p className="text-sm font-semibold">{t.footer.explore}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className="text-sm font-semibold">{t.footer.documents}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {evidenceLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-sm font-semibold">{t.footer.contact}</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {trust.contact.email && (
              <li>
                <a href={`mailto:${trust.contact.email}`} className="inline-flex items-start gap-2 break-all hover:text-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {trust.contact.email}
                </a>
              </li>
            )}
            {trust.contact.phone && (
              <li>
                <a href={`tel:${trust.contact.phone.replace(/\s/g, "")}`} className="inline-flex items-start gap-2 hover:text-foreground">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {trust.contact.phone}
                </a>
              </li>
            )}
            {trust.contact.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                <Tx value={trust.contact.address} locale={locale} className="whitespace-pre-line" />
              </li>
            )}
            <li>
              <Link href={href("contact")} className="font-medium text-foreground underline-offset-4 hover:underline">
                {t.header.ctaContact} →
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} <span lang={brand.lang}>{brand.name}</span>. {t.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Tx value={settings.footerNote} locale={locale} />
            <Link href={href("privacy")} className="hover:text-foreground">
              {t.nav.privacy}
            </Link>
            <Link href={href("terms")} className="hover:text-foreground">
              {t.nav.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
