# Architecture

## Folder Map

- `src/app/` owns routing and route-level composition. The public landing routes remain separate from `/dashboard`.
- `src/components/layout/` contains the shared dashboard navigation and logout control.
- `src/lib/` contains feature-agnostic auth guards, signed-session handling, Prisma access, Dhaka-time helpers, formatters, validators, and shared services.
- `src/lib/validators/` contains per-feature Zod input contracts; common Bangladesh mobile and money primitives live in `shared.ts`.
- `src/lib/services/balance.ts` calculates therapist earnings from active appointments and payout records; `balance-calculator.ts` contains the pure arithmetic.
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

- Feature forms and server actions import the specific schema from `src/lib/validators/`; mobile values normalize before the canonical BD number check.
- Date filters use the Dhaka timezone helpers. Timestamp queries use half-open ranges; appointment serials use `getDhakaSerialDate()`.
- Money presentation uses `formatBDT()`; validation and storage remain integer BDT.
- `getTherapistBalance()` aggregates non-deleted appointment shares and all payout records. `calculateTherapistBalance()` contains the pure arithmetic and is tested without database access.
- Run `npm test` for the Vitest suite covering mobile normalization, serial date boundaries, and lifetime balance arithmetic.

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

## Planned Business Flows

These flows are part of the target architecture but are not implemented in Phase 0.

### Create Appointment And Invoice

1. Appointment form submits to the appointment Server Action.
2. The action authenticates, authorizes, validates with Zod, and calls the appointment service.
3. The service enforces patient upsert, active therapist, Dhaka serial, session, and therapist-share rules inside one transaction.
4. The repository contains only the Prisma reads/writes used by the transaction.
5. The committed appointment is read by invoice lookup and rendered by the PDF route.

### Therapist Payout

1. The payout form calls the payout Server Action.
2. The action requires ADMIN and validates an integer BDT amount.
3. The payout service calculates earned lifetime share less prior payouts, enforces the minimum payout and available balance, then creates the payout with the current staff ID.
4. The repository owns the payout and balance queries; balance is calculated, never stored.

### Today's Closing

1. The dashboard page requests today's summary from the dashboard service.
2. The service computes the Asia/Dhaka day boundary and asks the repository for non-deleted appointment income, expenses, and payouts separately.
3. Closing is `income - expenses - payouts`; payouts are not included in expenses.

### Month Comparison And Growth

1. The dashboard page requests growth data only for ADMIN users.
2. The dashboard service computes current and previous month boundaries in Asia/Dhaka.
3. The repository aggregates non-deleted income, expenses, distinct patients, net, and cumulative daily income for both months.
4. The feature component displays values, percentage changes, and the cumulative income chart.
