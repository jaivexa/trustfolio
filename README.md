# Trustfolio

A production-ready, database-driven **trust portfolio platform**: a premium personal-brand website with a secure admin dashboard. All portfolio content comes from PostgreSQL. The UI components contain no hard-coded content.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · Motion · PostgreSQL · Prisma 7 · Auth.js v5 · Zod 4 · Vercel-ready

---

## Architecture

```
prisma/
  schema.prisma          Relational schema (13 models, enums, indexes, cascades)
  migrations/            SQL migrations
  seed.ts                Idempotent seed: admin user, settings, profile, demo content
prisma.config.ts         Prisma 7 config (datasource URL, seed command)
scripts/create-admin.ts  Create an admin or reset a password
src/
  app/
    (site)/              Public site: home, /projects, /projects/[slug], legal pages
    admin/login/         Sign-in page
    admin/(dashboard)/   Protected dashboard: overview + CRUD for every entity
    api/auth/…           Auth.js route handlers
    api/admin/upload/    Authenticated file uploads
    uploads/[...path]/   Serves files from the local storage driver
    og/, icon.tsx        Generated Open Graph card and favicon
    sitemap.ts, robots.ts
  auth.ts, auth.config.ts   Auth.js (credentials + JWT), proxy-safe config
  proxy.ts               Fast redirect for /admin (Next 16's replacement for middleware)
  components/
    ui/                  shadcn/ui primitives
    sections/            Public page sections (server components + small client islands)
    site/                Header, footer, theme toggle, section layout
    admin/               Admin shell, form system, field editors, row actions
    motion/              Reveal / stagger / counter primitives
    shared/              Markdown, images, icons, empty states, form field
  lib/
    validations/         Centralized Zod schemas (shared by client and server)
    db.ts, env.ts, rate-limit.ts, storage.ts, email.ts, seo.ts, constants.ts
  server/
    queries/public.ts    Cached, tag-invalidated reads → serializable DTOs
    queries/admin.ts     Uncached admin reads, each re-checking the session
    actions/             Server actions (contact, auth, admin CRUD)
    auth-guard.ts        requireAdmin / requireAdminPage
```

### Key decisions

| Concern | Approach |
| --- | --- |
| **Rendering** | Public pages are **static with ISR**. Queries go through `unstable_cache` with cache tags. Admin mutations call `updateTag()`, so changes appear on the next request with no rebuild. Admin pages render dynamically. |
| **Client JS** | Server Components by default. Client code is limited to interactive islands: the header, filters, carousel, contact form, counters, and admin forms. Motion features are lazy-loaded (`LazyMotion`). |
| **LCP** | The hero entrance uses CSS only, so the headline never waits for JS. Page transitions skip the first load. |
| **Auth** | Auth.js credentials provider, bcrypt (cost 12), 8-hour JWT sessions. `proxy.ts` redirects early, and **every** admin page, query and action re-verifies the session against the database. Deleting a user revokes access immediately. Roles: `ADMIN`, `EDITOR`. Only admins can change site settings. |
| **Validation** | One set of Zod schemas in `src/lib/validations`. The contact form uses them client-side for instant feedback, and the server always re-validates. |
| **Rate limiting** | Fixed-window counters in Postgres, updated with one atomic `INSERT … ON CONFLICT`, so limits hold across serverless instances without Redis. Contact: 3 per IP per 10 min and 5 per email per day. Login: 5 attempts per IP+email per 15 min. Uploads: 60 per hour per admin. |
| **Spam** | Honeypot field and a minimum fill time. Bots get a fake success response and nothing is stored. IPs are stored only as salted SHA-256 hashes. |
| **Uploads** | Admin-only. MIME type allow-list plus magic-byte sniffing (no SVG uploads), a size limit, an origin check, and random file names. Drivers: `local` (disk) or `vercel-blob`. |
| **Security headers** | CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy. `/admin` is `noindex`. |
| **SEO** | Metadata comes from the database with a title template, canonical URLs, Open Graph and X cards. OG images are generated per project. Also includes a sitemap, robots.txt, JSON-LD (`Person`, `WebSite`, `CreativeWork`, `BreadcrumbList`), semantic landmarks, and one `h1` per page. |
| **Theming** | Every color, radius and shadow is a CSS variable in `globals.css`. Light, dark and system modes are persisted via `next-themes`. Six accent presets can be switched from Admin → Settings. |
| **Accessibility** | Skip link, visible focus rings, labelled controls, `aria-invalid` and `aria-describedby` on errors, live regions for form status, and a WAI-ARIA carousel with a pause control. `prefers-reduced-motion` is honored in both CSS and Motion. |

### Data model

`User` · `Profile` (singleton) · `SocialLink` · `SiteSetting` (singleton) · `Project` · `ProjectImage` · `Technology` (many-to-many with Project and Experience) · `Experience` · `Skill` · `Service` · `Testimonial` (optionally linked to a Project) · `Certificate` · `ContactMessage` · `ActivityLog` (powers "recent activity") · `RateLimit`

Trust metrics (years, projects, clients, certifications, technologies, achievements) are **derived from your content**. You can override any of them in Settings.

---

## Local development

**Requirements:** Node.js ≥ 20.9 and PostgreSQL ≥ 14.

```bash
git clone <repo> && cd trustfolio
npm install                       # also runs `prisma generate`
cp .env.example .env              # then edit values
npx auth secret                   # or: openssl rand -base64 32 → AUTH_SECRET

# Create the database (example for a local Postgres)
createdb trustfolio

npm run db:migrate                # apply migrations
npm run db:seed                   # admin user + demo content
npm run dev                       # http://localhost:3000
```

Sign in at **http://localhost:3000/admin** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

### Admin users

```bash
# Create an admin, or reset an existing user's password (prompts for the password if ADMIN_PASSWORD is unset)
npm run admin:create -- --email you@example.com --name "Your Name"
# Create an editor (content only, no site settings)
npm run admin:create -- --email editor@example.com --role EDITOR
```

Passwords must be at least 12 characters and include uppercase and lowercase letters and a number. Admins can change their password in **Settings → Account**.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:migrate` | Create and apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed (safe to re-run) |
| `npm run db:studio` | Prisma Studio |

### Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Use a pooled connection string in serverless environments. |
| `AUTH_SECRET` | ✅ | At least 32 characters. |
| `AUTH_TRUST_HOST` | self-hosting | `true` for `next start`, Docker, or behind your own proxy. Vercel sets it automatically. |
| `NEXT_PUBLIC_SITE_URL` | ✅ in prod | Canonical origin for metadata and the sitemap. |
| `STORAGE_DRIVER` | – | `local` (default) or `vercel-blob` |
| `BLOB_READ_WRITE_TOKEN` | with blob | Created when you link a Vercel Blob store. |
| `UPLOAD_MAX_MB` | – | Default `8` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL` | – | Optional email notification for each new contact message. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | seed only | Used by `db:seed` and `admin:create`. |

Secrets are only read on the server (`src/lib/env.ts` is `server-only`). The only public variable is `NEXT_PUBLIC_SITE_URL`.

---

## Production deployment (Vercel)

1. **Database:** create a Postgres database (Vercel Postgres/Neon, Supabase, RDS…). Use its **pooled** connection string as `DATABASE_URL`.
2. **Storage:** in Vercel → Storage, create a **Blob** store and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`. Then set `STORAGE_DRIVER=vercel-blob`. The local disk is not persistent on Vercel.
3. **Environment variables:** set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://your-domain.com`, the storage variables, and optionally the email variables.
4. **Build command:** set it to `npm run vercel-build`. This runs `prisma generate && prisma migrate deploy && next build`, so migrations are applied before the build. The database must be reachable at build time because public pages are prerendered.
5. **First deploy, then seed once** from your machine against the production database:
   ```bash
   DATABASE_URL="<prod url>" ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD='<strong password>' npm run db:seed
   ```
   To start empty instead of with demo content, create only an admin (`npm run admin:create`), then fill in **Settings → Profile** in the dashboard.
6. Replace the demo content, profile image and résumé from `/admin`.

### Self-hosting (Node/Docker)

```bash
npm ci && npm run build && npm run db:deploy
AUTH_TRUST_HOST=true npm start
```

With `STORAGE_DRIVER=local`, uploads are written to `./uploads`. Mount it as a persistent volume.

---

## Extending

- **New content type:** add a Prisma model and migration, a Zod schema in `lib/validations`, a cached getter in `server/queries/public.ts` with a new `CACHE_TAGS` entry, admin actions built on `adminMutation` + `expire(tag)`, and a form built from `components/admin/fields`.
- **New accent color:** add a `[data-accent="…"]` block in `globals.css` and the name to `ACCENT_COLORS`.
- **New service icon:** add it to `SERVICE_ICON_NAMES` and `components/shared/service-icon.tsx`.

## License

MIT
