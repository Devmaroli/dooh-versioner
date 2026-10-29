---
name: Backend for apps
description: >-
  Use this when an app or MVP needs a real backend: database schema, APIs, auth
  and roles, payments or messaging integrations (webhooks), offline sync,
  security, hosting, or moving a prototype from mocked/local data to production.
---
# Backend for apps

## 1. Choose the setup (defaults)
- Fastest path: Supabase (Postgres + auth + storage + realtime + row-level security) or Neon Postgres with an ORM (Drizzle or Prisma).
- API layer: Next.js route handlers / server actions for web-first apps; a separate Node (Hono, Fastify, or NestJS) service when there are mobile clients, heavy webhooks, or background jobs.
- Background jobs and schedules: a queue or workflow tool (e.g. Vercel Workflow/Cron, Inngest, or BullMQ on Redis) for reminders, retries, and webhook processing.
- Hosting: Vercel for Next.js; Railway, Fly.io, or Render for long-running services; pick a region close to users (for the Gulf, a Middle East or EU region) and check data-residency rules.

## 2. Model the data
1. List entities and relationships from the user flows; draw an ER diagram (mermaid erDiagram).
2. Every table: id (uuid), created_at, updated_at, created_by; tenant id (e.g. shop_id) on everything multi-tenant.
3. Money as integer minor units with a currency column; never floats.
4. Ledgers and payments are append-only: corrections are new reversing entries, never edits or deletes. Derive balances with a view or a cached balance updated in the same transaction.
5. Use status enums with explicit state machines (order: placed, accepted, out_for_delivery, delivered, cancelled; ledger entry: pending, confirmed, disputed).
6. Add indexes for every foreign key and hot query; write migrations, never hand-edit production.

## 3. Auth and permissions
- Phone-number OTP is usually right for consumer and small-merchant apps in the Gulf; email/password or OAuth for admin.
- Roles (customer, merchant owner, merchant staff, delivery agent, admin) via a membership table (user_id, shop_id, role).
- Enforce access in the database (row-level security policies) or a single authorization layer; never trust the client. Each user sees only their own rows; merchants only their shop's rows.

## 4. API design
- Resource-oriented endpoints or typed server actions; validate every input with a schema (e.g. Zod); return consistent error shapes.
- Idempotency keys on anything that creates money movements or orders, so retries never double-charge or double-record.
- Pagination on lists; rate limiting on auth and public endpoints.
- Realtime (websockets or Supabase realtime) for chat and live order status.

## 5. Third-party integrations
- Wrap each provider behind an interface (messagingService, paymentService, smsService) so mocks and real providers swap cleanly.
- Webhooks: verify signatures, store the raw event, acknowledge fast, process in a background job, make handlers idempotent, and log failures for replay.
- Messaging (e.g. WhatsApp Business Cloud API): needs a verified business, phone number, approved message templates for outbound notifications outside the 24-hour window; inbound messages arrive by webhook and are stored to mirror chats.
- Payments: use a licensed gateway/aggregator for the market; never store card data; record payment intents and reconcile on webhook confirmation.

## 6. Offline and sync
- Client keeps a local store plus an outbox of pending operations with client-generated ids.
- Server accepts batched operations idempotently and returns the canonical state; append-only data makes conflicts rare. Show sync status in the UI.

## 7. Security and reliability checklist
- Secrets in environment variables, never in code; separate dev/staging/prod.
- HTTPS everywhere, least-privilege database keys (no service key in the client).
- Audit log for sensitive actions (credit added, entry reversed, role changed).
- Automated backups and a tested restore; error tracking (e.g. Sentry) and structured logs.
- Privacy: collect the minimum personal data, have a privacy policy, allow data export/deletion.

## 8. From prototype to production
1. Replace the local repository layer with real API calls behind the same interface.
2. Write the schema and migrations, seed data, and RLS policies; add tests for money logic and permissions.
3. Wire auth, then one real integration at a time behind feature flags.
4. Set up staging, CI (lint, typecheck, tests, migrations), and monitoring before inviting real users.
5. Load-test the hot paths and review costs.
