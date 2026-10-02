# Architecture

## Folder Map

- `src/app/` owns routing and route-level composition. The public landing routes remain separate from `/dashboard`.
- `src/components/layout/` contains the shared dashboard navigation and logout control.
- `src/lib/` contains feature-agnostic auth guards, signed-session handling, Prisma access, Dhaka-time helpers, formatters, validators, and shared services.
- `src/lib/validators/` contains per-feature Zod input contracts; common Bangladesh mobile and money primitives live in `shared.ts`.
- `src/lib/services/balance.ts` calculates therapist earnings from active appointments and payout records; `balance-calculator.ts` contains the pure arithmetic.
- `src/features/` contains per-feature actions, services, repositories, schemas, and UI components.
- `src/prisma/` contains the generated Prisma 8 contract and database client; edit the source schema fragments, not generated files.
- `prisma/schemas/` is the current contract source configured by `prisma.config.ts`.
- `migrations/` contains Prisma 8 migration graph metadata and migration packages.

## Layer Rules

- Pages and layouts compose UI and call server-side services or guards.
- Client components call public auth APIs and render navigation; they do not query Prisma.
- Auth guards validate signed access tokens against the active `User` database row before exposing dashboard routes.
- Feature actions validate and authorize writes, services own business rules, repositories own Prisma queries, and components own presentation.
- Generated Prisma contract files are emitted from `prisma/schemas/` and should not be hand-edited.
- `src/lib/dhaka-time.ts` uses `Asia/Dhaka` and half-open time ranges (`start` inclusive, `end` exclusive); appointment serial dates are Dhaka `YYYY-MM-DD` values.
- `src/lib/mobile.ts` normalizes supported Bangladesh prefixes and validates canonical `01XXXXXXXXX` numbers.

## Shared Logic

- Feature forms and server actions import feature schemas; shared mobile and money primitives live in `src/lib/validators/`.
- Date filters use the Dhaka timezone helpers. Timestamp queries use half-open ranges; appointment serials use `getDhakaSerialDate()`.
- Money presentation uses `formatBDT()`; validation and storage remain integer BDT.
- `getTherapistBalance()` aggregates non-deleted appointment shares and all payout records. `calculateTherapistBalance()` contains the pure arithmetic and is tested without database access.
- Run `npm test` for Vitest coverage of mobile normalization, Dhaka boundaries, appointment calculations, and lifetime balance arithmetic.

## Login And Role Check

1. `src/app/(landing)/login/page.tsx` submits email and password to a server action; public registration is not exposed.
2. The server action finds the `User` by normalized email and verifies its Argon2 password hash.
3. A successful login writes signed HttpOnly `accessToken` (15 minutes) and `refreshToken` (7 days) cookies; `src/proxy.ts` verifies access and renews it from a valid refresh token.
4. `src/app/dashboard/layout.tsx` calls `requireUser()`.
5. `src/lib/auth.ts` verifies the session and loads the current `User` row, rejecting missing, soft-deleted, or non-staff rows.
6. The dashboard sidebar hides role-restricted links. Each protected feature must still enforce its role in a server-side guard or action.

## Password Reset

1. The login page links to `/forgot-password`; its form calls `requestPasswordReset` in the login Server Action module.
2. The action validates and normalizes the email, applies a short Redis rate limit, and returns the same confirmation whether an active staff account exists or not.
3. For an active ADMIN or RECEPTIONIST, the action creates a cryptographically random token, stores its SHA-256 key and user ID in Redis for 30 minutes, and sends the reset URL through the server-only Nodemailer helper.
4. `/reset-password` submits the token and matching new password to `resetPassword`. The action atomically consumes the token with Redis `GETDEL`, rechecks that the user is active, hashes the password with Argon2, and updates `User.passwordHash`.
5. SMTP uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`; `APP_URL` supplies the public origin for reset links. Redis credentials use the existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` settings.

## Initial Admin

After the database schema is migrated, set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and normalized `SEED_ADMIN_MOBILE` in `.env`; `SEED_ADMIN_NAME` is optional and defaults to the email's local part. Run `npm run seed:admin`. The command stores only the Argon2 hash and skips creation whenever an ADMIN row already exists.

## Implemented Phase 2 Flows

### Service Catalog

1. `/dashboard/services` requires ADMIN and loads the Service catalog through its repository.
2. Add, rename, and delete actions recheck ADMIN access, validate inputs, and delegate uniqueness/existence rules to the service layer.
3. Appointment service names are stored as snapshots, so deleting a catalog entry does not rewrite historical appointment invoices.

### Create Appointment And Invoice

1. `/dashboard/appointments/new` authenticates staff and loads Service options plus ACTIVE therapists. The schema has no therapist `deletedAt` field, so ACTIVE status is the available eligibility filter.
2. Mobile lookup normalizes Bangladesh prefixes, returns existing demographics, counts non-deleted visits, and lists incomplete packages.
3. The form submits to the appointment Server Action, which authenticates, validates with Zod, and calls the appointment service with the current staff ID.
4. One Prisma 8 `db.transaction` upserts patient details, catalogs typed services, verifies the therapist, applies package progression, calculates `Math.round(fee * therapistPercent / 100)`, allocates a Dhaka `PlainDate` serial, and inserts the appointment. Recognized PostgreSQL unique conflicts retry the whole transaction.
5. The generated invoice number and appointment ID are returned. The authenticated PDF route reloads the persisted appointment and renders the English invoice with clinic environment details.

## Implemented Phase 3 Flows

### Invoice PDF

1. The download link calls `GET /api/invoices/[id]/pdf` in the Node.js runtime.
2. The route requires ADMIN, validates the appointment UUID, and asks the invoice service for a non-deleted appointment plus its patient and therapist.
3. `InvoicePdfDocument` renders the English invoice fields and clinic details from environment variables; the route returns it as a private, non-cacheable PDF attachment.

### Invoice Search

1. `/dashboard/invoices` is available to authenticated ADMIN and RECEPTIONIST users; `q` and `page` are read from Next.js `searchParams`.
2. The invoice repository uses case-insensitive `ILIKE` partial matches against patient name and mobile, then filters out soft-deleted appointments.
3. Results include patient and therapist names, are ordered newest first, and use 20-row offset pagination. The UI preserves search text in previous/next links and links each row to the ADMIN-only PDF route.

## Planned Business Flows

The following flows remain part of the target architecture and are not implemented yet.

### Today's Closing

1. The dashboard page requests today's summary from the dashboard service.
2. The service computes the Asia/Dhaka day boundary and asks the repository for non-deleted appointment income, expenses, and payouts separately.
3. Closing is `income - expenses - payouts`; payouts are not included in expenses.

### Month Comparison And Growth

1. The dashboard page requests growth data only for ADMIN users.
2. The dashboard service computes current and previous month boundaries in Asia/Dhaka.
3. The repository aggregates non-deleted income, expenses, distinct patients, net, and cumulative daily income for both months.
4. The feature component displays values, percentage changes, and the cumulative income chart.

## Implemented Phase 4 Flows

### Therapist Management And Payout

1. `/dashboard/therapists` and `/dashboard/therapists/[id]` require ADMIN; the list defaults to ACTIVE therapists and has a separate BLOCKED view.
2. Create/edit actions validate profile details; delete and restore actions recheck ADMIN and switch status between ACTIVE and BLOCKED. The current Therapist schema has no `deletedAt`, so BLOCKED is the agreed reversible deleted state.
3. Card and detail balances are calculated from non-deleted appointment shares less all payout records; no balance is stored.
4. The payout action validates integer BDT with a minimum of ৳ 500, recalculates current balance inside a Prisma transaction, rejects amounts above it, and records the current admin as `paidById`.
5. The detail page shows lifetime earnings, paid total, current balance, payout dates/amounts, and a 20-row paginated appointment history.

## Implemented Phase 5 Flows

### Patient Directory And Profile

1. `/dashboard/patients` is available to authenticated staff and reads `q` and `page` from URL search parameters. The repository performs case-insensitive partial matches and returns 20 patients per page with non-deleted visit count and last visit.
2. `/dashboard/patients/[id]` shows patient details, active visits with invoice links, unfinished session packages based on each package's latest active visit, and total fees from active visits.
3. ADMIN can edit patient details; RECEPTIONIST sees the profile read-only.
4. Patient deletion is hard delete only when no appointment row references the patient. The server action requires ADMIN and the service rechecks the constraint in a Prisma transaction, counting soft-deleted appointments too.

## Implemented Phase 6 Flow

### Expenses

1. `/dashboard/expenses` reads the selected `month` from the URL and defaults it to the current Asia/Dhaka month.
2. The expense repository queries `[month start, next month start)` using Dhaka-local `PlainDateTime` timestamps and returns the month total with newest expenses first.
3. Create defaults to today's Dhaka calendar date; selected date-only values are stored as local midnight timestamps.
4. ADMIN can edit/delete any expense. RECEPTIONIST can edit/delete only records dated today in Asia/Dhaka, and edits must keep that date. Server actions enforce the policy inside the mutation service.
