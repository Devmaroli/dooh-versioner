# Free Transform

The focused editor shares a native Canvas gizmo and strict TypeScript affine math (`src/graphics`). It supports eight resize handles, rotation and body movement. Corner scaling keeps the opposite corner fixed and is proportional by default; Shift permits stretching of unprotected materials. Logos and text retain their proportions. A manual reference point overrides the automatic opposite anchor.

Pointer events cache samples. A requestAnimationFrame callback applies an immutable-start matrix and paints the existing artwork canvas. Window listeners and pointer capture retain tracking outside the canvas. Escape cancels, Enter commits, and each gesture creates one history action. This avoids React state changes for every pointer sample; it does not promise zero latency or tracking outside OS/browser input delivery.

Local matrices persist per guide/output and are shared by hit testing, bounds validation, previews and final rendering. Illustrator sources are prepared again at export resolution. Transforming a group applies the same world delta to its members. Background and original border use the same geometry path.

Validation: typecheck, strict graphics typecheck, production build, 76 unit tests and 19 browser tests passed. Browser coverage includes anchored scaling, Shift behaviour, logo protection, rotation, cancellation, RAF coalescing, undo/redo, persistence, transformed pixel selection and exported PNG geometry. Browser plugin unavailable; Playwright used Chrome. `work/free-transform-gizmo.png` records the native gizmo.

Known limits: no flipping, perspective or skew handles; raster sources remain raster. A transformed background requires human coverage review. Advanced Photoshop effects and native Illustrator path editing remain outside the editor.
