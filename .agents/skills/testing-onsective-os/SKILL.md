---
name: testing-onsective-os
description: How to boot, seed and end-to-end test Onsective OS (Next.js 15 + Prisma + custom JWT cookie auth), including demo logins, role routing, and tricks for verifying client-portal data isolation.
---

# Testing Onsective OS locally

## Bring the app up
1. Postgres runs in docker on port **5433** (matches `DATABASE_URL` in `.env`):
   - first time: `docker run -d --name onsective-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=onsective -p 5433:5432 postgres:16`
   - after a box restart the container usually exists but is stopped: `docker start onsective-pg`
2. `npx prisma migrate deploy`
3. `npm run seed` (idempotent reset/reseed; prints a seeded ticket id)
4. `npm run dev` → http://localhost:3000 (logs to a file, e.g. `npm run dev > /tmp/dev.log 2>&1 &`; grep it for `⨯ Error` after each server action — failed server actions surface as Next.js error overlays and log there)

`.env` already contains `DATABASE_URL` and `AUTH_SECRET`. No external secrets are needed — **Devin Secrets Needed: none**.

## Logins (all password `onsective123`)
| Email | Role | Lands on |
|---|---|---|
| admin@onsective.com | ADMIN | /dashboard |
| priya@onsective.com | MANAGER | /dashboard |
| diego@onsective.com | EMPLOYEE | /dashboard (no Employees nav link) |
| client@northpeak.com | CLIENT | /portal |

Auth is a `onsective_session` JWT cookie (`src/lib/auth.ts`). Guards: `requireStaff` bounces CLIENT→/portal, `requireAdmin` bounces EMPLOYEE→/dashboard, `requireClient` bounces staff→/dashboard, no session→/login. There is no middleware, so test guards by visiting routes directly in the address bar.

## Useful testing tricks
- The seed only creates a ticket for NorthPeak. To test cross-tenant access (`/portal/tickets/<other client id>` must 404) create a ticket for another client first with a one-off script:
  `npx tsx -e 'import {PrismaClient} from "@prisma/client"; ...prisma.ticket.create({data:{clientId, subject, messages:{create:{...}}}})'`
- Verify hidden-from-portal tasks with the seeded `Internal: margin review` task (`clientVisible=false`) on the NorthPeak SEO project.
- Checkbox/select state after a server action is not re-synced (`defaultValue`/`defaultChecked`), so **always confirm persisted values with a page reload or a `prisma` query** instead of trusting the control.
- Both kanban boards (pipeline, project tasks) use native HTML5 drag-and-drop; synthetic mouse_down → several mouse_move → mouse_up works in Chrome and does persist.
- Invoice numbers come from `count()+1` (`ONS-YYYY-NNNN`), so numbering shifts if rows are deleted; expect the next number to equal current row count + 1.
- Known rough edges to re-check when testing: portal Overview "Upcoming invoices" card includes DRAFT invoices; duplicate portal-account email throws a raw Prisma unique-constraint error page; below 768px the sidebar disappears with no hamburger menu, and wide tables are clipped by `overflow-x-hidden` in `src/components/shell.tsx`.
