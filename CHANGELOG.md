# Changelog

## 1.6.0 — 2026-10-31

- Refine each generated screen independently with the complete layer editor; approve and export the same persisted layout.
- Move, scale and rotate using an affine Canvas gizmo, fixed anchors, pointer offsets, proportional text/logo safeguards and RAF rendering.
- Export exact-resolution PNG, lossless flattened PDF or layered PSD ZIPs. Optional transparent PNG hides a separate identified background. Native source material remains available in a hidden PSD reference folder.
- Choose target presets during Import. Display selected-size counts/dimensions and available languages. Require only relevant guide families; adding a new family retains earlier approvals.
- Add the offline Chrome extension, the selected thinner Adapt icon, visible version and source-only author attribution.
- Harden local file handling, remove a legacy HTML interpolation sink, enforce extension CSP, bundle startup resources and update development dependencies to address known advisories.
- Validation: 79 unit tests, 21 web browser tests and two extension-origin tests passed. Typechecks and production/extension builds passed. Both npm scans reported zero known advisories at the time of review.

Known limits: adapted PSD layers are raster with baked leaf masks/effects; supported native originals are retained separately. PDF is flattened. Some group effects/adjustments block PSD export. Enterprise installation and antivirus approval remain subject to office IT policy. See the linked README documentation for details.
