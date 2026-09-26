# Lectern LMS

A learning management system built with TanStack Start: a public course catalog with Stripe enrollment, a learner dashboard with lesson progress tracking, and an admin area for building courses (chapters, lessons, video uploads) plus platform analytics.

## Stack

- **Framework:** TanStack Start (SSR) + TanStack Router (file-based routes)
- **UI:** React 19, Tailwind CSS v4, shadcn-style components on Base UI, TipTap rich-text editor, Recharts dashboards
- **Auth:** Better Auth (email/password, Google + GitHub OAuth, email verification, password reset)
- **Database:** PostgreSQL (Neon serverless) via Drizzle ORM (relational queries v2, `defineRelations`)
- **Storage:** S3-compatible object storage (Tigris) via presigned URLs
- **Payments:** Stripe Checkout + webhooks (async fulfillment to `Active`)
- **Email:** Nodemailer + React Email templates (dev: `pnpm email:dev`)
- **Security:** Arcjet (rate limiting, bot protection) on auth, API, and public routes

## Getting started

Prerequisites: Node.js, pnpm, a PostgreSQL database, and accounts/keys for the services in `.env.example`.

```bash
cp .env.example .env.local
# fill in DATABASE_URL, BETTER_AUTH_*, OAuth clients, S3, Stripe, Arcjet
pnpm install
pnpm db:push        # create tables (or `pnpm db:migrate` once migrations exist)
pnpm dev            # http://localhost:3000
```

Useful scripts (`package.json`):

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server (`:3000`) |
| `pnpm build` / `preview` | Production build / preview (`:3001`) |
| `pnpm generate-routes` | Regenerate `src/routeTree.gen.ts` after route changes |
| `pnpm check` / `fix` | Ultracite lint check / autofix |
| `pnpm db:generate` | Generate a migration from schema changes (`drizzle/`) |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema directly (dev prototyping) |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm email:dev` | React Email preview server (`:3001`) |

## Architecture

- `src/routes/` — file-based routes: `_public` (landing, catalog), `_app/admin` (admin layout, `beforeLoad` role guard), `dashboard` (learner area), `api` (S3 upload, Stripe webhook, auth).
- `src/features/` — domain logic: `courses` (server functions + Zod schemas), `admin` (dashboard overview queries), `auth`, `email`.
- `src/db/` — Drizzle `schema/`, `relations.ts` (`defineRelations`), client.
- `src/components/` — shared UI (`ui/`, `shared/`), sidebar, file uploader, rich-text editor.

Key flows:

- **Enrollment:** learner checks out via Stripe → `checkout.session.completed` webhook (`src/routes/api/webhook/stripe.ts`, signature-verified) flips the `Pending` enrollment to `Active`. Idempotency keys guard retries.
- **Learning:** `getCourseSiderbarData` loads chapters/lessons; lesson views require an Active enrollment; `markLessonComplete` upserts `lesson_progress` (`user_lesson_unique` prevents duplicates).
- **Uploads:** admins request presigned PUT URLs (`/api/s3/upload`, MIME allowlist + size caps in `src/lib/upload-policy.ts`); the browser uploads straight to object storage.
- **Search:** `?q=` search params feed `loaderDeps` into `ILIKE` filters on published courses (debounced input, shareable URLs).

## Environment variables

See `.env.example` for the full list: `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, Google/GitHub OAuth clients, `SMTP_*` (optional in dev — falls back to a logging stub), `AWS_*` + `VITE_S3_BUCKET_NAME_IMAGES` (Tigris), `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (forward webhooks with `stripe listen --forward-to localhost:3000/api/webhook/stripe` during development), and `ARCJET_KEY`.

## Database migrations

Schema lives in `src/db/schema/*.schema.ts`; relations in `src/db/relations.ts`. After changing either:

```bash
pnpm db:generate   # writes to drizzle/
pnpm db:migrate    # apply
```

Review the generated SQL before applying. `drizzle.config.ts` reads `DATABASE_URL` from `.env.local`/`.env`.

## Deployment

`pnpm build` produces a Nitro server (`preset: node-server`) in `.output/`. Provide all production env vars (including `STRIPE_WEBHOOK_SECRET` for the live webhook endpoint and `BETTER_AUTH_URL` for the public origin), run pending migrations, and start the Nitro output.
