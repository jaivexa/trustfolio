import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Pending, Tx } from "@/components/i18n/tx";
import { ContactForm } from "@/components/interactive/contact-form";
import { PageIntro, Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { SocialIcon } from "@/components/shared/social-icon";
import { getPageContext } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";
import { submitContact } from "@/server/actions/contact";
import { getSettings, getTrust } from "@/server/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale, t } = await getPageContext(params);
  return pageMetadata({ locale, path: "/contact", title: t.contact.title, description: t.contact.description });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale, t } = await getPageContext(params);
  const [trust, settings] = await Promise.all([getTrust(), getSettings()]);
  const c = trust.contact;
  const hasDetails = Boolean(c.email || c.phone || c.address);

  return (
    <>
      <PageIntro
        eyebrow={t.nav.contact}
        title={t.contact.title}
        description={t.contact.description}
        breadcrumbs={[{ label: t.nav.home, href: localePath(locale, "/") }, { label: t.contact.title }]}
      />
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="flex flex-col gap-4 lg:col-span-4">
            <h2 className="text-xl">{t.contact.details}</h2>
            {!hasDetails && <Pending t={t} />}
            {c.email && (
              <a href={`mailto:${c.email}`} className="surface group flex items-center gap-4 p-5 transition-colors hover:border-brand/40">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{t.contact.email}</span>
                  <span className="block font-medium break-all group-hover:text-brand">{c.email}</span>
                </span>
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="surface group flex items-center gap-4 p-5 transition-colors hover:border-brand/40">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Phone className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">{t.contact.phone}</span>
                  <span className="block font-medium group-hover:text-brand">{c.phone}</span>
                </span>
              </a>
            )}
            {c.address && (
              <div className="surface flex items-start gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{t.contact.address}</span>
                  <Tx value={c.address} locale={locale} className="block font-medium whitespace-pre-line" />
                  {c.mapUrl && (
                    <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand hover:underline">
                      {t.contact.map} ↗
                    </a>
                  )}
                </span>
              </div>
            )}
            {c.hours && (
              <div className="surface flex items-start gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">{t.contact.hours}</span>
                  <Tx value={c.hours} locale={locale} className="block font-medium whitespace-pre-line" />
                </span>
              </div>
            )}
            {trust.socialLinks.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-2">
                {trust.socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                    >
                      <SocialIcon platform={link.platform} className="size-3.5" /> {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
          <Reveal delay={0.05} className="lg:col-span-8">
            <h2 className="mb-4 text-xl">{t.contact.formTitle}</h2>
            {settings.contactEnabled ? (
              <ContactForm action={submitContact.bind(null, locale)} labels={t.contact} />
            ) : (
              <div className="surface flex flex-col items-center p-10 text-center">
                <MessageSquareText className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-4 text-sm text-muted-foreground">{t.contact.closed}</p>
              </div>
            )}
          </Reveal>
        </div>
      </Section>
    </>
  );
}
