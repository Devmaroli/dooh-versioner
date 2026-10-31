# Changelog

## 1.7.6 — 2026-11-01

- Replace headline preparation with Split selected layer. Split the selected source without requiring a headline role or rectangular border detection; preserve source roles and create separate enclosing border/components and gap-separated parts.
- Retain original SVG/PDF sources and non-destructive separation masks in previews, vector renders and project recovery. Touching or opaque artwork remains intact when no reliable separation exists.

Validation: 106 unit tests, 26 synthetic browser tests and two offline MV3 tests passed; nine private browser cases and one private extension case skipped. Both typechecks and both builds passed. Synthetic SVG and embedded PDF checks cover nonrectangular coloured borders, isolated vector pixels, PSD layers, role preservation, undo/redo and recovery.

## 1.7.5 — 2026-11-01

- Move Analyse’s Manage files and Next step actions beside the heading, remove the bottom summary cards, and let the canvas and rails fill the remaining viewport.
- Remove layer up/down buttons. Drag reordering remains available; [ moves the selected layer up and ] moves it down within its folder, respecting locks and leaving text inputs alone. Compact guidance and empty preparation status reclaim room for rows.

Validation: 106 unit tests and 23 synthetic browser tests passed; nine private-artwork browser cases skipped. Both typechecks, web/extension builds and the offline MV3 test passed (one private extension case skipped).

## 1.7.4 — 2026-11-01

- Increment the release version for the delivered VectorCraft SVG WASM update. Package metadata, extension manifest/launcher and runtime version now agree on 1.7.4.
- Record the requirement to increment the version for each delivered change set. Extension checks read the manifest version so future release bumps do not leave stale test expectations.

## 1.7.3 — 2026-10-31

- VectorCraft SVG WASM is now enabled after the size cutoff was waived. A local worker normalizes styled shapes through the pinned Rust SVG import/export API; JS retains source groups, editable paint metadata, verified fonts and relinkable images. The 10.93 MB module ships as a 3.47 MB local gzip asset in web and extension builds, with upstream and dependency licenses. Only `wasm-unsafe-eval` is added to the extension CSP; permissions remain empty. No CDN, font files or client artwork is bundled. WASM failures are visible and Rust warnings require review. PDF import is unchanged. See `docs/wasm-spike.md`.
- Analyse now puts artwork and V/T/H/Z source tools on the left, with separate 300px Tagging and Layers panels on the right. Both resize by pointer/keyboard, collapse, and remember their widths. Role, requirement, priority, placement, integrity permissions, relationships and language/source properties follow selection; dashed amber role tags identify unconfirmed suggestions. Canvas picking selects source pixels and highlights their layer.
- Removed the remote Google Fonts stylesheet from web startup. A cancelled animation-frame ID is cleared in the transform hook so editor handles are positioned and all four earlier transform/history drag failures pass.
- SVG author styles now cascade over presentation attributes, with specificity, source order, `!important`, inline styles, inherited paint/font properties, `currentColor`, opacity, display and visibility. Class/id/element, compound, descendant and child selectors are supported. Styles in defs and CDATA are read.
- Local `<use>` references expand images, symbols, paths and groups with instance transforms, symbol viewports and cycle detection. SVG paint order is converted to the studio's top-first stack. PNG/JPEG colour survives worker and fallback decoding; canvases are capped at 4096 px per side while preserving the original image aspect ratio.
- Linear/radial SVG gradients retain stops (attributes/CSS), href inheritance, units, transform and spread method in the layer model. The native SVG renderer paints gradient fills/strokes into layer pixels, which the existing layered PSD exporter retains. Text paint supports fill/stroke gradients and separate paint opacity.
- PDF axial/radial shadings retain pdf.js shading data and raster layer pixels. Text operations keep source colour, transforms and spacing instead of being redrawn in a guessed near-black font. Embedded font bytes load into a local FontFace; named system faces are verified using `local()`. If face loading fails but source glyphs exist, pdf.js source outline commands and their transforms are retained in the layer model, with noneditable raster previews labelled “text outlined, not editable · Needs review”.
- SVG accepts original OTF/TTF companions, matched by internal family/full/PostScript names rather than filenames. Companion fonts/images are saved only in the local IndexedDB project and restored before the SVG is reimported. Font status appears per text layer. Missing source fonts render no substitute and block approved export; outlined text requires review. Explicit generic SVG families remain labelled generic.
- Synthetic regression fixtures cover styles, defs references, gradients, RGB images, 16 MB scans, an original triangle-only font, PDF shadings, and forced font failures. No client artwork or client fonts are included.

Validation: `npm test` passed 106 tests in 36 files; `typecheck`, `typecheck:transform`, `build`, and `build:extension` passed. The Chromium browser suite passed all 23 synthetic cases and skipped nine existing private-artwork cases. No browser tests failed. The actual MV3-origin offline test also passes with local WASM initialization, SVG import and all export formats. The Analyse case covers both rail sizes/collapse, keyboard and pointer resizing, source selection, tagging and recovery at 1440 and 1280 widths.

Limits: SVG text with separately positioned/styled tspan runs, CSS at-rules/pseudo/attribute selectors, patterns, filters and complex clips still require review. An SVG or PDF without the original font bytes, an installed exact named face, or source glyph outlines cannot be reconstructed faithfully: its text stays missing rather than substituted. PDF shading and outlined glyph previews/PSD output are raster; ordinary outline-fallback glyph commands and transforms remain in the model. Type 3 and advanced paint interactions can still need review; native PDF text/shading extraction uses the pinned pdf.js 6.4.299 internals. Soft masks and advanced PDF blend/form interactions need visual review. Adapted PSD layers remain raster. Images decode at native size before bounded canvas downsampling; the cap does not guarantee that every oversized compressed image fits decoder memory.

## 1.7.2 — 2026-10-31

- SVG import reads nested paths, groups and text instead of stopping at one shallow tag. Each `<image>` becomes its own pixel layer, including base64 `href` or `xlink:href` data, with its transform, clip and opacity kept.
- Linked SVG images resolve by file name when the SVG is picked or dropped with those files, or with a folder. A missing file stays on the layer as “Missing linked image … Needs review” and can be relinked. http(s) addresses are never downloaded.
- PDF import uses the bundled pdf.js worker. Page 1 opens first, with a page picker when there are more. Text and vector paths stay editable layers. Embedded page images become pixel layers. A page with none of those falls back to a labelled raster. `.ai` imports only when the file is PDF-compatible.
- Large SVG text is scanned without a backtracking expression, and embedded image bytes decode off the main thread.

## 1.7.1 — 2026-10-31

- Layer groups keep imported nesting, cascade visibility, lock and opacity, and remember whether they are open.
- Analyse uses three scrolling columns at desktop widths: roles, artwork, and the layer tree.
- Prepare / split works on any layer. Verified embedded vectors stay labelled as vectors. Raster splits are labelled raster. Logos stay whole until split is allowed.

## 1.7.0 — 2026-10-31

- Five stages: Import, Analyse, Adapt, Review & edit, and Export. Review and Refine are one stage with an output overview and a focused editor.
- Tags keep role, requirement, priority, placement and inclusion separate. Confirmed roles override suggestions. Unrecognised images stay unresolved instead of being called the key visual.
- Review cards show Ready, Needs review or Blocked with finding counts. Hard failures block export. Review-only findings need a recorded acknowledgment.
- Projects save as version 2 and still open version 1 metadata.

## 1.6.0 — 2026-10-31

- Refine each generated screen independently with the complete layer editor; approve and export the same persisted layout.
- Move, scale and rotate using an affine Canvas gizmo, fixed anchors, pointer offsets, proportional text/logo safeguards and RAF rendering.
- Export exact-resolution PNG, lossless flattened PDF or layered PSD ZIPs. Optional transparent PNG hides a separate identified background. Native source material remains available in a hidden PSD reference folder.
- Choose target presets during Import. Display selected-size counts/dimensions and available languages. Require only relevant guide families; adding a new family retains earlier approvals.
- Add the offline Chrome extension, the selected thinner Adapt icon, visible version and source-only author attribution.
- Harden local file handling, remove a legacy HTML interpolation sink, enforce extension CSP, bundle startup resources and update development dependencies to address known advisories.
- Validation: 79 unit tests, 21 web browser tests and two extension-origin tests passed. Typechecks and production/extension builds passed. Both npm scans reported zero known advisories at the time of review.

Known limits: adapted PSD layers are raster with baked leaf masks/effects; supported native originals are retained separately. PDF is flattened. Some group effects/adjustments block PSD export. Enterprise installation and antivirus approval remain subject to office IT policy. See the linked README documentation for details.
