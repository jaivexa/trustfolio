import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { Tx } from "@/components/i18n/tx";
import { Reveal } from "@/components/motion/reveal";
import { TimelineTrack } from "@/components/motion/timeline-track";
import { SmartImage } from "@/components/shared/smart-image";
import { formatDate } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { resolve, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import type { HistoryEventDTO } from "@/server/queries/public";

/** Vertical timeline; each event can carry an image, document and evidence link. */
export function HistoryTimeline({ locale, t, events }: { locale: Locale; t: Dictionary; events: HistoryEventDTO[] }) {
  return (
    <TimelineTrack>
      <ol className="space-y-8 sm:space-y-10">
        {events.map((event, index) => {
          const label = resolve(event.dateLabel, locale)?.text ?? formatDate(locale, event.date, "monthYear");
          return (
            <li key={event.id} className="relative pl-10 sm:pl-14">
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-[5px] size-[15px] rounded-full border-2 border-brand bg-background sm:left-[13px]"
              />
              <Reveal delay={Math.min(index * 0.04, 0.2)} className="surface grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <time dateTime={event.date} className="text-sm font-medium text-brand">
                    {label}
                  </time>
                  <Tx value={event.title} locale={locale} as="h3" className="mt-1 text-lg leading-snug" />
                  <Tx value={event.description} locale={locale} as="p" className="mt-2 text-sm leading-relaxed text-muted-foreground" />
                  {(event.document || event.evidenceUrl) && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {event.document && (
                        <Link href={localePath(locale, `/documents/${event.document.slug}`)} className="inline-flex items-center gap-1.5 text-brand hover:underline">
                          <FileText className="size-4" aria-hidden="true" />
                          <Tx value={event.document.title} locale={locale} />
                        </Link>
                      )}
                      {event.evidenceUrl && (
                        <a href={event.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                          <ExternalLink className="size-4" aria-hidden="true" /> {t.actions.viewEvidence}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {event.image && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted md:w-44">
                    <SmartImage src={event.image.url} alt={text(event.image.alt, locale)} fill sizes="(min-width: 768px) 176px, 100vw" className="object-cover" />
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </TimelineTrack>
  );
}
