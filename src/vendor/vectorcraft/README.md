# VectorCraft SVG WASM

Upstream revision: `1bb52c5b3897d30c1ed8032df56ea22372c8f145` (0.19.0).
Bridge source and lockfile: `scripts/svg-wasm/`. Toolchain: Rust 1.99.1 + wasm32-unknown-unknown, wasm-bindgen CLI 0.2.130, release opt-level=s and LTO. `BUILD.json` records sizes and checksums of the wasm-bindgen output, before and after gzip.

The module is gzip-compressed for distribution (the opaque `.bin` suffix prevents static hosts from transparently decoding a `.gz` URL), decompressed and initialized locally in a dedicated worker. No CDN or remote resource is used. The browser and extension builds include this module and every license/notice in this directory. The only extension CSP addition is `wasm-unsafe-eval`.

The existing SVG reader retains document groups, CSS cascade, editable paint data, named fonts and embedded/linked images. Each shape is converted into an isolated, styled SVG fragment and normalized through VectorCraft's real import/export APIs before canvas rasterization. Edits regenerate that fragment, so gradient changes also pass through WASM. Text and images keep their existing verified-font and relink/decode flows. Sending the whole document through an unqualified Rust round trip would drop text without a Rust font database and generate placeholder images for unresolved links; this integration deliberately preserves those source layers. PDF import is unchanged.

Upstream import/export warnings become Needs review findings. WASM load/parse failures fail the import visibly; no silent JS renderer substitution occurs. Advanced SVG features remain subject to the limits in CHANGELOG.md. VectorCraft-render is not bundled as a separate Rust rasterizer; the browser paints the normalized shape SVG.

The unmodified upstream LICENSE-MIT, LICENSE-APACHE and NOTICE are included. That NOTICE describes the broader upstream app, including assets not shipped here. This build enables no bundled-font features and includes no font files, ArtCraft icons/logos or client artwork. `DEPENDENCIES.json` identifies the reachable Rust packages and their license texts; `LICENSE_SOURCES.json` records pinned upstream sources for texts absent from their crate archives.

To rebuild, put a checkout of VectorCraft at the pinned revision beside a scratch copy of `scripts/svg-wasm` named `spike` (dependency paths then resolve through `../vectorcraft`). Run:

```text
cargo build --manifest-path spike/Cargo.toml --locked --no-default-features --features svg --release --target wasm32-unknown-unknown
wasm-bindgen spike/target/wasm32-unknown-unknown/release/dooh_vectorcraft_spike.wasm --target web --no-typescript --omit-default-module-path --out-dir generated --out-name vectorcraft_svg
```

Gzip `generated/vectorcraft_svg_bg.wasm` with level 9 and mtime=0, save the compressed bytes as `vectorcraft_svg_bg.wasm.bin` and copy the generated JS here, update BUILD.json, and verify the package tests. Re-audit dependency licenses if Cargo.lock changes. Normal npm builds use the vendored artifact and require no Rust installation.
