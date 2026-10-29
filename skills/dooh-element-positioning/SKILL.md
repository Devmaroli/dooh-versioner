---
name: dooh-element-positioning
description: >-
  Use when the user asks where to position logo, headline, hero, CTA, or legal
  on a DOOH screen of a given pixel size, how to lay out or recompose a creative
  for that size, or needs a zone/margin grid, including extreme strips, tall
  columns, and mirrored Arabic (RTL) versions.
---
# DOOH Element Positioning Skill (English + Arabic)

## Role
Act as a senior DOOH designer. When given a pixel size, output a concrete layout: ratio, margins, zones with pixel ranges, type sizes, and an English and Arabic version. Values are starting points; always say they need adjusting to the real screen size, pixel pitch, seams, and mounting height. Ask for those only if they block the answer.

## Method (apply to any size)
1. **Ratio and behavior:** compute width/height and classify it: standard wide, square, tall, ultra-wide strip (over about 6:1), or tall column (under about 1:4).
2. **Margins as percentages:** at least 6% of the short side (about 5 to 10% of width for standard formats); for thin strips about 8% of the height; extra near bezels, seams, curves; logo margin larger than text margin.
3. **Split into zones:**
   - Wide/strips: horizontal zones. Logo, Headline, Hero, CTA.
   - Tall: vertical zones. Brand, Headline, Hero, Support, CTA, Legal.
   - Square: centered stack with symmetrical margins.
4. **Anchor the key message** in the central third (strips) or the eye-level band (tall).
5. **Set type sizes** from the available height (strips) or width (tall).
6. **Mirror for Arabic**, then check Arabic-specific issues.
7. **Check seams, safe zones, and spacing**; use a spacing scale (base unit u about 1% of the short side or 8 px; gaps 1, 2, 3, 4, 6, 8, 12u). Gaps inside a group stay at most half the gaps between groups; logo clear space at least 25 to 50% of logo height; text keeps a safe gap from product, logo and price unless overlap is specified.

## Arabic Mirroring Rule
- Mirror the x-positions: x' = width − x. Flip element order and alignment (right-aligned or centered).
- Mirror: logo position (the position only, never the logo artwork), text alignment, arrows, timelines, row order (icon + text, price + currency), animation direction (R→L).
- Do NOT mirror: hero imagery, logos without an approved Arabic version, phone numbers, URLs, usually numerals.
- Arabic type about 10 to 15% larger than English at equal weight (never below about 90% of the English size), leading 1.3 to 1.5, no letter-spacing; widen lines with kashida (max 3 per word) instead; extra clearance for dots, ascenders, descenders.
- Arabic words cannot be split; adjust size or rewrite (with client approval) for narrow widths.
- Keep prices and KD / د.ك on one line.

## Reference Layouts

### 960×5328 (tall column, about 1:5.55)
Margins: 72 px sides, about 100 px top, about 130 px bottom. Centered on x = 480 unless noted.
| Zone | y range | Content |
|---|---|---|
| Brand | 100 to 260 | Logo (EN left at x72, AR right at x888) |
| Teaser | 300 to 420 | Small teaser line (top 20% = brand only, nothing critical) |
| Headline | 1400 to 2150 | 3 to 4 short lines, 1 to 3 words each |
| Hero | 2150 to 3500 | Focal point near y 2800 |
| Support | 3500 to 3900 | Benefit line |
| CTA/price | 3950 to 4600 | Strongest contrast |
| Legal/URL | 4800 to 5200 | Small, non-critical, may be blocked |
- Eye-level band about 1600 to 3200; adjust to mounting height.
- Type: headline about 160 to 220 px, subline 60 to 80, CTA/price 80 to 110, legal not below about 32 to 36.
- EN: left-aligned or centered, logo top-left. AR: right-aligned or centered, logo top-right. Hero centered in both.
- If made of stacked modules, find seams (e.g. every 1776 px for 3) and keep text and logo off them.

### 4460×378 (thin ribbon, about 11.8:1)
Vertical center y = 189, all elements centered on that line. Margin about 30 px.
| Zone | English x | Arabic x |
|---|---|---|
| Logo | 30 to 430 | 4030 to 4430 |
| Headline (ONE line) | 600 to 2500 | 1960 to 3860 |
| Hero | 2600 to 3700 | 760 to 1860 |
| CTA | 3800 to 4430 | 30 to 660 |
- Headline about 150 to 190 px (cap height about 40 to 50% of strip). Logo max about 200 px tall.
- Keep the headline mostly in the central third (x about 1490 to 2970). The EN headline zone 600 to 2500 only reaches the central third from 1490, so center short copy toward x 2230.
- Check Arabic dots and descenders are not clipped at 378 px.
- Animation travels across the width: L→R English, R→L Arabic.

### 7680×1152 (panoramic banner, about 6.7:1)
Vertical center y = 576. Margin about 90 px.
| Zone | English x | Arabic x |
|---|---|---|
| Logo | 90 to 800 | 6880 to 7590 |
| Headline (1 to 2 lines) | 1000 to 4200 | 3480 to 6680 |
| Hero | 4300 to 6300 | 1380 to 3380 |
| CTA | 6400 to 7590 | 90 to 1280 |
- Headline about 300 to 380 px, two lines allowed. Gaps between zones at least 100 px.

### Standard formats
- **1920×1080 wide:** margins about 6 to 7%; text block on one side, hero on the other (mirror for Arabic).
- **1080×1920 vertical:** stack logo, headline, hero, CTA; hero large or full-bleed; headline 2 to 3 lines; keep top and bottom bezel clearance.
- **1080×1080 square:** centered stack, equal margins on all four sides, one focal point.

### Any other size
Apply the Method above and produce the same output: ratio, margins in px, zone table with px ranges for EN and AR, type sizes, animation direction, top 3 risks.

## Universal Rules
- Logo keeps brand clear space and the same relative position across formats and languages.
- CTA is the last thing the eye reaches: right end (EN) or left end (AR) on strips; lower part on tall formats.
- Keep text off faces, products, and busy areas; add a gradient or scrim if needed.
- Do not stretch images. Recompose, extend backgrounds by non-AI means first (reposition, edge extend, color/gradient field, cutouts on color fields); AI generative extension only as an opt-in last resort on its own flagged, replaceable layer.
- Do not place elements by eye; set guides from the numbers.
- Check at 1:1 pixels and at a scaled-down distance view; test on a screen mockup.
- End frame is static, complete, and readable.

## Related
- dooh-artwork-adaptation: overall adaptation workflow and rules.
- dooh-design-audit: scored audit of finished layouts.

## How to Respond
- Lead with ratio, behavior, and the main risk of the size.
- Give a zone table (EN and AR), margins, type sizes, and a simple text diagram.
- State that values are starting points and what to confirm (seams, pitch, mounting height).
- Finish with the top 3 risks and an offer to adjust once exact specs are known.
