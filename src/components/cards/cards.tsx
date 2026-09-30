import Link from "next/link";
import { ArrowUpRight, CalendarDays, Download, FileText, Images, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tx } from "@/components/i18n/tx";
import { SmartImage } from "@/components/shared/smart-image";
import { formatDate, formatFileSize, formatNumber } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";
import type {
  ActivityCardDTO,
  AlbumCardDTO,
  DocumentCardDTO,
  MediaDTO,
  NewsCardDTO,
  ProjectCardDTO,
  ReportCardDTO,
  StoryCardDTO,
} from "@/server/queries/public";

const cardShell =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift focus-within:border-brand/40";

function Cover({ media, locale, sizes, ratio = "aspect-[16/10]", priority }: { media: MediaDTO | null; locale: Locale; sizes: string; ratio?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", ratio)}>
      {media ? (
        <SmartImage
          src={media.url}
          alt={text(media.alt, locale)}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="bg-kolam size-full bg-gradient-to-br from-accent to-muted" aria-hidden="true" />
      )}
    </div>
  );
}

/** Title link that makes the whole card clickable without nesting interactive elements. */
function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40">
      {children}
    </Link>
  );
}

const CARD_SIZES = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw";

export function ProjectCard({ locale, t, project, priority }: { locale: Locale; t: Dictionary; project: ProjectCardDTO; priority?: boolean }) {
  return (
    <article className={cardShell}>
      <Cover media={project.cover} locale={locale} sizes={CARD_SIZES} priority={priority} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.category && (
            <Badge variant="secondary">
              <Tx value={project.category.name} locale={locale} />
            </Badge>
          )}
          <Badge variant={project.phase === "COMPLETED" ? "success" : project.phase === "ONGOING" ? "brand" : "outline"}>
            {t.projects.phase[project.phase]}
          </Badge>
        </div>
        <h3 className="mt-4 text-xl leading-snug">
          <CardLink href={localePath(locale, `/projects/${project.slug}`)}>
            <Tx value={project.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={project.summary} locale={locale} as="p" className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground" />
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-xs text-muted-foreground">
          {project.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              <Tx value={project.location} locale={locale} />
            </span>
          )}
          {project.startDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDate(locale, project.startDate, "year")}
              {project.endDate ? `–${formatDate(locale, project.endDate, "year")}` : ""}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ActivityCard({ locale, t, activity }: { locale: Locale; t: Dictionary; activity: ActivityCardDTO }) {
  return (
    <article className={cardShell}>
      <Cover media={activity.cover} locale={locale} sizes={CARD_SIZES} ratio="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={activity.date} className="font-medium text-brand">
            {formatDate(locale, activity.date, "medium")}
          </time>
          {activity.category && <Tx value={activity.category.name} locale={locale} />}
        </div>
        <h3 className="mt-2 text-lg leading-snug">
          <CardLink href={localePath(locale, `/activities/${activity.slug}`)}>
            <Tx value={activity.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={activity.summary} locale={locale} as="p" className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground" />
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
          {activity.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              <Tx value={activity.location} locale={locale} />
            </span>
          )}
          {activity.beneficiaries !== null && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden="true" />
              {formatNumber(locale, activity.beneficiaries)} {t.activities.beneficiaries}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function DocumentCard({ locale, t, document }: { locale: Locale; t: Dictionary; document: DocumentCardDTO }) {
  const isPdf = document.file?.mimeType === "application/pdf";
  return (
    <article className="group relative flex h-full gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-lift sm:p-5">
      <div className="relative grid h-24 w-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted">
        {document.thumbnail ? (
          <SmartImage src={document.thumbnail.url} alt="" fill sizes="72px" className="object-cover" />
        ) : (
          <FileText className="size-7 text-brand/70" aria-hidden="true" />
        )}
        {document.file && (
          <span className="absolute bottom-1 rounded bg-background/90 px-1 text-[10px] font-semibold text-muted-foreground uppercase">
            {isPdf ? "PDF" : (document.file.mimeType.split("/")[1] ?? "").slice(0, 4)}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {document.category && <Tx value={document.category.name} locale={locale} className="font-medium text-brand" />}
          {document.year && <span>· {document.year}</span>}
          <span>· {t.documents.languages[document.language]}</span>
        </div>
        <h3 className="mt-1.5 text-base leading-snug">
          <CardLink href={localePath(locale, `/documents/${document.slug}`)}>
            <Tx value={document.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={document.description} locale={locale} as="p" className="mt-1 line-clamp-2 text-sm text-muted-foreground" />
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-muted-foreground">
          {document.version && <span>{format(t.documents.version, { version: document.version })}</span>}
          {document.isRedacted && <Badge variant="outline">{t.documents.redacted}</Badge>}
          {document.file && <span>{formatFileSize(locale, document.file.size)}</span>}
          {document.file && (
            <a
              href={document.file.url}
              download
              className="relative z-10 ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-brand hover:bg-brand-soft"
            >
              <Download className="size-3.5" aria-hidden="true" /> {t.actions.download}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ReportCard({ locale, t, report }: { locale: Locale; t: Dictionary; report: ReportCardDTO }) {
  const files = [
    { doc: report.documentEn, label: t.reports.english, lang: "en" },
    { doc: report.documentTa, label: t.reports.tamil, lang: "ta" },
  ].filter((f) => f.doc?.file);
  return (
    <article className={cardShell}>
      <div className="relative grid aspect-[3/2] place-items-center overflow-hidden bg-primary text-primary-foreground">
        {report.cover ? (
          <SmartImage src={report.cover.url} alt={text(report.cover.alt, locale)} fill sizes={CARD_SIZES} className="object-cover opacity-40" />
        ) : null}
        <div className="bg-kolam absolute inset-0" aria-hidden="true" />
        <div className="relative text-center">
          <p className="font-display text-4xl tabular-nums sm:text-5xl">{report.periodLabel}</p>
          <p className="tracking-eyebrow mt-2 text-xs text-primary-foreground/75">{t.reports.title}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <CardLink href={localePath(locale, `/reports/${report.slug}`)}>
            <Tx value={report.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={report.summary} locale={locale} as="p" className="mt-2 line-clamp-3 text-sm text-muted-foreground" />
        {files.length > 0 && (
          <ul className="relative z-10 mt-auto flex flex-wrap gap-2 pt-4">
            {files.map((f) => (
              <li key={f.lang}>
                <a
                  href={f.doc!.file!.url}
                  download
                  lang={f.lang}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Download className="size-3.5" aria-hidden="true" /> {f.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function AlbumCard({ locale, t, album }: { locale: Locale; t: Dictionary; album: AlbumCardDTO }) {
  return (
    <article className={cardShell}>
      <Cover media={album.cover} locale={locale} sizes={CARD_SIZES} ratio="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <CardLink href={localePath(locale, `/gallery/${album.slug}`)}>
            <Tx value={album.title} locale={locale} />
          </CardLink>
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Images className="size-3.5" aria-hidden="true" />
            {format(t.gallery.photos, { count: album.imageCount })}
          </span>
          {album.date && <span>{formatDate(locale, album.date, "monthYear")}</span>}
          {album.location && <Tx value={album.location} locale={locale} />}
        </div>
      </div>
    </article>
  );
}

export function NewsCard({ locale, t, post }: { locale: Locale; t: Dictionary; post: NewsCardDTO }) {
  const isEvent = post.kind === "EVENT" && post.eventStart;
  return (
    <article className={cardShell}>
      <Cover media={post.cover} locale={locale} sizes={CARD_SIZES} ratio="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={post.kind === "EVENT" ? "brand" : "secondary"}>{t.news.kind[post.kind]}</Badge>
          <time dateTime={isEvent ? post.eventStart! : post.date}>{formatDate(locale, isEvent ? post.eventStart! : post.date, "medium")}</time>
        </div>
        <h3 className="mt-3 text-lg leading-snug">
          <CardLink href={localePath(locale, `/news/${post.slug}`)}>
            <Tx value={post.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={post.excerpt} locale={locale} as="p" className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground" />
        {post.eventLocation && (
          <p className="mt-auto inline-flex items-center gap-1 pt-3 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden="true" />
            <Tx value={post.eventLocation} locale={locale} />
          </p>
        )}
      </div>
    </article>
  );
}

export function StoryCard({ locale, t, story }: { locale: Locale; t: Dictionary; story: StoryCardDTO }) {
  return (
    <article className={cardShell}>
      <Cover media={story.cover} locale={locale} sizes={CARD_SIZES} ratio="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <CardLink href={localePath(locale, `/stories/${story.slug}`)}>
            <Tx value={story.title} locale={locale} />
          </CardLink>
        </h3>
        <Tx value={story.summary} locale={locale} as="p" className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground" />
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-brand">
          {t.actions.readFullStory} <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
