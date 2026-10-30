# Implementation report — DOOH Creative Studio v1.6.0

Delivered locally on feature/per-screen-refinement. Production/main were not merged or deployed during these milestones.

## Free Transform milestone

Implemented strict TypeScript affine geometry, eight scale handles, rotation, body movement, fixed opposite anchors, cached pointer offsets and RAF-coalesced canvas painting. Text/logos stay proportional; Shift permits stretching for unprotected materials. One gesture records one undo action. Hit testing, visual gizmo, validation and output share the persisted matrices. Background and original border use the same transform path.

Files: src/graphics/*, Calibration.tsx, calibration.css, engine/render.js, layoutGuides.js, strict transform tsconfig and related unit/browser tests. Commit 21f33e9. Verification: regular/strict typechecks, build, 76 unit tests and 19 browser tests passed. Evidence: free-transform-gizmo.png. No perspective/skew/flip handles; no claim of zero latency or tracking beyond OS/browser input delivery.

## Export milestone

PNG, PDF and PSD format selection added with exact target-resolution rendering. PNG background omission is optional and requires a separate background. Alpha is preserved. Lossless PDF image/soft-mask streams, compressed PSD channels, cropped transparent margins and ZIP compression reduce byte size without downsampling. Files use screen/language/dimension names; transparent PNGs have a clear suffix. Export work runs sequentially, releases temporary canvases and blocks simultaneous edits.

Files: exportPdf.ts, engine/exportPsd.js, engine/render.js, App.tsx, app.css, export tests and docs/export-formats.md. Commit f34f2f0. Verification: build/typecheck, 78 unit tests and export browser round-trip passed. PNG/PDF rendered pixels agree; PSD composite agrees and source pixels do not have opacity applied twice. Embedded native smart object data was byte-identical in the synthetic read-back test. Example 1080×1920 synthetic files: transparent PNG 48,195 bytes, PDF 9,871 bytes, layered PSD 132,800 bytes. Campaign photographs and embedded originals can be much larger.

## Selected-target milestone

Target preset selection is available during Import. Selection notices show selected/total counts, dimensions and available languages. Only required layout families need approval. Previously approved guides persist when scope expands; new families require review. Generated unapproved targets show an approval notice rather than a misleading fallback preview. 1920×1080 maps to landscape. Import offers Go ahead and adapt using available matching masters.

Files: App.tsx, Calibration.tsx, layoutGuides.js, engine/render.js, app.css, selection tests and docs/selected-targets.md. Verification: 79 unit tests and all 21 web browser tests passed, including the private IKEA PSD. No Arabic substitution occurs when Arabic is absent. Custom size entry/natural-language booking parsing has not been added; the existing presets retain their exact names and dimensions.

## Chrome extension, security and identity milestone

Manifest V3 package opens the full local editor from a small toolbar launcher. No browser or host permissions, content scripts or native helpers. Existing Studio tab is reused. Startup fonts and all scripts/workers are local. Strict CSP blocks remote connections, frames, plug-ins, inline JavaScript and runtime eval. The release app code is readable rather than custom-obfuscated. Third-party licenses and dependency versions are included.

Full dependency audit initially found three vulnerable development package entries. Vitest was upgraded to 5.0.5; full and production npm scans now report zero known advisories. A legacy HTML interpolation sink was removed; PSD decode budget set to 256 MiB; embedded PDF runtime eval/worker fetching/WASM disabled with image/canvas budgets. These measures reduce exposure; they are not a security certification. No private files were uploaded to a public scanning service, and no antivirus/firewall/policy setting was changed.

Files: extension/*, scripts/build-extension.mjs, playwright.extension.config.ts, tests/extension/*, src/version.ts/main.tsx, storage/import/render touchpoints, package lock, CI checks and security/install docs. Source comments include Author: Kapildev Maroli; author attribution is absent from UI. Version 1.6.0 is visible on startup and in the launcher, and the build enforces version agreement. The user selected the original overlapping-frame Adapt icon with thinner strokes. Three original concepts, three letter refinements and three A refinements remain as SVG/PNG design studies.

Validation: npm run typecheck, npm run typecheck:transform, npm test (79 tests), npm run build, npm run build:extension, npm audit, npm audit --omit=dev. Two actual extension-origin tests passed in Chrome for Testing 156.0.8078.4: offline PSD import, hostile layer names as text, local recovery, all three exports, existing-tab reuse, version visibility/hidden author, no unexpected CSP violations, explicit external fetch blocked before network dispatch, zero observed external HTTP(S) requests, and private IKEA Illustrator-word rendering under packaged PDF worker/CSP. Browser plugin unavailable; Playwright Chrome/Chromium used. CI configuration updated but remote CI execution is not claimed.

## Important handoff limits

- PSD adaptations are separate pixel layers with native blend/opacity and groups. Adapted masks/fill/effects are baked; the hidden source folder retains original native objects supported by ag-psd. It does not reconstruct editable adapted Illustrator paths. Some adjustments/group effects block PSD export. Check complex Photoshop handoff fidelity in Photoshop; that application was not used for visual verification.
- PDF is flattened, lossless RGB imagery with exact pixel dimensions, not native editable vector art. Source raster detail cannot be recovered by higher export resolution.
- Local browser storage is not additionally encrypted and is not a secure-erasure system. Hidden source layers in PSD may disclose campaign originals when sharing.
- Very large/malformed assets can still consume browser CPU/memory. Keep Chrome current and import trusted production assets.
- The ZIP is an unpacked evaluation/IT review package, not a Web Store-signed release. Office installation depends on administrator policy. Do not disable security tools; use the organisation's approved deployment channel. No claim of antivirus approval or guaranteed absence of false positives is made.

References and detailed operation: docs/chrome-extension.md, docs/security-audit.md, docs/export-formats.md, docs/selected-targets.md and docs/free-transform.md.
