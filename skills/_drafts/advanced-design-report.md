# dooh-advanced-design-and-adaptation: review (29 Oct 2026)
Checked against AE_ScreenManager_Config.json, Combiners.json and Alshaheed_Screens_ScreenManager.json (84 screens).

## Sizes
- Appendix A: all 77 listed sizes, names and ratios match the config. The family counts are correct.
- Missing: the 7 Alshaheed screens. They are now added to Appendices A and C (Banner, Ribbon, Panoramic ×2, Standard wide, Portrait ×2) with codec and bitrate rows. "about 80 screens" is changed to 84.
- Appendix C: MP, odd-size flags, codec class and bitrate math are all correct.
- Appendix B fixes:
  - Thuraya 1+2 is NOT "not combinable": combiner `Thuraya_Full` makes 3584×608, top-aligned, with a 68 px gap under screen 2.
  - Marina Palm Trees: the combiner uses **4** panels (960×960), not 6 (1440×960). Section 8.4 is updated too.
  - Dayarti and Marina 1+2 have no combiner in Screen Manager.
  - Added the real combiners: Platinum ×2, Crescent ×2, Murouj 3/4-stack, Capital Hub ×2, Piccadilly ×3 (6080, force-scaled from 6081), Topaz ×2, Al Salam Sync ×2.

## Consistency fixes (minimal edits)
1. Background extension (§5, §1.7): generative fill was first. It is now non-AI first, with AI fill opt-in and the last resort (matches dooh-artwork-adaptation and dooh-element-positioning).
2. Contrast (§3.1, §11): the "7:1 minimum" for headline is now aim 7:1, with minimum 4.5:1 for body/CTA/legal and 3:1 for large headlines (matches dooh-design-audit). Auto scrim noted.
3. Seams (§8.2): 1U changed to one full margin from every seam (dooh-spacing-rules / dooh-artwork-adaptation).
4. Kashida (§7): "unless client wants it" replaced with the decided policy (1-line AR headline on wide screens only, max 3 per word). Added to the QA list.
5. Arabic size (§7): now 110–115% of Latin, never below about 90%.
6. Text never overlaps the product (§5, §11). Margins at least 6% of the short side (§11).
7. Math slip (§2.2): at 60 m the 275 px font (cap ≈194 px = 51% of 378) does fit the 40–55% ribbon range, but only as one short line inside the 318 px usable height. The text said it doesn't fit; corrected. The D/200 minimum is shown as ≈116 px cap / 166 px font.
8. Added a Related skills section.

## Needs Kapildev's decision
- Marina Palm Trees: 4 or 6 panels?
- Thuraya: is the combined 3584×608 canvas with the 68 px gap the real physical layout?
- Piccadilly ×3: 6081 px force-scaled to 6080 (odd width). Is that OK with the media owner?
- Section 3.1 "aim 7:1": should the audit grade against 7:1 as well (stricter), or keep 4.5:1 / 3:1?
- Alshaheed family placement is ASSUMED from ratio (1024×512 is exactly 2.0, so it went into Panoramic).
- Family ratio bounds were harmonised with dooh-all-screens-layouts and the AI master prompt: standard 1.55–2, classic 1.25–1.55, square 0.85–1.25, portrait 0.55–0.85. Dayarti 3 950×600 (1.58) was listed as standard wide but fell under classic by the old bounds; it now fits. No other screen moves.

# Second file: AI master prompt (grok-master-prompt.fixed.md → skill dooh-ai-master-prompt)
- Section 5 formulas were checked against dooh-all-screens-layouts for Kuwait Gate, 1.7HD, Capital Hub, Topaz, Diamond and Al Nassar Vertical. They reproduce the library to within ±10 px.
  - Fixed: the 960×5328 example (headline 1402–2142, hero 2162–3490, support 3510–3900, as in the library).
  - Fixed: the portrait logo width is 30% of the INNER width.
- Sizes: 77 / 68 unique is correct for the main config. Noted the 7 Alshaheed screens. Special sets were corrected as in the advanced skill (Thuraya combiner, Palms ×4, duplicate combiners).
- Consistency fixes:
  1. Contrast: aim 7:1, minimums 4.5 / 3.
  2. Background extension: non-AI first; AI is opt-in and the last resort.
  3. Seams: one margin from every seam (not 1U), also in Mode B check 2.
  4. Hero→text "no overlap unless deliberate": now only when explicitly tagged overlap.
  5. Kashida policy added (4.2, check 15).
  6. AR headline 110–115% (≥90%).
- Added a Related skills section. The title is kept.
- Merged into the versioner's AI system prompt (`ai/design-rules.md` §8) without repeating sections 1–7.
- Decision for Kapildev: Mode B output schema vs the versioner's `layout-params.schema.json`. The versioner keeps its own schema; Mode B fields (issues/suggestions/needs_human/p) are mapped in §8.
