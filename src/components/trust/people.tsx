import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { Eyebrow } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SmartImage } from "@/components/shared/smart-image";
import { HistoryTimeline } from "@/components/trust/history-timeline";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import type { TrusteeCardDTO, TrusteeDTO } from "@/server/queries/public";

export function Portrait({
  photo,
  name,
  locale,
  sizes,
  className,
  priority,
}: {
  photo: TrusteeCardDTO["photo"];
  name: string;
  locale: Locale;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={className ?? "relative aspect-[4/5] overflow-hidden bg-muted"}>
      {photo ? (
        <SmartImage src={photo.url} alt={text(photo.alt, locale) || name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="grid size-full place-items-center bg-gradient-to-b from-accent to-muted text-muted-foreground" aria-hidden="true">
          <UserRound className="size-12" />
        </div>
      )}
    </div>
  );
}

export function TrusteeCard({ locale, trustee }: { locale: Locale; trustee: TrusteeCardDTO }) {
  const name = text(trustee.name, locale);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Portrait
        photo={trustee.photo}
        name={name}
        locale={locale}
        sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
        className="relative aspect-[4/5] overflow-hidden bg-muted [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <Link
            href={localePath(locale, `/trustees/${trustee.slug}`)}
            className="outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40"
          >
            <Tx value={trustee.name} locale={locale} />
          </Link>
        </h3>
        <Tx value={trustee.position} locale={locale} as="p" className="mt-1 text-sm text-brand" />
        <Tx value={trustee.bioExcerpt} locale={locale} as="p" className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground" />
        <ArrowUpRight className="mt-auto ml-auto size-4 pt-0 text-muted-foreground transition-colors group-hover:text-brand" aria-hidden="true" />
      </div>
    </article>
  );
}

/** Dedicated founder feature: portrait, vision, contribution and timeline. */
export function FounderFeature({ locale, t, founder }: { locale: Locale; t: Dictionary; founder: TrusteeDTO }) {
  const name = text(founder.name, locale);
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[22rem_1fr] lg:gap-14">
      <Reveal className="lg:sticky lg:top-28 lg:self-start">
        <Portrait
          photo={founder.photo}
          name={name}
          locale={locale}
          sizes="(min-width: 1024px) 352px, 90vw"
          className="relative aspect-[4/5] overflow-hidden rounded-t-[10rem] rounded-b-2xl border bg-muted shadow-lift"
        />
        <div className="mt-5">
          <Tx value={founder.name} locale={locale} as="p" className="font-display text-2xl" />
          <Tx value={founder.position} locale={locale} as="p" className="mt-1 text-sm text-brand" />
          <Link href={localePath(locale, `/trustees/${founder.slug}`)} className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
            {t.trustees.profile} →
          </Link>
        </div>
      </Reveal>
      <div className="min-w-0 space-y-10">
        {founder.vision && (
          <Reveal>
            <Eyebrow>{t.founder.vision}</Eyebrow>
            <Tx value={founder.vision} locale={locale} as="blockquote" className="border-l-2 border-gold pl-5 font-display text-xl leading-relaxed italic sm:text-2xl" />
          </Reveal>
        )}
        <Reveal>
          <LocalizedMarkdown value={founder.bio} locale={locale} t={t} />
        </Reveal>
        {founder.contribution && (
          <Reveal>
            <h3 className="mb-3 text-xl">{t.founder.contribution}</h3>
            <LocalizedMarkdown value={founder.contribution} locale={locale} t={t} />
          </Reveal>
        )}
        {founder.timeline.length > 0 && (
          <div>
            <h3 className="mb-6 text-xl">{t.founder.timeline}</h3>
            <HistoryTimeline locale={locale} t={t} events={founder.timeline} />
          </div>
        )}
      </div>
    </div>
  );
}
