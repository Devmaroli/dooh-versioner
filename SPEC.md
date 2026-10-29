# DOOH Versioner — Product Spec (v0.1)
Local Bannerflow-style tool for DOOH: one master design → many screen sizes × many versions. **DOOH only** (no HTML5 banners).

> Sizes below are **EXAMPLE sizes only** — not real M2R screen specs. Real sizes come from Kapildev's booking sheets.

## 1. Goals
| # | Goal |
|---|------|
| 1 | Design once, output every booked screen size automatically |
| 2 | Generate versions (EN/AR, price, offer) from a CSV/Excel sheet |
| 3 | Allow manual per-size overrides without breaking the master |
| 4 | Batch export JPG/PNG + MP4 (FFmpeg), correctly named |
| 5 | Run 100% locally, no cloud, no login |

## 2. Scope
| Feature | MVP | Later |
|---|---|---|
| Master design (image, text, shape, logo layers) | ✅ | |
| Size list (manual + CSV import), presets | ✅ | |
| Resize rules: anchor, scale, text fit | ✅ | |
| Editor + size switcher + per-size overrides | ✅ | |
| All-sizes preview grid | ✅ | |
| Data sheet (CSV/XLSX) → bound layers | ✅ | |
| Arabic / RTL text (shaping, right-align, mirrored anchors) | ✅ | |
| Export JPG/PNG | ✅ | |
| Export MP4 (static hold + simple fade/slide in) | ✅ | |
| Keyframe animation timeline | | ✅ |
| Video layers as background | | ✅ |
| Combined multi-face screens (one design split across faces) | | ✅ |
| Spec checker vs booking (size, duration, fps, file size) | | ✅ |
| Electron desktop wrapper | | ✅ |
| Templates library / brand kits | | ✅ |
| HTML5 banners | ❌ out of scope | |

## 3. User flow
1. Create project → set master size (ASSUMED: largest booked size).
2. Add target sizes (type or import CSV: name, width, height, duration, fps).
3. Build master design: add layers, set resize rule per layer.
4. Import data sheet; bind columns to layers (e.g. `headline` → Headline text).
5. Review all sizes in the grid; open any size in the editor to override.
6. Pick versions × sizes → Export. Files named `{campaign}_{version}_{size}_{w}x{h}.{ext}`.

## 4. Data model
| Entity | Key fields |
|---|---|
| Project | id, name, masterSizeId, sizes[], layers[], dataSheet, exportSettings |
| Size | id, label, width, height, durationSec, fps, format (jpg/png/mp4) |
| Layer | id, type (text/image/shape/logo), name, frame {x,y,w,h} in master, rule, bindings, style |
| Rule | anchorH (left/center/right/stretch), anchorV (top/middle/bottom/stretch), scaleMode (fit/fill/fixed/%ofHeight/%ofWidth), scaleValue, textFit (shrink/wrap/none), minFont, maxFont, safeMargin % |
| Override | sizeId, layerId, partial frame/style/visible (wins over rule) |
| DataSheet | columns[], rows[] (row = version), keyColumn (e.g. `version_id`) |
| Binding | layerId, property (text/src/color), column |
| Version row | version_id, lang (en/ar), dir (ltr/rtl), headline, price, offer, image |

Stored as one `project.json` + `assets/` folder.

## 5. Resize-rule system (v0.2 — hybrid, engine in `engine/adapt.ts`)

### 5.1 Approaches compared
| Approach | Used by | Strength | Weakness for DOOH | Verdict |
|---|---|---|---|---|
| A. Constraints/anchors per layer (pin edges, fixed/% size) | Figma auto-layout, Bannerflow-style templates | Precise, predictable | Every layer needs rules; breaks at extreme ratios (8:1, 1:5) | Use for **manual overrides** only |
| B. Role tags + proportional master geometry | ScreenAdapter (Kapildev, AE) | One-word tags, zero per-size work, proven on real M2R screens, already tested (208 checks) | Big aspect jumps (16:9 → 1:3) shrink text; needs variants | **Base engine** |
| C. Aspect-class master variants | Celtra/Bannerflow "template per format" (ASSUMED) | Designer controls the hard cases | More design work | **Add**: per-class layout (7 classes) for the roles that need it |
| D. Saliency smart crop / ROI | AutoPoster (arXiv 2308.01095), Intelligent Ad Resizing (WWW 2010) | Keeps subject in bg/product images | Images only | **Add** for `@bg` / `@product` |
| E. Learned layout generation (LayoutGAN, energy models) | Research | Novel layouts | Unpredictable, needs training data | Later, **suggestions only** |

**Choice: hybrid B + C + D, with A as overrides.** Order per layer per size:
`role default (B) → aspect-class variant if present (C) → saliency crop for images (D) → keep-clear pass → manual override (A) → QA warnings`.

### 5.2 Layer rule syntax (from ScreenAdapter tag grammar)
| Token | Meaning |
|---|---|
| `@bg @logo @headline @cta @product @panel` | Role → default adapt: bg=cover, panel=stretch, others=keep |
| `.keep .stretch .cover .contain` | Adapt override |
| `.tl .tr .bl .br .t .b .l .r .c` | Pin to frame (inside safe margin) instead of master position |
| `.flushl/.flushr/.flusht/.flushb/.ground` | Snap one edge to frame |
| `.clear / .clear24 / .clear5p` | Keep clear of logo/CTA (safe margin / px / % short side) |
| `.60.r` (product) + `.hf/.vf` + reserve | Zone split, fit axis, reserve |
| `@h @sq @v @uv @xv @uw @xw` | Only on that aspect class (fallback xw→uw→h, xv→uv→v) |
In the app these become **form fields** on the layer (stored as JSON); the tag string stays as import/export format so AE masters can be read.

### 5.3 Constants (from ScreenAdapter, editable per project)
| Constant | Value |
|---|---|
| Safe margin | 5% of short side |
| Text max upscale | 140% of master scale |
| Logo max | 50% width / 25% height; min 3% short side (≥24 px) |
| Aspect classes (w/h) | xw ≥8, uw ≥3, h >1.1, sq 0.9–1.1, v <0.9, uv ≤0.35, xv ≤0.2 |

### 5.4 Arabic / RTL (new)
`dir=rtl` mirrors horizontal anchors, zone sides and master x-fractions; text right-aligned. Text box measured per version, so longer AR copy is fitted by the same scale caps.

### 5.5 AI in the adaptation loop — placement & decisions only
Rule: AI proposes; it does **not** generate pixels, with one exception (row 7). It only proposes numbers (crop rect, position, scale, layout choice, score) that land as editable layer parameters, each marked "AI-suggested" with accept/revert.
| # | Feature | Output (editable) | Local option | Cost / risk |
|---|---|---|---|---|
| 1 | Saliency smart crop for `@bg`/`@product` | crop rect / focal point | Prototype: browser contrast saliency. Prod: U²-Net / BiRefNet via ONNX Runtime, RTX 3070 Ti (ASSUMED fits 8 GB) | Free; may pick wrong subject → designer drags focal point |
| 2 | Subject/face detection to protect ROI | protected ROI box | YOLO / RT-DETR ONNX (check model licence: Ultralytics is AGPL) | Licence risk |
| 3 | Layout QA scoring | warnings + score per size | Rules (min text px for viewing distance, safe area, overlaps, contrast WCAG) + optional local VLM (Qwen2.5-VL 7B quantised, ASSUMED runs on 8 GB) | Rules = deterministic; VLM = advisory only |
| 4 | Pick variant / suggest positions for bad sizes | chosen class variant, x/y/scale | Search over rule params maximising QA score (no model needed) | Low |
| 5 | Copy shortening + Arabic fit | **suggested** shorter text for approval | Local LLM (ASSUMED Qwen 7B Q4) or cloud LLM | Brand/legal: must be approved by human, never auto-used |
| 6 | Auto-tagging layers on import | proposed role tags | Heuristics (name, size, position) + optional VLM | Low |
| 7 | Background extension (outpainting) — **opt-in last resort** | Separate `@bg.ai` layer: toggleable, replaceable, flagged "AI-generated" in UI, file metadata and export log | Local SDXL/Flux inpaint via ComfyUI on RTX 3070 Ti (ASSUMED feasible at DOOH res with tiling) or cloud (Firefly API) | Only after non-AI fallbacks fail: reposition → scale → saliency crop → mirror/stretch edges → solid/gradient fill. User-triggered per size, never automatic. Risks: client approval, artefacts, model licence |

### 5.6 Industry survey (short)
| Product | How it resizes | Notes |
|---|---|---|
| Bannerflow | Template + brand rules, "preserves layout intent, focal points, safe areas" | HTML5 focus |
| Celtra | Modular template systems per format | Enterprise, rigid |
| Figma | Constraints + auto-layout (flex) | Manual setup per frame |
| Canva Magic Switch | AI resize, then manual fixes | Consumer |
| Adobe Express / Firefly / GenStudio | Resize + Generative Expand (outpainting) | Allowed for us only as opt-in last resort (5.5 #7) |
| Research | AutoPoster (saliency crop + layout), Attribute-conditioned LayoutGAN (resize keeping reading order), O'Donovan 2014 energy model | Ideas for #1, #3, #4 |

## 6. Tech stack
| Part | Choice |
|---|---|
| UI | React + TypeScript + Vite, Zustand state |
| Canvas | Konva (react-konva) for editor; same layout engine for render |
| Layout engine | Pure TS module (shared by UI and renderer, unit-tested) |
| Data sheet | SheetJS (xlsx/csv) |
| Arabic text | Browser text shaping + `dir=rtl`; fonts bundled (ASSUMED: client fonts supplied) |
| Server | Node + Express on localhost |
| Layout engine | `engine/adapt.ts` (port of ScreenAdapter) — pure TS, used by editor, grid and server |
| Rendering | Stills: canvas/Playwright. Motion: **EffectCraft CLI** `render --template --values` (spike first; fallback Playwright frames) |
| Encode / QA | **EncodeCraft** (`encodecraft-cli serve`, `POST /v1/enqueue` on 127.0.0.1:9878 with token; presets Better Res / Installation / Approval Res / Sultan; one-source-many-sizes; ffprobe) — shells out to FFmpeg |
| Jobs | Simple local queue with progress |
| Desktop (later) | Electron wrapper |

## 7. Roadmap
| Phase | Deliverable | Est. (ASSUMED) |
|---|---|---|
| 1 | Layout engine + size list + grid preview (static) | 1–2 wks |
| 2 | Editor: layers, properties, size switcher, overrides | 2 wks |
| 3 | Data sheet + bindings + EN/AR RTL | 1–2 wks |
| 4 | Batch export PNG/JPG + MP4 via FFmpeg | 1 wk |
| 5 | Animation presets, video backgrounds, spec checker | 2–3 wks |
| 6 | Electron app, templates, multi-face screens | later |

## 8. Open questions
1. Real size list: which booked screens/sizes should be the starting presets?
2. MP4 specs per network: codec, bitrate, fps, max file size?
3. Animation needed in MVP, or static hold + fade enough?
4. Arabic fonts: which fonts are licensed for use?
5. File-naming convention required by M2R / media owners?
6. One machine only, or shared across the team (network folder)?

## 9. Build plan (architecture: React editor + TS engine + EffectCraft render + EncodeCraft encode)
1. **Engine package** `engine/adapt.ts` — done (port + RTL + saliency crop, 219 checks). Add aspect-class variants, overrides merge, QA rules.
2. **Project model** — `project.json` (layers with rule fields, sizes from `ScreenAdapter_Config.json` format, data sheet, overrides).
3. **React editor** (Vite + Konva): layers / canvas / properties / size switcher; tag string ⇄ form fields; "AI-suggested" badge with accept/revert.
4. **Grid + data sheet**: SheetJS import CSV/XLSX; live grid = sizes × versions (prototype proves this).
5. **Node local server** (Express, 127.0.0.1): file IO, asset folder, job queue, WebSocket progress.
6. **Stills export**: render via same canvas code in headless Chromium → PNG/JPG, naming `prefix_screen_duration_suffix` (ScreenAdapter rule).
7. **Motion render spike**: write EffectCraft `.ectemplate` + values per version×size, call `effectcraft-cli render`; verify per-size layout + Arabic shaping. Fallback: Playwright frames → FFmpeg.
8. **Encode/QA**: hand rendered masters to EncodeCraft (`POST /v1/enqueue`, network preset, sizes), poll `/v1/queue`; ffprobe check vs booking (size, fps, duration, bitrate).
9. **AI assist (local, placement only)**: ONNX saliency (BiRefNet/U²-Net) → focal point; rule-based QA score; optional local VLM/LLM suggestions behind approval.
10. **AE bridge (optional)**: read ScreenAdapter-tagged AE masters / export tags back, so both tools share one grammar.
11. **Package**: Electron wrapper; bundle FFmpeg via EncodeCraft install.

---
## 10. v0.3 additions (2026-10-29)

### 10.1 Real M2R screen presets (engine: `importScreenList`, `importCombiners`, `mergePresets`)
| File | Contains | Format | Quirks |
|---|---|---|---|
| ScreenAdapter_Config.json | 72 screens | `[{name,w,h,selected}]` | no `group` |
| Alshaheed_Screens_ScreenManager.json | 7 screens | `[{name,w,h,group,selected}]` | group "Al Shaheed" |
| AE_ScreenManager_Config.json (screenmanager2.zip, 9488 B) | 77 screens | `[{name,w,h,group,selected}]` | 8 groups (360 Mall, AL Kout, Avenues, DOOH, Dayarti, Khairan Mall, Marina, Warehouse Mall). 6 names not in ScreenAdapter (incl. both Thuraya faces). Name "Assima L1 & L2 " has a trailing space, kept verbatim. If the file is empty, the JSX falls back to 8 built-in defaults; the importer reports "empty file" instead |
| AE_ScreenManager_Combiners.json | 15 combined layouts | `[{name,columns:[{screenName,layout,count,match:[w,h],vAlign?,forceScale?,compW?}]}]` | see below |
| AE_ScreenManager_Unified_V2_6.jsx | the AE panel | geometry in `computeLayoutSize` | the importer mirrors it |

Combiner geometry:
- Columns are laid out left to right.
- `h-dup` repeats a face across, `v-dup` repeats it down, and `single` forces count = 1.
- `compW` overrides the column width.
- `vAlign` is `top` by default.
- The combined canvas is W = Σ column widths and H = max column height. Each face rect is kept and drawn as a dashed outline.

Quirks:
- Piccadilly: output width rule 6080 (`compW`); 3×2027 = 6081, so the engine CROPS 1 px from the last face (2027+2027+2026), never scales (Kapildev, 29 Oct 2026).
- "Marina - Palm Trees (6 screens)": 4 panels only (confirmed); the name is legacy.
- `Mourouj_*` layouts reference "Murouj-Wall Screens" (spelling differs). The same face is used with ×3 and ×4.
- The two Thuraya screens are only in AE_ScreenManager_Config.json. Their sizes match the combiner `match`. Thuraya = two separate screens 2624×608 + 960×540 (confirmed); `Thuraya_Full` 3584×608 is only the AE comp.
- Merged order: AE config → ScreenAdapter → Alshaheed. Same name and size → one entry. Total: 85 screens + 15 combined. Sizes conflict nowhere.

Names are kept verbatim. Sizes are never invented: bad rows are reported, not guessed.

### 10.2 Text adaptation
| Case | Rule | Code |
|---|---|---|
| Tall (v/uv/xv) | Headline and offer are re-broken into 1–4 or 1–5 balanced word chunks. The line count is chosen to give the largest font that fits the box (w = frame − margins, h = 20–26% of frame height). Lines ending on a weak word (of/the/و/في…) are penalised. | `balancedBreak`, `chunkToBox` (heuristic stand-in for AI word-split) |
| Wide (uw/xw or ≥2.5:1), Arabic | Kashida: U+0640 is inserted at the last joining pair of each word (UCD joining types D/R/C/T, port of vectorcraft `kashida.rs`). Each word gets an equal share, at most 6 per word, and the headline fills its column (≤1.45× width). | `kashidaPicks`, `kashidaFit` |
| AI (later) | The LLM returns `{lines[], anchor, scale}` JSON only. The engine validates and clamps it. | provider layer |

### 10.3 AI auto-apply + badges
Every decision is applied by default and shows an "AI · …" badge. A click toggles accept/revert.

Decisions:
- smart crop (per size);
- word split (per size);
- kashida (per size);
- auto-tag (global per layer);
- QA score (text < 3.5% of the short side, text overlapping the logo/CTA, outside the safe area).

Outpainting stays opt-in, user-triggered only, on a flagged `@bg.ai` layer (§5.5 row 7).

### 10.4 Non-destructive stack
1. Master: read-only source.
2. Rules: computed by the engine.
3. AI decisions: `{id: accepted|reverted}` per size.
4. Manual overrides: parameters per size, stored as fractions. Figma pin/stretch applies only here.

How changes are kept and undone:
- Each change pushes a history entry with a snapshot, and Undo steps back through them.
- You can revert per decision, revert all manual edits, or reset a size to its rules.
- Source files are never written.

ASSUMED: the project file stores `{master, rules, ai, manual, history}` as JSON.

### 10.5 AI provider abstraction
| Task | Default | Optional |
|---|---|---|
| Saliency / crop | Local ONNX (u2net/BASNet, ASSUMED) | — |
| Word split, layout, QA, auto-tag | Local LLM via Ollama (:11434) / LM Studio (:1234). A 7–8B Q4 model on the RTX 3070 Ti 8 GB is ASSUMED to fit. | Claude, Grok (xAI), GPT (OpenAI), each with the user's API key |
| Outpaint | off | user-triggered only |

Rules:
- Offline-first.
- A provider is chosen per task.
- Only layout JSON and a 256 px thumbnail are sent; source files are never sent.
- Keys are stored in the OS keychain (ASSUMED).

Cost:
- Local: 0.
- Cloud: per-token on the user's key. ASSUMED ~1–3k tokens per size per call.

Account sign-in instead of a key only where the vendor offers it (ASSUMED limited).

### 10.6 Paste screens (v0.4) — `matchPastedScreens`
This mirrors AE_ScreenManager_Unified_V2_6.jsx:
- `normalizeScreenName`;
- `stripPastedListMarker`, which strips bullets and numbering such as "-", "•", "1.", "2)" and "[3]", but keeps "1.7HD", "1st…" and "WxH";
- splitting on newline / `,` / `;`;
- the 33 `PASTE_SELECTION_ALIASES` copied verbatim (combined names → face presets);
- exact match, else a unique partial match (≥4 characters). An ambiguous partial counts as unmatched.
- "Select pasted" replaces the current selection, as in the JSX.

| Extension (not in JSX) | Rule |
|---|---|
| A line containing WxH (`1234x567`, `1234 × 567`, tab-separated Excel cells) | The name is tried first. If it doesn't match, the size must match exactly one preset. If several presets share the size, the line is unmatched and lists them as candidates to pick from. |
| Unmatched line with a size | "Add W×H as custom" adds a "Custom (pasted)" screen with the pasted name. Sizes are never guessed. |
| Combined names (`Thuraya_Full`) | Also tick the combined preset. |
| Adapt all ticked | Every ticked size is adapted at once in the grid. Export-all exports them all. |

### 10.7 QA fix (v0.4)
- QA now checks text overlapping the product.
- The product may bleed outside the safe area (flush zones).
- On tall sizes, chunked text goes in the larger free band above or below the product, and the box is scaled to fit that band.

### 10.8 Hard rule: text vs product (v0.4) — `avoidRect`, `allowsOverlap`, `rectGap`
| Item | Rule |
|---|---|
| Default | Text never overlaps the product and keeps a gap. Gap = `DEFAULT_PRODUCT_GAP` = 2% of the short side. It is configurable (UI: Text ↔ product). |
| Resolution | The layout engine moves the text block, not just QA. All text layers are moved as one group, into the band above, below, left or right of the product. Priority: keep full size with the smallest move; otherwise shrink, keeping the aspect, to the band that allows the largest scale. It stays inside the safe margin. |
| No room | `impossible` is reported with a red RULE badge. Text is never silently overlapped. |
| Opt-out | Only explicit: per-layer `allowOverlap` (UI checkbox) or a `.overlap` token in the layer name. |
| QA | Flags "text overlaps product" and "text closer than gap to product". |
| Order | rules → AI (word split / kashida) → manual → **product-clearance rule (always last)**, so a manual nudge can't break it either. |

## 10.9 Senior-designer composer + AI design rules
| class | aspect | axis | slot order (LTR, RTL mirrors x) | headline min | hierarchy | fill | kashida |
|---|---|---|---|---|---|---|---|
| xw | ≥8 | x | logo·product·text·cta | 30% short | 1.6 | 35–80% (union) | yes |
| uw | ≥3 | x | logo·product·text·cta | 28% | 1.6 | 35–80% | yes |
| h | >1.1 | x | product·text stack | 9% | 1.7 | 35–80% | yes |
| sq | 0.9–1.1 | y | logo·product·headline·offer·cta | 9% | 1.7 | 35–80% | no |
| v | <0.9 | y | logo·headline·product·offer·cta | 8% W | 1.8 | 35–80% | no |
| uv / xv | ≤0.35 / ≤0.2 | y | same as v, ≤3 words/line | 14–18% W | 1.8 | 35–80% | no |
| combined | faces | — | hero on largest face; others logo+offer+cta, offer ≤ hero offer | | | | |

1. Engine: `compose`, `composeFaces`, `TEMPLATES`, `designScore` (rubric weights: hierarchy .18, legibility .22, fill .14, balance .12, gaps .14, brand .10, rtl .10; pass ≥70).
2. Proto: "AI · designer layout" badge (default on, revert = rules layout) + "Design NN" badge with notes. Hard product rule runs after, per text layer.
3. AI files (`ai/`): `design-rules.md` (system prompt), `rubric.json`, `layout-params.schema.json`, `example.json`. The AI outputs params only; the engine clamps them, `designScore` critiques them, max 2 rounds.
4. Before/after: `proto/index.html#ba=<preset>`; shots are in `shots/ba_*.png`.
5. Known limits: the composer is heuristic (stand-in for the local AI); a secondary face's offer can run edge-to-edge; the rubric flags "no kashida" even when the headline is width-bound (ASSUMED acceptable).

## 10.10 Limits closed (v0.6)
1. **Price keep-clear (HARD):** the price circle keeps ≥ gap (same as the product gap, default 2% of the short side) from headline, offer, product and logo, on every class and every face. The badge moves first (nearest free spot in the safe area), then shrinks to ≥60%; text never moves for it. Badge "RULE · price clear of text: none/move/shrink/impossible". Engine: `keepClear`.
2. **Secondary faces:** the offer is clamped inside the face's safe margins (shrinks to fit) and aligned within that face; its price circle is kept clear of it.
3. **Fill metric:** `coverage()` = the union area of the content rects divided by the safe area (raster), replacing the bounding box. Every class now targets 35–80%.
4. **Kashida flag:** raised only when the headline is < 92% of its slot width.
5. **Kashida cap:** `KASHIDA_MAX_PER_WORD = 3`, clamped inside `kashidaFit`.

## 10.11 Jev AI provider (decide/score; cloud only)
| Item | Value |
|---|---|
| Endpoint | POST https://thejevai.com/v1/systemone, model `jev-latest` (ASSUMED shape, from the brief, not verified) |
| Tasks → type | layout template, auto-tag, chunk split → **Choice**; quality score → **Score**; needs-review → **Noul** |
| Data sent | JSON layout state only (tags, rects, strings, target size); `jevRequest` rejects images |
| Key | server-side proxy env `JEV_API_KEY`; never in the browser; mock has no key fields enabled |
| Routing | `routeDecision(p, threshold=0.8)`: p ≥ t → auto-apply with a revertable badge; p < t → Review queue; no answer/offline → local rules |
| Proto | provider dialog: "Jev AI (cloud)" on decide/score rows plus a threshold input; right panel "Review queue"; badge "auto p=…/needs review p=…" (mock p = rubric/100) |

## 10.12 Design audit (18 criteria, matches the shared skill `dooh-design-audit`)
**Spacing system first:** u = 1% of the short side, rounded to whole px. Gaps sit on the scale 1·2·3·4·6·8·12u. The outer margin is ≥6u, or ≥8u on xw/xv. The gap inside a group is ≤ ½ the gap between groups. Spacing is measured to the visible letters (cap-height band), not the text bounding box. Leading is 1.12 for Latin and 1.4 for Arabic (allowed: 1.05–1.2 and 1.3–1.6).

| # | Criterion | Measured / pass rule (pass ≥80) | One-click fix |
|---|---|---|---|
| 1 | Safe margins | every layer ≥6u (8u xw/xv) from edges; product exempt (flush by design) | re-run designer layout |
| 2 | Logo clear space | free zone ≥25% logo h (50% ideal) to edges and elements | scale logo |
| 3 | Element clearance | every pair ≥2u (allow-overlap layers exempt vs product) | keep-clear |
| 4 | Spacing scale & proximity | ≥67% of gaps on scale; inner ≤ ½ between | snap via layout |
| 5 | Logo size consistency | logo h 6–25% short side; within-class CV ≤25% | scale logo |
| 6 | Hierarchy | headline ≥1.5× offer; logo not taller than headline | scale headline |
| 7 | Legibility at distance | cap (0.7×font) ≥5% (headline) / 2.5% (offer) of short side, ASSUMED (no viewing distance) | scale text |
| 8 | 3-second read | ≤7 headline words, ≤3 text groups, 1 CTA | creative call |
| 9 | Contrast | text vs local bg (90th-pct luminance, pixels) ≥3:1 headline, ≥4.5:1 offer; logo ≥3:1 | add scrim |
| 10 | Alignment & grid | headline/offer share an axis within 2u | re-layout |
| 11 | Balance & visual weight | fill 35–80% (union coverage); weight centre y 40–52% (±5%), x ±15% | re-layout |
| 12 | Gestalt grouping | price nearer offer than logo; logo ≥ inner gap from message | re-layout |
| 13 | Focal point & flow | headline → offer → CTA in reading order (Z/F; mirrored RTL) | re-layout |
| 14 | Typography | ≤6 words/line, no widows, no weak endings, ≤2 typefaces | rebalance breaks |
| 15 | Colour & brand | ≤5 colours, brand colour present | palette (manual) |
| 16 | Arabic / RTL | RTL, kashida ≤3/word, no kashida on Latin/numbers, leading 1.3–1.6, Arabic ≥90% of the Latin headline px (ASSUMED tolerance) | re-fit / match size |
| 17 | Consistency across sizes | within-class CV ≤25% for hierarchy ratio, headline–offer gap (u), logo % | template on all sizes |
| 18 | Multi-face | nothing split across a seam; headline on the largest face | re-layout |

**Proto:** right panel "Design audit (18 criteria)" with the campaign line (avg, pass rate, top issues), a table for the selected tile and one-click fix buttons. Fixes go into the non-destructive stack (manual layer / AI toggles), so Undo works. Exports: CSV and HTML. `#auditall` audits all presets; `#audit=<preset>` selects one tile.
**All presets (v0.7):** `reports/audit-all-presets.html` and `.csv`. Engine: `auditTile`, `auditCampaign`, `auditCSV`, `inkRect`, `AUDIT`.

### 10.13 DOOH adaptation skill alignment (v0.8)
Ribbon/tall-column playbooks in the composer, audit #19 "Format playbook", and Arabic, numeral, price, seam, glare and bg-extension checks. Details: ai/design-rules.md §6. Reference zones (dooh-element-positioning) in `REF_ZONES`, `refZoneRects` and `zoneConformance`. All-preset audit: 36% → 37% all-pass, avg 97 → 97.

### 10.13 results (2026-10-29, Asia/Riyadh UTC+3)
| Run | All-criteria pass | Avg |
|---|---|---|
| Baseline (v0.7) | 36% | 97 |
| + adaptation and positioning skills (v0.8) | 37% | 97 |
| + layout library templates (v0.9) | 30% | 96 |
The v0.9 drop is because the stricter library zones are now audited (#19). Remaining fails: Contrast ×114, Arabic/RTL ×54 (Arabic type ≈86% of English vs the 110–115% target), Typography ×33, Safe margins ×16.

## 10.14 Layout library (skill dooh-all-screens-layouts)
1. Validated by `layouts/validate.py` → `layouts/library.json`, `engine/layout-lib.ts` (77 entries), `/workspace/uskills/layout-basic-rules.fixed.md`, `/workspace/uskills/layout-validation-report.md`.
2. Lookup order: exact preset name → exact W×H → aspect class (`lookupLayout`). The library zones become the start template. Arabic mirrors x unless the zone is full width.
3. Class map (library 5 → engine 7): Ribbon→xw/uw · Wide→uw/h · Square→h/sq/v · Portrait→v/uv · Tall→uv/xv.
4. Precedence: artwork inference > library entry > class template. Audit #19 checks conformance (`libConformance`).

## 10.15 Artwork-driven inference
The imported master is analysed (`analyseArtwork`) into **editable rules**. Each rule shows why and what it overrides, and can be edited or switched off in the import panel:
logoAspect, wideLockup, lockKV (composed key visual moves as one unit), heroUnit (multiple products as one group), productAspect, fullBleed, artStyle (photo → scrim), protect (baked text), brandColor, headlineMaxLines (copy length), focal, masterComposition, fonts.
Roles are auto-tagged (`@tag` > name > geometry), and the user confirms each one. Layers keep their id and a `src` link to the source file. A missing font raises a warning and sets the `@font.sub` flag.

## 11. Supported inputs
| Format | What's preserved | Limits |
|---|---|---|
| PSD / PSB | Layer tree, groups, names, bounds, visibility, masks flag, live text (string, font, size, colour), smart objects as units | Prototype: PSD via ag-psd (browser). Layer pixels not re-rendered in the prototype (rules only). Effects/blend modes read-only |
| AI | Read through its PDF-compatible stream: text runs (string, font, position, size) + page size | Needs "Create PDF compatible file" on save; vector paths are not split into layers |
| SVG | Top-level `<g>/<rect>/<image>/<text>`, ids / `inkscape:label` / `data-name`, translate transforms, fill colours, fonts | Rotate/skew/matrix transforms and `<use>`/CSS not resolved (ASSUMED rare in masters) |
| PDF | Page 1 text items via pdf.js (string, font, size, position) + page as background | No per-object vector layers; multi-page = first page only |
| EPS | Converted to PDF by Ghostscript (backend), then the PDF route | Backend only; not in the prototype |
| PNG / JPG / WebP / TIFF | Single raster layer + saliency focal point | No roles beyond bg/hero; baked text flagged for protection only |
| After Effects | ScreenAdapter tag grammar (`@headline` etc.) / JSON bridge export | Needs the bridge script; expressions not evaluated |
| Figma | — | Later (JSON via REST API) |
| PhotoCraft `.pcraft` | manifest.json layer tree (raster/group/text/shape/smart, text font/size/colour/transform); output: `.pcraft` round-trip + PSD via `photocraft-cli convert` | Prototype reads the manifest JSON; manifest field names partly ASSUMED (from repo read) |
| VectorCraft `.vectorcraft` / `.drawcraft` | Embedded PDF stream → PDF route; otherwise export SVG from VectorCraft; output: SVG/PDF | gzip variant needs backend; native object model not mapped yet |
| EffectCraft `.ecproj` / `.ectemplate` | Import: project/template controls. Export: per size × version comp spec (`screenadapter-json/1`, tagged layers, editable) via `effectCraftComps` | Writing true `.ectemplate` ZIPs is future (ASSUMED format stable) |
| EncodeCraft | Handoff job: `POST 127.0.0.1:9878/v1/enqueue` with `X-EncodeCraft-Token` (local data dir), body from `encodeCraftJob` (source effectcraft, sizes, preset) | Local only; the prototype downloads the JSON, it never posts. Preset id `dooh-h264` ASSUMED |
Samples: `samples/sample.psd` (made with ag-psd: 3 products, wide lockup, live text, Montserrat to trigger the missing-font warning) and `samples/sample.svg` (KV group `@kv`, long headline). Both are loadable in the prototype with one click.

## 10.16 Spacing rules (v1.0, skill dooh-spacing-rules)
| Rule | Engine value |
|---|---|
| Unit U | 0.25 × headline size H, min 8px (2-pass compose). Margins stay % of short side |
| headline→subline | 1.2U (ink gap) |
| subline→CTA / main stack | 3U (y) / 2U (x zones), capped by space |
| text→hero | ≥0.5H |
| logo→headline | ≥max(6U, logo h); logo shrinks ≤15% to fit |
| logo clear space | ≥0.5× logo h |
| CTA button | text 0.5H, pad 0.5×/1.0× text, h 2× text, arrow mirrored in AR (`ctaButton`) |
| Price | currency gap 0.15–0.25× number, no wrap, old price 0.5×, gap 0.3× (`priceBlock`) |
| Ribbon zone gaps | interior inset U per side → ≥2U equal |
| Bilingual / repeats | ≥4U / 2U items, 4U groups |
| Tracking | EN 0–1%, AR 0 |
| Kashida | only 1-line AR headline on xw/uw/h, max 3 per word; nothing else |
| Auto-fixes | contrast scrim (black, alpha 0.2–0.85, reversible AI badge "auto scrim"); AR headline 110–115% of EN (`pairFonts`; AR grows first, else EN shrinks, offer scales with it — ASSUMED) |
Audit #20 "Spacing rules (U = ¼ headline)" checks the above; #16 flags kashida outside the policy; consistency CVs now per class & language, inner gap in U.
Results (all 100 presets × EN/AR): v0.9 all-pass 30% / avg 96 → v1.0 all-pass 0% / avg 96; excluding campaign consistency (#17) 50%. #17 fails on hierarchy CV 43% (EN ribbons: headline ≈4–5× offer).

## 10.17 Advanced design skill (v1.1, skill dooh-advanced-design-and-adaptation)
| Export | What |
|---|---|
| `ELEMENT_RANK` | logo/headline/product/offer 1 (never dropped), CTA 2, subline 3, badge 4, legal 5 |
| `SCREEN_FAMILIES`, `screenFamily(w,h)` | 11 ratio families with real anchors; tier 1 anchor, 2 within ±15%, 3 special (≤240px, >8.9MP, odd size) |
| `contentLadder(w,h,roles)` | thin screens: subline/badge out (ultra → second beat), legal → end frame |
| `viewingSize(D,pitch,mode)` | cap = D/120 (comfortable), /200 (min), /300 (floor); font = cap/0.7; AR ×1.12 |
| `intakeChecks(...)` | odd size, codec class + bitrate, Arabic copy blocker, hero upscale >120%, tier 3, distance sizing |
Audit: #19 shows family + tier; #7 uses `viewingSize` minimum when a tile has distanceM + pitchMm (otherwise the ASSUMED % rule).
Ribbon offer fix: the hero zone's unused width goes to the offer (product slides to the far edge), so offers on EN ribbons are bigger and the hierarchy CV drops 43% → 27%, so #17 passes.
Results: v1.0 all-pass 0% / avg 96 → v1.1 **51% / avg 98**.

## 10.18 Multi-master campaigns, EN/AR pairs, focus view (v1.2, 29 Oct 2026)
- **Multi-master import:** pick several files or drop them anywhere. Supported: PSD/PSB, SVG, PDF/AI, PNG/JPG/WebP, PhotoCraft/VectorCraft. All files are masters of ONE campaign in different sizes.
- **Master choice per screen** (`Adapt.pickMaster`):
  1. Smallest |ln(master ratio / screen ratio)|.
  2. +0.15 penalty if the master is in a different screen family.
  3. Ties (≤0.01) go to a master that covers the screen at 1:1, then to the higher pixel count.
- **Per-screen override:** a dropdown on each screen card stores `ST.mov[screen]`. It is non-destructive, logged in History and undoable. "auto" reverts.
- **Artwork list:** thumbnail, name, size, ratio, family, number of screens served, and remove (removed master's screens fall back to auto).
- **Grid:** one shared grid and one campaign audit. Each screen is one card with a shared header (name, size, family, master used). EN sits left and AR right; ribbons (ratio ≥5) stack EN above AR.
- **Focus view:** double-click any tile. View only. Fit/1:1 (keys 1/0), wheel zoom, drag pan, ←/→ step screen to screen, Esc or a backdrop click closes. Language toggle: both / EN / AR. Header shows name, size, languages, master, and per-language audit score with fail reasons.
- ASSUMED: manual overrides and AI decisions are keyed per version+screen, so they are shared whichever master serves the screen.
- Confirmed set rules: Palms 4 panels; Thuraya = 2624×608 + 960×540 as separate screens; Piccadilly sync 6080×720 by 1 px crop.
- **Grid view toggle (v1.3):** "EN | AR pairs" or "Separate tiles" (pre-v1.2 grid, one tile per version, master badge kept). The choice is saved in localStorage `dooh.gridView`. In separate mode the focus view shows one tile and ←/→ step tile to tile.

### 10.19 v1.4 — real PSD pixel rendering + language masters (Rio test, 2026-10-29)
- Masters carry a language (`detectMasterLang`: file/group name, else Arabic script in text). `pickMasterForLang`: tagged masters feed only their language; untagged feed all. Artwork list warns when EN/AR master sizes differ.
- Pixel renderer draws real layer pixels per role (editable layers kept): same ratio → master as-is; else flat bg fill or focal crop, product unit in product zone, copy as one unit or split.
- Baked (rasterised) taglines are re-flowed by splitting at empty alpha columns (word gaps) into 2–4 lines, right-to-left for AR, when the zone is taller than the line or the one-line headline would be < 2.5% of screen height.
- Enabled Color Overlay (solidFill) effects are baked into layer pixels; other layer effects are not rendered yet.
- Role heuristics for files without live text: groups = containers, inherited visibility, multiply = shadow, aspect ≥4 strips = text (aligned strips = offer).
- Local-only: client PSDs and renders are never deployed (`#real*` loaders fetch `../samples/real/`).

### 10.20 v1.5 — engine fixes after Rio run + Step 1 mockup (2026-10-29)
- `langFromFilename(name)`: suffix before extension → AR (`_AR`, `-ar`, ` Ar`, glued `Ar`/`AR`/`Arabic`, `عربي`, any case with separator), EN (`_EN`, `-english` …), none → EN (implicit). `base` drives EN/AR pairing. Glued lowercase (e.g. "Qatar") is not a suffix (ASSUMED). `detectMasterLang` uses it first.
- Audit contrast in pixel mode = real artwork: headline text colour from its own layer pixels (effects baked) vs. rendered pixels around it; offers = text vs. pill body (3rd vs 60th luminance percentile).
- Layer effects drawn: Color Overlay, Drop Shadow, Outer Glow, Stroke (approximation: blur = size/2; spread, contour, noise ignored).
- Stacked copy: tagline anchored to bottom, pills above with ≥1U gap. Tall columns (w/h < 0.5): headline target 2.5% of screen height (ASSUMED viewing distance) — up to 6 lines and up to 55% of the copy zone.
- Equal-size multi-face walls (h-dup / v-dup) with no logo/price in the art: hero face repeated on every face (Mourouj_Wall_C/AB).
- Mockup: `proto/mockup-tag.html` (Step 1 Load & tag, static, local art only — not deployed).
