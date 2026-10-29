---
name: dooh-advanced-design-and-adaptation
description: Advanced DOOH design and adaptation guide, tuned to the user's own screen list (84 screens in Screen Manager: DOOH, Marina, Avenues, AL Kout, 360 Mall, Khairan, Warehouse, Dayarti, plus 7 Alshaheed screens). Covers how to adapt ONE given artwork to every screen (families, anchors, tiers, content ladder), viewing-distance sizing, colour and contrast on LED, motion timing, imagery handling, logo rules, English/Arabic font pairing, multi-screen and seam handling, After Effects workflow, and export/codec settings. Use alongside the layout, spacing, and adaptation skills.
---

# DOOH Advanced Design and Adaptation (English + Arabic)

All numbers are **starting points and rules of thumb**. Real screen size, pixel pitch, viewing distance, brand guidelines, and the media owner's spec override them. Where something is assumed from a screen's name, it is marked "confirm".

---

# 1. Adapting ONE artwork to ALL screens (the master workflow)

## 1.1 Intake: what to check before touching the artwork
- **Source type**
  - A. Layered file (PSD, AI, AE project, Figma): build directly from layers.
  - B. Flat image or video with baked-in text: rebuild it. Cut out the hero, clean or extend the background, retype all text, ask for the layered file or original fonts and photos. Tell the client this takes longer and may not match the original perfectly.
  - C. Video master only: identify what can be separated (logo, text, hero). Re-animate in AE; do not crop and scale the video.
- **Languages**: is the Arabic copy supplied, approved, and by a native writer? If not, flag it as a blocker for Arabic versions.
- **Scope**: all screens, one group, or a priority list? Which durations (5, 10, 15 s)? Which fps?
- **Assets**: logo versions (horizontal, stacked, one-colour, Arabic lockup), fonts (with commercial/digital signage licence), hero photo at full resolution, legal text, brand guidelines.
- **Dynamic content**: prices, dates, countdowns, live data? Fallback needed?
- **Screen specs**: pixel pitch, physical size, viewing distance, seams, player codec and limits (see Section 10 for what to ask).

## 1.2 Audit and rank the master
Rank every element. This decides what survives on the smallest screens.
| Rank | Element | Rule |
|---|---|---|
| 1 | Logo | Never dropped |
| 1 | Headline / main message | Never dropped; can be shortened |
| 1 | Hero / product / offer | Never dropped; can be cropped or recut |
| 2 | CTA | Shortened, never dropped on screens that have room for it |
| 3 | Subline / benefit | First text to be cut on thin screens |
| 4 | Secondary visuals, icons, badges | Cut or move to a later frame |
| 5 | Legal / T&Cs / URL | Moves to end frame; stays readable; never removed if required |

Also note: the hero's focal point (face, product, action), how much background exists around it, hero resolution, and which elements are baked into the image.

## 1.3 Group the screens into families (by ratio), then design anchors first
With 84 screens you do **not** design 80 layouts. You design one **anchor** per family, then derive the others by percentages and check them. The families and their screens are listed in Appendix A (generated from the config). Typical anchor order: **hardest first**.

1. Ultra-ribbon anchor (hardest). 
2. Ribbon and short ribbon anchors.
3. Extreme tall and tall column anchors.
4. Banner anchor.
5. Portrait anchor (1080×1920 covers many screens).
6. Square anchor.
7. Wide anchors (16:9, panoramic, classic).

Why hardest first: if the message, hero, and CTA survive on a 4460×378 strip and a 960×5328 column, they will survive on everything easier. Designing wide first and "squeezing" is what causes bad results.

## 1.4 Three tiers of effort
| Tier | What | How |
|---|---|---|
| Tier 1: anchors | One hand-built layout per family | Full design time: re-crop, re-extend background, re-break copy, re-time animation |
| Tier 2: derived | Screens whose ratio is within about ±10 to 15% of an anchor | Reposition by percentage from the anchor (zone coordinates), check crop, copy fit, and spacing |
| Tier 3: special | Sync sets, pairs, curved or oval screens, very narrow (240 px), huge canvases (7680×1152, 7560×2100), odd pixel sizes | Individual treatment with specs from the media owner (Sections 8 and 10) |

Same-size screens share one file (for example the six 1080×1920 screens). Render once per size per language, then duplicate with the screen name.

## 1.5 Copy ladder (prepare three headline lengths per language)
Thin screens cannot hold the full headline. Prepare these before layout and get them approved in both languages:
- **Long:** full headline (wide, portrait, square, tall)
- **Medium:** about 60% (banners, panoramic)
- **Short:** 2 to 4 words (ribbons and ultra-ribbons)

Use the character budgets in the layout file ("chars/line"). Arabic often runs shorter or longer than English depending on the copy, so check each language separately. Never cut or rewrite copy yourself without client approval.

## 1.6 Content ladder (what to remove first as space shrinks)
1. Legal and URL move to the end frame (keep readable, minimum size per the spacing file).
2. Subline.
3. Secondary visuals and badges.
4. CTA text shortened (for example "Shop now" instead of a sentence), then CTA becomes text plus arrow.
5. Offer details move to a second beat in the animation.
Never remove: logo, headline, hero or offer, and legally required text.

## 1.7 Hero strategies by situation
| Situation | Solution |
|---|---|
| Hero too wide for the new shape | Re-crop around the focal point; or use a cutout on a colour field |
| Hero too narrow for a ribbon | Non-AI first: place the cutout on a brand-colour field, mirrored edge plus blur, gradient plus grain, or repeated product shots. Generative/content-aware fill only as an opt-in last resort, with client approval |
| Hero too short for a tall column | Extend background vertically; stack content in chapters; use gradient and brand pattern for the empty length |
| Group photo or scene with several subjects | Pick the key subject for thin formats; use the full scene only on wide formats |
| Hero is a product pack | Cutout, rebuild a soft contact shadow, place on a colour field with a subtle glow so it separates on LED |
| Low-resolution hero | Do not upscale beyond about 120%; request the original; use AI upscaling only as a last resort and check at 100% |

## 1.8 Order of work for one artwork
1. Intake and audit (1.1, 1.2). 
2. Copy ladder approved in EN and AR (1.5). 
3. Build the master assets: cut-out hero, extended background, logo versions, text styles, colour tokens.
4. Design anchors, hardest first (1.3), EN then AR.
5. Build the motion once in a shared animation precomp (Section 9) and reuse it.
6. Derive Tier 2 screens from anchors; hand-fix Tier 3.
7. Contact sheet of all versions side by side: check brand consistency.
8. QA every version on the exported file (Section 11); then deliver.

---

# 2. Viewing distance and legibility sizing

## 2.1 Rules of thumb (letter height vs distance)
Cap height (height of capital letters) needed to read at distance D:
- **Comfortable:** cap height ≈ D / 120 (about 1 inch of letter height per 10 feet)
- **Minimum for short, high-contrast words:** cap height ≈ D / 200
- **Never below:** D / 300 (under ideal conditions only)

Latin font size ≈ cap height / 0.7. Arabic needs about 10 to 15% larger size for equal visual weight.

## 2.2 Convert to pixels
1. Pixel pitch (mm per pixel) = physical width (mm) / width (px). Use the real screen size from the media owner.
2. Cap height (px) = cap height (mm) / pixel pitch.
3. Font size (px) ≈ cap height (px) / 0.7.

**Illustrative example (assumed size, replace with the real one):** a 4460×378 strip that is 11.5 m wide has a pitch of about 2.6 mm. Viewed from 40 m, comfortable cap height is about 333 mm, which is about 129 px, so a font of about 185 px. That is about half the strip height, which matches the 150 to 190 px starting size in the layout file. At 60 m the same rule asks for about 275 px, which does not fit the strip, a cap height of about 194 px, about 51% of the strip height. That is at the top of the 40 to 55% ribbon range and only fits as one short line with tight leading inside the 8% margins (318 px usable). So keep the copy to 2 to 3 words, or use the minimum (D/200 ≈ 116 px cap, ≈ 166 px font).

## 2.3 Pixel-level minimums
- Do not use font sizes below about 24 px on any screen (check pitch).
- Stroke width at least 2 px; no 1 px lines, 1 px borders, or hairline fonts (they flicker and vanish).
- Prefer medium, semi-bold, or bold weights. Avoid light weights, especially for Arabic (thin strokes break up).
- Keep counters and gaps open (no tight tracking on English; no tracking at all on Arabic).

## 2.4 Assumed viewing contexts (confirm each with the media owner)
| Context (assumed from the screen name) | Likely distance | Copy |
|---|---|---|
| Gates, bridges, ring road, rotundas, towers | 30 to 100+ m, often in motion | 2 to 5 words, huge type, no subline |
| Mall outdoor, entrances, walls | 10 to 40 m | up to about 7 words, one offer |
| Mall indoor atriums, circular, grand entrance | 5 to 20 m | up to about 7 words, short subline allowed |
| Elevators, MUPI, indoor small screens | 1 to 5 m, longer dwell for elevators | shorter copy but smaller text is acceptable; avoid clutter |

Dwell time (how long people look) matters as much as distance: roadside means 2 to 3 seconds, elevator means longer.

---

# 3. Colour, contrast, and LED behaviour

## 3.1 Contrast
- Aim for **7:1 or better** where the design allows. Hard minimums (same as dooh-design-audit and dooh-artwork-adaptation): **4.5:1** for body, subline, CTA, and legal; **3:1** for large display headlines. Legal aim 7:1.
- If contrast fails, add a scrim or gradient behind the text (the engine adds a reversible "auto scrim").
- Check contrast with a tool; do not judge by eye on a monitor.
- Text over photos: add a gradient or overlay behind the text, or move the text to a calm area.

## 3.2 Safe and unsafe combinations
- Good: white or warm white on deep navy/black/dark brand colours; dark text on bright yellow or white-ish fields; high luminance difference between text and background.
- Weak: blue text on black (low luminance), red on black or red on green (vibrates and fails for colour-blind viewers), pastel on pastel, mid-grey on mid-grey.
- Colours must differ in **brightness**, not just in hue.

## 3.3 White and black
- Avoid large areas of pure white (#FFFFFF) on LED at night: glare and fatigue. Use about 90 to 95% white (for example #EDEDED to #F2F2F2) for big fields; pure white only for small text.
- On LED, pure black means pixels off and works well; on LCD in strong sun black can look grey. Do not depend on subtle dark-on-dark detail or dark gradients; they crush or wash out.
- Large saturated blocks of pure red, blue, or green can look harsh; test.

## 3.4 Gradients and banding
- Large smooth gradients can band on LED and in 8-bit video. Add fine monochrome noise or grain (about 1 to 3%) over gradients, keep gradients short or add a mid colour stop.
- Keep export 8-bit unless the spec allows more; dither in the source to reduce banding.

## 3.5 Day and night
- If the screen auto-dims, check the artwork at low brightness: thin details and dark gradients disappear first.
- If the media owner supports day/night versions, deliver two: day (stronger contrast, more saturation, less dark detail) and night (less white area, softer glow).
- Preview on a real screen if possible; LED panels are often over-saturated compared with a monitor.

## 3.6 Flash safety
- No more than 3 flashes in any one second; avoid large-area high-contrast flashing and saturated red flashing.
- No strobing transitions. Follow the media owner's content policy.

---

# 4. Motion timing

## 4.1 Reading time
- Hold time for text (after its entrance animation finishes) ≈ **1.0 s + 0.3 s per word**, minimum 2 s. Add about 15 to 20% for Arabic. Text should stay long enough to be read twice if possible.
- Total words on any one frame: aim for 7 or fewer.

## 4.2 Beat structure by slot length
| Slot | Beat plan |
|---|---|
| 5 s | 0 to 1 s brand/hook · 1 to 3.5 s message · last 1.5 to 2 s static end card (logo + CTA) |
| 10 s | 0 to 1.5 s brand/hook · 1.5 to 4 s headline · 4 to 7 s hero/offer · 7 to 10 s end card (static for at least 3 s) |
| 15 s | three beats of about 4 s (hook, benefit, offer) · last 3 s static end card |
The end card contains the full message: logo, headline or offer, CTA, legal. It must be correct if a player freezes on it.

## 4.3 Transitions and easing
- Entrances 0.3 to 0.6 s, ease-out; exits 0.2 to 0.4 s, ease-in. Avoid transitions longer than 0.8 s.
- Use simple moves (slide, fade, scale 95 to 100%). Avoid fast cuts, heavy parallax, spinning, and long camera moves.
- Text should settle and then stay still. Avoid scrolling text; if a ticker is unavoidable, keep it slow.
- Keep motion within the eye-level band on tall screens; on ribbons let the story travel across the width in reading direction (EN left to right, AR right to left) with sequential reveals, and avoid long, fast pans over thousands of pixels (stutter).

## 4.4 Loops and frames
- First frame should already show something meaningful (it may display while loading).
- Last frame is static and complete; the loop point must not cut mid-motion.
- Match the player's frame rate (25 or 30); do not retime in the encoder. Keep motion simple enough to avoid judder on very wide frames.
- No 1 px details that shimmer when moving.
- Sync screens: identical durations, frame counts, and start frames across partner screens.

---

# 5. Imagery handling

- **Resolution:** the hero must be at its placed size at 100% or more; if it animates a slow zoom to 110%, you need at least 110% resolution; ideally 150%. Check each screen's final size, not the master's.
- **Extending backgrounds (in order of preference; non-AI first, as in dooh-artwork-adaptation):**
  1. Recompose or reposition, or cut out the subject onto a solid brand colour field with a subtle vignette.
  2. Mirror and blur the edge, then add grain to match.
  3. Gradient built from sampled background colours plus grain.
  4. Last resort, opt-in only, with client approval: generative / content-aware expand on a clean area, then retouch.
  Avoid visible repeating patterns, stretched textures, and soft/blurry bands next to sharp areas; add matching grain over everything.
- **Cutouts:** clean edge, remove colour fringing, rebuild a soft contact shadow or glow so the subject does not float on LED, and match light direction.
- **Placement on LED:** keep products away from seams; keep faces away from text; text never overlaps the product or faces.
- **Text baked into images:** remove it; localise it as live text.
- **Cropping:** crop around the focal point; never auto-centre. Keep headroom.
- **Compression:** export images as PNG/high-quality JPG; avoid double compression.
- **Licensing:** check image licences for the market and for digital out-of-home use.

---

# 6. Logo rules

- **Minimum size:** the larger of (brand guideline minimum, about 0.5 × headline size in height, and the size where its smallest detail stays at least 2 px).
- **Typical sizes:** ribbons: height about 35 to 50% of strip height; wide: width about 20 to 30% of the text block; square: about 22 to 30% of inner width; portrait and tall: about 25 to 35% of inner width.
- **Lockups:**
  - Horizontal lockup for ribbons, banners, wide.
  - Stacked lockup for portrait, tall, and square.
  - Icon-only/monogram only for very small formats (for example 1200×240 or 240×960) and only if the brand approves it.
- **Arabic:** use the approved Arabic or bilingual lockup if one exists; do not mirror the logo itself. Position logo on the right (top right on vertical) in Arabic layouts when the English has it on the left.
- **Contrast:** use the white, black, or one-colour logo version that gives at least 4.5:1 against the background; use a plate or gradient if the background is busy.
- **Placement:** same corner/zone logic in every format; distance from the edge equals the margin; keep clear space intact.
- **Animation:** simple reveal; logo present on the end card for at least the last 2 to 3 seconds.

---

# 7. English and Arabic font pairing

- **Use the companion Arabic of the Latin family where one exists**: for example IBM Plex Sans Arabic with IBM Plex Sans, Noto Sans Arabic or Noto Kufi Arabic with Noto Sans, DIN Next Arabic with DIN Next, Frutiger Arabic with Frutiger, Helvetica Neue Arabic with Helvetica Neue. If the brand has its own bilingual font, use that.
- **Match weights by role**, not by name: Bold headline in Latin pairs with the Arabic weight that looks equally heavy (check visually; Arabic often needs one step heavier or a larger size).
- **Match size by visual weight**: Arabic headline 110 to 115% of the Latin size (never below about 90%) so the Arabic body height matches the Latin x-height visually.
- **Baseline:** when Arabic and English sit side by side, align the baselines, not the descender bottoms.
- **Leading:** Latin 1.1 to 1.2; Arabic 1.3 to 1.5.
- **Letter-spacing:** Latin 0 to +1% for headlines; Arabic always 0.
- **Numerals:** choose Western or Eastern Arabic numerals per the client and keep them consistent; set the number font so digits match the surrounding text.
- **Kashida:** allowed ONLY on single-line Arabic headlines on wide screens (ribbon, ultra-wide, landscape), max 3 per word. No kashida or justification anywhere else (multi-line, sublines, body, legal, tall or square screens).
- **Avoid:** italics and underline in Arabic, thin weights on LED, decorative display fonts for long text.
- **Licence:** confirm the fonts are licensed for digital signage and commercial use. Package the fonts used with the source files.
- **Shaping:** verify letters connect correctly in the software (see Section 9 for the AE setting).

---

# 8. Multi-screen sets, seams, and non-rectangular screens

## 8.1 First, get the map
For any pair, sync, or multi-panel set, ask the media owner: Are the screens physically adjacent? In what order? Are gaps or angles between them? Is the content one continuous canvas, or independent per screen? Do they play in sync from the same player?

## 8.2 If it is one continuous canvas
1. Build a **canvas comp** at the combined resolution (see Appendix B for candidate combinations from your list; confirm each).
2. Add **seam guides** at each join.
3. Keep text, logo, CTA, and faces at least **one full margin** (about 7.5% of the short side, 8% of height on ribbons) away from every seam, as in dooh-spacing-rules; each face keeps its own safe margins. A continuous background or hero image may cross a seam only if it is designed to.
4. Split the story: for example left screen = logo + headline, right screen = hero + CTA (mirror for Arabic: logo and headline on the right).
5. Keep baselines, horizon lines, and colours continuous across the joins.
6. Slice the canvas into one file per screen at exact pixel sizes; durations and frame counts must be identical.

## 8.3 If screens are independent but play together (sync)
- Each screen is a complete layout by itself, but the story should progress across them (for example hook on one, offer on the other) with the same timing.
- Use identical duration, frame rate, and start frame.
- Test the sync on the real player.

## 8.4 Many small panels (for example Marina - Palm Trees, 240×960)
- Decide: one canvas or independent panels. **Marina - Palm Trees = 4 panels only** (confirmed by Kapildev, 29 Oct 2026): combiner `Marina_Palms_Full` = 4 × 240×960 = 960×960. The "(6 screens)" in the config name is legacy; never build 6.
- Independent: one idea per panel; at most 2 words or an icon per panel; repeat the logo on the first or last panel only.
- Arabic: reverse the panel order (right to left).

## 8.5 Curved, oval, circular, or crescent screens
- Ask for the **mapping template or mask** and the visible area. Never guess the shape.
- Keep key content inside the central safe area (a starting rule is the central 70% of the visible shape) and extend backgrounds to the full rectangle behind the mask.
- Check text on curves for distortion; keep the logo and CTA on the flattest part.

## 8.6 Companion screens (different orientations)
For example Al Nassar Tower (2688×1152) with its vertical (960×5328), or Eye of Kuwait with its crop: keep the same message, colours, and logo behaviour, but design each layout separately; confirm the crop window for crop versions.

---

# 9. After Effects workflow

## 9.1 Project structure
```
01_ASSETS      (hero, logo versions, backgrounds, fonts list)
02_PRECOMPS    (LOGO, HERO, HEADLINE_EN, HEADLINE_AR, SUB_EN, SUB_AR, CTA_EN, CTA_AR, LEGAL_EN, LEGAL_AR, BG)
03_MOTION      (one shared animation timing comp per slot: 5s, 10s, 15s)
04_LAYOUTS     (one comp per family anchor: ULTRA_RIBBON, RIBBON, BANNER, WIDE, SQUARE, PORTRAIT, TALL, EXTREME_TALL)
05_SCREENS     (one comp per screen: Group_Screen_WxH_LANG_10s)
06_RENDER      (final comps only)
```
- Names: `Brand_Campaign_LANG_WxH_Ns_vN` with LANG = EN or AR (match the media owner's convention).

## 9.2 Keep layout and animation separate
- Build the **timing once** in 03_MOTION (when elements enter, hold, exit). Every layout comp reuses the same timing, so all formats move in sync and a timing change updates everything.
- Layout comps only control **position, scale, and line breaks**. 
- Use **Essential Graphics / Master Properties** for text, colours, and the language switch so one change updates every version.

## 9.3 Control layer
Add a null or control layer with sliders: `Margin`, `U` (spacing unit = 0.25 × headline size), `HeadlineSize`. Drive positions with expressions, for example:
```
m = thisComp.layer("CTRL").effect("Margin")("Slider");
[m, value[1]]
```

## 9.4 Arabic setup in After Effects
- Preferences > Type > Text Engine: **Middle Eastern and South Asian** (restart AE if asked). Without it, letters will not connect correctly.
- Paragraph panel: set right-to-left direction; right-align or centre; set tracking to 0.
- Use an Arabic font with a Latin companion if mixing scripts.
- To mirror a layer's position in the Arabic comp (when the layout is a pure mirror), use this on Position and re-check anchor points:
```
[thisComp.width - value[0], value[1]]
```
- Mirror only the layout, not the imagery. Re-check line breaks and text sizes by eye; do not rely on the expression alone for text blocks (anchor and justification change in RTL).

## 9.5 Guides and checks
- Create guide layers or null-based guides for margins, zones, seams, and the eye-level band from the layout file coordinates.
- Keep a "SAFE" guide layer you can toggle on and off on every screen comp.
- If your Screen Manager script creates comps from the config list, extend it to add margin and zone guides automatically from the layout rules.

## 9.6 Render
- Use Adobe Media Encoder with presets per codec class (Section 10).
- Render a short test (first and last 2 seconds plus the loop point) for each family before batch rendering.
- Keep a ProRes or lossless master for archive.

---

# 10. Export, codec, and file specs

## 10.1 Ask the media owner for each screen (or family)
Codec and profile/level, maximum resolution the player decodes, maximum bitrate, frame rate (25 or 30), container (MP4/MOV), whether audio track must be absent or silent, colour space, file size limit, naming convention, and whether very wide files must be split into tiles or sections.

## 10.2 Practical limits (rules of thumb; the player decides)
- **H.264:** safe on most players up to about 4096 px on either side and about 8.3 million pixels (4K UHD is 3840×2160 = 8.29 MP). Level 5.1 allows up to about 9.4 MP in the standard, but real hardware decoders are usually the limit.
- **H.265 (HEVC):** needed when width is over about 4096 px or the pixel count is high. Level 5.x allows about 8.9 MP; **Level 6.x** is needed above that. Confirm that the player supports it.
- **Odd dimensions:** most encoders need even width and height (4:2:0). A screen with an odd size (see Appendix C) needs an agreed handling: ask the media owner whether to deliver at the next even size or pad.
- **Over about 8.9 MP (for example 7560×2100):** confirm HEVC Level 6 support or split delivery into tiles/sections.

## 10.3 Starting export settings (adjust to the spec)
- Container MP4, H.264 High profile (or H.265 Main), 8-bit, 4:2:0, Rec.709/sRGB.
- Constant frame rate, same as the player (25 or 30).
- Keyframe interval about 1 to 2 seconds (closed GOP) for clean looping and seeking.
- MP4 with the "fast start" option (metadata at the front).
- No audio track unless required (or a silent track if the player demands one).
- Bitrate by pixel count: **bitrate ≈ width × height × fps × bits-per-pixel**, with H.264 about 0.12 to 0.20 and H.265 about 0.08 to 0.14 for motion graphics. Cap it at the player's maximum. Flat graphics with gradients need the higher end (banding).
- Appendix C lists the pixel count, suggested codec class, odd-size warnings, and a bitrate range at 25 fps for every unique size in your list.

## 10.4 Test before delivery
Play the exported file on the CMS or player: check first frame, end frame, loop, banding, colour, flicker, and playback smoothness.

---

# 11. QA and delivery (per version, on the exported file)

- [ ] Correct resolution, codec, fps, duration, size, naming
- [ ] Safe areas, margins (at least 6% of the short side), seams respected; text never overlaps the product
- [ ] Headline readable at the real distance; minimum sizes respected
- [ ] Contrast: minimum 4.5:1 for body, CTA and legal, 3:1 for large headlines (aim 7:1)
- [ ] No banding, no flashing, no 1 px shimmer
- [ ] Hero crop, focal point, and resolution correct on every screen
- [ ] Logo version, size, clear space, and position correct
- [ ] Arabic: RTL flow, correct font, shaping, no tracking, kashida only per Section 7, numerals, currency, punctuation, no clipped dots
- [ ] Native Arabic proofread and English proofread on the exported file
- [ ] Spacing follows the spacing rules (multiples of U)
- [ ] Motion: hold times, end frame, loop point, sync timing on sets
- [ ] Contact sheet of all versions reviewed for brand consistency
- [ ] Sign-off: client, native Arabic speaker, media owner
- [ ] Package: renders, sources, fonts, assets, version log, spec summary, backup poster frame

---

# Appendix A: Screen families from your list (generated)

Design the **anchor** first (the hardest or most extreme size), then derive the rest of the family by percentages. Sizes are unique pixel sizes; names with the same size share one layout. Checked against AE_ScreenManager_Config.json and Alshaheed_Screens_ScreenManager.json (29 Oct 2026): all sizes match; the 7 Alshaheed screens were added.

## Ultra-ribbon (ratio 10.0:1 to widest)
2 screens, 2 unique sizes. **Anchor: Hawally Gate 5832×432.**

**Strategy:** Height is the enemy. ONE short line (about 2 to 4 words), logo, hero, CTA in a single row. Subline, offer detail, and legal move to a second beat or the end frame. Hero is a cutout or panoramic extension. Story travels across the width.

| Size | Ratio | Screens |
|---|---|---|
| 5832×432 | 13.5:1 | Hawally Gate |
| 4460×378 | 11.8:1 | Kuwait Gate |

## Ribbon (ratio 6.0:1 to 10.0:1)
6 screens, 6 unique sizes. **Anchor: Boulevard Bridge 3584×384.**

**Strategy:** One line headline (two only if height is 800 px or more), 4 zones in a row. One offer only. Hero as a cutout on a colour field or a panoramic crop. CTA short.

| Size | Ratio | Screens |
|---|---|---|
| 3584×384 | 9.3:1 | Boulevard Bridge |
| 6048×864 | 7.0:1 | Avenues Gate Right Side |
| 7680×1152 | 6.7:1 | Al Salam Mall |
| 6880×1032 | 6.7:1 | Alshaheed - Karting Area High Wall Behind Chairs |
| 5328×864 | 6.2:1 | Mubarak Al Kabeer Gate |
| 1920×320 | 6.0:1 | 360 Circular |

## Short ribbon (ratio 5.0:1 to 6.0:1)
3 screens, 3 unique sizes. **Anchor: Marina - Balcony One 1200×240.**

**Strategy:** Often small in absolute width (1200 to 2400 px): use the compact 3-zone row (logo, headline, small hero/icon, CTA). Headline very short. Consider hero as a soft background field.

| Size | Ratio | Screens |
|---|---|---|
| 4200×720 | 5.8:1 | Mubarakiya Gate |
| 1200×240 | 5.0:1 | Marina - Balcony One |
| 2375×475 | 5.0:1 | AL Kout Bridge |

## Banner (ratio 3.0:1 to 5.0:1)
10 screens, 9 unique sizes. **Anchor: Baitak 2624×608.**

**Strategy:** Split layout: text block on one side, hero on the other. Headline 2 lines. Subline optional. Legal in the end frame.

| Size | Ratio | Screens |
|---|---|---|
| 2624×608 | 4.3:1 | Baitak; Thuraya Screen 1 (Big) |
| 3600×864 | 4.2:1 | Marina 1 |
| 3168×864 | 3.7:1 | Marina 2 |
| 7560×2100 | 3.6:1 | Eye of Kuwait |
| 1680×480 | 3.5:1 | Murouj-Wall Screens |
| 2400×720 | 3.3:1 | Boursa (big) |
| 3816×1224 | 3.1:1 | Khairan indoor 3816 x 1224 |
| 3440×1032 | 3.3:1 | Alshaheed - Extreme Entrance Parking Basement 1 |
| 2400×800 | 3.0:1 | WareHouse Screen 2400 x 800 |

## Panoramic wide (ratio 2.0:1 to 3.0:1)
22 screens, 20 unique sizes. **Anchor: Al Nassar Tower 2688×1152.**

**Strategy:** Split layout, headline 2 to 3 lines, subline allowed. Hero can take a full half of the canvas; extend the master background horizontally.

| Size | Ratio | Screens |
|---|---|---|
| 2448×864 | 2.8:1 | Blajat-Left Side; Mayar |
| 2027×720 | 2.8:1 | Piccadilly |
| 2736×1008 | 2.7:1 | Farwaniya Rotunda |
| 2816×1024 | 2.8:1 | Alshaheed - Karting Track Big Wall |
| 1536×576 | 2.7:1 | 2.6 Screen; Al Salam Sync |
| 3024×1152 | 2.6:1 | Al Mansouriya |
| 1920×766 | 2.5:1 | 360 Bridge |
| 1440×600 | 2.4:1 | Dayarti 1 1440 x 600 |
| 2688×1152 | 2.3:1 | Al Nassar Tower |
| 2304×1008 | 2.3:1 | Khalijiya |
| 1440×630 | 2.3:1 | The Capital Hub - Side 1 |
| 1120×512 | 2.2:1 | WareHouse Screen 1120 x 512 |
| 2160×1008 | 2.1:1 | Al Meera Mall-Left Side |
| 2048×960 | 2.1:1 | Marina - Bridge Screen |
| 3624×1704 | 2.1:1 | Eye of Kuwait Crop |
| 2304×1152 | 2.0:1 | Assima G & M Floors |
| 1440×720 | 2.0:1 | Boursa (small) |
| 2048×1024 | 2.0:1 | Grand Plaza Entrance |
| 1024×512 | 2.0:1 | Alshaheed - Ice Rink High Wall |
| 3456×1728 | 2.0:1 | Khairan indoor 3456 x 1728 |

## Standard wide (ratio 1.55:1 to 2.0:1)
8 screens, 8 unique sizes. **Anchor: 1.7HD 1920×1080.**

**Strategy:** Closest to the master (16:9). Recompose rather than scale: keep hierarchy, re-check safe areas and margins.

| Size | Ratio | Screens |
|---|---|---|
| 1100×600 | 1.8:1 | Dayarti 2 1100 x 600 |
| 1366×768 | 1.8:1 | 360 Grand entrance |
| 1920×1080 | 1.8:1 | 1.7HD |
| 960×540 | 1.8:1 | Thuraya Screen 2 (Side) |
| 1920×1152 | 1.7:1 | Assima L1 & L2 |
| 1720×1032 | 1.7:1 | Alshaheed - Ice Rink Ticketing |
| 1440×864 | 1.7:1 | Avenues Gate Left Side |
| 950×600 | 1.6:1 | Dayarti 3 950 x 600 |

## Classic / 4:3-ish (ratio 1.25:1 to 1.55:1)
7 screens, 6 unique sizes. **Anchor: Platinum Square 1440×1008.**

**Strategy:** Split layout with a taller text block; headline up to 3 lines; hero larger than in 16:9.

| Size | Ratio | Screens |
|---|---|---|
| 2160×1440 | 1.5:1 | Downtown |
| 948×648 | 1.5:1 | The Gate Mall Outdoor |
| 1040×720 | 1.4:1 | Al Zawya - Screen 2 (right side) |
| 1440×1008 | 1.4:1 | Al Meera Mall-Right Side; Platinum Square |
| 1152×864 | 1.3:1 | Blajat-Right Side |
| 1120×840 | 1.3:1 | Khairan Outdoor 1120 x 840 |

## Square-ish (ratio 0.85:1 to 1.25:1)
4 screens, 4 unique sizes. **Anchor: Al Hamra Mall - Outdoor Screen 1840×1740.**

**Strategy:** Centred stack: logo, headline, hero, CTA, legal. One message, one focal point. Symmetrical margins. Simplest layout; cut hardest.

| Size | Ratio | Screens |
|---|---|---|
| 860×720 | 1.2:1 | Al Zawya - Screen 1 (center) |
| 1840×1740 | 1.1:1 | Al Hamra Mall - Outdoor Screen |
| 864×864 | 1.0:1 | Topaz (Sync) |
| 2304×2376 | 1:1.0 | Khairan indoor 2304 x 2376 |

## Portrait (ratio 1:1.8 to 0.85:1)
15 screens, 9 unique sizes. **Anchor: 360 OvalScreen 1080×1920.**

**Strategy:** Vertical stack with support line. Hero at the centre band, full-bleed or cutout. Headline 2 to 4 lines, big type.

| Size | Ratio | Screens |
|---|---|---|
| 1280×1600 | 1:1.2 | Boulevard Wall |
| 1440×1800 | 1:1.2 | Diamond |
| 768×1280 | 1:1.7 | Alshaheed - Snow Fun High Wall |
| 768×1024 | 1:1.3 | 360 Al Wadi |
| 576×768 | 1:1.3 | 360 Elevator |
| 640×896 | 1:1.4 | Al Hamra Mall - Indoor Screen |
| 2000×2800 | 1:1.4 | WareHouse Screen 2000 x 2800 |
| 1080×1920 | 1:1.8 | Gate Digital; Slayel and Yaal; Aveneus Digital; Avnues Flag; 360 MUPI; 360 OvalScreen; Alshaheed - Mupi |
| 1600×2864 | 1:1.8 | 360 Imax Tower |

## Tall column (ratio 1:4.5 to 1:1.8)
5 screens, 5 unique sizes. **Anchor: Marina - Palm Trees (6 screens) 240×960.**

**Strategy:** Vertical zones with eye-level band. Brand at top (non-critical), headline and hero at the middle, CTA below, legal at the base. Short lines (1 to 3 words).

| Size | Ratio | Screens |
|---|---|---|
| 672×1836 | 1:2.7 | Aqarat |
| 480×1440 | 1:3.0 | Marina - Crescent Sync |
| 576×1728 | 1:3.0 | WareHouse Screen 576 x 1728 |
| 864×2880 | 1:3.3 | Derwaza |
| 240×960 | 1:4.0 | Marina - Palm Trees (6 screens) |

## Extreme tall (ratio narrowest to 1:4.5)
2 screens, 2 unique sizes. **Anchor: Al Nassar Tower Vertical 960×5328.**

**Strategy:** Narrow and very long. Fill the length with intent (background extension, brand pattern, vertical storytelling). Key message only inside the eye-level band. Re-time animation top to bottom.

| Size | Ratio | Screens |
|---|---|---|
| 1008×5184 | 1:5.1 | 1st Ring Road |
| 960×5328 | 1:5.5 | Al Nassar Tower Vertical |

---

# Appendix B: Candidate combined canvases and companion sets (confirm physical layout with the media owner)

Only combine screens into one canvas if they are physically adjacent and the media owner confirms it. Otherwise treat them as independent screens that play in sync.

| Set | Sizes | Possible combined canvas | Note |
|---|---|---|---|
| Al Meera Mall left + right | 2160×1008 + 1440×1008 | 3600×1008 | Same height |
| Avenues Gate left + right | 1440×864 + 6048×864 | 7488×864 | Same height; very long: confirm codec |
| Blajat left + right | 2448×864 + 1152×864 | 3600×864 | Same height |
| Al Zawya screen 1 + 2 | 860×720 + 1040×720 | 1900×720 | Same height |
| Boursa big + small | 2400×720 + 1440×720 | 3840×720 | Same height |
| Dayarti 1, 2, 3 | 1440×600, 1100×600, 950×600 | 3490×600 | Same height; no Screen Manager combiner; confirm if adjacent |
| Marina 1 + Marina 2 | 3600×864 + 3168×864 | 6768×864 | Same height; no Screen Manager combiner; confirm |
| Platinum Square ×2 | 2 × 1440×1008 | 2880×1008 (`Platinum_Screen`) | Duplicate side by side |
| Marina Crescent ×2 | 2 × 480×1440 | 960×1440 (`Marina_Crescent_Sync`) | Duplicate |
| Murouj wall | 3 or 4 × 1680×480 stacked | 1680×1440 (`Mourouj_Wall_AB`), 1680×1920 (`Mourouj_Wall_C`) | Vertical stack |
| Capital Hub ×2 | 2 × 1440×630 | 2880×630 (`Capital_HUB`) | Duplicate |
| Piccadilly ×3 | 3 × 2027×720 | **6080×720 is the rule** (`Piccadilly_Sync`). 3 × 2027 = 6081: **crop 1 px** from the right edge of the last panel (panels 2027 + 2027 + 2026); never scale (confirmed 29 Oct 2026) | - |
| Topaz ×2 | 2 × 864×864 | 1728×864 (`Topaz_Sync`) | Duplicate |
| Al Salam Sync ×2 | 2 × 1536×576 | 3072×576 (`Al_Salam_Sync`) | Duplicate |
| Marina palm trees | 4 × 240×960 | 960×960 (combiner `Marina_Palms_Full`) | **4 panels only** (confirmed) |
| Thuraya screen 1 + 2 | 2624×608 + 960×540 | Two separate screens (confirmed by Kapildev, 29 Oct 2026). Design and deliver each screen on its own. `Thuraya_Full` in Combiners.json lists exactly these two (top-aligned); its 3584×608 canvas is only the AE combiner comp, not a design area | No 68 px gap layout |
| Al Salam Mall + Al Salam Sync | 7680×1152 + 1536×576 | Not combinable with the Mall screen | Sync companion; 1536×576 is also the size of "2.6 Screen" |
| Al Nassar Tower + Vertical | 2688×1152 + 960×5328 | Not combinable | Companion: same message, separate layouts |
| Eye of Kuwait + Crop | 7560×2100 + 3624×1704 | Not combinable | Crop version: confirm crop window |
| Khairan indoor (3 sizes) | 2304×2376, 3456×1728, 3816×1224 | Not combinable | Independent screens in one mall |
| Warehouse (4 sizes) | 1120×512, 2000×2800, 2400×800, 576×1728 | Not combinable | Independent screens in one mall |

---

# Appendix C: Encoding quick table (generated, rules of thumb)

Pixel count (MP), suggested codec class, odd-dimension warning, and an estimated bitrate range at 25 fps (multiply by about 1.2 for 30 fps). Always confirm player limits with the media owner and test.

| Size | MP | Codec class | Odd size | Bitrate (25 fps) | Screens |
|---|---|---|---|---|---|
| 7560×2100 | 15.88 | H.265 Level 6 or split/tile (confirm) | - | 31.8–55.6 Mbps | Eye of Kuwait |
| 6880×1032 | 7.10 | H.265 (confirm player) | - | 14.2–24.8 Mbps | Alshaheed - Karting Area High Wall Behind Chairs |
| 3440×1032 | 3.55 | H.264 (H.265 optional) | - | 10.6–17.8 Mbps | Alshaheed - Extreme Entrance Parking Basement 1 |
| 2816×1024 | 2.88 | H.264 (H.265 optional) | - | 8.7–14.4 Mbps | Alshaheed - Karting Track Big Wall |
| 1720×1032 | 1.78 | H.264 (H.265 optional) | - | 5.3–8.9 Mbps | Alshaheed - Ice Rink Ticketing |
| 768×1280 | 0.98 | H.264 (H.265 optional) | - | 2.9–4.9 Mbps | Alshaheed - Snow Fun High Wall |
| 1024×512 | 0.52 | H.264 (H.265 optional) | - | 1.6–2.6 Mbps | Alshaheed - Ice Rink High Wall |
| 7680×1152 | 8.85 | H.265 (confirm player) | - | 17.7–31.0 Mbps | Al Salam Mall |
| 3624×1704 | 6.18 | H.264 (H.265 optional) | - | 18.5–30.9 Mbps | Eye of Kuwait Crop |
| 3456×1728 | 5.97 | H.264 (H.265 optional) | - | 17.9–29.9 Mbps | Khairan indoor 3456 x 1728 |
| 2000×2800 | 5.60 | H.264 (H.265 optional) | - | 16.8–28.0 Mbps | WareHouse Screen 2000 x 2800 |
| 2304×2376 | 5.47 | H.264 (H.265 optional) | - | 16.4–27.4 Mbps | Khairan indoor 2304 x 2376 |
| 6048×864 | 5.23 | H.265 (confirm player) | - | 10.5–18.3 Mbps | Avenues Gate Right Side |
| 1008×5184 | 5.23 | H.265 (confirm player) | - | 10.5–18.3 Mbps | 1st Ring Road |
| 960×5328 | 5.11 | H.265 (confirm player) | - | 10.2–17.9 Mbps | Al Nassar Tower Vertical |
| 3816×1224 | 4.67 | H.264 (H.265 optional) | - | 14.0–23.4 Mbps | Khairan indoor 3816 x 1224 |
| 5328×864 | 4.60 | H.265 (confirm player) | - | 9.2–16.1 Mbps | Mubarak Al Kabeer Gate |
| 1600×2864 | 4.58 | H.264 (H.265 optional) | - | 13.7–22.9 Mbps | 360 Imax Tower |
| 3024×1152 | 3.48 | H.264 (H.265 optional) | - | 10.5–17.4 Mbps | Al Mansouriya |
| 1840×1740 | 3.20 | H.264 (H.265 optional) | - | 9.6–16.0 Mbps | Al Hamra Mall - Outdoor Screen |
| 3600×864 | 3.11 | H.264 (H.265 optional) | - | 9.3–15.6 Mbps | Marina 1 |
| 2160×1440 | 3.11 | H.264 (H.265 optional) | - | 9.3–15.6 Mbps | Downtown |
| 2688×1152 | 3.10 | H.264 (H.265 optional) | - | 9.3–15.5 Mbps | Al Nassar Tower |
| 4200×720 | 3.02 | H.265 (confirm player) | - | 6.0–10.6 Mbps | Mubarakiya Gate |
| 2736×1008 | 2.76 | H.264 (H.265 optional) | - | 8.3–13.8 Mbps | Farwaniya Rotunda |
| 3168×864 | 2.74 | H.264 (H.265 optional) | - | 8.2–13.7 Mbps | Marina 2 |
| 2304×1152 | 2.65 | H.264 (H.265 optional) | - | 8.0–13.3 Mbps | Assima G & M Floors |
| 1440×1800 | 2.59 | H.264 (H.265 optional) | - | 7.8–13.0 Mbps | Diamond |
| 5832×432 | 2.52 | H.265 (confirm player) | - | 5.0–8.8 Mbps | Hawally Gate |
| 864×2880 | 2.49 | H.264 (H.265 optional) | - | 7.5–12.4 Mbps | Derwaza |
| 2304×1008 | 2.32 | H.264 (H.265 optional) | - | 7.0–11.6 Mbps | Khalijiya |
| 1920×1152 | 2.21 | H.264 (H.265 optional) | - | 6.6–11.1 Mbps | Assima L1 & L2 |
| 2160×1008 | 2.18 | H.264 (H.265 optional) | - | 6.5–10.9 Mbps | Al Meera Mall-Left Side |
| 2448×864 | 2.12 | H.264 (H.265 optional) | - | 6.3–10.6 Mbps | Blajat-Left Side; Mayar |
| 2048×1024 | 2.10 | H.264 (H.265 optional) | - | 6.3–10.5 Mbps | Grand Plaza Entrance |
| 1920×1080 | 2.07 | H.264 (H.265 optional) | - | 6.2–10.4 Mbps | 1.7HD |
| 1080×1920 | 2.07 | H.264 (H.265 optional) | - | 6.2–10.4 Mbps | Gate Digital; Slayel and Yaal; Aveneus Digital; Avnues Flag; 360 MUPI; 360 OvalScreen; Alshaheed - Mupi |
| 1280×1600 | 2.05 | H.264 (H.265 optional) | - | 6.1–10.2 Mbps | Boulevard Wall |
| 2048×960 | 1.97 | H.264 (H.265 optional) | - | 5.9–9.8 Mbps | Marina - Bridge Screen |
| 2400×800 | 1.92 | H.264 (H.265 optional) | - | 5.8–9.6 Mbps | WareHouse Screen 2400 x 800 |
| 2400×720 | 1.73 | H.264 (H.265 optional) | - | 5.2–8.6 Mbps | Boursa (big) |
| 4460×378 | 1.69 | H.265 (confirm player) | - | 3.4–5.9 Mbps | Kuwait Gate |
| 2624×608 | 1.60 | H.264 (H.265 optional) | - | 4.8–8.0 Mbps | Baitak; Thuraya Screen 1 (Big) |
| 1920×766 | 1.47 | H.264 (H.265 optional) | - | 4.4–7.4 Mbps | 360 Bridge |
| 2027×720 | 1.46 | H.264 (H.265 optional) | ODD: single 2027; the 3-panel sync output is 6080 (crop 1 px) | 4.4–7.3 Mbps | Piccadilly |
| 1440×1008 | 1.45 | H.264 (H.265 optional) | - | 4.4–7.3 Mbps | Al Meera Mall-Right Side; Platinum Square |
| 3584×384 | 1.38 | H.264 (H.265 optional) | - | 4.1–6.9 Mbps | Boulevard Bridge |
| 1440×864 | 1.24 | H.264 (H.265 optional) | - | 3.7–6.2 Mbps | Avenues Gate Left Side |
| 672×1836 | 1.23 | H.264 (H.265 optional) | - | 3.7–6.2 Mbps | Aqarat |
| 2375×475 | 1.13 | H.264 (H.265 optional) | ODD: single 2027; the 3-panel sync output is 6080 (crop 1 px) | 3.4–5.6 Mbps | AL Kout Bridge |
| 1366×768 | 1.05 | H.264 (H.265 optional) | - | 3.1–5.2 Mbps | 360 Grand entrance |
| 1440×720 | 1.04 | H.264 (H.265 optional) | - | 3.1–5.2 Mbps | Boursa (small) |
| 1152×864 | 1.00 | H.264 (H.265 optional) | - | 3.0–5.0 Mbps | Blajat-Right Side |
| 576×1728 | 1.00 | H.264 (H.265 optional) | - | 3.0–5.0 Mbps | WareHouse Screen 576 x 1728 |
| 1120×840 | 0.94 | H.264 (H.265 optional) | - | 2.8–4.7 Mbps | Khairan Outdoor 1120 x 840 |
| 1440×630 | 0.91 | H.264 (H.265 optional) | - | 2.7–4.5 Mbps | The Capital Hub - Side 1 |
| 1536×576 | 0.88 | H.264 (H.265 optional) | - | 2.7–4.4 Mbps | 2.6 Screen; Al Salam Sync |
| 1440×600 | 0.86 | H.264 (H.265 optional) | - | 2.6–4.3 Mbps | Dayarti 1 1440 x 600 |
| 1680×480 | 0.81 | H.264 (H.265 optional) | - | 2.4–4.0 Mbps | Murouj-Wall Screens |
| 768×1024 | 0.79 | H.264 (H.265 optional) | - | 2.4–3.9 Mbps | 360 Al Wadi |
| 1040×720 | 0.75 | H.264 (H.265 optional) | - | 2.2–3.7 Mbps | Al Zawya - Screen 2 (right side) |
| 864×864 | 0.75 | H.264 (H.265 optional) | - | 2.2–3.7 Mbps | Topaz (Sync) |
| 480×1440 | 0.69 | H.264 (H.265 optional) | - | 2.1–3.5 Mbps | Marina - Crescent Sync |
| 1100×600 | 0.66 | H.264 (H.265 optional) | - | 2.0–3.3 Mbps | Dayarti 2 1100 x 600 |
| 860×720 | 0.62 | H.264 (H.265 optional) | - | 1.9–3.1 Mbps | Al Zawya - Screen 1 (center) |
| 1920×320 | 0.61 | H.264 (H.265 optional) | - | 1.8–3.1 Mbps | 360 Circular |
| 948×648 | 0.61 | H.264 (H.265 optional) | - | 1.8–3.1 Mbps | The Gate Mall Outdoor |
| 1120×512 | 0.57 | H.264 (H.265 optional) | - | 1.7–2.9 Mbps | WareHouse Screen 1120 x 512 |
| 640×896 | 0.57 | H.264 (H.265 optional) | - | 1.7–2.9 Mbps | Al Hamra Mall - Indoor Screen |
| 950×600 | 0.57 | H.264 (H.265 optional) | - | 1.7–2.9 Mbps | Dayarti 3 950 x 600 |
| 960×540 | 0.52 | H.264 (H.265 optional) | - | 1.6–2.6 Mbps | Thuraya Screen 2 (Side) |
| 576×768 | 0.44 | H.264 (H.265 optional) | - | 1.3–2.2 Mbps | 360 Elevator |
| 1200×240 | 0.29 | H.264 (H.265 optional) | - | 0.9–1.4 Mbps | Marina - Balcony One |
| 240×960 | 0.23 | H.264 (H.265 optional) | - | 0.7–1.2 Mbps | Marina - Palm Trees (6 screens) |

---

# Related skills
- **dooh-spacing-rules**: U = 0.25 × headline, gap table, CTA/price blocks, letter-spacing and kashida policy.
- **dooh-all-screens-layouts**: per-screen zone coordinates and starting type sizes (Section 1.3 anchors use them).
- **dooh-artwork-adaptation**: adaptation workflow, margins (at least 6% of the short side), non-AI background extension first.
- **dooh-element-positioning**: where each element goes for a given pixel size.
- **dooh-design-audit**: the scoring criteria used for QA (contrast minimums 4.5:1 / 3:1).
