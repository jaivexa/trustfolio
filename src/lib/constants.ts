/**
 * Allow-lists shared by validation, admin forms and rendering.
 * These are configuration, not portfolio content.
 */

export const SERVICE_ICON_NAMES = [
  "sparkles",
  "code",
  "layout",
  "server",
  "database",
  "cloud",
  "shield",
  "gauge",
  "smartphone",
  "palette",
  "workflow",
  "bot",
  "rocket",
  "search",
  "users",
  "line-chart",
] as const;

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number];

export const SOCIAL_PLATFORMS = [
  "github",
  "linkedin",
  "x",
  "youtube",
  "instagram",
  "dribbble",
  "medium",
  "devto",
  "website",
  "email",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const ACCENT_COLORS = ["indigo", "violet", "emerald", "sky", "amber", "rose"] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number];

export const SKILL_CATEGORY_LABELS = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASE: "Database",
  DEVOPS: "DevOps & Cloud",
  TOOLS: "Tools",
  OTHER: "Other",
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
} as const;

/** Cache tags for public data. Admin mutations expire these. */
export const CACHE_TAGS = {
  profile: "profile",
  settings: "settings",
  projects: "projects",
  experience: "experience",
  skills: "skills",
  services: "services",
  testimonials: "testimonials",
  certificates: "certificates",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const PUBLIC_NAV = [
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/#experience" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/#contact" },
] as const;
