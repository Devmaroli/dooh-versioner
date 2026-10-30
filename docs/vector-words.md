# Multi-selection and Illustrator-backed headline words

## Implemented

Ctrl/Cmd-click toggles individual layer selection; Shift-click selects a contiguous range in the Layers panel, including its checkboxes. Blank row space now participates in selection. Canvas Ctrl/Cmd-click toggles foreground elements, and Shift-click adds/removes elements. Modifier clicks select without starting a move gesture. A single canvas selection becomes the next layer-range anchor. Existing link/group transforms remain available.

The headline-preparation controls had moved below the large Layers panel. The split algorithm remained functional in regression tests, but the action was hard to discover. A persistent action at the top of Layers now exposes **Prepare headline words**, the word count, vector/pixel source status, and **Use embedded Illustrator vectors** for existing pixel-based pieces. Preparation is guarded while loading and remains undoable.

## Actual PSD findings

The private IKEA PSD contains four embedded PDF-compatible Illustrator objects as linked smart-object data. Its headline uses the embedded source ID ending `fa642ad20bff`; that PDF contains the original headline lettering and border. The former importer retained the cached layer canvas but dropped the embedded Illustrator data. Consequently, previous separation preserved cached pixels rather than the Illustrator source. The source file itself was not modified.

The importer now retains PDF-compatible vector smart objects as non-serialized runtime references. The original PSD remains the durable source in IndexedDB. On recovery, reparsing restores those references. No artwork, font, logo or wording is recreated.

## Vector rendering architecture

`src/embeddedVectors.js` loads Mozilla PDF.js on demand, with a locally bundled worker. It verifies the source's unrotated placement, compares content bounds and a small premultiplied colour/alpha comparison against the PSD cache, and rejects mismatches. The retained PDF page contains the original vector paths and embedded typography.

Word separation continues to locate safe word crops from the source alpha; each resulting vector-backed word instance references a crop of the original Illustrator/PDF. It has its own position/scale and can be linked, grouped, aligned or distributed. These instances are not independently rewritten SVG glyph paths or newly typed text. A logo-protected source remains ineligible for splitting.

Previews render those original vector crops at their actual preview pixel dimensions. Hit testing reads the rendered vector crop, so thin vector edges can be picked accurately. Cache keys tolerate Canvas transform floating-point roundoff. Each original page is shared, raster derivatives are bounded/cached, and document workers are released when an asset is removed.

PNG export now awaits vector rendering at each word's actual target pixel dimensions. An incomplete vector preparation raises an export error instead of quietly substituting enlarged cached pixels. PNG is a raster delivery format; the source remains vector-backed until that final rendering step. The traced border remains existing vector rectangle geometry.

Previous pixel-based pieces can be upgraded through the top-of-panel action without changing their placements. The upgrade and its source labels survive refresh and Undo/Redo. New preparations use embedded vectors where available. Artwork without a usable embedded PDF retains the honest original-pixel workflow.

## Validation

- TypeScript and production build executed successfully; existing large main-bundle warning remains.
- Vitest: 69 tests across 27 files passed, including source-reference retention, non-PDF/raster fallback and float-stable cache lookup.
- Chrome tests exercise actual Ctrl/Shift row/checkbox selection and pixel picking on the canvas; five rendered vector words; refresh; upgrading existing pixel pieces without losing position; Undo/Redo; approval of all five representative layouts; ZIP download and a decoded 1080×1920 PNG.
- Existing import/removal, background, blend math, PNG pixel comparison, border, layer ordering, linking and history browser regressions were rerun. The full 16-test browser suite passed. After the final export-await correction, all 4 targeted vector/export/blending checks passed again; the final upgraded-layer metadata check also passed. Browser plugin not available; verification used the project Playwright workflow with Chrome.
- Screenshots: vector-words-selection.png. Tests used isolated project storage and did not change the user's saved placements.

Changed files: package.json/package-lock.json; src/embeddedVectors.js; src/engine/adapt.js; src/artwork.js; src/sourceText.js; src/engine/render.js; src/App.tsx; src/Calibration.tsx; src/LayersPanel.tsx; src/layerPanelAdapter.ts; src/layersPanel.css; embedded-vector unit tests; vector-word browser tests; existing history/stack source assertions; documentation/style lock.

## Limits

PDF-compatible embedded Illustrator objects are supported. Non-PDF AI/EPS, missing external linked files, rotated/mirrored/warped placements, mismatched smart-object content and complex PSD effects need review or an SVG/PDF source prepared in Illustrator. Arbitrary PSD masks/effects still have the limitations documented in the Layers-panel report. No native AI editing, glyph-path editing, automatic font substitution, tracing or text rewriting is claimed. Final DOOH composition quality still requires designer review.

Dependency: pdfjs-dist 6.4.299, loaded only for embedded-vector rendering. Its worker is served locally; the browser does not send artwork to an external conversion service. npm audit reported the existing Vitest-related development dependency advisories; none listed pdfjs-dist. No unrelated dependency upgrades, deployment or merge were performed.

Reference: [Mozilla PDF.js rendering examples](https://mozilla.github.io/pdf.js/examples/) explain viewport transforms, target pixel sizes and awaiting rendering. Implementation fidelity was checked against the private source, not inferred solely from documentation.
