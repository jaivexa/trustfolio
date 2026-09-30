import { Clock, Mail, MapPin, MessageSquareText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { SocialIcon } from "@/components/shared/social-icon";
import { Section, SectionHeading } from "@/components/site/section";
import type { ProfileDTO } from "@/server/queries/types";

export function ContactSection({ profile, enabled }: { profile: ProfileDTO; enabled: boolean }) {
  return (
    <Section id="contact" labelledBy="contact-title">
      <SectionHeading
        id="contact-title"
        eyebrow="Contact"
        title="Let's build something dependable"
        description="Tell me about your product, your team and what success looks like. I'll respond with next steps."
      />
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="flex flex-col gap-4 lg:col-span-4">
          <a
            href={`mailto:${profile.email}`}
            className="surface group flex items-center gap-4 p-5 transition-colors hover:border-brand/40"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Mail className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Email</span>
              <span className="block truncate font-medium group-hover:text-brand">{profile.email}</span>
            </span>
          </a>
          {profile.location && (
            <div className="surface flex items-center gap-4 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Based in</span>
                <span className="block font-medium">{profile.location}</span>
              </span>
            </div>
          )}
          <div className="surface flex items-center gap-4 p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground">Response time</span>
              <span className="block font-medium">Within one business day</span>
            </span>
          </div>
          {profile.socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="Social profiles">
              {profile.socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer me"
                    className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                  >
                    <SocialIcon platform={link.platform} className="size-3.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.05} className="relative lg:col-span-8">
          {enabled ? (
            <ContactForm />
          ) : (
            <div className="surface flex flex-col items-center p-10 text-center">
              <MessageSquareText className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 font-medium">The contact form is temporarily closed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Email me directly at{" "}
                <a className="text-brand underline-offset-4 hover:underline" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                .
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
