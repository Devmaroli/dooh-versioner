---
name: dooh-spacing-rules
description: Exact spacing rules for DOOH artwork in English and Arabic: gaps between headline, subline, logo, hero/product, CTA button, price, legal text, and bilingual blocks, plus clear space, padding, leading, and letter-spacing, scaled from the headline size so they work on any screen size (ribbons, banners, squares, tall columns). Use when the user asks about spacing, padding, gaps, clear space, or how far apart elements should be.
---

# DOOH Spacing Rules (English + Arabic)

## Core idea: scale everything from the headline size
Do not use fixed pixel gaps copied from another format. Measure the **headline font size (H)** on the target screen, then derive every gap from it.
- **U (spacing unit) = 0.25 × H**, rounded to a whole pixel (minimum 8 px). Gaps use U steps (1U, 1.25U, 1.5U, 2U, 3U, 4U, 6U); half steps are allowed for tight pairs such as headline to subline.
- Example: H = 190 px gives U = 48 px. H = 340 px gives U = 85 px.

## Gap table (vertical stacks and text blocks)
| Between | Gap | Notes |
|---|---|---|
| Headline lines (leading) | EN 1.1 to 1.2 × H; AR 1.3 to 1.5 × H | Arabic needs more for dots and ascenders |
| Headline → subline | about 1.2U (0.3 × H) | Tight: they read as one group |
| Subline → CTA | about 3U (0.75 × H) | Clear separation before the action |
| Headline block → hero / product | 2U to 4U (min 0.5 × H) | More if the hero has a busy edge |
| Logo → headline | at least 1.5 × H (6U), or the logo height, whichever is larger | Logo must not compete with the headline |
| Logo clear space (all sides) | at least 0.5 × logo height, or the brand guideline if larger | Brand rule always wins |
| Hero / product → text | at least 0.5 × H; never overlap text on faces or product | Use a gradient or overlay if text sits on an image |
| CTA → legal / URL | at least 0.5 × CTA height | Legal is small and quiet |
| Last element → screen edge | at least the margin (about 7.5% of the shorter side, 8% of height on ribbons) | More near bezels, seams, curves |
| Group → group | at least 2 × the gap inside a group | Proximity shows what belongs together |

## CTA button
- CTA text size about 0.5 × H (see the screen's type sizes)
- Vertical padding about 0.5 × CTA text size; horizontal padding about 1.0 × CTA text size
- Button height about 2 × CTA text size
- Corner radius per brand guidelines; keep it the same in every format
- Highest contrast element on the screen; keep the whole button inside the safe area, away from seams
- If the CTA has an arrow or icon: gap between text and icon about 0.4 × CTA text size. In Arabic the arrow points left and sits on the left of the text (mirrored).
- On ribbons, leave at least 2U of clear space between the CTA and the hero

## Price block
- Currency to number gap about 0.15 to 0.25 × the number size; keep on one line, same baseline
- KD / د.ك never wraps; do not separate currency from its number
- Old price to new price gap about 0.3 × the new price size; old price smaller (about 0.5 × new price)
- Arabic: check the order of number and currency after mirroring, and keep numerals consistent (Western or Eastern)

## Horizontal layouts (ribbons and banners)
- Gap between zones (logo, headline, hero, CTA): about 0.5 to 0.7 × H (2U to 3U)
- Equal gaps between zones; do not let one zone touch the next
- Hero keeps at least 1U from the headline zone on both sides
- Keep the same gap sequence in Arabic, mirrored

## Repeated items (icons, offers, price tags)
- Equal gaps between items: about 2U
- Gap between a group and the next group: at least 4U
- Same item size, same alignment, same baseline

## Bilingual layouts (Arabic + English on one screen)
- Gap between the English block and the Arabic block: at least 4U (or 1.0 × the larger headline size)
- Same text block height and weight in both; the same gap rhythm in both
- Align baselines across the two languages where they sit side by side
- Never let the Arabic block feel secondary: equal size, equal gaps

## Letter, word, and line spacing
- English headline: letter-spacing 0 to +1%; small text and caps: +2 to +5%
- **Arabic: letter-spacing always 0** (tracking breaks letter connections)
- **Kashida (decision 29 Oct 2026):** allowed ONLY on single-line Arabic headlines on wide screens (ribbon xw ≥8:1, ultra-wide uw ≥3:1, landscape h), max 3 per word. No kashida or justification anywhere else: multi-line headlines, sublines, body, legal, tall or square screens.
- Arabic word spacing: check for uneven gaps, especially in justified text; avoid justification
- Keep the same line count in English and Arabic where possible
- Break lines by meaning; avoid single words alone on the last line (orphans) and awkward breaks

## Text and image
- Keep text off busy areas; if it must overlay an image, add a gradient or overlay behind it for contrast
- Keep at least 1U between text and the edge of the image focal point

## Worked examples
**960×5328 (H about 190 px, U about 48 px)**
- Headline leading EN about 210 px; AR about 265 px
- Headline → subline about 58 px; subline → CTA about 144 px (3U)
- Headline block → hero at least 100 px (2U); logo → headline at least 285 px
- CTA text about 95 px; button about 190 px tall; horizontal padding about 95 px
- CTA → legal at least 95 px; last element at least 72 px from the edge (margin)

**4460×378 (H about 170 px, U about 43 px)**
- Gaps between zones about 90 to 130 px (the zone coordinates already include them)
- Logo clear space at least half the logo height; CTA button about 85 px text, 170 px tall, centred on y = 189
- No subline: one line headline only; legal on the end frame

**1920×1080 wide split (H about 120 px, U about 30 px)**
- Headline → subline about 36 px; subline → CTA about 85 px
- Logo → headline at least 180 px; text block → hero at least 60 px
- Margin about 80 px

## Checks before delivery
- [ ] All gaps are on the U steps, scaled from this screen's headline size
- [ ] Logo clear space respected
- [ ] CTA padding and size consistent across every format
- [ ] Equal gaps between repeated items; group gaps at least twice the inner gaps
- [ ] Arabic: more leading, no tracking, mirrored order, currency kept on one line
- [ ] Bilingual blocks have equal weight and gaps
- [ ] Nothing closer to the edge than the margin; nothing on a seam
- [ ] Checked at 1:1 and at viewing distance

## Related
- dooh-all-screens-layouts: per-screen zones and type sizes (gives H for each screen).
- dooh-design-audit: measures these gaps on finished layouts.
