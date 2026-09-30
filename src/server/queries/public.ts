import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS, type CacheTag } from "@/lib/constants";
import { projectMetricsSchema } from "@/lib/validations/content";
import type {
  CertificateDTO,
  ExperienceDTO,
  ProfileDTO,
  ProjectCardDTO,
  ProjectDetailDTO,
  ServiceDTO,
  SiteSettingsDTO,
  SkillGroupDTO,
  TestimonialDTO,
  TrustStatsDTO,
} from "@/server/queries/types";
import { SKILL_CATEGORY_LABELS } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Public, read-only queries. Each is cached across requests with tags that
 * admin mutations expire, and memoized per request with React `cache`.
 * Results are plain serializable DTOs (dates as ISO strings).
 */
function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, tags: CacheTag[]) {
  return cache(unstable_cache(fn, [key], { tags, revalidate: 86_400 }));
}

const iso = (date: Date) => date.toISOString();
const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

// ─── Profile & settings ─────────────────────────────────────────────────────

export const getProfile = cached(
  async (): Promise<ProfileDTO | null> => {
    const profile = await db.profile.findUnique({
      where: { id: "default" },
      include: { socialLinks: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } } },
    });
    if (!profile) return null;
    return {
      fullName: profile.fullName,
      headline: profile.headline,
      tagline: profile.tagline,
      shortBio: profile.shortBio,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      email: profile.email,
      availability: profile.availability,
      isAvailable: profile.isAvailable,
      resumeUrl: profile.resumeUrl,
      heroEyebrow: profile.heroEyebrow,
      primaryCta: { label: profile.primaryCtaLabel, href: profile.primaryCtaHref },
      secondaryCta: { label: profile.secondaryCtaLabel, href: profile.secondaryCtaHref },
      values: profile.values,
      highlights: profile.highlights,
      socialLinks: profile.socialLinks.map((link) => ({
        id: link.id,
        platform: link.platform,
        label: link.label,
        url: link.url,
      })),
      updatedAt: iso(profile.updatedAt),
    };
  },
  "profile",
  [CACHE_TAGS.profile],
);

const DEFAULT_SETTINGS: SiteSettingsDTO = {
  siteName: "Trustfolio",
  siteDescription: "A personal portfolio platform.",
  seoTitle: "Trustfolio",
  seoDescription: "A personal portfolio platform.",
  seoKeywords: [],
  ogImageUrl: null,
  twitterHandle: null,
  defaultTheme: "SYSTEM",
  accentColor: "indigo",
  showServices: true,
  showTestimonials: true,
  showCertificates: true,
  contactEnabled: true,
  footerNote: null,
};

export const getSiteSettings = cached(
  async (): Promise<SiteSettingsDTO> => {
    const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
    if (!settings) return DEFAULT_SETTINGS;
    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      seoKeywords: settings.seoKeywords,
      ogImageUrl: settings.ogImageUrl,
      twitterHandle: settings.twitterHandle,
      defaultTheme: settings.defaultTheme,
      accentColor: settings.accentColor,
      showServices: settings.showServices,
      showTestimonials: settings.showTestimonials,
      showCertificates: settings.showCertificates,
      contactEnabled: settings.contactEnabled,
      footerNote: settings.footerNote,
    };
  },
  "settings",
  [CACHE_TAGS.settings],
);

// ─── Trust metrics ──────────────────────────────────────────────────────────

export const getTrustStats = cached(
  async (): Promise<TrustStatsDTO> => {
    const [profile, projectCount, clients, certificateCount, technologyCount, earliest, achievementRows] =
      await Promise.all([
        db.profile.findUnique({
          where: { id: "default" },
          select: { yearsExperience: true, projectsCompleted: true, clientsServed: true, achievementsCount: true },
        }),
        db.project.count({ where: { isPublished: true } }),
        db.project.findMany({
          where: { isPublished: true, clientName: { not: null } },
          distinct: ["clientName"],
          select: { clientName: true },
        }),
        db.certificate.count({ where: { isPublished: true } }),
        db.technology.count({
          where: { OR: [{ projects: { some: { isPublished: true } } }, { experiences: { some: { isPublished: true } } }] },
        }),
        db.experience.findFirst({ where: { isPublished: true }, orderBy: { startDate: "asc" }, select: { startDate: true } }),
        db.experience.findMany({ where: { isPublished: true }, select: { achievements: true } }),
      ]);

    const derivedYears = earliest
      ? Math.max(1, Math.floor((Date.now() - earliest.startDate.getTime()) / (365.25 * 24 * 3600 * 1000)))
      : 0;
    const derivedAchievements = achievementRows.reduce((sum, row) => sum + row.achievements.length, 0);

    return {
      yearsExperience: profile?.yearsExperience ?? derivedYears,
      projectsCompleted: profile?.projectsCompleted ?? projectCount,
      clientsServed: profile?.clientsServed ?? clients.length,
      certifications: certificateCount,
      technologies: technologyCount,
      achievements: profile?.achievementsCount ?? derivedAchievements,
    };
  },
  "trust-stats",
  [CACHE_TAGS.profile, CACHE_TAGS.projects, CACHE_TAGS.certificates, CACHE_TAGS.experience],
);

// ─── Skills ─────────────────────────────────────────────────────────────────

export const getSkillGroups = cached(
  async (): Promise<SkillGroupDTO[]> => {
    const skills = await db.skill.findMany({ orderBy: [{ sortOrder: "asc" }, { proficiency: "desc" }] });
    const order = Object.keys(SKILL_CATEGORY_LABELS) as (keyof typeof SKILL_CATEGORY_LABELS)[];
    return order
      .map((category) => ({
        category,
        label: SKILL_CATEGORY_LABELS[category],
        skills: skills
          .filter((skill) => skill.category === category)
          .map((skill) => ({
            id: skill.id,
            name: skill.name,
            proficiency: skill.proficiency,
            years: skill.years,
            isFeatured: skill.isFeatured,
          })),
      }))
      .filter((group) => group.skills.length > 0);
  },
  "skills",
  [CACHE_TAGS.skills],
);

// ─── Projects ───────────────────────────────────────────────────────────────

const projectCardSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  thumbnailUrl: true,
  category: true,
  isFeatured: true,
  completedAt: true,
  githubUrl: true,
  liveUrl: true,
  clientName: true,
  technologies: { select: { name: true }, orderBy: { name: "asc" } },
} satisfies Prisma.ProjectSelect;

type ProjectCardRow = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;

function toProjectCard(project: ProjectCardRow): ProjectCardDTO {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    thumbnailUrl: project.thumbnailUrl,
    category: project.category,
    isFeatured: project.isFeatured,
    completedAt: isoOrNull(project.completedAt),
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    clientName: project.clientName,
    technologies: project.technologies.map((t) => t.name),
  };
}

const projectOrder: Prisma.ProjectOrderByWithRelationInput[] = [
  { isFeatured: "desc" },
  { sortOrder: "asc" },
  { completedAt: { sort: "desc", nulls: "last" } },
];

export const getPublishedProjects = cached(
  async (): Promise<ProjectCardDTO[]> => {
    const projects = await db.project.findMany({
      where: { isPublished: true },
      select: projectCardSelect,
      orderBy: projectOrder,
    });
    return projects.map(toProjectCard);
  },
  "projects:published",
  [CACHE_TAGS.projects],
);

export const getFeaturedProjects = cached(
  async (limit: number): Promise<ProjectCardDTO[]> => {
    const projects = await db.project.findMany({
      where: { isPublished: true },
      select: projectCardSelect,
      orderBy: projectOrder,
      take: limit,
    });
    return projects.map(toProjectCard);
  },
  "projects:featured",
  [CACHE_TAGS.projects],
);

export const getProjectBySlug = cached(
  async (slug: string): Promise<ProjectDetailDTO | null> => {
    const project = await db.project.findFirst({
      where: { slug, isPublished: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        technologies: { select: { name: true }, orderBy: { name: "asc" } },
        testimonials: { where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 2 },
      },
    });
    if (!project) return null;

    const metrics = projectMetricsSchema.safeParse(project.metrics);
    const related = await db.project.findMany({
      where: { isPublished: true, id: { not: project.id } },
      select: projectCardSelect,
      orderBy: projectOrder,
      take: 12,
    });
    // Prefer the same category, then fill with the rest.
    const relatedSorted = [
      ...related.filter((p) => p.category === project.category),
      ...related.filter((p) => p.category !== project.category),
    ].slice(0, 3);

    return {
      ...toProjectCard({ ...project, technologies: project.technologies }),
      description: project.description,
      clientIndustry: project.clientIndustry,
      clientUrl: project.clientUrl,
      role: project.role,
      duration: project.duration,
      challenge: project.challenge,
      solution: project.solution,
      results: project.results,
      seoTitle: project.seoTitle,
      seoDescription: project.seoDescription,
      metrics: metrics.success ? metrics.data : [],
      images: project.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        caption: image.caption,
      })),
      testimonials: project.testimonials.map(toTestimonial),
      related: relatedSorted.map(toProjectCard),
      updatedAt: iso(project.updatedAt),
      publishedAt: isoOrNull(project.publishedAt),
    };
  },
  "project:by-slug",
  [CACHE_TAGS.projects, CACHE_TAGS.testimonials],
);

export const getProjectSitemapEntries = cached(
  async () => {
    const projects = await db.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    return projects.map((p) => ({ slug: p.slug, updatedAt: iso(p.updatedAt) }));
  },
  "projects:sitemap",
  [CACHE_TAGS.projects],
);

// ─── Experience ─────────────────────────────────────────────────────────────

export const getExperience = cached(
  async (): Promise<ExperienceDTO[]> => {
    const rows = await db.experience.findMany({
      where: { isPublished: true },
      include: { technologies: { select: { name: true }, orderBy: { name: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      company: row.company,
      companyUrl: row.companyUrl,
      logoUrl: row.logoUrl,
      position: row.position,
      location: row.location,
      employmentType: row.employmentType,
      startDate: iso(row.startDate),
      endDate: isoOrNull(row.endDate),
      description: row.description,
      achievements: row.achievements,
      technologies: row.technologies.map((t) => t.name),
    }));
  },
  "experience",
  [CACHE_TAGS.experience],
);

// ─── Services ───────────────────────────────────────────────────────────────

export const getServices = cached(
  async (): Promise<ServiceDTO[]> => {
    const rows = await db.service.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      features: row.features,
      pricing: row.pricing,
      ctaLabel: row.ctaLabel,
      ctaHref: row.ctaHref,
      isFeatured: row.isFeatured,
    }));
  },
  "services",
  [CACHE_TAGS.services],
);

// ─── Testimonials ───────────────────────────────────────────────────────────

function toTestimonial(row: {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  date: Date;
}): TestimonialDTO {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    avatarUrl: row.avatarUrl,
    content: row.content,
    rating: row.rating,
    date: iso(row.date),
  };
}

export const getTestimonials = cached(
  async (): Promise<TestimonialDTO[]> => {
    const rows = await db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { date: "desc" }],
    });
    return rows.map(toTestimonial);
  },
  "testimonials",
  [CACHE_TAGS.testimonials],
);

// ─── Certificates ───────────────────────────────────────────────────────────

export const getCertificates = cached(
  async (): Promise<CertificateDTO[]> => {
    const rows = await db.certificate.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { issuedAt: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      issuer: row.issuer,
      issuedAt: iso(row.issuedAt),
      expiresAt: isoOrNull(row.expiresAt),
      credentialId: row.credentialId,
      verificationUrl: row.verificationUrl,
      imageUrl: row.imageUrl,
      fileUrl: row.fileUrl,
      description: row.description,
    }));
  },
  "certificates",
  [CACHE_TAGS.certificates],
);
