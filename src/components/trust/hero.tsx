import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pending, Tx } from "@/components/i18n/tx";
import { SmartImage } from "@/components/shared/smart-image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";
import type { EvidenceCoverageDTO, TrustDTO } from "@/server/queries/public";

function HeroItem({ children, className, index }: { children: React.ReactNode; className?: string; index: number }) {
  return (
    <div className={cn("animate-hero-in", className)} style={{ "--i": index } as React.CSSProperties}>
      {children}
    </div>
  );
}

/**
 * Status chips are derived from published data only: "Registered trust"
 * appears only when a registration number or registration document exists.
 */
function statusItems(t: Dictionary, trust: TrustDTO, coverage: EvidenceCoverageDTO) {
  const items: { icon: typeof BadgeCheck; label: string }[] = [];
  if (trust.registration.number || trust.registration.document) items.push({ icon: BadgeCheck, label: t.hero.statusRegistered });
  if (trust.registration.established) {
    items.push({ icon: CalendarDays, label: format(t.hero.statusSince, { year: new Date(trust.registration.established).getUTCFullYear() }) });
  }
  if (coverage.projects.count > 0) items.push({ icon: FolderOpen, label: format(t.hero.statusProjects, { count: coverage.projects.count }) });
  if (coverage.documents.count > 0) items.push({ icon: FileText, label: format(t.hero.statusDocuments, { count: coverage.documents.count }) });
  return items.slice(0, 3);
}

export function TrustHero({
  locale,
  t,
  trust,
  coverage,
}: {
  locale: Locale;
  t: Dictionary;
  trust: TrustDTO;
  coverage: EvidenceCoverageDTO;
}) {
  const status = statusItems(t, trust, coverage);
  const href = (path: string) => localePath(locale, path);

  return (
    <section aria-labelledby="hero-title" className="bg-kolam relative isolate overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="absolute -top-48 right-[-10%] -z-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--gold)_22%,transparent),transparent)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 left-[-12%] -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_16%,transparent),transparent)] blur-2xl"
      />
      <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div className="flex min-w-0 flex-col items-start">
          {trust.name.ta && trust.name.en && !trust.namePending && (
            <HeroItem index={0}>
              <p className="tracking-eyebrow text-xs font-medium text-brand" lang={locale === "en" ? "ta" : "en"}>
                {locale === "en" ? trust.name.ta : trust.name.en}
              </p>
            </HeroItem>
          )}
          <HeroItem index={1} className="mt-4 w-full">
            <h1 id="hero-title" className="text-hero font-display">
              {trust.namePending ? <Pending t={t} className="text-base" /> : <Tx value={trust.name} locale={locale} />}
            </h1>
          </HeroItem>
          <HeroItem index={2} className="mt-6 max-w-xl">
            <Tx
              value={trust.tagline}
              locale={locale}
              as="p"
              className="font-display text-xl leading-relaxed text-foreground/90 italic sm:text-2xl"
              fallback={<Pending t={t} />}
            />
          </HeroItem>
          <HeroItem index={3} className="mt-5 max-w-xl">
            <Tx value={trust.heroText} locale={locale} as="p" className="text-base leading-relaxed text-muted-foreground sm:text-lg" />
          </HeroItem>

          <HeroItem index={4} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link href={href("/projects")}>
                {t.hero.explore} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href("/about")}>{t.hero.about}</Link>
            </Button>
          </HeroItem>
          <HeroItem index={5} className="mt-4">
            <Link
              href={href("/documents")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              <FileText className="size-4" aria-hidden="true" /> {t.hero.documents}
            </Link>
          </HeroItem>

          {status.length > 0 && (
            <HeroItem index={6} className="mt-10 w-full border-t pt-6">
              <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                {status.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Icon className="size-4 text-brand" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            </HeroItem>
          )}
        </div>

        <HeroItem index={3} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-3xl border bg-card shadow-lift">
            {trust.heroImage ? (
              <SmartImage
                src={trust.heroImage.url}
                alt={text(trust.heroImage.alt, locale)}
                fill
                priority
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="bg-kolam grid size-full place-items-center bg-gradient-to-b from-accent to-muted" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="size-40 text-brand/60">
                  <g fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M100 20 Q180 20 180 100 Q180 180 100 180 Q20 180 20 100 Q20 20 100 20Z" />
                    <path d="M100 55 Q145 55 145 100 Q145 145 100 145 Q55 145 55 100 Q55 55 100 55Z" />
                  </g>
                  <g fill="currentColor">
                    {[40, 100, 160].flatMap((x) => [40, 100, 160].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />))}
                  </g>
                </svg>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-brand via-gold to-brand" aria-hidden="true" />
          </div>
          {trust.heroImage && (
            <Tx
              value={trust.heroImage.caption}
              locale={locale}
              as="p"
              className="mt-3 text-center text-xs text-muted-foreground"
            />
          )}
        </HeroItem>
      </div>
    </section>
  );
}
