# Analyse: background selection and headline correction

Implemented on feature/studio-foundation after the foundation milestone.

## Use it

1. Import the PSD, assign its language and open Analyse.
2. Pick a layer from the right-hand Layers panel. Thumbnails show original layer pixels; Full artwork highlights its original bounds. Selected layer isolates its pixels at their original position, clipped to the artboard.
3. For background, select the actual texture layer (Newspaper 03 in the supplied IKEA file). Click Draw background area. The preview switches to the isolated layer so foreground text does not contaminate the sample.
4. Drag a rectangle over clean texture. Reverse-direction dragging works. Coordinates use source pixels; the fields provide a keyboard alternative and exact values. Choose Use this background area to commit it. Escape/Cancel preserves the previously saved area. Clear removes it.
5. The engine samples only the saved rectangle, clamps it to both the layer and original artboard, preserves the texture pixels and proportionally scales/crops that patch to cover target backgrounds. Preview and full-resolution export use the same sample. No new pixels are generated beyond normal resampling and no full advertisement is repeated in the chosen background.
6. Tag original headline layers Main headline, and the offer Offer / secondary message. Several layers can carry the headline role and are composited as a semantic unit. Group editing and independent word reflow remain separate unfinished work.

Background selections, layer identity and confirmed role corrections persist in IndexedDB. Updating/clearing the selection or changing the sampled layer away from Background clears background/semantic caches. Changing the role away from Background also removes its saved selection. Flattened files remain excluded from independent PSD layer tagging. Layers in hidden groups are omitted from the picker.

## Offer fix

The original engine identified the largest editable text as headline. In the IKEA file that was the offer; the main headline is raster/smart-object content. Role inference now considers explicit headline names and offer/promotion wording before size ranking, without campaign-specific strings. On recovery, automatic roles are recalculated; confirmed source/designer roles take precedence. Thus old automatic mistakes do not silently replace corrected inference, and actual designer decisions remain authoritative.

When no original headline is identified, Analyse explicitly warns. The pixel renderer keeps a lone offer in the offer zone instead of allocating the combined headline/offer area. It does not invent a replacement headline.

## IKEA-specific finding and remaining limitation

Inspection of isolated layer pixels shows that the main headline and rectangular border are bundled in a Vector Smart Object. The yellow strips are separate layers, and another smart object bundles contact information and the logo. The secondary offer is editable text. Simply tagging the large smart object is not enough to safely split its words: the border spans empty columns and defeats transparent-gap word detection. Region extraction or verified word/line grouping must exclude the border before reliable portrait reflow. This update does not claim that the full portrait adaptation is production-ready.

The user-specified background patch is a human declaration of clean texture. An opacity probe rejects visibly transparent samples; it is not semantic foreground detection or a guarantee of texture suitability. Sampling isolated layer pixels can differ from the Photoshop composite where adjustment layers/effects are involved. These limitations are stated in the controls. Scaling a small patch can soften or enlarge texture; seamless texture synthesis is not implemented. Without a saved patch the existing background renderer remains unchanged.

## Files

Added src/AnalyseArtwork.tsx, src/analyse.css, src/background.js, src/engine/__tests__/background.test.js and tests/browser/background.spec.ts. Updated App integration, engine rendering, general role inference, metadata persistence and the existing browser workflow tests. Design tokens/contrast and pending-review status are recorded in .tastemaker. Original PSD is kept in ignored work storage and is not committed.

## Verification

- TypeScript check and Vite production build: passed (runner config loader needed in this sandbox).
- Vitest: 19 files, 27 tests passed. New cases cover reversed/out-of-bounds rectangles, artboard/layer intersections, persistent background metadata/cache invalidation, lone-offer classification, explicit headline evidence and confirmed-role precedence.
- Playwright in Edge: 4 scenarios passed with the supplied IKEA fixture. The new scenario actually drags a rectangle, verifies the right-side layer rail, checks that the IKEA offer is classified as offer, saves/recovers the patch, cancels an attempted replacement, clears the region, and checks the 700px layout for overflow.
- The same browser test inspects a tall preview's corner pixels before/after the selection, downloads the ZIP, decodes the actual 1008 × 5184 PNG and checks that its background corner is neutral/opaque rather than the former saturated yellow. This demonstrates the selection affects rendered output rather than metadata alone. It is not a complete creative-quality approval.
- Screenshot evidence: background-selected.png (real IKEA layer selection).

Nothing was merged or deployed. Broader Review/Refine/production export acceptance remains as documented in the foundation report.
