# Selected targets

Target screens can be chosen during Import, then changed during Adapt or in the output screen list. The same selected preset names persist in IndexedDB. The selection notice gives the count against the full preset inventory and an expandable list with names and exact dimensions. It explicitly states that only selected sizes and available matching languages will be included; choosing fewer screens is permitted.

`requiredFamilies(screens)` deduplicates selected screens into the composition families they actually need. Approval checks in the UI, renderer and export use this same mapping. Additional unrelated families are not required. Adding a new family requires its approval, preserving previously approved guides. Stale previews are withheld until the required guide is approved. Default six-screen selection currently spans four families; explicitly selecting the Gate Outdoor target exposes the fifth compact guide. 1920×1080 now correctly maps to landscape instead of compact.

Import's Go ahead and adapt action opens the selected guide preparation stage with the available masters. Human guide review and required-content checks remain in place. Missing Arabic content is never replaced with English. A new custom-dimension input or natural-language booking parser has not been added; selection uses the existing exact screen presets.

Verification: 79 unit tests, regular and strict graphics typechecks, production build and all 21 web browser tests passed. Coverage includes a Mupi-only project, subset notice/expanded dimensions, disabled empty selection, single-language/single-size ZIP, adding an ultra-wide target, approval retention, persistence and rejection of background-removal requests for flattened art.
