/**
 * Admin content resources that share list, status and bulk-action behaviour.
 * Plain data (safe for client and server).
 */
export const RESOURCES = {
  trustees: { label: "Trustees", singular: "Trustee", href: "/admin/trustees", publicPath: "/trustees" },
  objectives: { label: "Objectives", singular: "Objective", href: "/admin/objectives", publicPath: "/about#objectives" },
  history: { label: "History", singular: "Timeline event", href: "/admin/history", publicPath: "/about#history" },
  activities: { label: "Activities", singular: "Activity", href: "/admin/activities", publicPath: "/activities" },
  projects: { label: "Projects", singular: "Project", href: "/admin/projects", publicPath: "/projects" },
  metrics: { label: "Impact metrics", singular: "Impact metric", href: "/admin/impact", publicPath: "/impact" },
  testimonials: { label: "Testimonials", singular: "Testimonial", href: "/admin/testimonials", publicPath: "/verification#testimonials" },
  stories: { label: "Stories", singular: "Story", href: "/admin/stories", publicPath: "/stories" },
  documents: { label: "Documents", singular: "Document", href: "/admin/documents", publicPath: "/documents" },
  reports: { label: "Annual reports", singular: "Annual report", href: "/admin/reports", publicPath: "/reports" },
  certificates: { label: "Certificates & awards", singular: "Certificate", href: "/admin/certificates", publicPath: "/certificates" },
  verification: { label: "Verification records", singular: "Verification record", href: "/admin/verification", publicPath: "/verification" },
  albums: { label: "Gallery", singular: "Album", href: "/admin/gallery", publicPath: "/gallery" },
  news: { label: "News & events", singular: "Post", href: "/admin/news", publicPath: "/news" },
  faqs: { label: "FAQ", singular: "Question", href: "/admin/faqs", publicPath: "/about#faq" },
} as const;

export type ResourceKey = keyof typeof RESOURCES;
export const RESOURCE_KEYS = Object.keys(RESOURCES) as ResourceKey[];

/** `/admin/<slug>` → resource key (e.g. "impact" → "metrics"). */
export function resourceFromSlug(slug: string): ResourceKey | null {
  return RESOURCE_KEYS.find((key) => RESOURCES[key].href === `/admin/${slug}`) ?? null;
}

export type BulkOperation = "publish" | "draft" | "archive" | "delete";

export const STATUS_LABELS = { DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" } as const;
