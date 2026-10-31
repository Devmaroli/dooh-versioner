# Project instructions

## Release version policy

Every delivered change set must increment the patch release version unless the user explicitly requests a different version. Do not reuse the preceding delivered version. Small implementation commits within the same change set share that release version.

Keep package.json, package-lock.json, extension/manifest.json, extension/popup.html and src/version.ts aligned. Add a dated CHANGELOG.md entry and build the extension with that version before delivery. Prefer reading the manifest/package version in release tests rather than hardcoding it.
