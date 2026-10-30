# Editor layer UX audit and corrections — 2026-10-30

Audited the focused editor code and the actual IKEA PSD in an isolated browser project. This did not inspect or overwrite the user's saved browser project. Scope: discoverable layers, independent selection, Link/Unlink, background, border and text representation.

## Findings and changes

| Severity | Finding | Correction |
| --- | --- | --- |
| Critical | Unrelated layers with the same semantic role were collapsed into a single composited unit. The user could reasonably mistake this for a link. | Each unlinked source layer now has its own stable unit and source name. Roles influence placement without linking. Explicit source links remain explicit. |
| Major | The right inspector exposed a dropdown and short checkbox list rather than recognisable layer rows. | Added source-pixel thumbnails, source names, role/type badges, selected-row states and persistent foreground rows. Local links retain separate rows. |
| Major | An edge anchor disabled Link, preventing the requested stamp-plus-logo interaction. | Link is enabled for a multiple selection. Linked members move freely in that guide; original Analyse constraints remain unchanged. Unlink restores independent constraints. |
| Major | Background was absent and the reconstructed border had no editor row. | Added background and traced-vector-border rows above the foreground list. Background selection reveals source texture information. Border selection exposes a per-guide thickness control shared by preview and export. |
| Major | The editor could not release an explicit Analyse source link locally. | Selecting a source link and pressing Unlink detaches its constituent layers for that guide, preserving the project-level source link. |
| Major | Semantic role groups obscured the actual foreground paint order. | Units now follow source stack order and render from bottom to top. |
| Minor | Link's active styling could lose contrast under generic button rules. | Scoped active styling and a clear border keep the chain button legible. |

Code locations: `src/layoutGuides.js`, `src/Calibration.tsx`, `src/calibration.css`, `src/border.js`, `src/engine/render.js`. Regressions: `src/engine/__tests__/guides.test.js`, `tests/browser/editor-layers.spec.ts`, `tests/browser/words.spec.ts`.

## Existing project handling

The layout signature now marks the individual-layer planner version, so old approvals require review. Saved implicit-role frames are expanded into source-relative frames. Older explicit proof groups resolve their former role-unit IDs to the corresponding individual units when opened. Imported sources, tags, texture selections and stored projects remain in place. A new approval is required before batch export.

## Honest representation of text and borders

The IKEA text smart object appears by its actual source name, with a **Smart object pixels** badge. Word pieces remain source-pixel crops, not recovered vector paths or editable fonts. The **Original border** vector row exists after the designer traces the original border in Analyse. Its thickness is editable per layout; its frame is generated from the target and stamp position. The background row appears for a tagged background; otherwise the panel explains that a background needs identification in Analyse.

The IKEA logo shares a source layer with contact artwork. Those pixels cannot be independently separated with Link/Unlink because they are already one imported pixel layer. Logo protection remains intact. The unrelated EXTENDED stamp is a different source layer and now moves independently unless explicitly linked.

## Verification

TypeScript and production build passed. 45 unit tests across 21 files passed. All 8 browser tests passed in Chrome. Screenshots were visually inspected: background and vector-border rows are visible above the scrolling foreground list, with source thumbnails and independent selection.

The new IKEA browser case checks separate stamp/logo motion, linking an anchored stamp, separate linked rows, unlinking, visible background information, vector-border selection, and persistence of guide-specific border thickness. Existing cases cover word grouping, calibration, project recovery and full-resolution ZIP export.

Screenshots are editor QA evidence, not approved campaign adaptations. The fixture deliberately leaves background sampling and several semantic corrections undone; visible yellow regions and overlaps must not be taken as accepted composition quality.

## UX judgment and remaining work

The previous panel did not match the user's layer-based mental model. The functional unit must be a recognisable source layer, with semantic classification and explicit relationships shown separately. This correction addresses that central mismatch.

The editor is still not a complete professional layer workspace: hidden/ignored source layers remain managed in Analyse; a nested PSD hierarchy, renaming, a general undo/redo history, editable smart-object vectors and arbitrary path editing are not implemented. Background texture selection remains in Analyse rather than the edit inspector. The next priority should be reliable undo/redo and a complete layer hierarchy before adding more tools. Automatic initial composition still needs designer tagging and five-guide review, particularly for the IKEA contact/logo composite and yellow artwork.
