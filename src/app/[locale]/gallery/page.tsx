import type { Metadata } from "next";
import { Images } from "lucide-react";
import { AlbumCard } from "@/components/cards/cards";
import { FilterShell } from "@/components/filters/filter-shell";
import { categoryOptions, filterLabels, searchText } from "@/components/filters/filter-labels";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getAlbums, getCategories, toAlbumCard } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/gallery">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/gallery", title: t.gallery.title, description: t.gallery.description });
}

export default async function GalleryPage({ params }: PageProps<"/[locale]/gallery">) {
  const { locale, t } = await getPageContext(params);
  const [albums, categories] = await Promise.all([getAlbums(), getCategories("GALLERY")]);
  const used = categories.filter((c) => albums.some((a) => a.category?.slug === c.slug));
  const years = [...new Set(albums.flatMap((a) => (a.date ? [new Date(a.date).getUTCFullYear()] : [])))].sort((a, b) => b - a);

  return (
    <>
      <PageIntro
        eyebrow={t.nav.gallery}
        title={t.gallery.title}
        description={t.gallery.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.gallery.title }]}
      />
      <Section>
        {albums.length === 0 ? (
          <EmptyState icon={Images} title={t.empty.gallery} />
        ) : (
          <FilterShell
            items={albums.map((a) => ({
              key: a.id,
              groups: a.category ? [a.category.slug] : [],
              year: a.date ? new Date(a.date).getUTCFullYear() : null,
              text: searchText(a.title, a.description, a.location),
            }))}
            groups={categoryOptions(locale, used)}
            years={years}
            labels={filterLabels(t)}
          >
            {albums.map((album) => (
              <AlbumCard key={album.id} locale={locale} t={t} album={toAlbumCard(album)} />
            ))}
          </FilterShell>
        )}
      </Section>
    </>
  );
}
