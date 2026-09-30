import Link from "next/link";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { SocialIcon } from "@/components/shared/social-icon";
import { PUBLIC_NAV } from "@/lib/constants";
import type { ProfileDTO, SiteSettingsDTO } from "@/server/queries/types";

export function SiteFooter({ profile, settings }: { profile: ProfileDTO | null; settings: SiteSettingsDTO }) {
  const year = new Date().getFullYear();
  const name = profile?.fullName ?? settings.siteName;

  return (
    <footer className="relative mt-24 border-t bg-muted/30">
      <div className="container-page grid gap-12 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-lg font-semibold tracking-tight">{name}</p>
          {profile && <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{profile.shortBio}</p>}
          {profile && (
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand"
            >
              <Mail className="size-4" aria-hidden="true" />
              {profile.email}
            </a>
          )}
          {profile && profile.socialLinks.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social profiles">
              {profile.socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer me"
                    aria-label={link.label}
                    className="grid size-9 place-items-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Navigate</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-foreground/80 transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Resources</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {profile?.resumeUrl && (
              <li>
                <a
                  href={profile.resumeUrl}
                  download
                  className="inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-foreground"
                >
                  <Download className="size-3.5" aria-hidden="true" /> Download résumé
                </a>
              </li>
            )}
            <li>
              <Link href="/projects" className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground">
                All case studies <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-foreground/80 transition-colors hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-foreground/80 transition-colors hover:text-foreground">
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {name}. All rights reserved.
          </p>
          {settings.footerNote && <p>{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
