# Background transforms and direct artwork selection

The focused editor now selects the visible source pixels under the mouse, rather than the first overlapping bounding-box button. Transparent foreground areas pass through to lower source layers, the traced border, or the background. The corresponding layer row is selected and brought into view. Linked sets and groups still select together. Keyboard layer selection remains available.

The Background row exposes Scale (100–800%), horizontal/vertical crop position and Reset. With Background selected, Scale shows canvas-edge handles that zoom its original texture; Move drags its crop. 100% is the smallest proportional cover scale; the editor does not shrink the material below canvas coverage or synthesize additional content. Panning is constrained to available overflow. Thus an axis with no overflow at 100% cannot pan until zoomed in. Background scaling uses a centred zoom, independently of foreground anchor controls.

These settings belong to the current guide, persist in its `backgroundTransform` metadata, invalidate its approval and use the same geometry in previews and full-resolution exports. The original selected texture region remains the source; full-layer bounds and source-region editing stay in Analyse. No foreground content, text wording or logo pixels are generated or altered.

Files: `src/background.js`, `src/picking.js`, `src/engine/render.js`, `src/Calibration.tsx`, `src/calibration.css`, `src/engine/__tests__/picking.test.js`, and the calibration/editor/transform browser regressions.

Verification: TypeScript and production build passed. 47 unit tests across 22 files passed. Browser checks exercise visible-stamp clicking and matching row selection, foreground Move, transparent-pixel picking, background handle scaling, numerical scaling, crop dragging, preview pixel changes and saved background settings. All 8 browser tests passed in Chrome. Background and active-layer dropdown selection were checked again after the final UI adjustment. The earlier bounding-box-centre drag regression was updated because its centre was transparent: the correct behavior is now background selection there. Foreground dragging is independently checked using an opaque fixture.

Limitations: tiny features may be difficult to pick at Fit zoom; use zoom or layer rows. Native vector/font editing remains unavailable for smart-object pixels. These tools do not remove the need for designer review of texture selection and extreme-format layouts. The existing large-bundle build warning remains.

Update: `free-transform.md` supersedes the minimum-cover scale and constrained crop movement described above.
