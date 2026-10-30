---
name: dooh-design-audit
description: >-
  Use this when auditing a DOOH/billboard layout, adapted size set, or campaign
  render for creative-director and brand quality (spacing, margins, logo clear
  space, hierarchy, legibility, contrast, Gestalt and composition principles,
  Arabic typography, consistency) and producing a scored pass/fail report with
  fixes.
---
# DOOH design audit

Audit like a top advertising creative director and brand designer. Measure, don't eyeball. Never invent screen sizes or viewing distances; label guesses ASSUMED.

## Inputs
1. Layouts: images and, if available, layer data (boxes in px, roles: bg, product, headline, offer, price, logo, CTA).
2. Screen list: name, W x H px, physical size or viewing distance if known.
3. Brand rules if supplied; otherwise the defaults below.

## Spacing system (check first)
- Base unit u = about 1% of the short side (round to whole px). All gaps should be multiples of u on one scale: 1, 2, 3, 4, 6, 8, 12u.
- Outer margin >= 6u (8u+ on the ends of very wide or very tall screens); logo margin larger than text margin.
- Proximity: gaps inside a group (headline to subline, offer to price) are clearly smaller than gaps between groups, at least 1:2.
- Consistency: the same relationship uses the same gap on every size; no one-off gaps.
- Vertical rhythm: leading 1.05-1.2x for display Latin, 1.3-1.6x for Arabic; space above a group >= space inside it.
- Breathing room: whitespace is intentional and evenly distributed, never trapped pockets or cramped corners.
- Optical spacing: measure to visible ink (cap height, glyph edges, logo mark), not bounding boxes; round or pointed shapes may overshoot slightly.

## Criteria (score 0-100, pass at 80 unless brand rules say otherwise)
| # | Criterion | Default pass rule |
|---|---|---|
| 1 | Safe margins | Every layer >= outer margin from every edge |
| 2 | Logo clear space | Free zone >= 25-50% of logo height on all sides; never touches edge or element |
| 3 | Element clearance | Every layer pair >= 2u unless marked allow-overlap |
| 4 | Spacing scale and proximity | Gaps on the scale; inner gaps < outer gaps (1:2 or more); consistent across sizes |
| 5 | Logo size consistency | Logo height % within class target, above min legible size |
| 6 | Hierarchy | One hero, one message, one brand; headline >= 1.5x secondary text; clear reading order |
| 7 | Legibility at distance | Min cap height for screen size and viewing distance (ASSUMED distance if unknown) |
| 8 | 3-second read | <= 7 headline words, <= 3 text groups, one call to action |
| 9 | Contrast | Text vs local background >= 4.5:1 body, >= 3:1 large display; logo has enough contrast |
| 10 | Alignment and grid | Shared axes, column grid per aspect class, optical alignment |
| 11 | Balance and visual weight | Optical centre slightly above geometric centre; weight balanced or deliberately asymmetric; fill 35-80%, no dead zones |
| 12 | Gestalt grouping | Related items grouped by proximity, similarity and alignment; unrelated items separated |
| 13 | Focal point and flow | Eye path hero to message to brand to CTA (Z or F pattern for LTR, mirrored for RTL) |
| 14 | Typography | Line length 2-6 words on DOOH, no widows/orphans, no weak line endings, max 2 typefaces, consistent weights |
| 15 | Colour and brand | Brand colours used correctly, limited palette, no clashing accents |
| 16 | Arabic / RTL | Correct mirroring and shaping, kashida max 3 per word, no letter tracking, Arabic not smaller than Latin equivalent |
| 17 | Consistency across sizes | Same hierarchy, colours, logo treatment and spacing ratios on every size |
| 18 | Multi-face screens | Each face stands alone; main message on largest face; nothing split across a seam |

## Steps
1. Gather inputs; list what is missing and mark related checks ASSUMED.
2. Compute u per screen, then measure margins, clearances and every gap; map gaps to the spacing scale.
3. Measure criteria 1-5 from layer data (or pixels), then judge 6-18.
4. Score each criterion, pass or fail, with the measured value and one-line reason.
5. Give a concrete fix per failure (move X by N px, change gap to 4u, scale logo to N%, split headline after word N, drop an element on this face).
6. Roll up: per-tile score, campaign pass rate, worst offenders first.

## Output
- Summary: pass rate and top 3 issues.
- Table per tile: criterion, score, pass/fail, measured value, fix.
- Optional CSV or HTML export.
