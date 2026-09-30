import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/shared/smart-image";
import { SocialIcon } from "@/components/shared/social-icon";
import { cn, initials } from "@/lib/utils";
import type { ProfileDTO, TrustStatsDTO } from "@/server/queries/types";

/** CSS-only entrance so the LCP headline never waits for JavaScript. */
function HeroItem({ children, className, index }: { children: React.ReactNode; className?: string; index: number }) {
  return (
    <div className={cn("animate-hero-in", className)} style={{ "--i": index } as React.CSSProperties}>
      {children}
    </div>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      <div className="absolute -top-40 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_22%,transparent),transparent)] blur-2xl" />
      <div className="absolute top-24 -right-40 h-[28rem] w-[28rem] animate-aurora rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand-2)_18%,transparent),transparent)] blur-2xl [animation-delay:-8s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

export function Hero({ profile, stats }: { profile: ProfileDTO; stats: TrustStatsDTO }) {
  const [firstName] = profile.fullName.split(" ");

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <HeroBackground />
      <div className="container-page grid min-h-[calc(100svh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start">
          <HeroItem index={1}>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-0.5 text-brand">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {stats.yearsExperience}+ yrs
              </span>
              {profile.heroEyebrow ?? profile.headline}
            </p>
          </HeroItem>

          <HeroItem index={2}>
            <h1 id="hero-title" className="mt-6 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-[3.5rem]">
              <span className="sr-only">{profile.fullName} — </span>
              {profile.headline}
            </h1>
          </HeroItem>

          <HeroItem index={3}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{profile.tagline}</p>
          </HeroItem>

          <HeroItem index={4} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" variant="brand">
              <Link href={profile.primaryCta.href}>
                {profile.primaryCta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={profile.secondaryCta.href}>{profile.secondaryCta.label}</Link>
            </Button>
          </HeroItem>

          {profile.socialLinks.length > 0 && (
            <HeroItem index={5} className="mt-10 flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Find me on</span>
              <ul className="flex items-center gap-1">
                {profile.socialLinks.slice(0, 4).map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer me"
                      aria-label={link.label}
                      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </HeroItem>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <HeroItem index={6} className="ring-gradient relative aspect-[4/5] overflow-hidden rounded-3xl bg-card shadow-lift">
            {profile.avatarUrl ? (
              <SmartImage
                src={profile.avatarUrl}
                alt={`Portrait of ${profile.fullName}`}
                fill
                priority
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-brand/20 to-brand-2/20 text-6xl font-semibold text-brand">
                {initials(profile.fullName)}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white">
              <p className="font-semibold">{profile.fullName}</p>
              {profile.location && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="size-3.5" aria-hidden="true" /> {profile.location}
                </p>
              )}
            </div>
          </HeroItem>

          {profile.availability && (
            <HeroItem index={7} className="glass absolute -top-4 -left-4 flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-sm shadow-lift sm:-left-8">
              <span className="relative flex size-2.5" aria-hidden="true">
                {profile.isAvailable && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                )}
                <span
                  className={`relative inline-flex size-2.5 rounded-full ${profile.isAvailable ? "bg-success" : "bg-muted-foreground"}`}
                />
              </span>
              <span className="font-medium">{profile.availability}</span>
            </HeroItem>
          )}

          <HeroItem index={8} className="absolute -right-3 -bottom-5 rounded-2xl border bg-card px-4 py-3 shadow-lift sm:-right-6">
            <p className="text-2xl font-semibold tabular-nums">{stats.projectsCompleted}+</p>
            <p className="text-xs text-muted-foreground">projects shipped</p>
          </HeroItem>
        </div>
      </div>

      <a
        href="#trust"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground md:flex"
        aria-label={`Scroll to learn more about ${firstName}`}
      >
        <span className="flex h-9 w-5.5 justify-center rounded-full border-2 border-current pt-1.5">
          <span className="h-2 w-0.5 animate-scroll-cue rounded-full bg-current" />
        </span>
        Scroll
      </a>
    </section>
  );
}
