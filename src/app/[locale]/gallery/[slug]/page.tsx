import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { Tx } from "@/components/i18n/tx";
import { GalleryGrid } from "@/components/interactive/gallery-grid";
import { PageIntro, Section } from "@/components/layout/section";
import { formatDate, getPageContext, LOCALES } from "@/lib/i18n";
import { text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { galleryLabels, toGalleryItems } from "@/lib/view-models";
import { getAlbumBySlug, getAlbums } from "@/server/queries/public";

export async function generateStaticParams() {
  const albums = await getAlbums();
  return LOCALES.flatMap((locale) => albums.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/gallery/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({ locale, path: `/gallery/${slug}`, title: text(album.title, locale), description: text(album.description, locale) || undefined, image: album.cover?.url });
}

export default async function AlbumPage({ params }: PageProps<"/[locale]/gallery/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <PageIntro
        eyebrow={t.gallery.title}
        title={<Tx value={album.title} locale={locale} />}
        description={<Tx value={album.description} locale={locale} />}
        breadcrumbs={[
          { label: t.nav.home, href: localePath(locale, "/") },
          { label: t.gallery.title, href: localePath(locale, "/gallery") },
          { label: text(album.title, locale) },
        ]}
      >
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {album.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" /> {formatDate(locale, album.date)}
            </span>
          )}
          {album.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" /> <Tx value={album.location} locale={locale} />
            </span>
          )}
          {album.activity && (
            <Link href={localePath(locale, `/activities/${album.activity.slug}`)} className="text-brand hover:underline">
              <Tx value={album.activity.title} locale={locale} />
            </Link>
          )}
          {album.project && (
            <Link href={localePath(locale, `/projects/${album.project.slug}`)} className="text-brand hover:underline">
              <Tx value={album.project.title} locale={locale} />
            </Link>
          )}
        </div>
      </PageIntro>
      <Section>
        <GalleryGrid images={toGalleryItems(locale, album.images)} labels={galleryLabels(t)} />
      </Section>
    </>
  );
}
