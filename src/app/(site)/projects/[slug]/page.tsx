import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarDays, Clock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SocialIcon } from "@/components/shared/social-icon";
import { JsonLd } from "@/components/shared/json-ld";
import { Markdown } from "@/components/shared/markdown";
import { SmartImage } from "@/components/shared/smart-image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/sections/project-card";
import { ProjectGallery } from "@/components/sections/project-gallery";
import { breadcrumbJsonLd, buildProjectMetadata, projectJsonLd } from "@/lib/seo";
import { formatMonthYear, initials } from "@/lib/utils";
import { getProfile, getProjectBySlug, getProjectSitemapEntries, getSiteSettings } from "@/server/queries/public";

export async function generateStaticParams() {
  const projects = await getProjectSitemapEntries();
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return buildProjectMetadata(project, settings);
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getProjectBySlug(slug), getProfile()]);
  if (!project) notFound();

  const facts = [
    project.clientName && { icon: Building2, label: "Client", value: project.clientName, href: project.clientUrl },
    project.role && { icon: UserRound, label: "Role", value: project.role },
    project.duration && { icon: Clock, label: "Duration", value: project.duration },
    project.completedAt && { icon: CalendarDays, label: "Completed", value: formatMonthYear(project.completedAt) },
  ].filter(Boolean) as { icon: typeof Building2; label: string; value: string; href?: string | null }[];

  const caseStudy = [
    { id: "challenge", title: "The challenge", body: project.challenge },
    { id: "solution", title: "The approach", body: project.solution },
    { id: "results", title: "The results", body: project.results },
  ].filter((section): section is { id: string; title: string; body: string } => Boolean(section.body));

  return (
    <article className="pb-8">
      <JsonLd
        data={[
          projectJsonLd(project, profile),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
        ]}
      />

      <header className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="bg-grid mask-radial absolute inset-0 -z-10 opacity-60" />
        <div className="container-page pt-10 pb-12 sm:pt-14 sm:pb-16">
          <nav aria-label="Breadcrumb">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> All projects
            </Link>
          </nav>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{project.category}</Badge>
                {project.isFeatured && <Badge variant="outline">Featured</Badge>}
              </div>
              <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{project.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{project.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <Button asChild variant="brand">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Visit live site <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button asChild variant="outline">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <SocialIcon platform="github" /> Source code
                    </a>
                  </Button>
                )}
              </div>
            </Reveal>
            {facts.length > 0 && (
              <Reveal delay={0.08} className="lg:col-span-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border bg-card/70 p-5 shadow-soft backdrop-blur">
                  {facts.map(({ icon: Icon, label, value, href }) => (
                    <div key={label}>
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon className="size-3.5" aria-hidden="true" /> {label}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>
      </header>

      {project.thumbnailUrl && (
        <div className="container-page -mb-4 pt-10">
          <Reveal className="relative aspect-[16/8] overflow-hidden rounded-3xl border bg-muted shadow-lift">
            <SmartImage
              src={project.thumbnailUrl}
              alt={`${project.title} cover`}
              fill
              priority
              sizes="(min-width: 1152px) 1088px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      )}

      {project.metrics.length > 0 && (
        <section aria-label="Key results" className="container-page pt-14">
          <Stagger as="ul" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {project.metrics.map((metric) => (
              <StaggerItem as="li" key={metric.label} className="surface p-5">
                <p className="text-2xl font-semibold tracking-tight text-gradient sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <div className="container-page grid gap-12 pt-14 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <Reveal as="section" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
            <Markdown>{project.description}</Markdown>
          </Reveal>
          {caseStudy.map((section) => (
            <Reveal as="section" key={section.id} className="scroll-mt-24">
              <h2 id={section.id} className="mb-4 text-2xl font-semibold">
                {section.title}
              </h2>
              <Markdown>{section.body}</Markdown>
            </Reveal>
          ))}
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-24">
            {project.technologies.length > 0 && (
              <div className="surface p-5">
                <h2 className="text-sm font-semibold">Technology</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <li key={tech}>
                      <Badge variant="secondary" className="font-normal">
                        {tech}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {caseStudy.length > 0 && (
              <nav aria-label="Case study sections" className="surface hidden p-5 lg:block">
                <h2 className="text-sm font-semibold">In this case study</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {caseStudy.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {project.clientIndustry && (
              <div className="surface p-5 text-sm">
                <p className="text-muted-foreground">Industry</p>
                <p className="mt-1 font-medium">{project.clientIndustry}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {project.images.length > 0 && (
        <section aria-labelledby="gallery-title" className="container-page pt-16">
          <h2 id="gallery-title" className="mb-6 text-2xl font-semibold">
            Gallery
          </h2>
          <ProjectGallery images={project.images} />
        </section>
      )}

      {project.testimonials.length > 0 && (
        <section aria-label="Client feedback" className="container-page pt-16">
          <div className="grid gap-5 md:grid-cols-2">
            {project.testimonials.map((t) => (
              <Reveal key={t.id} as="article" className="surface p-7">
                <blockquote className="text-lg leading-relaxed">&ldquo;{t.content}&rdquo;</blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="border">
                    {t.avatarUrl && <AvatarImage src={t.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-brand-soft text-brand">{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-muted-foreground">{[t.role, t.company].filter(Boolean).join(", ")}</span>
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="cta-title" className="container-page pt-20">
        <Reveal className="relative overflow-hidden rounded-3xl border bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklch,var(--brand)_45%,transparent),transparent)]" />
          <div className="relative">
            <h2 id="cta-title" className="text-2xl font-semibold sm:text-3xl">
              Have a similar challenge?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/75">
              Let&apos;s talk about your goals and how I can help you reach them with confidence.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/#contact">
                Start a conversation <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {project.related.length > 0 && (
        <section aria-labelledby="related-title" className="container-page pt-20">
          <h2 id="related-title" className="mb-6 text-2xl font-semibold">
            More case studies
          </h2>
          <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.related.map((related) => (
              <StaggerItem as="li" key={related.id}>
                <ProjectCard project={related} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </article>
  );
}
