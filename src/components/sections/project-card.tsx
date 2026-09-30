import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";
import type { ProjectCardDTO } from "@/server/queries/types";

/** Works in both server and client trees (no server-only imports). */
export function ProjectCard({
  project,
  priority = false,
  headingLevel: Heading = "h3",
  className,
}: {
  project: ProjectCardDTO;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const year = project.completedAt ? new Date(project.completedAt).getUTCFullYear() : null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lift focus-within:border-brand/40",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {project.thumbnailUrl ? (
          <SmartImage
            src={project.thumbnailUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-brand/25 to-brand-2/25" />
        )}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <Badge variant="secondary" className="glass border-white/20 text-foreground">
            {project.category}
          </Badge>
          {project.isFeatured && (
            <span className="glass grid size-7 place-items-center rounded-full border border-white/20" title="Featured">
              <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
              <span className="sr-only">Featured project</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Heading className="text-lg leading-snug font-semibold">
            <Link href={`/projects/${project.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40">
              {project.title}
            </Link>
          </Heading>
          <ArrowUpRight
            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        <div className="mt-auto pt-5">
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.technologies.slice(0, 4).map((tech) => (
              <li key={tech} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {tech}
              </li>
            ))}
            {project.technologies.length > 4 && (
              <li className="rounded-md px-1 py-0.5 text-xs text-muted-foreground">+{project.technologies.length - 4}</li>
            )}
          </ul>
          {(project.clientName || year) && (
            <p className="mt-4 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
              {project.clientName && <span className="font-medium text-foreground/80">{project.clientName}</span>}
              {project.clientName && year && <span aria-hidden="true">·</span>}
              {year && <time dateTime={project.completedAt ?? undefined}>{year}</time>}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
