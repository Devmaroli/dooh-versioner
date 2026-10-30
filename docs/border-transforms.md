# Border Move and Scale

The reconstructed border previously exposed thickness but was omitted from the editor's transform target. It now has a selectable bounding box and the same default handle interaction as the other editable objects: drag an empty interior area to move; drag an edge/corner handle to scale. Visible foreground objects inside the frame remain directly selectable. Arrow-key nudging works when the border is selected.

The inspector exposes Border X/Y/Width/Height percentages, independent rectangular width/height adjustment, and the existing thickness control. Pointer scaling remains proportional and uses the selected reference point. **Reset adaptive border** removes the manual frame override and restores the screen/stamp-derived rectangle.

Manual geometry is stored as normalized `proof.borderFrame` values, belonging to the current guide rather than changing the original source. History captures each drag as one action and restores border transforms through Undo/Redo. Movement and scaling persist across guide navigation and project refresh. Other guides and original foreground pixels are preserved.

The renderer now forwards the guide proof to `borderGeometry` when drawing. This also fixes the earlier thickness override being saved by the inspector without reaching the rendered stroke. Preview, picking, validation and PNG export consume the same manual frame and source-derived stroke color. Off-canvas borders produce a review finding; manual positioning does not silently snap back.

Changed files: `src/border.js`, `src/Calibration.tsx`, `src/layoutGuides.js`, `src/engine/__tests__/guides.test.js`, `tests/browser/editor-layers.spec.ts`, this report. TypeScript/build and **57 unit tests across 24 files pass**. The targeted IKEA browser test passes for actual border dragging, handle scaling, Undo/Redo, thickness and persisted width. **All 11 browser regression tests passed.**

This is a rectangular source-border editor, not arbitrary path editing. Manual frame overrides stop following stamp movement until Reset is used. Source color/provenance remain unchanged. The existing Vite large-bundle warning remains. No deployment or merge was performed.
