# Analyse and five-layout calibration — implementation report

Date: 30 October 2026. Feature branch: feature/studio-foundation.

This update implements the user's successive Analyse, calibration, border, stamp, word-arrangement and logo-protection requests. It extends the working application; it does not certify the full DOOH product as production-ready.

## Implemented workflow

Analyse now supports Full artwork and Selected layer views, with a separate bounds selector for Entire selected layers or Original artboard. Entire selected layers uses the source layer's real bounding box, including negative source coordinates and pixels beyond the document canvas. The original artboard footprint is overlaid for context. Multi-selected layer bounds are combined without stretching source pixels. The supplied Newspaper 03 layer is displayed at its true 2964 × 1653 bounds, originating at -521, -286.

The reusable-background rectangle can be drawn or entered numerically within those full layer bounds. New selections record their scope; legacy artboard-only selections retain their old semantics. Sampling is still source-layer-specific and bounded to actual source pixels. Transparency probing and explicit confirmation remain. The tool scales/crops approved source texture rather than generating new campaign content. Human review of texture suitability is still needed, especially for off-artboard material.

The right rail offers checkboxes, Ctrl/Cmd selection, Shift ranges, per-layer Show/Hide and batch Show/Hide selected. Showing a child in a hidden PSD group reveals its ancestor groups as needed. Visibility affects calibration and final output and persists. Full-artwork preview uses the original composite when possible; visibility overrides reconstruct the visible source layers, subject to existing PSD effect limitations.

Alpha checkerboard and a chosen solid preview color help inspect individual layers. These are viewing preferences only; the color is not painted into exported creative.

Link selected includes all selected source layers and merges intersecting link sets. A linked unit retains original internal positions and scales proportionally. Unlink selected preserves unrelated links. Links apply throughout calibration and batch rendering.

Keep to edge applies to every role, including headline, contact and stamp, independently of legal categorization. Nearest original edge, explicit edges and locked relative placement are supported, with margins measured as a percentage of target short side. Linked units with conflicting anchors block guide approval.

## Five representative layouts

The final user-selected calibration set uses real repository presets:

| Preset | Exact dimensions | Guide family |
|---|---|---|
| 2.6 Screen | 1536 × 576 | Landscape |
| Al Salam Mall | 7680 × 1152 | Ultra-wide |
| Al Nassar Tower Vertical | 960 × 5328 | Ultra-tall |
| Alshaheed - Mupi | 1080 × 1920 | Portrait |
| The Gate Mall Outdoor | 948 × 648 | Compact |

Topaz was removed at the user's request. Gate Outdoor is not square; square outputs use the compact-family guide. Ultra-tall Nassar and portrait Mupi have separate guides.

All five previews appear together on desktop. Double-click a preview or use its Edit button to enter a full-screen, focused editor. Back to five previews and Escape return without discarding work. The dialog traps keyboard focus and restores it on close.

The editor supports element selection, multiple selection via checkboxes or Ctrl/Cmd-click, dragging, numeric X/Y/width, proportional scaling, zoom, reset, grouping/ungrouping, six alignments, and horizontal/vertical distribution. Alignment can reference selected bounds or the composition; safe-area and explicit edge constraints retain precedence. A group is selected and transformed as one coherent object. Grouping in a calibration proof belongs to that layout; source links created in Analyse apply across layouts.

All five guides must be manually approved for each master before Use these guides for full adaptation becomes available. Batch and ZIP export are gated on that state. Guides are tied to source identity and language, not shared silently across English/Arabic masters. Required hidden/excluded content and incompatible linked anchors block approval. Overlaps, background uncertainty, border conflicts and combined-display concerns are visible review findings. Approval is a human layout-guide decision, not automatic creative-quality certification.

Saved positions and slots guide other screens in the matching aspect family. The renderer fits original content proportionally into these slots, reapplies edge rules, and scales the source-verified border. It uses source pixels at actual output dimensions, not enlarged preview bitmaps. Scene groups alter stored member frames while preserving their relative transforms. Edits, guides and approvals persist locally.

Source roles, their confirmed status, background selection, visibility, links, constraints, crops, word pieces or border changes invalidate guide approval via a source signature. Preview color alone does not invalidate it. Layout-specific editing invalidates the affected proof and requires explicit enabling again. Exports continue to require human screen-by-screen review.

## IKEA border and stamp

Campaign stamp / label is a separate semantic role. Tagging EXTENDED as a stamp defaults it to the top edge. It remains original artwork and is not promoted to the headline.

Trace original border accepts a source-layer rectangle and checks for dark source pixels along all four sides. The vector frame records source layer identity, original rectangle, sampled source color and adjustable source-pixel thickness. Target thickness scales with short-side resolution, and the frame follows the stamp's bottom plus a gap while fitting the target canvas. The detector is a constrained heuristic; designers must inspect the traced source and result.

For a border sharing a layer with headline content, the explicit shared-content option keeps the interior, removes the old raster outline non-destructively and trims transparent margins. Original pixels remain available. Restore original raster border reverses the replacement. The tool can exclude outside-frame pixels when the designer confirms this mode; choose it only when the rectangle encloses the intended content. An untraced border remains original raster content rather than silently disappearing. This update supports rectangular source borders, not a general vector-path drawing application.

## Separate words and logo integrity

Separate words (source pixels) detects transparent row/column gaps in an identified headline after the shared border has been removed. The actual IKEA source yields five pieces. These contain original source pixels with stable references and crops. No OCR text, invented characters, font substitution, recoloring or rewriting is performed. The original combined layer is excluded while its pieces are active, so it cannot be duplicated behind them. Restore combined words is reversible. Required word pieces participate in validation.

The current importer does not expose editable native vector paths from the smart object. These pieces are explicitly labeled source pixels; they are not editable vector text. True vector-text recovery remains unimplemented. The grouping, alignment and distribution controls arrange these pieces in each of the five calibration editors.

Logos are excluded from separation, background sampling and border rebuilding. Brand-logo tags enable protection, and Contains a logo — preserve as one protects mixed smart objects such as contact text plus a logo. Protection is checked in the processing functions as well as the UI. Retagging a logo as headline does not silently clear its protection. Logos move and scale proportionally as whole original units. The application still relies on the designer to identify logos inside otherwise unrecognized mixed artwork.

## Architecture and persistence

New responsibilities: artwork.js handles source inventory/visibility/links; layoutGuides.js handles semantic units, normalized guide geometry, constraints and findings; Calibration.tsx implements the five-preview gallery and focused editor; border.js handles original-border detection, non-destructive interior cropping and target geometry; words.js handles source-pixel segmentation and arrangement math. The existing renderer remains the entry point for preview and export and caches original-derived unit rasters by source signature.

Project metadata in IndexedDB now includes visibility, source links, preview settings, layer crops, border provenance, word pieces, calibration frames, layout groups and approvals. New fields are optional so older projects restore. Original PSDs remain browser-local and ignored work fixtures remain outside Git. No runtime GPT, image-generation, cloud recognition or remote storage dependency was introduced. Other campaigns use the same tools after designer tagging and calibration; this does not retrain an AI model.

## Files changed

src/AnalyseArtwork.tsx, src/App.tsx, src/analyse.css, src/background.js, src/project.js, src/engine/render.js; new src/artwork.js, src/layoutGuides.js, src/Calibration.tsx, src/calibration.css, src/border.js and src/words.js; new guides unit tests, calibration and word browser tests, a shared browser helper; updates to the existing browser regressions, design memory and this report. Preset data and production deployment configuration were preserved.

## Verification

- npm run typecheck: passed.
- npm run build -- --configLoader runner: passed. The known large bundle warning remains (approximately 1.21 MB uncompressed).
- npx vitest run --configLoader runner: 20 files, 41 tests passed. Existing suites remain, with new tests for full-layer negative coordinates, multi-selection, transitive linking, hidden parents, source pixel references, edge placement, guide family routing, approval invalidation, word provenance, alignment/distribution, border geometry and logo protection.
- Playwright in installed Edge, with the actual supplied IKEA PSD: 6 browser scenarios passed. The tests cover source import/recovery/removal and ZIP dimension/language checks as well as the new features.
- The calibration scenario enters negative background coordinates, persists them, links source layers, changes visibility and preview color, anchors a headline group, tags the stamp, traces and rebuilds the actual IKEA border, shows all five presets, enters the editor via double-click, drags/resizes, returns to the gallery, approves all guides, renders a batch, restores on refresh and verifies source edits revoke export readiness.
- The word scenario verifies five real IKEA source pieces, checks no opaque text pixels disappear and total preview alpha differs by less than 0.5%, then groups, scales, ungroups, aligns and distributes words. It verifies saved pieces survive refresh, restoration to the combined source works, and logo protection prevents word separation/border reconstruction.
- The background/export scenario downloads and decodes the actual 1008 × 5184 PNG and verifies its background corner uses the selected neutral paper patch.
- Screenshots show actual functional UI. Test layouts deliberately exercise edge anchors and overlap findings; screenshots are not claims of final campaign composition approval.

## Remaining limitations

This is a functional guided adaptation system, not a universal autonomous designer. Initial layouts may overlap or compose poorly when source tagging is incomplete. The IKEA campaign still requires intentional selection/linking of its yellow treatments, headline pieces, contact/logo unit and decorative material, plus designer adjustment of the five guides. No professionally approved final IKEA production campaign is claimed here.

Word-gap segmentation can join words or split lettering in unfamiliar fonts; connected or opaque text may be rejected. It is not OCR, native vector editing, semantic Arabic word analysis or automatic typography reflow. Review the pieces and group/restore them as needed. PSD adjustment/effect fidelity remains limited outside the original composite. Background continuation uses source-patch resampling; it does not implement seamless generative texture synthesis or automatic recognition of contaminated source texture.

Layered jobs currently require a headline role before guide approval; headline-free campaign validation needs further work. The inherited SVG importer has no per-layer pixel assets for this calibration path and can block on unavailable source pixels; faithful SVG rasterization/editing remains unfinished. Combined-display guides require physical-face review. No cross-browser certification, complete undo/redo stack, nested group hierarchy, legal readability guarantee, native vector-word recovery or complete six-stage Refine workspace is claimed. Reset restores the current layout; editing is currently in calibration, while the separate Refine stage remains unavailable.

Project storage is local to the current browser/origin and is not a portable backup. Large PSD parsing can block; aggregate layer memory, worker parsing, tiled output and stronger canvas limits remain future hardening. Do not close until Saved on this device appears.

No remote push, merge or production deployment was performed. Refresh the local preview after saving to load this build.
