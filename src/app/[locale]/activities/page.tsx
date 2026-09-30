import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import { ActivityCard } from "@/components/cards/cards";
import { FilterShell } from "@/components/filters/filter-shell";
import { categoryOptions, filterLabels, searchText } from "@/components/filters/filter-labels";
import { PageIntro, Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { getActivities, getCategories } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/activities">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/activities", title: t.activities.title, description: t.activities.description });
}

export default async function ActivitiesPage({ params }: PageProps<"/[locale]/activities">) {
  const { locale, t } = await getPageContext(params);
  const [activities, categories] = await Promise.all([getActivities(), getCategories("ACTIVITY")]);
  const used = categories.filter((c) => activities.some((a) => a.category?.slug === c.slug));
  const years = [...new Set(activities.map((a) => new Date(a.date).getUTCFullYear()))].sort((a, b) => b - a);

  return (
    <>
      <PageIntro
        eyebrow={t.home.workEyebrow}
        title={t.activities.title}
        description={t.activities.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.activities.title }]}
      />
      <Section>
        {activities.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={t.empty.activities} />
        ) : (
          <FilterShell
            items={activities.map((a) => ({
              key: a.id,
              groups: a.category ? [a.category.slug] : [],
              year: new Date(a.date).getUTCFullYear(),
              text: searchText(a.title, a.summary, a.location, a.category?.name),
            }))}
            groups={categoryOptions(locale, used)}
            years={years}
            labels={filterLabels(t)}
          >
            {activities.map((activity) => (
              <ActivityCard key={activity.id} locale={locale} t={t} activity={activity} />
            ))}
          </FilterShell>
        )}
      </Section>
    </>
  );
}
