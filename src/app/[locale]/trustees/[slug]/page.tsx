import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Globe, Lock, Mail } from "lucide-react";
import { DocumentCard } from "@/components/cards/cards";
import { LocalizedMarkdown, Tx } from "@/components/i18n/tx";
import { Breadcrumbs, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { SocialIcon } from "@/components/shared/social-icon";
import { HistoryTimeline } from "@/components/trust/history-timeline";
import { Portrait } from "@/components/trust/people";
import { formatDate, getPageContext, LOCALES } from "@/lib/i18n";
import { format, text } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getTrusteeBySlug, getTrustees } from "@/server/queries/public";

export async function generateStaticParams() {
  const trustees = await getTrustees();
  return LOCALES.flatMap((locale) => trustees.map((t) => ({ locale, slug: t.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/trustees/[slug]">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const trustee = await getTrusteeBySlug(slug);
  if (!trustee) return { title: t.errors.notFoundTitle, robots: { index: false } };
  return pageMetadata({
    locale,
    path: `/trustees/${slug}`,
    title: `${text(trustee.name, locale)} — ${text(trustee.position, locale)}`,
    description: text(trustee.bioExcerpt, locale) || undefined,
    image: trustee.photo?.url,
  });
}

export default async function TrusteePage({ params }: PageProps<"/[locale]/trustees/[slug]">) {
  const { locale, t } = await getPageContext(params);
  const { slug } = await params;
  const trustee = await getTrusteeBySlug(slug);
  if (!trustee) notFound();
  const name = text(trustee.name, locale);
  const responsibilities = locale === "ta" && trustee.responsibilities.ta.length ? trustee.responsibilities.ta : trustee.responsibilities.en;
  const respLang = locale === "ta" && !trustee.responsibilities.ta.length ? "en" : undefined;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, path: localePath(locale, "/") },
          { name: t.trustees.title, path: localePath(locale, "/trustees") },
          { name, path: localePath(locale, `/trustees/${slug}`) },
        ])}
      />
      <Section className="pt-10 sm:pt-14">
        <Breadcrumbs items={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.trustees.title, href: localePath(locale, "/trustees") }, { label: name }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-14">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <Portrait
              photo={trustee.photo}
              name={name}
              locale={locale}
              priority
              sizes="(min-width: 1024px) 320px, 90vw"
              className="relative aspect-[4/5] overflow-hidden rounded-t-[9rem] rounded-b-2xl border bg-muted shadow-lift"
            />
            <ul className="mt-5 grid gap-2 text-sm">
              {trustee.joinedAt && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {format(t.trustees.joined, { date: formatDate(locale, trustee.joinedAt, "monthYear") })}
                </li>
              )}
              {trustee.publicEmail && (
                <li>
                  <a href={`mailto:${trustee.publicEmail}`} className="inline-flex items-center gap-2 break-all text-brand hover:underline">
                    <Mail className="size-4 shrink-0" aria-hidden="true" /> {trustee.publicEmail}
                  </a>
                </li>
              )}
              {trustee.linkedinUrl && (
                <li>
                  <a href={trustee.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand hover:underline">
                    <SocialIcon platform="linkedin" /> LinkedIn
                  </a>
                </li>
              )}
              {trustee.websiteUrl && (
                <li>
                  <a href={trustee.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand hover:underline">
                    <Globe className="size-4" aria-hidden="true" /> {new URL(trustee.websiteUrl).hostname}
                  </a>
                </li>
              )}
            </ul>
          </Reveal>

          <div className="min-w-0 space-y-10">
            <Reveal>
              {trustee.isFounder && <p className="tracking-eyebrow text-xs font-medium text-brand">{t.founder.eyebrow}</p>}
              <h1 className="text-page-title mt-2">
                <Tx value={trustee.name} locale={locale} />
              </h1>
              <Tx value={trustee.position} locale={locale} as="p" className="mt-2 text-lg text-brand" />
            </Reveal>
            {trustee.vision && (
              <Reveal>
                <h2 className="mb-3 text-xl">{t.founder.vision}</h2>
                <Tx value={trustee.vision} locale={locale} as="blockquote" className="border-l-2 border-gold pl-5 font-display text-xl leading-relaxed italic" />
              </Reveal>
            )}
            <Reveal>
              <LocalizedMarkdown value={trustee.bio} locale={locale} t={t} />
            </Reveal>
            {trustee.contribution && (
              <Reveal>
                <h2 className="mb-3 text-xl">{t.founder.contribution}</h2>
                <LocalizedMarkdown value={trustee.contribution} locale={locale} t={t} />
              </Reveal>
            )}
            {responsibilities.length > 0 && (
              <Reveal>
                <h2 className="mb-3 text-xl">{t.trustees.responsibilities}</h2>
                <ul lang={respLang} className="grid gap-2">
                  {responsibilities.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {trustee.timeline.length > 0 && (
              <div>
                <h2 className="mb-6 text-xl">{t.founder.timeline}</h2>
                <HistoryTimeline locale={locale} t={t} events={trustee.timeline} />
              </div>
            )}
            {trustee.documents.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl">{t.trustees.documents}</h2>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {trustee.documents.map((doc) => (
                    <li key={doc.id}>
                      <DocumentCard locale={locale} t={t} document={doc} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="flex items-start gap-2 border-t pt-6 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> {t.trustees.privacyNote}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
