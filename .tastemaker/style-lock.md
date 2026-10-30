# Style lock — DOOH Creative Studio

Established 2026-10-30 from the existing application CSS and user direction: professional dark creative workspace. This is a scoped extension of an established UI, not a palette redesign.

## Palette and color contract

Retain #0f1115 canvas surround, #111c2e analysis surface, #141820 layers surface, #23344d active/hover surface, #b1bed2 secondary text, #fff primary text, #a6c6ff selection/focus, #5549b2 role selection, #344969 decorative separators.

Measured with sRGB WCAG luminance math in work/contrast.cjs:
- White on analysis surface: 17.08:1.
- Secondary text on analysis surface: 9.08:1; layers surface: 9.45:1; canvas surround: 10.05:1.
- White on active surface: 12.58:1; selected role fill: 7.04:1.
- Analysis text on selection fill: 9.88:1.
- Selection outline against active surface: 7.27:1.

These pairs are text-safe (4.5:1 minimum). Separators are decorative; selection uses both border and pressed state. Artwork overlays pair a light stroke with a dark stroke because source art colors vary.

## Typography and density

Reuse system UI / Segoe UI. Labels 11–12px; controls/body 13px; inspector heading 16px; page heading unchanged. Spacing uses 4px units: 8px controls/list gaps, 12px compact toolbar spacing, 16px panels, 32px canvas surround. Four-pixel controls, ten-pixel editor container radius. No ornamental shadows; source transparency uses a checkerboard.

## App chrome

Artwork is the dominant central surface. A 288px right layer rail (240px on intermediate widths) is sticky and scrollable, with original-pixel thumbnails, source names and semantic labels. Below 760px the rail becomes a stacked panel. Inspector choices sit below the canvas. Placement options use details disclosure. Imported/generated-output gallery is absent from Analyse. Preserve existing workflow header.

## Assets and motion

Use only the user's source composite and layer pixels. No external imagery, new illustration, icon system or marketing animation needed. Reuse existing short button state transitions and reduced-motion handling. Rectangle follows pointer directly; no delayed motion.

## Do not

Do not introduce decorative artwork, new brand colors, generated copy, artificial background fills for a selected sample, or Photoshop branding. Do not claim automatic word splitting of raster artwork bundled with borders. User-confirmed tags override heuristics.

## Review

Pending user review. This change implements their requested rectangle and right-hand layer picker; no user approval of its final visual treatment is claimed. Self-critique scores: visual 5, purpose 5, hierarchy 4, specificity 5, restraint 4, variety 4. App-shell gates applied; marketing-page skeleton/motion gates do not apply to this scoped editor modification.

## Calibration extension — 2026-10-30

The current Analyse rail is 320px (280px at intermediate widths); multi-selection checkboxes, visibility controls and link/protection labels use existing surface/text pairs. All five requested presets share one gallery. Double-click or explicit Edit opens a fixed full-screen editor with a quiet dark canvas, a 300px scrollable inspector, element selection checkboxes and concise arrangement controls. Back and Escape retain edits. Keyboard focus is trapped inside the dialog and restored on close. Existing short button transitions and reduced-motion rules apply. No new palette, photography, marketing chrome or decorative imagery was added.

The source-border rectangle is actual campaign content restored from a user-identified source, not UI decoration. Word thumbnails and editable units contain original pixels; logo-protected layers cannot enter word separation or border reconstruction. The build log records this scope as pending user review, not approved visual design.

## Focused transform tools — 2026-10-30

Reuse the established palette for a narrow left Move/Scale rail and right Layers/Transform inspector. Nine reference points, visible scale handles and one stateful chain-link button communicate real geometry and link state; accessible labels and pressed states accompany every visual selection. Source artwork remains central. Synthetic-fixture screenshot checked for hierarchy, overflow and control contrast. Self-critique: visual 4, purpose 5, hierarchy 4, specificity 5, restraint 5, variety 4. User visual review remains pending.

## Layer discoverability correction — 2026-10-30

The user rejected the earlier layer picker as insufficiently usable. Source thumbnails, source names, selected rows and role/type labels now replace the short checkbox-only list. Background and traced-border rows sit above the scrolling foreground list. Explicit links retain individual rows. Active chain-button colors use existing approved palette pairs. This corrects the source-layer mental model; it does not claim user acceptance of the revised UI.

Direct selection now follows visible pixels and reveals the corresponding row. Background selection shortens the foreground list to expose its actual scale/crop controls, using the same existing form styles and palette. No new visual system is introduced. User review of these interactions remains pending.

Layer ordering now uses an explicitly labelled stack with drag support and keyboard-accessible up/down controls. Material shortcuts are labelled separately from stack order. Source border detection and word preparation sit near the active layer selector to avoid hiding them at the bottom of the inspector. Existing palette and control styles remain; the revised workspace is pending user review.

The latest editor keeps Undo/Redo in the header and a compact expandable seven-action History panel. A persistent source-preparation summary exposes missing border/word state independently of current layer selection, with a larger original-source preview before committing. Default box handles combine movement and scaling without a mandatory tool switch. The actual saved user project was inspected and prepared through its UI; this verifies behavior and does not claim approval of composition quality.

Layer appearance adds one restrained fieldset below the stack: a native grouped blend dropdown, horizontal opacity slider, percentage output and imported-value reset. Existing approved surface/text/focus pairs and form spacing are reused. Keeping it below the list preserves row-drag accessibility within the scrollable inspector. Synthetic PSD screenshot was inspected; user visual review remains pending.

## Full Layers panel — 2026-10-30

The appearance fieldset is integrated into a right-hand Layers panel with grouped blend controls, opacity/fill, five lock icons, real tree rows and a seven-action footer. Reuse the established dark surfaces, light blue selection and explicit focus states. White/grey checkerboards identify transparency. Thumbnail sizes are real 100/200/300px with inspector widths 340/380/440px. Source selection scrolls the list rather than the complete inspector, keeping its heading discoverable. Labels, pressed states and disabled controls accompany vector icons. Screenshots and browser measurements were checked; final user visual review remains pending. Self-critique: visual 4, purpose 5, hierarchy 4, specificity 5, restraint 4, variety 4.

The Layers panel now opens first in the right inspector, before History/source preparation and detailed transforms, so the thumbnail-size selector is immediately discoverable. The scrolling layer tree has a viewport-relative cap to preserve access to its footer.

## Illustrator source and multi-selection — 2026-10-30

The top of Layers now includes a real headline-preparation/upgrade action and concise Ctrl/Shift guidance. Row, name, thumbnail and checkbox selection share the range model; modifier clicks on the canvas select without moving. Vector-backed pieces have explicit source labels. Existing palette and interaction states remain. The actual IKEA PSD was checked for embedded Illustrator content; the renderer preserves that source instead of presenting pixel separation as vector recovery. User visual approval remains pending.

## Per-size refinement — 2026-10-30

Generated artwork now opens the same focused editor on double-click, with an explicit Refine button as an accessible alternative. Back/Escape return to the gallery. The focused header names the screen, dimensions and language; the Refine workflow step is functional. Screen-specific approval labels reuse established colours and typography. No new editor styling or new visual assets were introduced. User visual review remains pending.

## Free Transform — 2026-10-31
Native Canvas handles reuse the existing selection colour. Transparent focusable controls provide keyboard targets, with visible focus rings. The floating gizmo extends outside the composition so background handles remain reachable. Fit selection and opposite-anchor reset are real actions. Chrome interaction tests passed; user visual review remains pending.

## Export formats — 2026-10-31
Format and alpha controls sit in the Export stage, keeping the workflow header clear. Native selects share existing dark surfaces and focus rings. Format limitations are visible alongside the export action. Lossless output and transparent PNG were checked in Chrome; user visual review remains pending.

## Target subset and extension — 2026-10-31
A restrained amber selection notice identifies omitted sizes with explicit text, count and expandable details. Target choices use the existing screen list and exact presets. The extension launcher uses the locked dark palette, a single Open Studio action and visible v1.6.0. Author attribution stays in source comments. Three native SVG icon directions include actual 16/24/32px and monochrome proofs. User icon selection is pending. Self-critique: visual 4, purpose 5, hierarchy 5, specificity 4, restraint 5, variety 4.

The user selected the original Adapt direction (overlapping portrait and landscape frames). It is installed as the extension icon with the requested thinner 7px strokes. The three A refinements remain in design/ as exploration assets.
