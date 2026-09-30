/**
 * Serializable shapes passed from the data layer to UI components.
 * Dates are ISO strings so they survive caching and the RSC boundary intact.
 */
import type { ProjectMetric } from "@/lib/validations/content";
import type { EmploymentType, SkillCategory, ThemePreference } from "@/generated/prisma/enums";

export type LinkDTO = { label: string; href: string };

export type SocialLinkDTO = { id: string; platform: string; label: string; url: string };

export type ProfileDTO = {
  fullName: string;
  headline: string;
  tagline: string;
  shortBio: string;
  bio: string;
  avatarUrl: string | null;
  location: string | null;
  email: string;
  availability: string | null;
  isAvailable: boolean;
  resumeUrl: string | null;
  heroEyebrow: string | null;
  primaryCta: LinkDTO;
  secondaryCta: LinkDTO;
  values: string[];
  highlights: string[];
  socialLinks: SocialLinkDTO[];
  updatedAt: string;
};

export type SiteSettingsDTO = {
  siteName: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImageUrl: string | null;
  twitterHandle: string | null;
  defaultTheme: ThemePreference;
  accentColor: string;
  showServices: boolean;
  showTestimonials: boolean;
  showCertificates: boolean;
  contactEnabled: boolean;
  footerNote: string | null;
};

export type TrustStatsDTO = {
  yearsExperience: number;
  projectsCompleted: number;
  clientsServed: number;
  certifications: number;
  technologies: number;
  achievements: number;
};

export type SkillDTO = { id: string; name: string; proficiency: number; years: number | null; isFeatured: boolean };

export type SkillGroupDTO = { category: SkillCategory; label: string; skills: SkillDTO[] };

export type ProjectCardDTO = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string | null;
  category: string;
  isFeatured: boolean;
  completedAt: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  clientName: string | null;
  technologies: string[];
};

export type ProjectImageDTO = { id: string; url: string; alt: string; caption: string | null };

export type ProjectDetailDTO = ProjectCardDTO & {
  description: string;
  clientIndustry: string | null;
  clientUrl: string | null;
  role: string | null;
  duration: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  metrics: ProjectMetric[];
  images: ProjectImageDTO[];
  testimonials: TestimonialDTO[];
  related: ProjectCardDTO[];
  updatedAt: string;
  publishedAt: string | null;
};

export type ExperienceDTO = {
  id: string;
  company: string;
  companyUrl: string | null;
  logoUrl: string | null;
  position: string;
  location: string | null;
  employmentType: EmploymentType;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
  technologies: string[];
};

export type ServiceDTO = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  pricing: string | null;
  ctaLabel: string;
  ctaHref: string;
  isFeatured: boolean;
};

export type TestimonialDTO = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  date: string;
};

export type CertificateDTO = {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string | null;
  credentialId: string | null;
  verificationUrl: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  description: string | null;
};
