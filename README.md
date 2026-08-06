# Onsective OS

Company management system for **Onsective Inc** — an IT company selling SEO, social media management and digital marketing.

One app, three audiences:

| Area | Who | What it covers |
| --- | --- | --- |
| Workspace | Admin / Manager | Employees, leave approvals, clients, sales pipeline, projects, invoices, support |
| Workspace | Employee | Assigned tasks, time logging, own leave requests, client and project context |
| Client portal | Client | Project progress, deliverables, invoices, support conversations |

## Modules

- **People** — employee directory with departments, reporting lines, employment type, salary, status; leave requests with manager approval.
- **CRM** — clients with owners and activity timeline; drag-and-drop deal pipeline (Lead → Qualified → Proposal → Negotiation → Won/Lost) with weighted forecasting.
- **Work pipeline** — projects per client and service line, kanban task board, per-task time entries and progress rollups.
- **Billing** — invoices per client/project with status tracking and receivables reporting.
- **Client portal** — scoped to the signed-in client: only `clientVisible` tasks, non-draft invoices, and their own tickets.

## Stack

Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Prisma · PostgreSQL · JWT cookie sessions (`jose` + `bcryptjs`).

## Getting started

```bash
npm install
cp .env.example .env          # then set DATABASE_URL and AUTH_SECRET

docker run -d --name onsective-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=onsective -p 5433:5432 postgres:16

npx prisma migrate dev
npm run seed
npm run dev
```

`AUTH_SECRET` must be a random string of at least 32 characters (`openssl rand -base64 32`).

### Demo logins

Seeded with password `onsective123`:

| Role | Email |
| --- | --- |
| Admin | `admin@onsective.com` |
| Manager (Head of SEO) | `priya@onsective.com` |
| Employee | `diego@onsective.com` |
| Client portal | `client@northpeak.com` |

## Access control

Sessions are signed JWTs in an httpOnly cookie. Every page resolves the session server-side through `requireStaff` / `requireAdmin` / `requireClient` in `src/lib/auth.ts`, and portal queries are always filtered by the session's `clientId` — clients can never read another account's data.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run seed` | Reset and reseed demo data |
