# Milestone 1 — Foundation implementation report

Date: 30 October 2026
Branch: `feature/studio-foundation`
Starting point: `origin/feature/studio-workflow-ui` at `3da7119`
Status: Foundation implemented and verified. The complete product is not production-ready.

## Technical audit and branch reconciliation

All remote branches were fetched and their history inspected: main, app-scaffold, feature/creative-studio-v1 and feature/studio-workflow-ui. Main is at `4201f54`; app-scaffold is the older Vite scaffold. PR #3 is open, unmerged, and explicitly describes Refine as an inspection placeholder. Its head matches the selected UX branch. Existing UX work was retained rather than replaced.

The only commit on creative-studio-v1 not already represented in the workflow branch is `05733c6`: headline and original-edge-color heuristics. Its full diff was reviewed. It was deliberately not cherry-picked: it contains campaign-specific words, may demote existing headline content to ignore, and replaces background material with a median neutral edge color. Those decisions conflict with the general-purpose integrity requirements. This is a reconciliation decision, not an assertion that the experimental capability has been implemented another way.

Existing working capabilities: React/Vite application, PSD parsing with ag-psd, raster/SVG import entry points, embedded sample assets, real screen presets and combined screens, heuristic role analysis, editable role tags affecting cached semantic units, Canvas previews, full-resolution PNG rendering and ZIP packaging. Preview and export share the renderer.

Existing incomplete capabilities: semantic groups, per-layer priority/integrity constraints, actual legal edge placement, validated typography editing, source-traceability enforcement, background suitability checks, project persistence, automated production approval, Refine editing/undo, and export approval records. Placement preferences were already explicitly marked as future renderer inputs. Navigation had no readiness gates. Missing-language selection could choose an incompatible master; previews could show template-generated creative. One failed import stopped the remaining batch. Removal used array indexes.

## Implemented

- Stable UUID asset identities; removal resolves an ID, preserving unrelated assets even when filenames match. It clears removed semantic/background caches, thumbnail references, source-file references, active analysis selection and open focus preview. Existing index-based internal screen assignments are adjusted safely.
- IndexedDB schema version 1 stores original source files, asset metadata, language corrections, confirmed roles, layer constraints and selected screen names. Restore reparses each file once and reconnects metadata by asset/layer ID. No PSDs are placed in localStorage. No remote upload was introduced.
- Saving reports success/failure. Recovery errors pause autosave so an incomplete recovery cannot replace the last saved project.
- Serial imports prevent concurrent batch mutations. Per-file errors allow later valid files to import. Progress names real phases without percentages. Stop remaining imports discards queued work and ignores unfinished asynchronous reads; synchronous PSD parsing remains noninterruptible and completed imports are retained.
- Import limits: 128 MB per file, 40 megapixels and 16,384 pixels per axis. PSD header dimensions are checked before parsing; raster dimensions before creating the compositing canvas. Empty and unsupported files receive readable errors.
- Imported assets display format, dimensions, import completion and flattened/layered status. Language suggestions are editable. Flattened raster artwork cannot enter the independent-layer tagger.
- Workflow navigation retains state, opens on Import, shows meaningful readiness in control titles, and prevents entry without assigned sources. Only Import can become complete. Visiting a stage never marks it complete. Refine is disabled and labeled Not implemented. A self-navigation button on Export was removed.
- Only explicitly matching language rows are displayed/exported. renderFull rejects missing language masters. The original generic selector remains available internally, but the application production path now enforces matching masters.
- Existing ZIP capability remains available as a review export with explicit manual acknowledgment. It does not claim automated production validation. This is not the final export approval architecture.
- Tagging no longer jumps automatically to the next layer; placement preferences can be configured on the current layer and persist after navigation/refresh. Role changes still invalidate semantic and background caches.
- Visible keyboard focus and reduced-motion rules. Sample actions use the same import/persistence path as uploaded files.

## IKEA source inspection

The user-provided file is 37,795,076 bytes. It was read from the supplied Downloads path and copied only into ignored local work storage. It has not been committed or uploaded.

Canvas and Artboard 1: 1920 × 1080.

`Newspaper 03` bounds: left -521, top -286, right 2443, bottom 1367. Its actual layer size is 2964 × 1653, larger than the artboard on all sides. Browser inspection confirms off-canvas yellow material surrounds the paper region. Using the full layer as a background therefore creates the unwanted yellow bands. The source contains adjustment layers and smart objects, including foreground elements crossing the artboard boundary. Only the secondary offer is exposed as editable text; the main campaign headline is present in raster/smart-object artwork. A heuristic confined to editable text cannot reliably identify it.

The PSD imports successfully; actual layer preview/dimensions and confirmed background tagging survive refresh. Current extreme-ratio outputs remain visibly unsuitable: offer prominence is wrong and off-canvas material leaks into the background. The evidence screenshot documents these failures; it is not an accepted adaptation.

Required engine work: preserve full layer pixels and coordinates, sample the intersection with the original artboard, compare color/texture of any proposed off-artboard extension against the visible source region, and reject incompatible material. Reuse matching source pixels or scale/crop background-only material proportionally. Any synthesis must be confined to a verified background region and retain traceability. No generation service or background synthesis was introduced in this milestone.

## Architecture and setup

`src/project.js` contains serializable metadata and pure workflow/input/language policies. `src/storage.js` owns versioned IndexedDB transactions. App orchestrates serial import, reactive workflow state and persistence. The existing engine retains pixel assets and rendering; no parallel graphics engine was introduced. This is a first boundary around existing mutable engine state, not a completed state rewrite.

Install with `npm ci`. Run `npm run dev`, `npm run typecheck`, `npm run build`, and `npm test`. On this Windows sandbox, esbuild's default configuration loader cannot enumerate a parent directory. Build/test succeeded using `npm run build -- --configLoader runner` and `npx vitest run --configLoader runner`. Browser validation used the production build served by `npm exec vite preview -- --host 127.0.0.1 --port 4173 --configLoader runner`. The development dependency optimizer also encounters that environment restriction; production preview is usable. This is documented rather than hidden by changing application behavior.

Run `npm run test:browser` against a running preview. Set STUDIO_URL to use a different server, and STUDIO_BROWSER to select a browser channel. Windows defaults to installed Edge; other systems use Playwright Chromium. Set IKEA_PSD to an absolute local PSD path to run the private fixture case; otherwise that case is explicitly skipped. The private test expects the local fixture basename `ikea.psd`.

Supported import entry points: PSD/PSB subject to ag-psd support, SVG, PNG, JPEG and WebP. PSD effects/adjustments, smart-object editing and SVG pixel fidelity are not guaranteed by this prototype engine. PSB and every listed raster variant were not individually browser-tested in this milestone.

## Verification and actual results

Baseline: production build passed with runner loader; all 17 pre-existing test suites passed.

Final checks:

- `npm run typecheck`: passed.
- `npm run build -- --configLoader runner`: passed. Existing large JavaScript bundle warning remains (approximately 1.17 MB uncompressed).
- `npx vitest run --configLoader runner`: 18 files, 22 tests passed. The 17 inherited suite tests each contain multiple assertions; the five new tests use direct Vitest expectations.
- `npx playwright test` with IKEA_PSD set: all 3 browser scenarios passed in installed Edge. These exercise actual production JavaScript, not mocked React components.
- Browser scenario 1: import duplicate-named PSD samples, assign separate languages, confirm/correct tag and requirement, refresh/recover both, remove only English, refresh again, download ZIP, unzip and inspect all six PNG headers. Only AR outputs remain and PNG width/height match filename/preset dimensions. No page errors observed in this scenario.
- Browser scenario 2: corrupt PSD followed by valid PNG; recoverable error displayed, valid import retained, flattened status shown, layer tagging unavailable, no AR tiles substituted.
- Browser scenario 3: actual IKEA PSD import, language correction, inspect 2964 × 1653 background, confirm background role, capture screenshot, recover on refresh.
- `git diff --check`: passed.

Browser tests initially found an ID/index mismatch in removal and a flattened image entering the tagger. Both defects were fixed and the complete suite rerun successfully. No claim of all-format, cross-browser, full accessibility or production creative-quality certification is made.

## Files changed

`.gitignore`, `package.json`, `package-lock.json`, `src/App.tsx`, `src/app.css`, `src/engine/render.js`, `src/project.js`, `src/storage.js`, `src/engine/__tests__/project.test.js`, `playwright.config.ts`, `tests/browser/foundation.spec.ts`, and this report. Original presets, generated adapt.js logic, source artwork and deployment configuration were preserved.

## Remaining implementation sequence

1. Milestone 2: complete semantic role model and coherent groups; full-artwork context; priority, legal/required/placement constraints connected to engine inputs; confirmed analysis completion and dependency revisions.
2. Milestone 3: one verified IKEA portrait first. Identify raster headline/contact/logo groups, preserve original pixels and exact wording, crop to source-visible background material, validate oversized-layer texture compatibility, plan constrained layout, render and report failures. Generalize only after visual acceptance. Then ultra-tall and ultra-wide strategies.
3. Milestone 4: persisted layouts and meaningful required-content, clipping, overlap, dimension, language and readability validation; safe-area review and human approval.
4. Milestone 5: per-output transform editing with selection, locking, proportional resizing, alignment, undo/redo and persistence. Reuse the exact render plan for export.
5. Milestone 6: production export gate and recorded overrides, individual PNGs, robust packaging, performance/worker limits, regression fixtures and accessibility/browser hardening.

## Known limitations

The complete product is unfinished. The IKEA vertical acceptance case is not yet satisfied. Legal preferences are stored but do not reposition artwork; this remains visible in the interface. Refine has no working editor and is disabled. No persisted generated layouts or production validation approvals exist yet. Flattened fallback still derives ambient imagery from the full composite, and SVG/nonpixel fallback can generate template content; these inherited renderer paths do not meet the final creative-integrity standard and must be replaced before production approval. Review ZIPs are therefore not represented as production-ready deliverables.

PSD parsing can block the main thread. Compressed PSD file size/canvas limits do not cap every off-canvas layer allocation. No worker, tiled renderer or total project memory budget exists yet. IndexedDB is local to the browser/origin, may be evicted, and is not a portable project backup. Saving has a short debounce; close only after the saved status appears. The database currently rewrites source blobs with metadata and reparses sources on recovery. A normalized asset store and portable project export remain later hardening work. Browser cancellation/memory-pressure/quota failure and full keyboard/modal focus were not exhaustively automated.

No remote branch was pushed, PR merged, or production deployment changed.
