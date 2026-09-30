import type { CarouselItem } from "@/components/interactive/testimonial-carousel";
import type { GalleryItem } from "@/components/interactive/gallery-grid";
import type { MetricTile } from "@/components/impact/metric-tiles";
import { formatDate } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format, resolve, type OptionalLocalized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import type { MediaDTO, MetricDTO, TestimonialDTO } from "@/server/queries/public";

/** Resolved text + lang attribute for client components. */
export function tv(value: OptionalLocalized | undefined, locale: Locale): { text: string; lang?: string } | null {
  const r = resolve(value, locale);
  return r ? { text: r.text, lang: r.isFallback ? r.lang : undefined } : null;
}

export function metricPeriod(locale: Locale, metric: MetricDTO): string | null {
  const label = resolve(metric.periodLabel, locale)?.text;
  if (label) return label;
  if (metric.periodStart && metric.periodEnd) {
    return `${formatDate(locale, metric.periodStart, "monthYear")} – ${formatDate(locale, metric.periodEnd, "monthYear")}`;
  }
  if (metric.periodEnd) return formatDate(locale, metric.periodEnd, "monthYear");
  return null;
}

export function toMetricTile(locale: Locale, t: Dictionary, metric: MetricDTO): MetricTile {
  return {
    id: metric.id,
    label: tv(metric.label, locale)!,
    value: metric.value,
    prefix: metric.prefix,
    suffix: metric.suffix,
    unit: tv(metric.unit, locale),
    period: metricPeriod(locale, metric),
    methodology: tv(metric.methodology, locale),
    sourceDocument: metric.sourceDocument
      ? { href: localePath(locale, `/documents/${metric.sourceDocument.slug}`), title: tv(metric.sourceDocument.title, locale)! }
      : null,
    report: metric.report
      ? { href: localePath(locale, `/reports/${metric.report.slug}`), title: format(t.reports.report, { period: metric.report.periodLabel }) }
      : null,
    project: metric.project ? { href: localePath(locale, `/projects/${metric.project.slug}`), title: tv(metric.project.title, locale)! } : null,
    activities: metric.activities.map((a) => ({ href: localePath(locale, `/activities/${a.slug}`), title: tv(a.title, locale)! })),
    updated: formatDate(locale, metric.updatedAt, "medium"),
  };
}

export function metricTileLabels(t: Dictionary) {
  return {
    details: t.actions.viewDetails,
    period: t.impact.period,
    methodology: t.impact.methodology,
    noMethodology: t.impact.noMethodology,
    sourceDocument: t.impact.sourceDocument,
    report: t.impact.report,
    relatedActivities: t.impact.relatedActivities,
    relatedProject: t.impact.relatedProject,
    lastUpdated: t.meta.lastUpdated,
  };
}

export function toGalleryItems(locale: Locale, images: MediaDTO[]): GalleryItem[] {
  return images.map((image) => {
    const alt = tv(image.alt, locale);
    const caption = tv(image.caption, locale);
    return {
      id: image.id,
      url: image.url,
      alt: alt?.text ?? "",
      altLang: alt?.lang,
      caption: caption?.text ?? null,
      captionLang: caption?.lang,
      width: image.width,
      height: image.height,
    };
  });
}

export function galleryLabels(t: Dictionary) {
  return {
    open: t.gallery.open,
    counter: t.gallery.counter,
    hint: t.gallery.navigateHint,
    previous: t.actions.previous,
    next: t.actions.next,
  };
}

export function toCarouselItems(locale: Locale, t: Dictionary, testimonials: TestimonialDTO[]): CarouselItem[] {
  return testimonials.map((item) => {
    const meta = [tv(item.role, locale)?.text, tv(item.organization, locale)?.text, tv(item.relationship, locale)?.text]
      .filter(Boolean)
      .join(", ");
    return {
      id: item.id,
      quote: tv(item.content, locale)!,
      name: tv(item.name, locale)!,
      meta,
      date: item.date,
      dateLabel: formatDate(locale, item.date, "monthYear"),
      photoUrl: item.photo?.url ?? null,
      verifiedLabel: item.relationshipVerified ? t.testimonials.relationshipConfirmed : null,
    };
  });
}

export function carouselLabels(t: Dictionary) {
  return {
    region: t.testimonials.carouselLabel,
    slide: t.testimonials.slide,
    choose: t.testimonials.choose,
    show: t.testimonials.show,
    pause: t.testimonials.pause,
    play: t.testimonials.play,
    previous: t.actions.previous,
    next: t.actions.next,
  };
}
