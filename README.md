# Trustfolio

A bilingual (English / தமிழ்) transparency website for a registered charitable trust. Every public claim is meant to be traceable to a real source. Pages include:

- who runs the trust, what it does and what it has achieved;
- the documents that support all of this;
- an **Evidence Center** that shows plainly what is and isn't documented yet.

Everything on the site is edited in a protected dashboard at `/admin`.

> **No official trust data is included.** The repository ships with clearly marked placeholders (`[Content pending official information]`) instead of a trust name, registration number, trustees, dates, figures or claims. Enter official information only from the trust's own documents. Optional demo content is labelled `[DEMO]` / "Sample" / "மாதிரி" and can be removed with one command (see [Demo content](#demo-content)).

---

## What's inside

### Public site (`/en/…` and `/ta/…`)

- **Home.** The hero's status chips come only from real data (e.g. "Registered trust" appears only once a registration number or document is published).
- **About.** Introduction, vision and mission, objectives, history timeline, founder and FAQ.
- **Trustees** and trustee profiles. A profile is published only when the trustee's consent is recorded.
- **Activities and projects.** Category, year and text filters. Project pages show the need, approach, activities, figures, documents, stories, photos and an evidence checklist.
- **Impact.**
  - Figures always show their period, how they were counted and their source.
  - Each figure opens its evidence.
  - Charts come with a table view.
  - Figures in different units are never added together.
- **Evidence Center** (`/verification`) with an evidence-coverage checklist.
  - There is no "trust score": an area is only ticked when published records exist.
  - A **Registration & Legal** page embeds the registration document viewer.
- **Document vault.** Search and filters; a PDF viewer with fullscreen, page jump and download. Also annual reports, certificates and awards, gallery albums with a keyboard-accessible lightbox, news and events, beneficiary stories, testimonials and contact.
- **Global search** in both languages, including Tamil text.
- **Localized states.** Error, empty and loading states, and `404`s, in both languages.
- **Design.**
  - Warm institutional look with Tamil-appropriate typography (Noto Sans / Serif Tamil, taller line height).
  - A deliberate dark theme.
  - Motion that respects "reduce motion".
  - Layouts verified from 320 px to 1920 px.

### Admin (`/admin`)

- **Side-by-side English | தமிழ் editor.** Each field pair shows *Complete* or *Tamil missing*, and every form has a live **Translation complete ✓ / Translation missing ⚠** summary.
- **One list view for every content type.**
  - Search in English or Tamil, filter by status or "Tamil missing", pagination.
  - Bulk **publish / move to draft / archive / delete**.
- **Draft / Published / Archived** on every content type.
- **Evidence links.** Reusable pickers link documents, projects, activities, reports and trustees to each other.
- **Media library.**
  - Alt text and captions in both languages.
  - **Public** or **private** uploads, with files validated by their content (magic bytes).
- **Other pages.** Dashboard with real evidence coverage and recent changes; translation report; categories; messages; SEO and site settings; navigation; social links; users; password change.
- **Roles.**
  - `ADMIN` has full access.
  - `EDITOR` manages content only. Trust profile, settings, navigation, social links and users are admin-only; this is enforced on the server for every page and action.

---

## Evidence, privacy and honesty rules (enforced in code)

| Rule | Where |
| --- | --- |
| Trustee profiles, testimonials and stories can't be published without recorded consent | Zod schemas (`src/lib/validations/admin.ts`) and bulk-publish guards (`src/server/actions/admin/bulk.ts`) |
| A document marked "contains personal data" can only be public if the public file is a **redacted** copy; otherwise it must stay private | Same, plus public queries only return `public + published + (no personal data OR redacted)` documents |
| Original (unredacted) documents are stored as **private** media, never served publicly — only through an authenticated admin route | `src/lib/storage.ts`, `src/app/api/admin/media/[id]/file` |
| Published impact figures need a method, a source document or an annual report | Metric schema and bulk-publish guard |
| Verification records must point to a document or an external registry/issuer link | Verification schema |
| Placeholders and missing data render as "Content pending official information" and are left out of structured data | `real()` in public queries, `organizationJsonLd` |
| Tamil is never generated automatically; untranslated text falls back to English with a `lang="en"` attribute and a visible note | `src/lib/i18n/localized.ts`, `src/components/i18n/tx.tsx` |
| No Aadhaar, personal ID numbers or private phone numbers: forms warn editors, and the public contact block only uses the trust's office details | Admin forms, trust profile |

---

## Architecture

**Stack.** Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui on Radix, Motion, PostgreSQL + Prisma 7 (`@prisma/adapter-pg`), Auth.js v5 (credentials + JWT), Zod 4, next-themes, Sonner. Deployable on Vercel.

```
prisma/                 schema, migrations, production-safe seed (placeholders only)
scripts/                create-admin, seed-demo, clear-demo
src/proxy.ts            locale negotiation (cookie → Accept-Language → en) + admin fast-path redirect
src/app/[locale]/       public site (root layout per locale, html lang, hreflang)
src/app/admin/          admin root layout; (dashboard)/[resource] generic list/new/edit routes
src/app/api/admin/      upload, media list, private file stream (all authenticated)
src/components/         ui/ (shadcn), layout/, trust/, cards/, impact/, interactive/, admin/
src/lib/i18n/           locales, dictionaries (en.ts, ta.ts), localized-value helpers, paths
src/lib/validations/    Zod schemas (contact, auth, admin)
src/server/queries/     public/ (cached DTOs) and admin.ts (uncached, session-checked)
src/server/actions/     server actions (contact, auth, admin/*)
```

- **Localization.**
  - Every URL is prefixed with `/en` or `/ta`, and the language switcher keeps you on the same page.
  - Bilingual content is stored as `fieldEn` / `fieldTa` columns and resolved per request through `Localized` DTOs.
  - UI copy lives in `src/lib/i18n/dictionaries/`.
- **Caching.**
  - Public data uses `unstable_cache` with tags (`CACHE_TAGS`); detail pages are statically generated and regenerate on demand.
  - Admin mutations expire the affected tags (`updateTag`), so edits show immediately.
  - Content created after a deploy renders on first request; there is no rebuild needed.
- **Security.**
  - **Server-side authorization:** every admin page calls `requireAdminPage()`, and every action or route calls `requireAdmin()`. The proxy is only a fast redirect.
  - **Attack protection:** strict CSP and security headers, origin checks on uploads, and Postgres-backed rate limiting (sign-in, contact form, uploads).
  - **Minimal responses:** admin DTOs never include storage keys or password hashes.
- **SEO.**
  - Per-locale metadata with `hreflang` (`en`, `ta`, `x-default`) and canonical URLs; `sitemap.xml` covers both languages with alternates; `robots.txt` excludes `/admin` and `/api`.
  - Structured data (Organization/NGO, WebSite, BreadcrumbList, Article, Event) is generated only from published, visible content.

---

## Local development

**Requirements:** Node.js ≥ 20.9 and PostgreSQL ≥ 14.

```bash
npm install                       # also runs `prisma generate`
cp .env.example .env              # then edit values
npx auth secret                   # or: openssl rand -base64 32 → AUTH_SECRET
createdb trustfolio               # example for a local Postgres

npm run db:deploy                 # apply migrations
npm run db:seed                   # admin user + categories (+ labelled demo data outside production)
npm run dev                       # http://localhost:3000 → redirects to /en or /ta
```

Sign in at **http://localhost:3000/admin** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

### Demo content

`npx prisma db seed` loads a complete **fictional** dataset outside production so every page can be tested. It uses a made-up organisation, the "Aram Community Trust" (அறம் சமூக அறக்கட்டளை), set around Thirumangalam, Madurai. The dataset includes:

- **People:** a founder and 5 trustees.
- **Purpose:** 6 objectives and 6 history events.
- **Work:** 8 projects (one a draft), 12 activities, 24 impact figures (10 organisation-wide for 2025–26, 4 for 2024–25 and 10 per project), 6 testimonials (one a draft) and 5 stories.
- **Evidence:** 6 documents with demo PDFs, 2 annual reports (the 2024–25 one deliberately has no PDF), 4 certificates and 3 Evidence Center records.
- **Other content:** 6 gallery albums, 8 news posts and events (one draft, one archived, one intentionally without Tamil), 4 FAQs and 8 contact messages in every status.

Every row has `isDemo = true` and a deterministic `demo-…` id, so re-running the seed updates rows instead of duplicating them.

**What the demo data never contains:** registration numbers, government approvals, audited or financial statements, verified testimonials, issuer verification links or real people's details.

- Certificates use `DEMO-CERT-00x` ids from a fictional issuer.
- Contact details are `demo@trustfolio.example` and `+91 00000 00000`.
- Social links point to `example.com`.
- Images are original SVG placeholders in `public/demo` (regenerate with `npm run demo:assets`).

**While demo data is visible:**

- The public site shows a bilingual "demonstration website" banner and is `noindex`, with no Organization structured data.
- The admin marks every demo record **DEMO DATA** and adds a "Demo data" filter to each list.

```bash
npx prisma db seed           # admin + categories + demo data (demo skipped when NODE_ENV=production)
SEED_DEMO=false npm run db:seed   # structure only — use this for a real deployment
npm run db:seed:demo         # add/refresh demo data only
npm run db:demo:clear        # delete every isDemo row; reset a demo profile/settings to placeholders
npm run db:reset-demo        # clear, then seed demo again (explicit, never part of db:seed)
npm run db:audit-demo        # check relations, Tamil coverage, demo flags and that no official claims exist
```

**Real records are protected:**

- The seed never modifies non-demo records. The trust profile and settings are only filled while they are empty, pending or already demo, and slugs used by real records are skipped.
- Changing the registered name of a demo profile in the admin marks it official, so `db:demo:clear` will not reset it.

**After seeding or clearing a running site,** use **Refresh public website** on the admin dashboard (cached pages otherwise update within a day).

### Users

```bash
npm run admin:create -- --email you@example.org --name "Your Name"            # admin
npm run admin:create -- --email editor@example.org --role EDITOR              # editor
```

Admins can also add users from **Users** in the dashboard; a temporary password is shown once. Passwords need at least 12 characters with upper- and lowercase letters and a number.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run db:migrate` | Create and apply migrations in development |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Production-safe seed (safe to re-run) |
| `npm run db:seed:demo` / `npm run db:demo:clear` / `npm run db:reset-demo` | Add / remove / rebuild labelled demo content |
| `npm run db:audit-demo` | Audit the seeded data |
| `npm run admin:create` | Create a user or reset a password |
| `npm run db:studio` | Prisma Studio |

### Environment variables

See [`.env.example`](.env.example).

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Use a pooled connection string in serverless environments. |
| `AUTH_SECRET` | ✅ | At least 32 characters. Never commit it. |
| `AUTH_TRUST_HOST` | self-hosting | `true` for `next start`, Docker or your own proxy. Vercel sets it automatically. |
| `NEXT_PUBLIC_SITE_URL` | ✅ in prod | Canonical origin for metadata, hreflang and the sitemap. |
| `STORAGE_DRIVER` | – | `local` (default) or `vercel-blob` |
| `BLOB_READ_WRITE_TOKEN` | with blob | Created when you connect a Vercel Blob store. |
| `UPLOAD_MAX_MB` | – | Default `8` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL` | – | Optional email notification for new contact messages. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | seed | Required by `db:seed` (it fails clearly if missing or weak). The password is hashed and never printed. |
| `ADMIN_RESET_PASSWORD` | – | `true` makes the seed reset an existing admin's password to `ADMIN_PASSWORD`. |
| `SEED_DEMO` | – | `true`/`false` overrides whether the seed loads demo data (default: on outside production). |

Secrets are only read on the server (`src/lib/env.ts` is `server-only`); the only public variable is `NEXT_PUBLIC_SITE_URL`.

---

## Entering the trust's information

1. **Trust profile** (admin only).
   - Enter the registered name, registration number, office, dates, legal status and registered address exactly as printed on the registration certificate.
   - Use the office contact details, never a personal mobile number.
2. **Documents.** Upload the registration certificate and trust deed.
   - If a document shows personal details (Aadhaar or ID numbers, signatures, home addresses, private phone numbers), upload a **redacted** copy as the public file and the original as the **private** file, then tick "contains personal data" and "redacted".
   - Link the document from the trust profile and from a **Verification record**.
3. **Trustees.** Add profiles and record each person's consent before publishing. Mark one as the founder.
4. **Objectives.** Copy them from the trust deed, citing the clause.
5. **Projects, activities and impact.** Add a figure only when it was actually counted, with its period, method and source.
6. **Tamil.**
   - Official and legal wording should come from the trust's registered Tamil documents.
   - Other Tamil text is written or reviewed by a person.
   - Use **Translations** to see what is still missing.

---

## Deployment (Vercel)

1. **Database.** Create a Postgres database and use its **pooled** URL as `DATABASE_URL`.
2. **Storage.**
   - Create a **Blob** store in Vercel → Storage and connect it (this adds `BLOB_READ_WRITE_TOKEN`), then set `STORAGE_DRIVER=vercel-blob`.
   - Private originals are stored as private blobs and streamed only to signed-in admins.
3. **Environment.** Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL=https://your-domain`, the storage variables and, optionally, the email variables.
4. **Build command.** Use `npm run vercel-build`, which runs `prisma generate && prisma migrate deploy && next build`. The database must be reachable at build time.
5. **Seed once** against the production database:
   ```bash
   DATABASE_URL="<prod url>" SEED_DEMO=false ADMIN_EMAIL=you@domain.org ADMIN_PASSWORD='<strong password>' npm run db:seed
   ```
6. Sign in at `/admin` and complete the trust profile.

### Self-hosting (Node/Docker)

```bash
npm ci && npm run build && npm run db:deploy
AUTH_TRUST_HOST=true npm start
```

With `STORAGE_DRIVER=local`, mount `./uploads` and `./private-uploads` as persistent volumes. Never serve `./private-uploads` directly.

---

## Before launch

- [ ] Replace every `[Content pending official information]` placeholder, and run `npm run db:demo:clear` if demo content was added.
- [ ] Have a native Tamil speaker review the interface text in `src/lib/i18n/dictionaries/ta.ts` and the static legal pages (privacy and terms).
- [ ] Review the privacy and terms pages with the trust's advisers.
- [ ] Check that every public document containing personal data uses a redacted file.
- [ ] Run `npm run lint && npm run typecheck && npm run build`.

## License

MIT
