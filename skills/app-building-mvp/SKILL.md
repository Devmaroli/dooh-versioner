---
name: App building MVP
description: >-
  Use this when the user wants to build an app, MVP, or working prototype from
  an idea: scoping features, choosing a stack, briefing a coding agent, mocking
  third-party services, deploying, and reporting a demo.
---
# App building: idea to working MVP

## 1. Scope the MVP
1. Restate the idea in one line and name the hero feature (the one thing that must impress in a demo).
2. List roles and their must-have jobs. Sort every feature into Must (demo breaks without it), Should (nice in demo), Later (production). Build only Must plus a few cheap Shoulds.
3. List external dependencies (messaging APIs, payments, maps, auth, SMS). For an MVP, mock each behind a service interface (e.g. `paymentService`, `messagingService`) with realistic fake states, and note the real API to plug in later.
4. Define done: the flows that must work end to end, plus build passing and screenshots.

## 2. Pick the stack (defaults unless the user says otherwise)
- Web or mobile-first PWA prototype: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; local persistence (localStorage or IndexedDB) behind a repository layer so a real backend can swap in.
- Real backend later: Postgres (Supabase or Neon) with auth, row-level security, and server actions or API routes.
- Native mobile: Expo (React Native) + TypeScript when app-store presence, camera, push, or offline-first matters.
- Offline-first data (field shops, delivery): local DB with a sync queue and conflict rules (append-only ledgers avoid most conflicts).
- Deploy: Vercel for Next.js; Expo EAS for mobile builds.

## 3. Design first, lightly
Run the UX design for apps skill (if available) to get flows, screen list, states, and tokens. Even a short flow list plus screen list massively improves what a coder builds.

## 4. Brief the builder (a coding agent or yourself)
A good brief has: product summary and hero feature; roles and flows; screen list with states (empty, loading, error, offline); data model sketch; what's mocked and how; seeded realistic demo data (local names, currency, prices); i18n/RTL needs; quality bar; and an explicit definition of done (build passes, flows clicked through end to end, screenshots of key screens, README with demo walkthrough and next steps). Describe outcomes, not line-by-line code.

## 5. Data model patterns worth reusing
- Money as integer minor units (e.g. fils for KWD, 1 KD = 1000 fils), formatted only at display.
- Ledgers are append-only transactions (debit, credit, payment, adjustment) with created_by, source (online, offline), timestamp, and status (pending, confirmed, disputed); balances are derived, never stored as the only truth.
- Multi-tenant: every row carries the owning org/shop id.
- Orders: draft, placed, accepted, out for delivery, delivered, cancelled; payments: method (online, cash on delivery, credit), status.

## 6. Verify
1. Build passes and no console errors.
2. Click every Must flow end to end as each role; check cross-role effects (an action in one role visible in another).
3. Check mobile width (375 px), RTL if bilingual, empty states, and refresh persistence.
4. Capture screenshots of the key screens.

## 7. Report and next steps
Share the demo link or run instructions, screenshots, what works, what's mocked, known gaps, and a short production roadmap (real auth, backend, the real third-party integrations, compliance such as payment provider onboarding, analytics, app stores). Offer the most useful next iteration rather than a long list.
