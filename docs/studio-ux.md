# Studio UX — 1.7.2

Version 1.7.2 imports SVG vectors and PDF pages as editable layers, including raster images stored inside the file. See the changelog.

DOOH Creative Studio adapts existing masters to screen presets. It does not invent photography, products, logos, prices, contact details, legal lines or translations.

## Stages

1. **Import** — add masters, confirm EN or AR, choose the screens for this job. A subset is valid. Missing Arabic is omitted; it is never filled with English.
2. **Analyse** — confirm a role for each source layer. Suggestions stay visibly unconfirmed. A confirmed role replaces the suggestion for that layer only.
3. **Adapt** — approve one guide per family that the selected screens actually use. Representative guides are 2.6 Screen (1536×576), Al Salam Mall (7680×1152), Al Nassar Tower Vertical (960×5328), Alshaheed - Mupi (1080×1920) and The Gate Mall Outdoor (948×648).
4. **Review & edit** — one gallery. Double-click or Edit opens that output. Previous and Next move between outputs. Back keeps the filter. An edit is saved without approving. Editing an approved output clears that approval.
5. **Export** — PNG, lossless flattened PDF, or layered PSD. The confirmation lists each output. Blocked outputs are refused. Review-only findings export only after the confirmation, which is stored on the project.

## Tags

| Dimension | Values |
|---|---|
| Role | Headline, Supporting text, Offer, Price, Logo, Key visual, Contact, Legal, Regulatory, Background, Graphic, Other. Not sure is unresolved. |
| Requirement | Required or optional |
| Priority | Critical, High, Medium, Low |
| Placement | Free, nearest edge, top, bottom, left, right, or locked relative position |
| Inclusion | Include or exclude. The eye is separate. Required content cannot be excluded. |
| Graphic | Stamp and traced border are graphic subtypes |

Changing priority or inclusion does not change the role. Logos cannot be split into words. A border is reconstructed only from a traced source rectangle.

## Background

The full source layer is available, including pixels outside the artboard. The designer draws the reusable texture rectangle. The engine does not invent a fill when that region is unreliable; the finding stays on the output until someone reviews it.

## Analyse columns

At desktop widths the Analyse stage is three independently scrolling columns: roles and requirements on the left, the artwork in the centre, and the layer tree on the right. Below 1100px the role column moves above the artwork. Below 760px the columns stack.

## Groups

Imported PSD groups keep their nesting. A chevron shows collapsed at 0 degrees and expanded at 90 degrees, and it does not animate when reduced motion is requested. Open or closed state is stored on the group and survives refresh and undo. Hiding or locking a group hides or locks its children. Opacity multiplies down the group. Ctrl/Cmd+G groups the selection. Ctrl/Cmd+Shift+G ungroups. Collapsed children are omitted from Shift range selection. Hidden rows are omitted from that range unless the hidden row itself is clicked.

## Prepare / split

Prepare / split works on any selected layer. A verified embedded vector source is split into parts labelled as embedded vector and placed in a new group. A raster layer is split only where source-pixel gaps are reliable, and those parts are labelled raster. No paths are invented. A logo stays whole until Allow split is turned on.

## Editor

Move (V), Free Transform (T, or the Scale control, and Ctrl/Cmd+T), Hand (H) and Zoom (Z). Properties and Layers are separate jump targets in the same inspector. The layer tree supports arrow keys. Thumbnails are compact, 100, 200 or 300. Blend mode and opacity stay distinct from fill. History keeps seven undo steps, scoped to the guide or the output.

## Approval

Automated findings are not the same as guide approval or output approval. Hard failures (missing required content, clipping of required content, a missing headline on a layered master, a split logo) block approval and export. Overlaps, low opacity and an unconfirmed background patch are review-only.

## Persistence

Metadata schema is version 2. IndexedDB stores the original file. Version 1 projects migrate on open. Confirmed roles win over a new automatic suggestion. Derived pixel caches are dropped on restore.

## SVG and PDF import

An SVG becomes layers: groups, paths, text, and one pixel layer per image. Embedded images use a base64 data URI on `href` or `xlink:href`. Linked images match the file name when those files are chosen with the SVG, dropped beside it, or dropped as a folder. A missing link is labelled “Missing linked image … Needs review” and has a Relink action. The app does not request http(s) image addresses. Image transform, clip-path and opacity stay on the layer. The source is `embedded` or `linked`.

A PDF opens on page 1. Extra pages use the page picker. Text and simple paths become layers. Embedded images become pixel layers with the content-stream placement. A page that yields none of those uses one raster labelled “Page raster”. An `.ai` file imports only when it is a PDF-compatible Illustrator file. Annotations, soft masks, patterns and external PDF links are not fetched or rebuilt as layers. Path placement is the flipped PDF user space and can need a visual check.

## PSD and PDF limits

Adapted PSD layers are raster. Masks, fill and effects are baked into those pixels. Native layers and embedded Illustrator objects that ag-psd can read stay in a hidden source folder; that folder is not editable adapted artwork. PDF is a flattened RGB image at the screen's pixel size, mapped at 72 ppi. Previews are never upscaled to become the final file.

## What this release checked without production artwork

Unit tests cover migration, mixed-field edits, role aliases, portrait slot size, readiness states and unrelated images staying unresolved. Browser tests use generated PSDs and the built-in sample. They do not include a client master.

## Outstanding checks on a real production master

Run these on a trusted machine. Do not commit the master, crops or screenshots of it.

- Background layer extent, including a negative origin, can be selected and a texture rectangle survives reload.
- The offer line is not treated as the headline, and unnamed smart objects are not assumed to be the key visual.
- Logo and contact lockups with the same bounds stay unlinked until someone links them.
- Mupi, ultra-wide, ultra-tall and compact guides need a designer pass for prominence and background fit.
- Embedded vector word preparation still has to be compared with the placed Illustrator art.
- Exported PNG, PDF and PSD dimensions and a Photoshop open of the layered PSD.
