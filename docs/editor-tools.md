# Focused editor tools — 2026-10-30

The focused five-layout editor now uses a left tool rail, central artwork and right Layers/Transform inspector. Existing app colors and typography are retained.

- **Move (V):** select and drag an element or the selected set.
- **Scale (S):** drag an on-canvas handle to resize proportionally. Select one of nine reference points to keep that corner, edge midpoint or centre fixed. The same reference point applies to numerical Width changes. Safe areas and source edge constraints still take precedence.
- **Layers:** select with checkboxes or Ctrl/Cmd-click on artwork. A single chain-link button below the list links a multiple selection; when a linked set is selected the same button becomes Unlink. Unlink, change the selection and link again to change the membership. Linking retains current positions and scales/moves members together.
- Existing group/ungroup, align/distribute, exact position/width, reset, zoom, approval and Back controls remain functional.

Links created here belong to the current layout guide. They share the existing proof-group geometry, with `kind: 'link'` distinguishing them in the inspector. The later layer UX correction keeps their rows separate and permits anchored members to move freely while locally linked. Source links can be detached in one guide through Unlink without changing other screens. Links do not create nested groups. See `editor-layer-audit.md` for the current layer model and limitations.

Frames and links persist with project metadata, invalidate guide approval on change, and use the same guide renderer for preview and full-resolution export. Pointer scaling uses a drag-start snapshot to avoid cumulative rounding or proportional distortion. Logos remain intact; source word separation and border reconstruction protections are unchanged.

Changed files: `src/Calibration.tsx`, `src/calibration.css`, `src/transform.js`, `src/engine/__tests__/transform.test.js`, `tests/browser/transform.spec.ts`, `tests/browser/words.spec.ts`, this report and the existing style lock/log.

Verification: TypeScript and production build pass; 43 unit tests across 21 files pass. Browser regression covers all nine anchor positions mathematically, pointer scaling in wide/tall coordinate systems, actual handle dragging, numerical reference-point scaling, saved frame recovery, single-button link/unlink/relink of IKEA word pieces, and the existing import/tag/calibration/export workflows. All 7 browser tests pass in Chrome, including exact-dimension ZIP export and full-resolution background pixel checks.

Limits: this is a focused composition editor, not a complete Photoshop implementation. Scaling is uniform, reference points use nine preset positions, and source safe areas may constrain an attempted transform. Editable vector paths, arbitrary pivots, rotation, a general history stack and nested layer hierarchy remain unimplemented. The existing Vite large-bundle warning remains. UI evidence uses synthetic test artwork or deliberately manipulated IKEA geometry; neither is an approved campaign composition.

Windows sandbox verification uses Chrome with a writable temporary directory because Edge fails at browser launch and the default temporary download directory cancels downloads:

```powershell
New-Item -ItemType Directory -Force work/browser-temp | Out-Null
$env:TEMP=(Join-Path (Get-Location) 'work/browser-temp')
$env:TMP=$env:TEMP
$env:STUDIO_BROWSER='chrome'
$env:IKEA_PSD=(Join-Path (Get-Location) 'work/ikea.psd')
npx playwright test
```
