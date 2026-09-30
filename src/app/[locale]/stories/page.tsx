import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { StoryCard } from "@/components/cards/cards";
import { PageIntro, Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getStories } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/stories">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/stories", title: t.stories.title, description: t.stories.description });
}

export default async function StoriesPage({ params }: PageProps<"/[locale]/stories">) {
  const { locale, t } = await getPageContext(params);
  const stories = await getStories();
  return (
    <>
      <PageIntro
        eyebrow={t.home.voicesEyebrow}
        title={t.stories.title}
        description={t.stories.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.stories.title }]}
      />
      <Section>
        {stories.length === 0 ? (
          <EmptyState icon={HeartHandshake} title={t.empty.stories} />
        ) : (
          <Stagger as="ul" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StaggerItem as="li" key={story.id}>
                <StoryCard locale={locale} t={t} story={story} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Section>
    </>
  );
}
