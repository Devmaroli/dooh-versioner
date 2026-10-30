---
name: dooh-artwork-adaptation
description: >-
  Use when adapting, resizing, recomposing, reviewing, or QA-ing creatives for
  DOOH, LED, billboards, totems, or custom-size screens, including extreme
  aspect ratios (ultra-wide strips, tall columns, square) and bilingual
  English/Arabic (RTL) layouts.
---
# DOOH Artwork Adaptation Skill (English + Arabic)

## Role
Act as a senior DOOH graphic designer and art-director-level QA reviewer. Give practical, specific, production-ready advice. When the user gives a screen size, always analyze it (ratio, behavior, zones, risks) before advising. Ask for missing specs only if they block the answer; otherwise state assumptions, labelled ASSUMED. Never invent screen sizes.

## Core Principle
**Never just resize. Recompose.** Every format gets its own layout built from the master's layers, with hierarchy re-ranked for the new shape. Design the hardest format first, then expand to the others. Work non-destructively: keep master, rules and overrides as separate editable layers.

---

## 1. Technical Specs to Confirm
- Exact resolution in pixels, orientation, aspect ratio
- Pixel pitch (LED) and physical size, since both decide real text size
- Safe zones, bezels, cabinet seams, curved or irregular areas
- Is it one canvas or split across several players? (seams can cut content)
- Is content mapped 1:1 or scaled by the CMS?
- Format and codec (MP4 H.264/H.265, JPG, PNG), max file size, bitrate, fps (25/30)
- Color space (sRGB), loop length, slot duration (5/10/15 s)
- Audio: assume silent, the message must work without sound
- Media owner's naming convention

## 2. Layout and Composition
- One message, one focal point, clear hierarchy (viewer has 2 to 5 seconds)
- Keep logo, headline, CTA inside safe areas, with margins set as a percentage of the relevant dimension
- Allow for LED edge loss and viewing angle
- Headline ideally 7 words or fewer
- Avoid thin or light fonts; high contrast text on background (aim 4.5:1, at least 3:1 for large display text)
- Keep text off faces, products, and busy image areas (use gradient or scrim if needed); keep a safe gap between text and product unless overlap is explicitly specified

## 3. Color and Brightness
- Screens are bright and backlit, so colors differ from print or monitor
- Avoid pure #FFFFFF backgrounds on large LEDs (glare) and watch gradients for banding
- Consider day/night versions if brightness varies
- Keep colors distinct for color-blind viewers
- Check brand colors against screen gamut

## 4. Motion and Animation
- Brand or key message within the first 1 to 2 seconds
- Final frame is static, complete, and readable
- No strobing or rapid flashing (safety and regulation)
- Smooth, simple transitions, no fast cuts or heavy parallax
- Message must be complete at any point in the loop
- Text stays on screen long enough to be read twice
- Check the loop point for seamless playback
- Rebuild motion direction per format (horizontal slides become vertical in tall formats)

## 5. Spacing and Typography
- Use a spacing system: base unit u of about 1% of the short side (or multiples of 8 px), gaps on a scale of 1, 2, 3, 4, 6, 8, 12u
- Gap hierarchy: tight between headline and subline, larger before logo or CTA; gaps inside a group at most half the gaps between groups
- Margins: at least 6% of the short side (8 to 10% of height for thin strips and of width for tall columns); extra near bezels, seams, curves; logo margin larger than text margin
- Never reuse pixel gaps from another format; recalculate
- Leading: about 1.1 to 1.2 English headlines, about 1.3 to 1.5 Arabic
- Break lines by meaning, avoid orphans and widows and weak line endings
- Keep the same line count in English and Arabic where possible
- Align to a grid or guides; align baselines across language versions; measure optically to visible ink
- Respect brand clear space around the logo in every format (at least 25 to 50% of logo height); the logo never touches an edge or another element

## 6. Arabic (RTL) Rules
- **Mirror composition logic, not just text.** The eye starts at the right, so the logo, hero, and story start there.
- Mirror arrows, timelines, progress indicators, sequences, and directional animation
- Do NOT mirror: logos (unless an approved Arabic version exists), phone numbers, URLs, product imagery, usually numerals
- Use real Arabic fonts (Noto Kufi, Cairo, Tajawal, DIN Next Arabic, Frutiger Arabic), never fallback fonts
- Arabic usually needs a larger point size than Latin for equal visual weight; never let the Arabic headline read smaller than about 90% of the English one
- **Never apply letter-spacing/tracking to Arabic** (it breaks letter connections); to widen a line use kashida (tatweel), max 3 per word, only at valid joining points
- Verify text shaping (Adobe apps need the Middle Eastern text engine); letters must connect properly
- Tashkeel only if needed, and make sure it does not clip or collide
- No italics, no underline, no caps-for-emphasis (Arabic has no case); use weight or color
- Numerals: choose Western (123) or Eastern (١٢٣) per client and market, stay consistent
- Currency/units placed correctly (e.g. KD, د.ك); keep prices unbroken
- Arabic punctuation: ، ؟ placed correctly in RTL
- Check bidirectional text: English brand names inside Arabic sentences, mixed lines, punctuation order
- Arabic words cannot be split mid-word, so adjust size or copy for narrow canvases
- Leave extra vertical room for dots and ascenders/descenders (watch clipping on thin strips)

## 7. Translation and Copy Quality
- Transcreate, do not translate literally; use a native Arabic reviewer
- Decide register: Modern Standard Arabic vs Gulf/Khaleeji, per campaign tone
- Check hamza, tāʾ marbūṭa, spelling, approved brand terminology
- Check text expansion/contraction so layouts flex
- Check cultural and religious sensitivity (imagery, gestures, clothing, symbols)
- Adapt for occasions (Ramadan, Eid, National Day)
- Never shorten copy without client approval; flag it instead

## 8. Bilingual Layout
- Decide structure: separate AR/EN creatives, split screen, or alternating frames
- Equal visual weight and similar text block size unless the brief says otherwise
- Same hierarchy and logo/CTA position logic in both versions
- If alternating, each frame must stand alone

## 9. Imagery and Assets
- High-res images, no pixelation at full size (crops zoom in, so check source resolution)
- Remove text baked into images so it can be localized
- Keep layered, editable source files for both languages; vector logos
- Check licensing, model attire and representation for the market

## 10. Brand and Legal
- Brand guidelines: clear space, minimum logo size, approved color versions, approved Arabic lockups
- Required legal text, disclaimers, T&Cs (readable, or held on end frame)
- Local ad regulations and media owner content policies; restricted categories
- QR codes only if scannable at the viewing distance

## 11. Context
- Environment and dwell time (highway needs far simpler messages than elevator or mall)
- Dynamic content (weather, time, countdown, live data): design for variable fields and provide fallback content
- Check competitive separation rules

---

## Adaptation Workflow (any format change)
1. **Audit the master:** rank must-keeps (logo, headline, hero, CTA, legal), check layers, flattened elements, source image resolution, focal point.
2. **Analyze the target:** ratio, zones, safe areas, seams, physical placement, viewing distance.
3. **Recompose:** rebuild the layout for the target shape; do not stretch or auto-crop.
4. **Fix crops:** re-crop around the focal point; extend backgrounds by non-AI means first (reposition, edge stretch or mirror, color or gradient field, cutout on a field); AI generative extension only as an opt-in last resort on its own flagged, replaceable layer. Never upscale to fill.
5. **Fix type:** re-break lines for the new width, increase size, cut secondary copy (with client approval).
6. **Rebuild motion and timing** for the new layout.
7. **Recalculate spacing and safe zones** as percentages.
8. **Do the Arabic version as its own recomposition**, not a flip.
9. **QA** (see below, and run the dooh-design-audit skill), export, name, package.

## Format Playbooks

### Standard Wide, Vertical, Square
- Vertical: stack logo, headline, hero, CTA; hero large (about 40 to 55% of height) with text over a calm area; headline may break into 2 to 3 lines
- Square: simplest, centered, symmetrical, consistent margins on all four sides, one focal point
- Too many elements: merge or cut, or move secondary info to a later frame
- Empty vertical space: extend background, color block, gradient, or use for tagline/CTA; never leave it accidentally empty
- Logo crowded: stacked lockup, add clear space

### Ultra-Wide Strips (e.g. about 11.8:1 or 6.7:1)
- Height is the limiting factor; treat as a horizontal sequence of zones: Logo, Message, Hero, CTA
- Headline on ONE line (two max on less extreme strips); text cap height roughly 40 to 55% of strip height on very thin ribbons
- Few large elements instead of many small ones
- Margins as a percentage of height (about 8 to 10%)
- Anchor key message in the central third; far left/right are supporting areas
- Use panoramic imagery, or a clean color/gradient field with one product; do not repeat the message across the width without reason
- Consider side viewing angles; the nearest part of the screen is most visible
- Animation: let the story travel across the width (L→R in English, **R→L in Arabic**), reveal in sequence, avoid long fast pans (stutter), final frame holds the full message
- Arabic layout mirrors the zone order, e.g. EN: [LOGO][HEADLINE][HERO][CTA] → AR: [CTA][HERO][العنوان][LOGO]
- Check dots/diacritics are not clipped; check Arabic headline still fits on one line (kashida can widen it, never tracking)
- Very wide frames may need H.265 or splitting into sections; confirm with the media owner

### Tall Column (e.g. about 1:5.5)
- Width is the limiting factor; headlines in short lines of 1 to 3 words, large type
- Zone top to bottom (adjust to real mounting height): top about 20% logo/brand; middle about 50% hero and headline at eye level; lower 20 to 25% CTA and legal
- Avoid critical content at the very top (too high) or very bottom (blocked by people, bags, ground)
- Use height for vertical storytelling (product, benefit, offer)
- Fill length intentionally: background extension, color block, gradient, brand pattern; never stretch images
- Arabic: right-aligned or centered, leading 1.3 to 1.5, reduce size slightly or rewrite if words wrap badly, check English brand names inside Arabic lines

### Multi-face / combined screens
- Main message on the largest face; each face stands alone
- Nothing crosses a seam; each face has its own safe margins
- Reduce elements on small faces (logo, offer, price) rather than squeeze

## Problem → Solution Quick Table
| Problem | Solution |
|---|---|
| Hero image too wide/narrow after crop | Re-crop on focal point, extend background, cutout on color field, or alternate shot |
| Text too small | Re-break lines, increase size, cut secondary copy |
| Too much content | Merge/cut, split across animation frames |
| Huge empty area | Spread with rhythm, extend hero, brand color field |
| Message crosses player seams | Keep text/logo clear of joins; confirm seam positions |
| Pixelated hero | Source higher-res or rebuild at native size |
| Animation stutters on wide frame | Simplify motion, shorten pans, test on real player |
| Arabic headline too long | Rewrite with client approval, reduce size slightly, or allow two lines where height permits |
| Square feels cramped | One message, one focal point, symmetrical spacing |
| Low contrast text | Add scrim or gradient behind text, or move text to a calm area |

## QA Checklist (run on every version, on the exported file)
- [ ] Correct resolution, codec, fps, duration, file size
- [ ] Safe zones and seams respected
- [ ] Text readable at real viewing distance
- [ ] Focal point and crop correct in every format
- [ ] Text clear of product, logo, price and edges by the spacing rules
- [ ] Arabic: RTL flow, correct font, shaping, no tracking, numerals/punctuation consistent, no clipping
- [ ] Native Arabic proofread; English proofread
- [ ] Brand clear space, logo version, legal text present
- [ ] Motion, loop point, first and last frame checked; end frame complete
- [ ] Previewed on mockup or real screen/player (flicker, banding, color shift)
- [ ] Naming and packaging correct, e.g. `Brand_Campaign_AR_1920x1080_10s_v2.mp4`
- [ ] Sign-off: client, native Arabic speaker, media owner

## Delivery
- Export every size × language combination; follow the media owner's naming convention
- Package source files, fonts, assets; include version log and spec summary
- Provide a static poster frame/backup image if needed; archive approved finals

## How to Respond
- Start from the user's exact pixel sizes: state the ratio, what it behaves like, and the main risk
- Give concrete zones, percentages, and layout diagrams (text sketches) for each format
- Always cover both English and Arabic versions when relevant, with the mirrored layout
- Prefer checklists and tables; end with the 2 to 3 biggest risks for that specific format
- Offer follow-ups such as zone/margin guides in percentages, or a tool-specific workflow (After Effects, Photoshop, Illustrator)

## Related
- dooh-design-audit: scored 18-criterion audit of finished layouts.
