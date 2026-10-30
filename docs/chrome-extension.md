# Chrome extension — IT handoff

Build with `npm ci` and `npm run build:extension` using Node 22.12+ or 24. The output is `dist-extension/` and `artifacts/dooh-creative-studio-chrome-1.6.0.zip`, plus SHA-256 checksums. Node and npm are build tools only: the office PC runs the packaged files inside Chrome, with no local server or installer executable.

The toolbar opens a small launcher, then the full Studio in its own tab. An existing Studio tab is focused to reduce concurrent autosave conflicts. Local IndexedDB stores source files and work for this extension origin. The website and extension have separate project storage: import your originals again when moving between them. Removing/reinstalling an extension or clearing its browser profile may lose local work.

No browser permissions, host permissions, content scripts, native messaging, analytics or background worker are requested. Scripts, CSS and PDF worker are bundled. External web fonts are removed from this build; system fonts support the UI. Imported PSD pixels and embedded Illustrator artwork retain their existing lettering. No remote AI or artwork upload service is used.

For evaluation on a PC where your IT policy permits it: extract the ZIP to a permanent folder, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the folder containing `manifest.json`. Pin the extension and choose **Open Studio**. Keep that folder intact; use **Reload** after an approved update.

For managed office deployment, give IT the ZIP, source revision, audit report and checksums. Chrome policies may prohibit unpacked extensions. Use an organisation-approved Chrome Web Store/private distribution or enterprise-managed deployment. This package is not Web Store signed, automatically published or approved by your employer. Do not disable antivirus, firewall or managed Chrome policy. Publisher accounts, signing and allowlisting are deployment decisions for the organisation.

Official references: [Chrome distribution options](https://developer.chrome.com/docs/extensions/how-to/distribute), [extension CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy).

Compatibility is tested in the bundled Chromium/Chrome for Testing build; the manifest requires Chrome 123 or newer. Keep office Chrome current. Browser policy, antivirus reputation and machine resources cannot be reproduced or guaranteed from this development environment.
