# Refine each generated adaptation

## Implemented

After applying the five calibration guides, double-click any generated artwork to open the full existing editor. A visible **Refine [screen] [language]** button provides single-click and keyboard access. The same entry points work in Review, the now-functional Refine stage, and Export's generated gallery. Back to adaptations and Escape close the editor without discarding changes.

The editor reuses `Calibration` rather than introducing a second set of canvas tools. It retains the existing Layers panel, source-backed words and border, background transforms, proportional movement/scaling, layer ordering, selection, linking/grouping, alignment/distribution, blend/opacity/fill, locks, masks, implemented styles, source tools and history. Existing limits on Photoshop fidelity and text editing remain unchanged. The focused header includes the screen's exact dimensions and language.

## Screen-specific state and rendering

Five family guides remain in `art.calibration.proofs`. Individual output refinements live in `art.calibration.outputs`, keyed by screen name and dimensions. Assets own their own output maps, so English/Arabic masters and different source imports do not share edits.

Opening a size clones its actual generated geometry and serializable guide settings into a separate proof at that target's dimensions. Ordinary edits update only that proof. Another screen in the same aspect-ratio family and the five source guides retain their settings. Reset this layout returns the selected size to the family guide's generated starting arrangement.

`proofForScreen` is shared by layout planning, previews, validation, background/border rendering, vector crop preparation, hit testing and final export. Generated-gallery previews now await vector crops as well. IndexedDB project metadata already stores the calibration model; the new output map and screen-specific editor changes therefore survive navigation and refresh. Seven-action history snapshots include that state. Undo cannot jump from this output into a different screen or calibration context.

Source preparation, semantic tagging, word splitting and vector-source upgrades remain explicit source-wide operations: they affect the imported artwork and invalidate the source guides. Their controls describe that scope. Their frame migration/reconciliation now includes both guide proofs and any refined outputs. Ordinary moves, layer appearance, visibility, grouping, background positioning and border transforms remain local to the selected size.

## Approval and export

An opened/refined output requires explicit **Approve this adaptation** after review. Edits invalidate that output's approval without disabling the previously approved five guides. Gallery labels distinguish approved refinements from refinements needing approval, including stale source signatures.

PNG export resolves the same screen-specific proof as the editor and gallery. It rejects an unapproved/stale output or blocking geometry/content findings; it never silently exports the old guide in place of the user's correction. Unopened outputs continue using their family guide. Approving an output does not guarantee professional composition quality; source masks/effects, legibility and complex artwork still require visual inspection.

## Verification

TypeScript and production build passed; the existing bundle-size warning remains. Vitest: **71 tests across 28 files** passed, covering independent proof creation, identical starting geometry, source/screen identity and existing engine contracts.

The new Chrome/Playwright integration test imports a real generated PSD, approves the five guides, double-clicks Al Salam Mall, moves/scales its headline and adjusts opacity, exercises Undo/Redo, confirms Boulevard Bridge is unchanged despite sharing the ultra-wide family, confirms the Al Salam family guide is unchanged, reopens through the Refine stage, recovers after refresh, verifies export refusal before approval, then downloads/decodes the full-resolution 7680×1152 PNG and compares its pixels to the edited preview. Browser error events are checked. Browser plugin not available; the project's regular Playwright workflow was used with Chrome.

The complete existing browser suite, including the private IKEA source, was rerun. All 17 browser tests passed, including the new output-refinement workflow and the private IKEA regressions. Screenshot: per-screen-refinement.png. Tests use isolated browser storage and do not replace the user's saved project.

## Files changed and remaining limits

src/App.tsx, src/Calibration.tsx, src/layoutGuides.js, src/engine/render.js, src/project.js, src/app.css; refinement unit/browser tests and the workflow-state expectation; documentation/style lock.

This completes per-size access to the existing editor, not every feature in the original product brief. Native AI/glyph editing, full Photoshop effect parity, automatic layout-quality guarantees and export selection/individual-PNG UX still have their previously documented limits. This milestone is developed on feature/per-screen-refinement; production deployment is separate.
