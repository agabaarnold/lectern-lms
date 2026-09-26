<p align="center">
  <img src="public/logo.svg" width="80" alt="Lectern logo" />
</p>

<h1 align="center">Lectern</h1>

<p align="center">
  A modern, full-stack Learning Management System for building, selling, and taking online courses.
</p>

---

## Overview

Lectern is a course platform where **instructors/admins** create courses made up of chapters and lessons, and **students** browse a public catalog, pay for a course via Stripe, and work through the content from a personal dashboard with progress tracking.

It's built on TanStack Start (React 19, SSR, file-based routing) with a Postgres/Drizzle data layer, Better Auth for authentication, Stripe for payments, and S3-compatible object storage for course media.

## Features

- **Authentication** — email/password with email verification, GitHub and Google OAuth (with account linking), breach-password checking (HaveIBeenPwned), and role-based access (`admin` vs. regular user)
- **Course authoring** — create courses with title, description, category, level, price, and duration; organize content into drag-and-drop-reorderable chapters and lessons; rich text lesson content via a Tiptap editor
- **Media uploads** — direct-to-S3 file uploads (course thumbnails, lesson videos) via presigned URLs
- **Payments** — Stripe Checkout for course purchases, with a signature-verified webhook that activates enrollments once payment is confirmed (handles both instant and delayed/async payment methods)
- **Student dashboard** — enrolled courses, per-course progress, and a lesson player
- **Public catalog** — browsable, searchable course listing with category and level filters
- **Admin analytics** — enrollment and revenue overview for admins
- **Security & abuse prevention** — Arcjet-backed bot detection and tiered rate limiting (separate policies for public, authenticated, admin, and webhook routes)
- **Transactional email** — verification, password reset, and other emails built with React Email and sent via Nodemailer/SMTP

## Tech stack

| Layer          | Choice |
|----------------|--------|
| Framework      | [TanStack Start](https://tanstack.com/start) (React 19, SSR, file-based routing via TanStack Router) |
| Database       | PostgreSQL ([Neon](https://neon.tech)) via [Drizzle ORM](https://orm.drizzle.team) |
| Auth           | [Better Auth](https://www.better-auth.com) |
| Payments       | [Stripe](https://stripe.com) |
| Storage        | S3-compatible object storage (e.g. [Tigris](https://www.tigrisdata.com)) via AWS SDK v3 |
| Bot/abuse protection | [Arcjet](https://arcjet.com) |
| Email          | [React Email](https://react.email) + Nodemailer |
| Rich text      | [Tiptap](https://tiptap.dev) |
| UI             | Tailwind CSS v4, shadcn/ui, Radix/Base UI, Tabler Icons |
| Data fetching  | TanStack Query |
| Forms          | TanStack Form |
| Lint/format    | Ultracite (Oxlint + Oxfmt) |

## Getting started

### Prerequisites

- Node.js and [pnpm](https://pnpm.io)
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)
- Accounts/API keys for the services you want enabled: Stripe, Arcjet, an S3-compatible bucket, an SMTP provider, and OAuth apps for GitHub/Google (all optional except the database and auth secret)

### Installation

```bash
git clone https://github.com/agabaarnold/lectern-lms.git
cd lectern-lms
pnpm install
```

### Environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Generate with `pnpm dlx @better-auth/cli secret` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Outgoing email (verification, password reset) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `NODE_ENV` | `development` / `production` |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_ENDPOINT_URL_IAM`, `AWS_REGION`, `VITE_S3_BUCKET_NAME_IMAGES` | S3-compatible storage for course media |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe payments |
| `ARCJET_KEY` | Bot detection and rate limiting |

### Database setup

```bash
pnpm db:generate   # generate a migration from schema changes
pnpm db:migrate    # apply migrations
pnpm db:studio     # optional: browse the database with Drizzle Studio
```

### Run the app

```bash
pnpm dev
```

The app runs at `http://localhost:3000` by default.

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build |
| `pnpm db:generate` / `db:migrate` / `db:push` / `db:pull` / `db:studio` | Drizzle migration workflow |
| `pnpm check` | Lint/format check with Ultracite |
| `pnpm fix` | Auto-fix lint/format issues |
| `pnpm email:dev` | Preview transactional email templates locally |

## Project structure

```
src/
├── components/       # Shared UI components (forms, sidebar, rich text editor, shadcn primitives)
├── db/
│   ├── schema/       # Drizzle schema (auth + LMS tables)
│   └── relations.ts
├── features/
│   ├── auth/         # Login/register/reset forms + server functions
│   ├── courses/      # Course/chapter/lesson/enrollment schemas & server functions
│   ├── admin/        # Admin-only server functions
│   └── email/        # Transactional email templates + sending
├── hooks/            # Shared React hooks (progress, debounce, theme, confetti, etc.)
├── lib/              # Auth, Stripe, S3, Arcjet clients and helpers
├── routes/
│   ├── _public/      # Public marketing/catalog pages
│   ├── _auth/        # Login/register/password-reset pages
│   ├── _app/admin/   # Admin course editor and analytics
│   ├── dashboard/    # Student dashboard and lesson player
│   ├── payment/      # Stripe success/cancel pages
│   └── api/          # Auth, S3 upload, and Stripe webhook routes
├── middleware.ts     # authMiddleware / adminMiddleware / arcjetMiddleware
└── router.tsx
```

## Deployment

The build output is a self-contained Node server (via [Nitro](https://nitro.build)):

```bash
pnpm build
node dist/server/index.mjs
```

It can be deployed to any Node-compatible host (Render, Fly.io, a VPS, etc.). See the [Nitro deployment docs](https://v3.nitro.build/deploy) for host-specific presets (Vercel, Netlify, Cloudflare, AWS Lambda).

Remember to point your Stripe webhook endpoint at `/api/webhook/stripe` in production and set `STRIPE_WEBHOOK_SECRET` accordingly.

## Contributing

Issues and pull requests are welcome. Before submitting a change, run:

```bash
pnpm check
```

to make sure the code passes lint and formatting checks.

## License

_Add a license for this project (e.g. MIT) so others know how they can use it._
