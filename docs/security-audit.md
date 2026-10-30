# Security review — 2026-10-31

Scope: local source review, npm advisory scans, release contents and actual extension-origin browser checks. This is a bounded engineering review, not a penetration-test certification or a guarantee against unknown vulnerabilities.

## Findings and changes

- Production dependency scan: zero known advisories. Full development scan initially found three vulnerable package entries including critical test-tool findings. Updated Vitest from 3.2.7 to 5.0.5; the subsequent full scan reports zero known advisories. These development tools are not distributed in the extension.
- Removed an HTML interpolation sink in the legacy review-queue renderer. Names and notes now use text nodes. React layer/file names remain text, not executable HTML.
- PSD decoding has a 256 MiB decoded-bitmap budget in addition to file size, artboard dimension and image buffer limits. Embedded PDF processing disables runtime evaluation, worker fetching and WebAssembly, and caps image/canvas allocations. Large or adversarial files can still consume CPU/memory; only open trusted campaign assets.
- The extension requests no browser or host permissions and injects no content scripts. Its launcher only opens/focuses its own tab. It has no native executable, shell helper, remote update loader or automatic software installer.
- CSP restricts scripts, workers and network connections to packaged extension resources. No `unsafe-eval`; no remote scripts, external frames or plug-ins. Inline styles are allowed for the existing React canvas UI; inline JavaScript is not. External Google Fonts links are removed from the extension HTML.
- Local artwork and metadata are saved in the browser profile's IndexedDB. The app does not add encryption or secure erasure. Apply office device/retention policies. Exports contain campaign content; layered PSD also contains hidden original-source material, so review it before external sharing.
- SVG is parsed as artwork metadata, not inserted as live document HTML. Embedded PDF pages are rendered as artwork; PDF JavaScript/actions are not executed by this workflow. Layer/source names are tested as untrusted text.

## Reference application

Reviewed the screen-size planner's `master` manifest (blob `390d4bbc427c0de3f4bb7ab7f9a50fb016d46528`), popup and README. It uses Manifest V3, a toolbar launcher and a full local tab with no declared permissions. Studio follows that small-permission deployment model while adding a stricter CSP and bundled graphics dependencies. This is a packaging comparison, not a security audit of the entire planner repository.

## Verification and remaining limits

Web regression: 79 unit tests and 21 browser tests passed before extension packaging. Updated test runner: 79 unit tests passed. Two actual extension-origin browser tests passed in Chrome for Testing 156.0.8078.4: offline launch/import/refinement and all three export formats; hostile PSD layer names rendered as text; local persistence across refresh; reuse of the existing Studio tab; no observed external HTTP(S) requests; explicit external fetch blocked by CSP before network dispatch; and the private IKEA Illustrator-word render under the packaged PDF worker/CSP. Subsequent release checks also assert visible version and absence of author attribution in the UI. Windows test profiles use a short path to avoid the platform's long-path IndexedDB error, and are removed after each run.

The package includes readable application JavaScript rather than a custom obfuscator. The official PDF worker retains its upstream minified distribution. Third-party licenses and exact dependency versions are included. SHA-256 checksums identify the reviewed package; they are integrity checks, not a publisher signature. No files are submitted to a public malware scanning service. No office antivirus or firewall configuration is changed. Reputation/enterprise installation decisions remain with IT.

Resources: [Chrome CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy), [Chrome distribution policy](https://developer.chrome.com/docs/extensions/how-to/distribute), [Vitest mocker advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), [Tinypool advisory](https://github.com/advisories/GHSA-85c8-ppgw-ccpr).
