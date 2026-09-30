import { notFound } from "next/navigation";
import { AboutSection } from "@/components/sections/about";
import { CertificatesSection } from "@/components/sections/certificates";
import { ContactSection } from "@/components/sections/contact";
import { ExperienceSection } from "@/components/sections/experience";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { ServicesSection } from "@/components/sections/services";
import { SkillsSection } from "@/components/sections/skills";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { TrustSection } from "@/components/sections/trust";
import { JsonLd } from "@/components/shared/json-ld";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import {
  getCertificates,
  getExperience,
  getFeaturedProjects,
  getProfile,
  getPublishedProjects,
  getServices,
  getSiteSettings,
  getSkillGroups,
  getTestimonials,
  getTrustStats,
} from "@/server/queries/public";

export default async function HomePage() {
  const [profile, settings, stats, skillGroups, featured, allProjects, experience, services, testimonials, certificates] =
    await Promise.all([
      getProfile(),
      getSiteSettings(),
      getTrustStats(),
      getSkillGroups(),
      getFeaturedProjects(3),
      getPublishedProjects(),
      getExperience(),
      getServices(),
      getTestimonials(),
      getCertificates(),
    ]);

  // A profile is created by the seed script; without it there is nothing to show.
  if (!profile) notFound();

  return (
    <>
      <JsonLd data={[personJsonLd(profile), websiteJsonLd(settings)]} />
      <Hero profile={profile} stats={stats} />
      <TrustSection stats={stats} />
      <AboutSection profile={profile} skillGroups={skillGroups} />
      <SkillsSection groups={skillGroups} />
      <FeaturedProjectsSection projects={featured} total={allProjects.length} />
      <ExperienceSection items={experience} />
      {settings.showServices && <ServicesSection services={services} />}
      {settings.showTestimonials && <TestimonialsSection testimonials={testimonials} />}
      {settings.showCertificates && <CertificatesSection certificates={certificates} />}
      <ContactSection profile={profile} enabled={settings.contactEnabled} />
    </>
  );
}
