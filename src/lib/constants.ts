/**
 * Allow-lists and configuration shared by validation, admin forms and rendering.
 * These are structural settings, not trust content.
 */
import type { RouteKey } from "@/lib/i18n/paths";

/** Icons available for objectives (resolved against an explicit map on render). */
export const OBJECTIVE_ICON_NAMES = [
  "heart-handshake",
  "graduation-cap",
  "book-open",
  "users",
  "hand-heart",
  "stethoscope",
  "home",
  "sprout",
  "droplets",
  "landmark",
  "scale",
  "lightbulb",
  "baby",
  "accessibility",
  "utensils",
  "tree",
] as const;
export type ObjectiveIconName = (typeof OBJECTIVE_ICON_NAMES)[number];

export const SOCIAL_PLATFORMS = ["facebook", "instagram", "youtube", "x", "linkedin", "whatsapp", "website", "email"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const ACCENT_COLORS = ["teal", "maroon", "indigo", "forest", "ochre"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

/** Public navigation items that admins can show, hide and reorder. */
export const NAV_KEYS = [
  "home",
  "about",
  "activities",
  "projects",
  "impact",
  "trustees",
  "documents",
  "gallery",
  "news",
  "contact",
  "verification",
  "reports",
  "certificates",
  "stories",
] as const satisfies readonly RouteKey[];
export type NavKey = (typeof NAV_KEYS)[number];

export const DEFAULT_NAVIGATION: { key: NavKey; visible: boolean }[] = [
  { key: "home", visible: true },
  { key: "about", visible: true },
  { key: "activities", visible: true },
  { key: "projects", visible: true },
  { key: "impact", visible: true },
  { key: "trustees", visible: true },
  { key: "documents", visible: true },
  { key: "gallery", visible: true },
  { key: "news", visible: true },
  { key: "contact", visible: true },
  { key: "verification", visible: false },
  { key: "reports", visible: false },
  { key: "certificates", visible: false },
  { key: "stories", visible: false },
];

/** Cache tags for public data. Admin mutations expire these. */
export const CACHE_TAGS = {
  trust: "trust",
  settings: "settings",
  trustees: "trustees",
  objectives: "objectives",
  history: "history",
  categories: "categories",
  activities: "activities",
  projects: "projects",
  impact: "impact",
  testimonials: "testimonials",
  stories: "stories",
  documents: "documents",
  reports: "reports",
  certificates: "certificates",
  verification: "verification",
  gallery: "gallery",
  news: "news",
  faqs: "faqs",
  media: "media",
} as const;
export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** Placeholder written by the seed where official information is missing. */
export const PENDING_MARKER = "[Content pending official information]";
