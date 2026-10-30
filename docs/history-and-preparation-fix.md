# Seven-step history, default box controls and preparation fixes

## Delivered behavior

- Undo and Redo buttons in the focused editor header, with a History panel showing the seven retained actions and undone actions. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y work outside form fields, which retain native text-edit shortcuts.
- Movement, scaling, grouping/linking, stack changes, alignment, background edits, thickness changes, reset, guide approval and in-editor source preparation participate in history. A continuous drag or one focused numeric edit is one action. A new meaningful action clears redo; no-op changes do not consume a step.
- History stores metadata snapshots, never PSD canvases or original files, and persists with the local project. Source preparation undo restores source roles, links, crops, border, word pieces and all affected guides together. Stale history is cleared if unrelated Analyse changes make its recorded state inconsistent.
- Default Move interaction always shows scale handles: drag within the selected bounding box to move; drag edge/corner handles to resize proportionally. Visible foreground picking still takes precedence over transparent selected bounds where another foreground object is visible. Background receives the same default handles.

## Why the expected border and words were absent

Read the actual open project through the browser. It had no confirmed main headline, the background was selected, and there were explicit source links. The old preparation controls depended on selecting a single already-tagged headline and were therefore difficult to discover. They were not automatically triggered on import or by entering Edit.

Two engine issues compounded this workflow:

1. Splitting a linked source inserted all word IDs back into its source link, which could keep the words collapsed into one layout unit. Splitting now detaches the selected headline from that source link and preserves unrelated links. Words appear as independent rows. Existing guide placements for the old source and linked partners are expanded into source-relative new unit frames.
2. A newly created border could be appended below a background in an existing saved stack order. New borders now enter immediately above background. A later explicit user reorder is still respected.

A persistent Headline preparation panel now shows border readiness and word count. Choose the original source from a dimension-labelled list and inspect its thumbnail; **Prepare border + words** confirms the source and performs both operations. It also works for an original source inside a link. Incorrect source selections fail honestly; unsuccessful preparation restores the prior source state without consuming Undo or corrupting tags. Logos remain protected. The UI does not automatically choose an arbitrary selected product as the headline.

## Live project verification

The user's saved `1920x1080Artboard 1.psd` project was reloaded after confirming “Saved on this device.” Selected the actual **Vector Smart Object · 1522 × 732** after inspecting its preview, then ran preparation. The live project now shows **Border ready · 5 word pieces** and a history action. Undo was exercised: zero word rows and zero vector-border rows remained. Redo restored five word rows and the border. The saved state was also recovered through refresh. The final live screenshot is `live-prepared-history.png`.

Existing layout positions were retained. In the user's current 2.6 guide the final word remains partly outside the canvas and approval is correctly blocked. This is an editing-state verification, not an approved final campaign composition. Word pieces use original raster pixels, not recovered native vector paths. The rectangular border is reconstructed from verified source pixels.

## Validation and files

TypeScript and production build passed; **56 unit tests across 24 files passed**. Browser coverage exercises seven undo/redo steps, gesture coalescing, persisted redo, failure rollback, linked untagged headline preparation, source-operation undo/redo, default handles, the existing full workflow and production-resolution exports. **All 11 browser tests passed**, including failure rollback, linked-source preparation, persistence and default box controls. The existing large-bundle warning remains.

Changed files: `src/editorHistory.js`, `src/Calibration.tsx`, `src/project.js`, `src/sourceText.js`, `src/stack.js`, `src/engine/render.js`, `src/calibration.css`, corresponding history/stack unit tests, the history browser suite and default-handle regressions. Project persistence retains seven actions per source master, spanning its guide families. History does not include unrelated Import/Analyse actions, file deletion or browser UI state.

No merge or deployment was performed. The update is available in the local preview and the delivered source archive.
