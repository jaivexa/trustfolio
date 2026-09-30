import "server-only";
import { db } from "@/lib/db";
import { projectMetricsSchema } from "@/lib/validations/content";
import { requireAdminPage } from "@/server/auth-guard";
import type { MessageStatus } from "@/generated/prisma/enums";

/**
 * Uncached reads for the admin dashboard. Every function re-checks the session
 * (memoized per request) so data can never render for an anonymous visitor,
 * even if a layout check were bypassed.
 */
function adminQuery<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    await requireAdminPage();
    return fn(...args);
  };
}

export const getDashboardData = adminQuery(async () => {
  const [projects, publishedProjects, testimonials, pendingTestimonials, messages, unread, certificates, activity, recentMessages] =
    await Promise.all([
      db.project.count(),
      db.project.count({ where: { isPublished: true } }),
      db.testimonial.count(),
      db.testimonial.count({ where: { isPublished: false } }),
      db.contactMessage.count({ where: { status: { not: "ARCHIVED" } } }),
      db.contactMessage.count({ where: { status: "UNREAD" } }),
      db.certificate.count(),
      db.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      db.contactMessage.findMany({
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, subject: true, status: true, createdAt: true },
      }),
    ]);
  return {
    counts: { projects, publishedProjects, testimonials, pendingTestimonials, messages, unread, certificates },
    activity,
    recentMessages,
  };
});

export const listProjects = adminQuery(() =>
  db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      thumbnailUrl: true,
      isPublished: true,
      isFeatured: true,
      updatedAt: true,
      _count: { select: { images: true } },
    },
  }),
);

export const getProjectForEdit = adminQuery(async (id: string) => {
  const project = await db.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      technologies: { select: { name: true }, orderBy: { name: "asc" } },
    },
  });
  if (!project) return null;
  const metrics = projectMetricsSchema.safeParse(project.metrics);
  return { ...project, metrics: metrics.success ? metrics.data : [] };
});

export const listTechnologyNames = adminQuery(async () =>
  (await db.technology.findMany({ select: { name: true }, orderBy: { name: "asc" } })).map((t) => t.name),
);

export const listProjectCategories = adminQuery(async () =>
  (await db.project.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } })).map(
    (p) => p.category,
  ),
);

export const listExperience = adminQuery(() =>
  db.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    include: { technologies: { select: { name: true } } },
  }),
);

export const getExperienceForEdit = adminQuery((id: string) =>
  db.experience.findUnique({ where: { id }, include: { technologies: { select: { name: true }, orderBy: { name: "asc" } } } }),
);

export const listSkills = adminQuery(() =>
  db.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
);

export const listServices = adminQuery(() => db.service.findMany({ orderBy: { sortOrder: "asc" } }));

export const getServiceForEdit = adminQuery((id: string) => db.service.findUnique({ where: { id } }));

export const listTestimonials = adminQuery(() =>
  db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "desc" }],
    include: { project: { select: { title: true } } },
  }),
);

export const getTestimonialForEdit = adminQuery((id: string) => db.testimonial.findUnique({ where: { id } }));

export const listProjectOptions = adminQuery(() =>
  db.project.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
);

export const listCertificates = adminQuery(() =>
  db.certificate.findMany({ orderBy: [{ sortOrder: "asc" }, { issuedAt: "desc" }] }),
);

export const getCertificateForEdit = adminQuery((id: string) => db.certificate.findUnique({ where: { id } }));

export const listMessages = adminQuery(async (filter: "inbox" | "unread" | "archived") => {
  const where: { status: MessageStatus | { not: MessageStatus } } =
    filter === "archived" ? { status: "ARCHIVED" } : filter === "unread" ? { status: "UNREAD" } : { status: { not: "ARCHIVED" } };
  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, subject: true, message: true, status: true, createdAt: true },
    }),
    db.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Partial<Record<MessageStatus, number>>;
  return {
    messages,
    counts: {
      inbox: (byStatus.UNREAD ?? 0) + (byStatus.READ ?? 0),
      unread: byStatus.UNREAD ?? 0,
      archived: byStatus.ARCHIVED ?? 0,
    },
  };
});

export const getSettingsData = adminQuery(async () => {
  const [profile, settings] = await Promise.all([
    db.profile.findUnique({ where: { id: "default" }, include: { socialLinks: { orderBy: { sortOrder: "asc" } } } }),
    db.siteSetting.findUnique({ where: { id: "default" } }),
  ]);
  return { profile, settings };
});
