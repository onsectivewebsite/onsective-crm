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
- Status selects (invoice row, project, employee) are remounted via `key={value}` so they do reflect the saved value after a server action, but checkboxes still use `defaultChecked` — for anything else **confirm persisted values with a page reload or a read-only `prisma` query** instead of trusting the control.
- **Re-running `npm run seed` while a browser session cookie is live breaks writes**: the JWT still carries the old `employeeId`, so actions that create an `Activity` (e.g. `moveDeal`) fail with `Foreign key constraint violated on Activity_authorId_fkey`. Always sign out and log back in after a reseed.
- Both kanban boards (pipeline, project tasks) use native HTML5 drag-and-drop; synthetic mouse_down → several mouse_move → mouse_up works in Chrome and does persist.
- Invoice numbers derive from the highest existing `ONS-<year>-NNNN` (with a P2002 retry), so the next number is `max + 1` — create two in a row to check sequencing.
- Deal `probability` is **not rendered on pipeline cards**; it is only visible through the "Weighted forecast" stat (`sum(value × probability)`), so verify a stage move by predicting the exact forecast delta (stage map LEAD 10 / QUALIFIED 25 / PROPOSAL 50 / NEGOTIATION 75 / WON 100 / LOST 0) and optionally confirming with a prisma read.
- The invoice amount input has `step` granularity — non-multiple values (e.g. 4321) are rejected by HTML validation; use round amounts.
- Duplicate-email paths (`createClient`, `createPortalAccount`, `createEmployee`) are zod-validated `(prevState, formData)` actions surfaced through client components with `useActionState`; expect an inline rose-coloured message. Note the forms clear their inputs when an error is returned, so retyping is needed.
- Areas that were previously broken and might regress: portal Overview "Upcoming invoices" DRAFT filtering (`src/app/portal/page.tsx`), the below-`md` hamburger drawer plus `overflow-x-auto` main in `src/components/shell.tsx`, and the stable leave ordering (`startDate desc, id asc`) that keeps Approve/Reject buttons from jumping.
