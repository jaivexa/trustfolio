import { z } from "zod";
import {
  checkbox,
  commaList,
  jsonField,
  linkHref,
  lines,
  mediaUrl,
  optionalDate,
  optionalInt,
  optionalMediaUrl,
  optionalText,
  optionalUrl,
  requiredDate,
  requiredText,
  slug,
  sortOrder,
} from "./common";
import { SERVICE_ICON_NAMES } from "@/lib/constants";

// ─── Projects ───────────────────────────────────────────────────────────────

export const projectMetricSchema = z.object({
  label: requiredText("Metric label", 60),
  value: requiredText("Metric value", 40),
});

export const projectMetricsSchema = z.array(projectMetricSchema).max(8, "At most 8 metrics");

export const projectImageSchema = z.object({
  url: mediaUrl,
  alt: requiredText("Alt text", 200),
  caption: z.string().trim().max(300).optional().nullable(),
});

export const projectSchema = z.object({
  title: requiredText("Title", 120, 2),
  slug,
  summary: requiredText("Summary", 300, 10),
  description: requiredText("Description", 20_000, 10),
  category: requiredText("Category", 60),
  thumbnailUrl: optionalMediaUrl,
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  completedAt: optionalDate,
  clientName: optionalText(120),
  clientIndustry: optionalText(120),
  clientUrl: optionalUrl,
  role: optionalText(120),
  duration: optionalText(60),
  challenge: optionalText(10_000),
  solution: optionalText(10_000),
  results: optionalText(10_000),
  seoTitle: optionalText(70),
  seoDescription: optionalText(170),
  isFeatured: checkbox,
  isPublished: checkbox,
  sortOrder,
  technologies: commaList(30),
  metrics: jsonField(projectMetricsSchema),
  images: jsonField(z.array(projectImageSchema).max(20, "At most 20 gallery images")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectMetric = z.infer<typeof projectMetricSchema>;
export type ProjectImageInput = z.infer<typeof projectImageSchema>;

// ─── Experience ─────────────────────────────────────────────────────────────

export const employmentTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "INTERNSHIP"] as const;

export const experienceSchema = z
  .object({
    company: requiredText("Company", 120),
    companyUrl: optionalUrl,
    logoUrl: optionalMediaUrl,
    position: requiredText("Position", 120),
    location: optionalText(120),
    employmentType: z.enum(employmentTypes),
    startDate: requiredDate("Start date"),
    endDate: optionalDate,
    description: requiredText("Description", 4000, 10),
    achievements: lines(12),
    technologies: commaList(30),
    isPublished: checkbox,
    sortOrder,
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    path: ["endDate"],
    message: "End date must be after the start date",
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;

// ─── Skills ─────────────────────────────────────────────────────────────────

export const skillCategories = ["FRONTEND", "BACKEND", "DATABASE", "DEVOPS", "TOOLS", "OTHER"] as const;

export const skillSchema = z.object({
  name: requiredText("Name", 60),
  category: z.enum(skillCategories),
  proficiency: z.coerce.number().int().min(0).max(100),
  years: optionalInt(0, 60),
  isFeatured: checkbox,
  sortOrder,
});

export type SkillInput = z.infer<typeof skillSchema>;

// ─── Services ───────────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  title: requiredText("Title", 80),
  slug,
  description: requiredText("Description", 600, 10),
  icon: z.enum(SERVICE_ICON_NAMES),
  features: lines(10, 120),
  pricing: optionalText(60),
  ctaLabel: requiredText("CTA label", 40),
  ctaHref: linkHref,
  isFeatured: checkbox,
  isPublished: checkbox,
  sortOrder,
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ─── Testimonials ───────────────────────────────────────────────────────────

export const testimonialSchema = z.object({
  name: requiredText("Name", 100),
  role: optionalText(100),
  company: optionalText(100),
  avatarUrl: optionalMediaUrl,
  content: requiredText("Testimonial", 1500, 20),
  rating: z.coerce.number().int().min(1).max(5),
  date: requiredDate("Date"),
  projectId: z.preprocess((v) => (v === "" || v === "none" ? null : v), z.string().max(64).nullable()),
  isPublished: checkbox,
  isFeatured: checkbox,
  sortOrder,
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ─── Certificates ───────────────────────────────────────────────────────────

export const certificateSchema = z
  .object({
    name: requiredText("Name", 150),
    issuer: requiredText("Issuer", 120),
    issuedAt: requiredDate("Issue date"),
    expiresAt: optionalDate,
    credentialId: optionalText(120),
    verificationUrl: optionalUrl,
    imageUrl: optionalMediaUrl,
    fileUrl: optionalMediaUrl,
    description: optionalText(600),
    isPublished: checkbox,
    sortOrder,
  })
  .refine((data) => !data.expiresAt || data.expiresAt >= data.issuedAt, {
    path: ["expiresAt"],
    message: "Expiry must be after the issue date",
  });

export type CertificateInput = z.infer<typeof certificateSchema>;
