# Layers panel implementation report

Implemented on feature/studio-foundation; no production deployment or merge.

## Where to use it

Open Adapt, then Edit on one of the five guide previews. The right-hand Layers panel has a Thumbnails selector for **100 × 100, 200 × 200 or 300 × 300**. Sizes are actual CSS pixel dimensions, and transparent thumbnails use a white/grey checkerboard. Large thumbnails widen the inspector; row selection scrolls the list without hiding the panel heading. The setting persists for the imported artwork.

Select with the thumbnail or name, Ctrl/Cmd to add/remove, Shift for a range, or the selection checkboxes. Canvas picking still reveals the corresponding source row. Rename with the pencil or double-click a name. Filter by name or layer type. The eye toggles guide-specific visibility. Drag above/below another row to reorder, or into a folder's centre to reparent. Up/down buttons provide an alternative for sibling ordering. The tree order drives composition order.

The footer contains Link/Unlink, Layer Styles, Add Mask, Add Adjustment, Create Group, New Layer and Delete. Links preserve separate source rows and existing relative transforms. Groups act as coherent transform units, can be expanded/collapsed and apply isolated group appearance. Editing a child remains possible. Foreground linking and movement use the existing layout-unit geometry; background/border have their separate transform controls. Mixed foreground/material selection is suitable for appearance editing, not a combined material transform.

## Actual rendering behavior

- All 27 requested blend modes are available in six categories. Canvas-supported modes use native compositing; the remaining operations use bounded pixel tiles. Opacity multiplies source alpha. Normal mode reduces to source-over interpolation for an opaque backdrop. Imported PSD blend/opacity settings are retained.
- Fill changes source pixel alpha; the implemented inner-stroke style is composited separately. Thus Fill 0% can retain a stroke, while Opacity 0% hides both. Reset restores imported blend, opacity and fill.
- Position locks stop movement, scaling, nudge and geometry inputs. Pixel locks restrict appearance/style/adjustment and source preparation. Transparency locks restrict alpha and masks. All locks restrict visibility, rename, deletion and tree movement. Parent locks apply to descendants. Artboards lock prevents moving a layer across its parent boundary in this single-canvas editor; it does not introduce multi-artboard authoring.
- Add Mask creates a reveal-all rectangular vector mask. Its bounds are editable as percentages; it can be disabled, removed, or unlinked to remain in canvas coordinates while the source moves. Available imported bitmap mask data is retained and applied to source pixels.
- Add Adjustment creates a neutral Brightness/Contrast adjustment affecting existing layers below it. New Layer creates a truly empty transparent layer. Neither creates campaign imagery. Delete removes selected rows and group descendants from that guide; undo restores them.
- The implemented Layer Styles editor is an inner stroke with colour and source-pixel width controls. Imported effect names appear in the expandable submenu for inspection. The original campaign border remains source-traced vector geometry and retains its existing free-transform controls.
- Required hidden, deleted, fully transparent or fully masked layers block approval. Masks on required content and advanced imported effects generate visual-review findings. Automated checks do not prove visual suitability.

## State and architecture

`src/LayersPanel.tsx` is the reusable UI. `src/layerPanelModel.ts` defines typed tree records (stable ID, name, type, visible, blend mode, opacity, fill, parent, locks, mask), selection, normalization and immutable operations. `src/layerPanelAdapter.ts` reconciles imported PSD groups, semantic layout units, new word pieces and border/background material with persisted edits.

`src/Calibration.tsx` connects panel actions to existing per-guide frames, source links, seven-action Undo/Redo and project saves. Appearance changes invalidate approval. Original PSD source IDs remain on every foreground record. No file deletion or asset remapping is involved in a guide-specific layer deletion.

`src/blending.js` owns RGB/RGBA math and tiled Canvas composition. `src/panelCompositor.js` handles fill/stroke derivatives, masks, adjustment tiles and group buffers. `src/engine/render.js` uses the same guided composition path for previews and target-resolution exports. Source parsing retains blend, opacity, fill, masks, effects and protection metadata. IndexedDB recovery reparses original files and restores versioned panel metadata; huge image data is not stored in localStorage.

Reusable derived source canvases are cached and invalidated with source edits. Isolated group buffers have a 40-megapixel guard. This change adds no dependencies.

## Validation and evidence

TypeScript, production build, Vitest and real Chrome interaction tests were executed. See the final validation result below. Browser coverage includes all 27 compositing operations, a generated PSD with Screen/50% settings, thumbnail measurements for all three sizes, actual canvas pixel comparisons for visibility/fill/stroke/masks/adjustments, inherited locks, grouping, rename/filter, persistence and decoded full-resolution exported PNG pixels.

Existing private IKEA tests exercise source-border detection, five-word separation, background selection, layer order/dragging, links, scaling, seven-step undo/redo, refresh recovery, imports and file removal. Tests use isolated browser storage and do not overwrite the user's saved project. Screenshots: layers-panel-300.png, layers-panel-200.png, and editor-border-and-five-words.png.

## Known limitations

This is a functional subset of Photoshop layer management, not complete PSD fidelity. The style editor implements inner stroke; it does not recreate every imported Photoshop effect, Blend If, colour-profile or 16/32-bit behavior. Arbitrary imported PSD vector masks and group bitmap masks need visual comparison and are flagged for review. Bitmap masks require embedded parser-provided pixels. The UI mask tool edits rectangles rather than freehand paths. No pixel painting or native vector-smart-object text extraction was added. Word pieces remain original raster pixels, and logos remain protected from splitting.

Adjustment layers currently support Brightness/Contrast. Isolated group compositing supports the implemented modes, but exact Photoshop appearance must still be checked for complex documents. Empty groups/new layers carry no invented creative content. Existing broader adaptation quality, autonomous typography reflow and the separate Refine stage remain outside this panel update. The production build retains its existing large-bundle warning.

## Files changed

UI/model: src/LayersPanel.tsx, src/layersPanel.css, src/layerPanelModel.ts, src/layerPanelAdapter.ts, src/Calibration.tsx, src/calibration.css, src/analyse.css.

Graphics/state integration: src/blending.js, src/panelCompositor.js, src/artwork.js, src/background.js, src/engine/adapt.js, src/engine/render.js, src/layoutGuides.js.

Verification: src/engine/__tests__/blending.test.js, src/engine/__tests__/layer-panel.test.ts, tests/browser/blending.spec.ts, tests/browser/layers-panel.spec.ts, updated editor-layers/stack-source/words browser tests, vite.config.ts. Documentation and style-lock updated.

## Final validation

- `npm run typecheck`: passed.
- `npm run build -- --configLoader runner`: passed; existing bundle-size warning remains.
- `npx vitest run --configLoader runner`: 66 tests passed across 26 files.
- Chrome/Playwright full regression: 14 tests passed, including the private IKEA PSD fixture.
- After moving Layers to the top of the inspector, all 4 targeted thumbnail/tree/source-preparation/history browser checks passed again.

Remaining work: deeper PSD vector-mask/group-mask fidelity, expanded styles/adjustment types, and broader adaptation-quality milestones. No production deployment or claim of a complete Photoshop replacement.

## Subsequent Illustrator-source update

The later [vector-word implementation](vector-words.md) adds embedded PDF-compatible Illustrator sources for prepared headline words. Its vector-backed crop/render path supersedes the original raster-only word limitation above. Full native AI/glyph editing is still not claimed.
