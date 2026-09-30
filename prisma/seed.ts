/**
 * Seeds an admin user, site settings, profile and demo portfolio content.
 * Safe to re-run: singletons are upserted and demo content is only inserted
 * into empty tables.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");

const tech = (names: string[]) => ({
  connectOrCreate: names.map((name) => ({ where: { name }, create: { name, slug: slug(name.replace(/\./g, "-dot-")) } })),
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin ${email} already exists (password unchanged).`);
    return;
  }
  await db.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME ?? "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`✓ Created admin ${email}`);
}

async function seedSingletons() {
  await db.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      siteName: "Alex Morgan",
      siteDescription: "Senior full-stack engineer building reliable, human-centred software products.",
      seoTitle: "Alex Morgan — Senior Full-Stack Engineer",
      seoDescription:
        "Portfolio of Alex Morgan, a senior full-stack engineer who designs and ships fast, accessible and secure web platforms for ambitious teams.",
      seoKeywords: ["full-stack engineer", "Next.js", "TypeScript", "product engineering", "web performance"],
      twitterHandle: "@alexmorgan",
      defaultTheme: "SYSTEM",
      accentColor: "indigo",
      footerNote: "Designed and engineered with care.",
    },
  });

  await db.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      fullName: "Alex Morgan",
      headline: "I design and engineer software people can trust.",
      tagline:
        "Senior full-stack engineer with 9+ years shipping secure, high-performance products for fintech, health and SaaS teams.",
      heroEyebrow: "Senior Full-Stack Engineer · Product Architect",
      shortBio:
        "I help teams turn ambitious ideas into dependable products — from system architecture and APIs to polished, accessible interfaces.",
      bio: [
        "I'm a product-minded engineer who cares about the whole journey: the architecture that keeps a platform stable at scale, the details that make an interface feel effortless, and the processes that let teams ship confidently.",
        "Over the last nine years I've led engineering on payment platforms processing millions per month, rebuilt clinical scheduling tools used by thousands of practitioners, and helped early-stage startups find product–market fit with fast, measurable iterations.",
        "I work best in close partnership with design and product. I favour **boring, proven technology**, measurable outcomes and clear communication — and I document decisions so the next engineer doesn't have to guess.",
      ].join("\n\n"),
      avatarUrl: "/images/avatar.svg",
      location: "Lisbon, Portugal · Remote",
      email: "hello@alexmorgan.dev",
      availability: "Available for Q1 2027 engagements",
      isAvailable: true,
      resumeUrl: "/files/alex-morgan-resume.pdf",
      primaryCtaLabel: "View case studies",
      primaryCtaHref: "/projects",
      secondaryCtaLabel: "Book an intro call",
      secondaryCtaHref: "#contact",
      values: [
        "Clarity over cleverness — code and communication that others can build on.",
        "Accessibility and performance are features, not afterthoughts.",
        "Measure outcomes, not output.",
        "Own the problem end-to-end, from discovery to production.",
      ],
      highlights: [
        "Led a payments re-platform handling €40M+ per year with zero-downtime migration",
        "Cut median page load by 63% for a 2M-MAU marketplace",
        "Mentored 20+ engineers; ran the frontend guild at Northwind Health",
        "Speaker at JSConf EU and React Summit",
      ],
      socialLinks: {
        create: [
          { platform: "github", label: "GitHub", url: "https://github.com/", sortOrder: 0 },
          { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/", sortOrder: 1 },
          { platform: "x", label: "X", url: "https://x.com/", sortOrder: 2 },
          { platform: "email", label: "Email", url: "mailto:hello@alexmorgan.dev", sortOrder: 3 },
        ],
      },
    },
  });
  console.log("✓ Site settings & profile");
}

async function seedContent() {
  if ((await db.project.count()) > 0) {
    console.log("✓ Content already present — skipping demo content.");
    return;
  }

  const skills: [string, "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS" | "OTHER", number, number][] = [
    ["TypeScript", "FRONTEND", 95, 8],
    ["React & Next.js", "FRONTEND", 95, 8],
    ["Accessibility (WCAG 2.2)", "FRONTEND", 88, 6],
    ["Design systems", "FRONTEND", 90, 6],
    ["Motion & interaction", "FRONTEND", 80, 5],
    ["Node.js", "BACKEND", 92, 9],
    ["API design (REST & GraphQL)", "BACKEND", 90, 8],
    ["Go", "BACKEND", 70, 3],
    ["Event-driven systems", "BACKEND", 80, 5],
    ["PostgreSQL", "DATABASE", 90, 9],
    ["Prisma ORM", "DATABASE", 88, 5],
    ["Redis", "DATABASE", 78, 6],
    ["AWS", "DEVOPS", 82, 7],
    ["Vercel & edge platforms", "DEVOPS", 90, 5],
    ["Docker & Kubernetes", "DEVOPS", 75, 5],
    ["CI/CD & observability", "DEVOPS", 85, 7],
    ["Figma", "TOOLS", 80, 6],
    ["Playwright & Vitest", "TOOLS", 88, 5],
    ["Technical leadership", "OTHER", 90, 5],
    ["Product discovery", "OTHER", 82, 5],
  ];
  await db.skill.createMany({
    data: skills.map(([name, category, proficiency, years], i) => ({
      name,
      category,
      proficiency,
      years,
      sortOrder: i,
      isFeatured: proficiency >= 90,
    })),
  });

  const projects = [
    {
      title: "Ledgerline Payments Platform",
      category: "Fintech",
      summary: "Re-platformed a legacy payments stack into a modular, PCI-aligned system processing €40M+ annually.",
      clientName: "Ledgerline",
      clientIndustry: "Financial services",
      role: "Lead engineer",
      duration: "14 months",
      completedAt: new Date("2026-03-15"),
      isFeatured: true,
      thumbnailUrl: "/images/projects/ledgerline.svg",
      liveUrl: "https://example.com",
      technologies: ["TypeScript", "Next.js", "Node.js", "PostgreSQL", "Redis", "AWS"],
      metrics: [
        { label: "Annual volume", value: "€40M+" },
        { label: "Checkout conversion", value: "+18%" },
        { label: "Downtime during migration", value: "0 min" },
      ],
      challenge:
        "The existing monolith mixed billing, ledger and reporting logic in a single database, which made every release risky and audits slow.",
      solution:
        "We introduced a double-entry ledger service with idempotent APIs, migrated traffic with a strangler pattern behind feature flags, and rebuilt the merchant dashboard in Next.js with a shared design system.",
      results:
        "- Zero-downtime migration of 3.1M historical transactions\n- Release frequency went from monthly to daily\n- Reconciliation time dropped from 3 days to 20 minutes",
    },
    {
      title: "Northwind Clinical Scheduling",
      category: "Healthcare",
      summary: "An accessible scheduling suite used daily by 4,000+ clinicians across 120 practices.",
      clientName: "Northwind Health",
      clientIndustry: "Healthcare",
      role: "Frontend lead",
      duration: "10 months",
      completedAt: new Date("2025-09-01"),
      isFeatured: true,
      thumbnailUrl: "/images/projects/northwind.svg",
      technologies: ["React", "TypeScript", "GraphQL", "PostgreSQL", "Playwright"],
      metrics: [
        { label: "Clinicians onboarded", value: "4,000+" },
        { label: "Booking time", value: "−42%" },
        { label: "WCAG level", value: "AA" },
      ],
      challenge: "Scheduling relied on a decade-old desktop app with poor accessibility and no mobile support.",
      solution:
        "Designed a keyboard-first calendar with real-time conflict detection, offline-tolerant mutations and a component library audited against WCAG 2.2 AA.",
      results: "- Average booking time reduced by 42%\n- Support tickets down 35% in the first quarter\n- Passed an independent accessibility audit",
    },
    {
      title: "Atlas Marketplace Performance",
      category: "E-commerce",
      summary: "A performance programme that cut median load time by 63% for a 2M-MAU marketplace.",
      clientName: "Atlas Goods",
      clientIndustry: "Retail",
      role: "Performance consultant",
      duration: "4 months",
      completedAt: new Date("2025-02-20"),
      isFeatured: true,
      thumbnailUrl: "/images/projects/atlas.svg",
      technologies: ["Next.js", "Vercel", "TypeScript", "Redis"],
      metrics: [
        { label: "Median LCP", value: "1.1s" },
        { label: "Load time", value: "−63%" },
        { label: "Revenue per session", value: "+9%" },
      ],
      challenge: "Heavy client bundles and uncached API calls pushed Core Web Vitals into the red on mobile.",
      solution:
        "Moved rendering to React Server Components, introduced tag-based caching, image CDN policies and a performance budget enforced in CI.",
      results: "- All Core Web Vitals green on 95th percentile mobile\n- 9% uplift in revenue per session",
    },
    {
      title: "Orbit Design System",
      category: "Open Source",
      summary: "A themeable, accessible React component system adopted by six product teams.",
      clientName: null,
      role: "Creator & maintainer",
      duration: "Ongoing",
      completedAt: new Date("2024-11-05"),
      isFeatured: false,
      thumbnailUrl: "/images/projects/orbit.svg",
      githubUrl: "https://github.com/",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Storybook"],
      metrics: [
        { label: "Components", value: "64" },
        { label: "Teams using it", value: "6" },
      ],
      challenge: "Teams were rebuilding the same components with inconsistent behaviour and accessibility.",
      solution: "Built a token-driven system with headless primitives, visual regression tests and clear contribution guidelines.",
      results: "- Shipped features 30% faster across teams\n- One source of truth for tokens across web and native",
    },
    {
      title: "Pulse Analytics Dashboard",
      category: "SaaS",
      summary: "Real-time product analytics with sub-second queries over billions of events.",
      clientName: "Pulse",
      clientIndustry: "B2B SaaS",
      role: "Full-stack engineer",
      duration: "6 months",
      completedAt: new Date("2024-06-10"),
      isFeatured: false,
      thumbnailUrl: "/images/projects/pulse.svg",
      liveUrl: "https://example.com",
      technologies: ["Next.js", "Go", "ClickHouse", "Kubernetes"],
      metrics: [
        { label: "Events / day", value: "1.2B" },
        { label: "P95 query", value: "380ms" },
      ],
      challenge: "Customers waited minutes for dashboards on large datasets.",
      solution: "Introduced pre-aggregated materialized views, streaming ingestion and progressive chart rendering.",
      results: "- P95 query time down from 11s to 380ms\n- Net revenue retention up 12 points",
    },
    {
      title: "Kinetic Onboarding Flow",
      category: "SaaS",
      summary: "A research-led onboarding redesign that doubled activation for a developer tool.",
      clientName: "Kinetic",
      clientIndustry: "Developer tools",
      role: "Product engineer",
      duration: "3 months",
      completedAt: new Date("2023-10-01"),
      isFeatured: false,
      thumbnailUrl: "/images/projects/kinetic.svg",
      technologies: ["React", "Node.js", "PostgreSQL"],
      metrics: [{ label: "Activation", value: "2.1×" }],
      challenge: "Only 18% of sign-ups reached their first successful deploy.",
      solution: "Ran interviews, mapped drop-off, then shipped a guided, resumable onboarding with contextual docs.",
      results: "- Activation rate from 18% to 38%\n- Time-to-first-deploy under 6 minutes",
    },
  ];

  for (const [index, p] of projects.entries()) {
    const projectSlug = slug(p.title);
    await db.project.create({
      data: {
        title: p.title,
        slug: projectSlug,
        summary: p.summary,
        description: `${p.summary}\n\nThis engagement combined hands-on engineering with technical leadership: aligning stakeholders on measurable goals, designing the architecture, and shipping iteratively with a focus on reliability and user experience.`,
        category: p.category,
        thumbnailUrl: p.thumbnailUrl,
        githubUrl: p.githubUrl ?? null,
        liveUrl: p.liveUrl ?? null,
        clientName: p.clientName,
        clientIndustry: p.clientIndustry ?? null,
        role: p.role,
        duration: p.duration,
        completedAt: p.completedAt,
        isFeatured: p.isFeatured,
        isPublished: true,
        publishedAt: p.completedAt,
        sortOrder: index,
        metrics: p.metrics,
        challenge: p.challenge,
        solution: p.solution,
        results: p.results,
        technologies: tech(p.technologies),
        images: {
          create: [
            { url: p.thumbnailUrl, alt: `${p.title} overview`, caption: "Overview", sortOrder: 0 },
            { url: "/images/projects/detail-a.svg", alt: `${p.title} interface detail`, caption: "Interface detail", sortOrder: 1 },
            { url: "/images/projects/detail-b.svg", alt: `${p.title} architecture`, caption: "Architecture", sortOrder: 2 },
          ],
        },
      },
    });
  }

  const experiences = [
    {
      company: "Ledgerline",
      position: "Staff Software Engineer",
      location: "Remote",
      employmentType: "FULL_TIME" as const,
      startDate: new Date("2023-01-09"),
      endDate: null,
      description: "Technical lead for the payments platform, owning architecture, reliability and developer experience.",
      achievements: [
        "Led the zero-downtime migration to a double-entry ledger service",
        "Introduced SLOs and on-call practices that cut incidents by 48%",
        "Grew the platform team from 3 to 9 engineers",
      ],
      technologies: ["TypeScript", "Node.js", "PostgreSQL", "AWS", "Next.js"],
    },
    {
      company: "Northwind Health",
      position: "Senior Frontend Engineer",
      location: "London, UK",
      employmentType: "FULL_TIME" as const,
      startDate: new Date("2020-03-02"),
      endDate: new Date("2022-12-16"),
      description: "Led frontend architecture for clinical products and ran the company-wide frontend guild.",
      achievements: [
        "Shipped an accessible scheduling suite used by 4,000+ clinicians",
        "Created the Orbit design system adopted by six teams",
        "Mentored 12 engineers through promotion",
      ],
      technologies: ["React", "TypeScript", "GraphQL", "Playwright"],
    },
    {
      company: "Brightwave Studio",
      position: "Full-Stack Developer",
      location: "Lisbon, Portugal",
      employmentType: "FULL_TIME" as const,
      startDate: new Date("2017-05-15"),
      endDate: new Date("2020-02-21"),
      description: "Built web products for startups and agencies across e-commerce, media and SaaS.",
      achievements: ["Delivered 25+ client projects on time", "Introduced automated testing and CI across the studio"],
      technologies: ["Node.js", "React", "PostgreSQL", "Docker"],
    },
  ];
  for (const [index, e] of experiences.entries()) {
    await db.experience.create({ data: { ...e, sortOrder: index, technologies: tech(e.technologies) } });
  }

  const services = [
    {
      title: "Product Engineering",
      icon: "rocket",
      description: "End-to-end delivery of web products — from discovery and architecture to launch and iteration.",
      features: ["Technical discovery & scoping", "Next.js & TypeScript builds", "Launch plan & handover"],
      pricing: "From €9,000",
      isFeatured: true,
    },
    {
      title: "Performance & Core Web Vitals",
      icon: "gauge",
      description: "Measurable speed improvements that lift conversion, SEO and user satisfaction.",
      features: ["Audit with prioritised roadmap", "Rendering & caching strategy", "Performance budgets in CI"],
      pricing: "From €4,500",
    },
    {
      title: "Architecture & Technical Leadership",
      icon: "workflow",
      description: "Fractional staff-engineer support to de-risk decisions and level up your team.",
      features: ["Architecture reviews", "Hiring & mentoring", "Engineering process design"],
      pricing: "Monthly retainer",
    },
    {
      title: "Design Systems & Accessibility",
      icon: "palette",
      description: "Consistent, accessible UI foundations that let teams ship faster with confidence.",
      features: ["Token & component architecture", "WCAG 2.2 AA audits", "Documentation & adoption"],
      pricing: null,
    },
  ];
  await db.service.createMany({
    data: services.map((s, i) => ({ ...s, slug: slug(s.title), sortOrder: i, ctaLabel: "Discuss your project", ctaHref: "#contact" })),
  });

  const ledgerline = await db.project.findUnique({ where: { slug: "ledgerline-payments-platform" } });
  await db.testimonial.createMany({
    data: [
      {
        name: "Priya Raman",
        role: "CTO",
        company: "Ledgerline",
        content:
          "Alex combined deep technical judgement with calm, clear communication. The migration was the smoothest large project I've seen in my career.",
        rating: 5,
        date: new Date("2026-04-02"),
        isPublished: true,
        isFeatured: true,
        projectId: ledgerline?.id ?? null,
        sortOrder: 0,
      },
      {
        name: "Daniel Okafor",
        role: "Head of Product",
        company: "Northwind Health",
        content:
          "Clinicians told us the new scheduler 'just works' — which is the highest compliment in healthcare. Alex sweated every detail of accessibility.",
        rating: 5,
        date: new Date("2025-10-12"),
        isPublished: true,
        sortOrder: 1,
      },
      {
        name: "Sofia Lindqvist",
        role: "Founder",
        company: "Kinetic",
        content:
          "Within weeks our activation doubled. Alex brought structure to our discovery process and shipped at an impressive pace.",
        rating: 5,
        date: new Date("2023-11-20"),
        isPublished: true,
        sortOrder: 2,
      },
      {
        name: "Marco Bianchi",
        role: "VP Engineering",
        company: "Atlas Goods",
        content:
          "The performance programme paid for itself within a month. Clear reporting, pragmatic trade-offs and zero drama.",
        rating: 5,
        date: new Date("2025-03-18"),
        isPublished: true,
        sortOrder: 3,
      },
    ],
  });

  await db.certificate.createMany({
    data: [
      {
        name: "AWS Certified Solutions Architect – Professional",
        issuer: "Amazon Web Services",
        issuedAt: new Date("2025-05-10"),
        expiresAt: new Date("2028-05-10"),
        credentialId: "AWS-PSA-2025-0931",
        verificationUrl: "https://aws.amazon.com/verification",
        imageUrl: "/images/certificates/aws.svg",
        sortOrder: 0,
      },
      {
        name: "Certified Kubernetes Application Developer",
        issuer: "The Linux Foundation",
        issuedAt: new Date("2024-08-22"),
        expiresAt: new Date("2027-08-22"),
        credentialId: "LF-CKAD-2408-7712",
        verificationUrl: "https://training.linuxfoundation.org/certification/verify/",
        imageUrl: "/images/certificates/ckad.svg",
        sortOrder: 1,
      },
      {
        name: "Web Accessibility Specialist (WAS)",
        issuer: "IAAP",
        issuedAt: new Date("2023-03-14"),
        credentialId: "IAAP-WAS-3141",
        verificationUrl: "https://www.accessibilityassociation.org/",
        imageUrl: "/images/certificates/was.svg",
        sortOrder: 2,
      },
    ],
  });

  await db.contactMessage.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@example.com",
      subject: "Performance audit for our storefront",
      message:
        "Hi Alex — we're seeing poor Core Web Vitals on mobile and would love to talk about an audit next month. Are you available?",
    },
  });

  console.log("✓ Demo content");
}

async function main() {
  await seedAdmin();
  await seedSingletons();
  await seedContent();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
