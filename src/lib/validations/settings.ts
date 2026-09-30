import { z } from "zod";
import {
  checkbox,
  commaList,
  jsonField,
  linkHref,
  lines,
  optionalInt,
  optionalMediaUrl,
  optionalText,
  requiredText,
} from "./common";
import { ACCENT_COLORS, SOCIAL_PLATFORMS } from "@/lib/constants";

export const profileSchema = z.object({
  fullName: requiredText("Full name", 100),
  headline: requiredText("Headline", 140),
  tagline: requiredText("Credibility statement", 240),
  shortBio: requiredText("Short bio", 400, 10),
  bio: requiredText("Biography", 8000, 20),
  avatarUrl: optionalMediaUrl,
  location: optionalText(100),
  email: z.email("Enter a valid email address").trim().max(254),
  phone: optionalText(40),
  availability: optionalText(120),
  isAvailable: checkbox,
  resumeUrl: optionalMediaUrl,
  heroEyebrow: optionalText(80),
  primaryCtaLabel: requiredText("Primary CTA label", 40),
  primaryCtaHref: linkHref,
  secondaryCtaLabel: requiredText("Secondary CTA label", 40),
  secondaryCtaHref: linkHref,
  values: lines(8, 160),
  highlights: lines(8, 200),
  yearsExperience: optionalInt(0, 80),
  projectsCompleted: optionalInt(0, 100_000),
  clientsServed: optionalInt(0, 100_000),
  achievementsCount: optionalInt(0, 100_000),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: requiredText("Label", 40),
  url: z
    .string()
    .trim()
    .max(2048)
    .refine((v) => /^https:\/\//.test(v) || /^mailto:/.test(v), "Use an https:// or mailto: link"),
  isVisible: z.boolean().default(true),
});

export const socialLinksSchema = z.object({
  links: jsonField(
    z
      .array(socialLinkSchema)
      .max(12, "At most 12 links")
      .refine(
        (links) => new Set(links.map((l) => l.platform)).size === links.length,
        "Each platform can only be used once",
      ),
  ),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export const siteSettingsSchema = z.object({
  siteName: requiredText("Site name", 80),
  siteDescription: requiredText("Site description", 300),
  seoTitle: requiredText("SEO title", 70),
  seoDescription: requiredText("SEO description", 170, 20),
  seoKeywords: commaList(20, 40),
  ogImageUrl: optionalMediaUrl,
  twitterHandle: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z
      .string()
      .trim()
      .regex(/^@?[A-Za-z0-9_]{1,15}$/, "Enter a valid X/Twitter handle")
      .transform((v) => (v.startsWith("@") ? v : `@${v}`))
      .nullable(),
  ),
  defaultTheme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  accentColor: z.enum(ACCENT_COLORS),
  showServices: checkbox,
  showTestimonials: checkbox,
  showCertificates: checkbox,
  contactEnabled: checkbox,
  footerNote: optionalText(200),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
