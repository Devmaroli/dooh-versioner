# Layer stacking and headline preparation in Edit

The editor now has an explicit **Layer stack · top is in front** list. Drag a row above/below another row or use Move layer up/down. Foreground, reconstructed border and background participate in one persisted guide-specific `layerOrder`. Grouped selections move as a block; linked members remain separate rows. The background/border shortcuts above the list open settings and do not represent stack order.

The compositor draws this same stack bottom-to-top. Pointer picking traverses it top-to-bottom and tests actual foreground/background alpha or the vector border stroke. Moving background above foreground therefore covers it in both the composition and hit testing. Validation warns about this and blocks approval where required units are underneath it. Exports share the guided renderer and the saved stack. New layers are appended deterministically; removed IDs are ignored.

## Why the border and words could be missing

Earlier controls required visiting Analyse and explicitly tracing/splitting the source. A confirmed headline tag alone did not perform either operation. Edit now exposes **Headline source tools** directly beneath its layer selector:

1. Select the source artwork containing the main headline. If needed, choose **Use selected source as main headline**.
2. Choose **Detect original border**. The app checks the selected source's dark-pixel bounds and verifies material along four sides using the existing detector. When supported, it rebuilds a separate original-color vector rectangle and crops out that shared raster outline non-destructively. If detection fails, the app directs the user to trace the actual border in Analyse; it does not invent a border.
3. Choose **Split headline into words**. It uses alpha gaps in the original pixels. Border removal should happen first when border and text share the same layer. Inspect the resulting pieces.

These are explicit, designer-triggered source operations. They affect all guide families and require renewed review, unlike layout-specific stack changes. Existing guide frames are used to place new words relative to their original source parent; stored order/groups/free-transform membership are updated. Automatic confidence is not presented as an approved layout.

Actual IKEA acceptance: the editor detected the original rectangular outline and separated five source-pixel word pieces. This was exercised on the supplied private PSD, not hardcoded campaign text. Logos and logo-containing protected layers remain excluded. Word pieces are not native vector paths or recovered editable font text. The default reconstructed stroke is six source pixels; the existing thickness control allows correction. Complex, colored, irregular or ambiguous borders still need manual tracing; opaque/connected lettering can prevent safe splitting.

## Verification and changed files

TypeScript and production build pass. **51 unit tests across 23 files and all 9 browser tests pass.** The new browser regression checks in-editor detection, five word rows, actual composition pixel changes when raising the background, hit selection of that frontmost background, drag reordering and refresh persistence. Existing full-resolution ZIP, background, word, selection and calibration tests pass.

Changed files: `src/stack.js`, `src/sourceText.js`, `src/layoutGuides.js`, `src/engine/render.js`, `src/Calibration.tsx`, `src/calibration.css`, `src/engine/__tests__/stack.test.js`, `tests/browser/stack-source.spec.ts` and this report. Screenshot evidence: `editor-border-and-five-words.png` and `stack-order-background-front.png` in the delivered outputs. These show test geometry, not approved creative layouts; the fixture deliberately leaves background sampling, stamp tagging and other composition corrections undone.

Remaining limits: no native smart-object vector recovery, automatic campaign-wide source preparation on import, nested layer hierarchy, arbitrary vector path editor or general undo/redo history. Hidden/ignored source-layer management and precise source-region tracing remain in Analyse. PSD blend/effect fidelity remains subject to the existing source-pixel renderer limitations. The existing Vite large-bundle warning remains. No deployment or merge was performed.
