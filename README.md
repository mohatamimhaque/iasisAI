# Iasis AI

Iasis AI is a full-stack healthcare platform built with Next.js, Supabase, and Cloudflare R2. It powers patient, doctor, clinic, and admin experiences, including AI-assisted triage, chat, and reporting workflows.

## Docs

- [iasis_ai_prd.md](iasis_ai_prd.md) — Product Requirements Document
- [docs/master.md](docs/master.md) — Master documentation
- [docs/developer.md](docs/developer.md) — Developer guide
- [docs/user-admin.md](docs/user-admin.md) — Admin guide
- [docs/user-clinic.md](docs/user-clinic.md) — Clinic/lab guide
- [docs/user-doctor.md](docs/user-doctor.md) — Doctor guide
- [docs/user-patient.md](docs/user-patient.md) — Patient guide

## Tech stack

- Next.js 16 (App Router)
- React 19
- Supabase (Auth + Postgres)
- Cloudflare R2 (asset storage)
- Tailwind CSS

## Project structure

- app/: App Router pages and API routes
- components/: UI and feature components
- lib/: shared utilities and Supabase clients
- supabase/: schema and migrations
- public/: static assets
- scripts/: admin or maintenance scripts

## Quick start

1) Install dependencies

```
npm install
```

2) Create an env file

```
cp .env.example .env.local
```

3) Start the dev server

```
npm run dev
```

## Environment variables

Set these in .env.local for local dev and in your hosting provider for production:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
- SUPABASE_SERVICE_ROLE_KEY
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME
- R2_PUBLIC_URL

Notes:
- SUPABASE_SERVICE_ROLE_KEY is required for admin email lookups and role management.
- R2_PUBLIC_URL should be a public base URL for assets (no trailing slash).

## Scripts

- npm run dev: start the dev server
- npm run build: build for production
- npm start: run the production build
- npm run lint: lint the codebase
- npm run backup:supabase: run the Supabase backup script

## Admin features

- Admin settings: profile, password, add admin by email or user id
- Admin users: email search, role management
- Branding: upload logo and favicon (server-side upload to R2)

## Storage and uploads

Uploads are handled server-side to avoid CORS issues. Branding and profile photos are uploaded via API routes and stored in R2. The app saves public URLs to the database.

## Deployment

1) Add env vars to your hosting provider.
2) Deploy with `npm run build` and `npm start`.

## Security notes

- Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
- Rotate keys if they are ever exposed.

## License

Proprietary. All rights reserved.
