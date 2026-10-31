# Changelog

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
