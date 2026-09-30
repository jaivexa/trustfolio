import { ArrowUpRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { TimelineTrack } from "@/components/sections/timeline-track";
import { Section, SectionHeading } from "@/components/site/section";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatDateRange } from "@/lib/utils";
import type { ExperienceDTO } from "@/server/queries/types";

export function ExperienceSection({ items }: { items: ExperienceDTO[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="experience" labelledBy="experience-title" className="bg-muted/25">
      <SectionHeading
        id="experience-title"
        eyebrow="Experience"
        title="Where I've made an impact"
        description="Roles where I've owned outcomes — not just tickets."
      />
      <TimelineTrack>
        <ol className="space-y-10 sm:space-y-12">
          {items.map((item, index) => (
            <li key={item.id} className="relative pl-10 sm:pl-14">
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-[5px] grid size-[15px] place-items-center rounded-full border-2 border-brand bg-background sm:left-[13px]"
              >
                {!item.endDate && <span className="size-1.5 rounded-full bg-brand" />}
              </span>
              <Reveal delay={index * 0.04} className="surface p-6 sm:p-7">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold">{item.position}</h3>
                    <p className="mt-0.5 text-sm">
                      {item.companyUrl ? (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 font-medium text-brand hover:underline"
                        >
                          {item.company}
                          <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="font-medium text-brand">{item.company}</span>
                      )}
                      <span className="text-muted-foreground"> · {EMPLOYMENT_TYPE_LABELS[item.employmentType]}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 text-sm text-muted-foreground sm:items-end">
                    <p>
                      <time dateTime={item.startDate}>{formatDateRange(item.startDate, item.endDate)}</time>
                    </p>
                    {item.location && (
                      <p className="inline-flex items-center gap-1 text-xs">
                        <MapPin className="size-3" aria-hidden="true" /> {item.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{item.description}</p>

                {item.achievements.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {item.achievements.map((achievement) => (
                      <li key={achievement} className="flex gap-2.5 text-sm leading-relaxed">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}

                {item.technologies.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
                    {item.technologies.map((tech) => (
                      <li key={tech}>
                        <Badge variant="secondary" className="font-normal">
                          {tech}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </TimelineTrack>
    </Section>
  );
}
