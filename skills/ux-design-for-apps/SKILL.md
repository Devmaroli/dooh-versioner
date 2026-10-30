---
name: UX design for apps
description: >-
  Use this when designing, reviewing, or critiquing the UX/UI of a mobile or web
  app or MVP: user flows, screens, wireframes, design systems, usability,
  accessibility, Arabic/RTL, or writing a design brief for a builder.
---
# UX design for apps

Goal: turn an idea into flows and screens that real users can complete fast, then hand a builder a brief precise enough to implement.

## 1. Frame the problem (before any screen)
1. Write a one-line problem statement: who struggles, with what, today, and why it hurts.
2. List each user role (e.g. customer, shop owner, delivery agent, admin) with: goal, context of use (one hand? in a rush? low literacy? patchy connectivity?), device, and language.
3. Name the ONE hero job the product must nail. Everything else supports it. Write 3 success metrics (e.g. time to record a sale < 5 s, % of entries acknowledged by customer).
4. Capture current workarounds (paper ledgers, WhatsApp, spreadsheets). The new flow must beat them on speed and trust, not just look nicer.

## 2. Map flows
1. For each role, write the top 3–5 jobs as user stories: "As a <role>, I want <action> so that <outcome>."
2. Draw each job as a flow (a mermaid flowchart works): entry point, steps, decisions, success state, error/empty/offline states.
3. Count taps for the hero job and cut it down. Target: the most frequent action is reachable in one tap from the home screen and completes in 3 taps or fewer.
4. Mark where two roles touch the same data (e.g. a shopkeeper entry appearing on a customer account) and design both sides plus notifications, confirmation, and dispute paths.

## 3. Information architecture
- 3–5 bottom-nav tabs max on mobile; the hero job gets the primary position or a floating action button.
- Name things in users' words ("Credit", "Owes you") not system words ("Ledger entity").
- Sketch the screen list with each screen's single purpose.

## 4. Screen design principles
- Hierarchy: one primary action per screen, visually dominant; secondary actions quieter.
- Big touch targets (min 44×44 pt), thumb-zone placement for frequent actions, numeric keypads for amounts.
- Show state always: loading, empty (with a call to action), error (with a fix), offline (queued, will sync), success (with undo where possible).
- Money: always show currency and correct decimals (e.g. KWD has 3); color plus sign plus label for owed vs paid (never color alone).
- Trust: timestamps, who recorded an entry, receipts, confirmations before irreversible actions, an audit trail.
- Forms: smart defaults, remember recent values, inline validation, no more fields than needed.
- Progressive disclosure: advanced options behind "More".

## 5. Localization, Arabic and RTL
- Design bilingual from day one: mirror layout (logical start/end, not left/right), flip directional icons (arrows, back), keep numbers, phone numbers, and media controls LTR.
- Allow for text expansion and pick fonts with good Arabic support (e.g. IBM Plex Sans Arabic, Noto Sans Arabic, Cairo, Tajawal).
- Respect local norms: currency formatting, prayer-time/shop-hour patterns, preferred channels such as WhatsApp, local payment methods.

## 6. Accessibility checklist
- Text contrast ≥ 4.5:1 (3:1 for large text), body text ≥ 16 px, supports dynamic type.
- Every control has a label; focus order is logical; don't rely on color alone.
- Reduced-motion friendly; errors are announced, not only colored.

## 7. Visual system (lightweight design system)
- Tokens: color (primary, surface, text, success, warning, danger), type scale (e.g. 12/14/16/20/24/32), spacing on a 4 or 8 px grid, radius, elevation.
- Core components: button (primary, secondary, ghost, danger), input, list row, card, chip, bottom sheet, toast, empty state, avatar, badge, tab bar.
- Keep one icon set (e.g. Lucide) and one illustration style.

## 8. Review and test
1. Heuristic pass (Nielsen's 10): visibility of status, match with real world, user control/undo, consistency, error prevention, recognition over recall, efficiency, minimal design, error recovery, help.
2. 5-user hallway test per role: give a task, stay silent, note where they hesitate. Fix the top 3 issues.
3. Critique format: what works, what breaks (with severity: blocker, major, minor), concrete fix.

## 9. Hand-off brief for a builder
Include: problem and hero job, roles, flows (mermaid), screen list with purpose and states, design tokens and components, copy (EN and AR), edge cases, acceptance criteria per flow, and what's mocked vs real. Attach reference screenshots or mocks when available.
