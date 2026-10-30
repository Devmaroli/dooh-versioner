# Freer Move and Scale

Manual foreground transforms now preserve user positions outside canvas and safe-area bounds. They override placement anchors only for transformed units in the current guide (`freeUnitIds`); automatic layouts and Analyse source constraints remain unchanged. Width can exceed the composition width. Source proportions are retained for text, images and logos. Scale handles continue to use the selected reference point.

Background scale now accepts 1–800% of the original cover size, including sizes below full coverage. Move drags freely using X/Y offsets rather than clamping the crop to available overflow. Exact background offsets and Reset are available in the inspector. Transparent areas stay transparent; no replacement colors or creative content are synthesized.

Arrow keys nudge the selected object/set or background by one target pixel, Shift+Arrow by ten. Form fields keep their normal keyboard behavior. Transforms persist in guide metadata and use the same geometry in preview and export. Reset this layout restores generated positioning.

Validation reports off-canvas foreground geometry. Required elements outside canvas block approval; optional clipping prompts review. Background reduction/offsets prompt explicit inspection for uncovered areas. These are geometry checks, not a guarantee of readability or creative quality.

Changed files: `src/Calibration.tsx`, `src/background.js`, `src/layoutGuides.js`, corresponding picking/guide unit tests, and editor/calibration/transform browser cases. TypeScript and production build passed; 49 unit tests passed. All 8 browser tests passed, including foreground movement beyond the canvas, 150% composition width, Shift-arrow nudging and background reduction to 50%. The existing bundle-size warning remains.

This supersedes the minimum-100%-cover and constrained-panning behavior documented in `background-and-picking.md`. Free transforms remain proportional; arbitrary skew, rotation, perspective, and editable smart-object vector paths are not implemented. Pixels outside the canvas are clipped in exported PNGs, as indicated by validation. These tools do not introduce a general undo/redo history.
