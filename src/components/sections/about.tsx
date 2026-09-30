import { CheckCircle2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/site/section";
import type { ProfileDTO, SkillGroupDTO } from "@/server/queries/types";

export function AboutSection({ profile, skillGroups }: { profile: ProfileDTO; skillGroups: SkillGroupDTO[] }) {
  const topSkills = skillGroups
    .flatMap((group) => group.skills)
    .filter((skill) => skill.isFeatured)
    .slice(0, 10);

  return (
    <Section id="about" labelledBy="about-title">
      <SectionHeading id="about-title" eyebrow="About" title="Engineering with judgement, craft and care" />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <Markdown className="text-base sm:text-[1.0625rem]">{profile.bio}</Markdown>

          {topSkills.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Core strengths</p>
              <ul className="flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                  <li key={skill.id}>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-normal">
                      {skill.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.resumeUrl && (
            <Button asChild variant="outline" className="mt-8">
              <a href={profile.resumeUrl} download>
                <Download aria-hidden="true" /> Download CV
              </a>
            </Button>
          )}
        </Reveal>

        <div className="flex flex-col gap-5 lg:col-span-5">
          {profile.values.length > 0 && (
            <Reveal delay={0.05} className="surface p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-brand" aria-hidden="true" /> How I work
              </h3>
              <ul className="mt-4 space-y-3">
                {profile.values.map((value) => (
                  <li key={value} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {value}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {profile.highlights.length > 0 && (
            <Reveal delay={0.1} className="surface p-6">
              <h3 className="font-semibold">Career highlights</h3>
              <ol className="mt-4 space-y-4">
                {profile.highlights.map((highlight, index) => (
                  <li key={highlight} className="flex gap-4 text-sm leading-relaxed">
                    <span className="font-mono text-xs text-brand tabular-nums" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>
      </div>
    </Section>
  );
}
