# VectorCraft WASM spike — 1.7.3

Tested source: [VectorCraft](https://github.com/storytold/vectorcraft/tree/1bb52c5b3897d30c1ed8032df56ea22372c8f145), revision `1bb52c5b3897d30c1ed8032df56ea22372c8f145` (0.19.0). Toolchain: Rust 1.99.1 stable, host x86_64-pc-windows-msvc, target wasm32-unknown-unknown. The toolchain and checkouts were isolated outside this application's tracked source.

| Standalone library bridge | Build | Raw .wasm bytes | Bytes excluding custom sections |
| --- | --- | ---: | ---: |
| SVG import + export round trip | passed | 11,198,733 | 9,310,734 |
| Document JSON to rendered RGBA | passed | 10,631,867 | 8,812,192 |

Decision: use the JS importer. Both standalone payloads exceed the requested approximately 8 MB limit, even after excluding custom sections (also above 8 MiB). No WASM is vendored, loaded, or shipped; no CSP change is made. The existing stylesheet/reference/gradient/font fixes stay behind the same JS import API.

These are compilation and size results, not browser rendering/parity results. The size experiment used `opt-level = "s"` and LTO. A wasm-bindgen CLI packaging pass and wasm-opt were not run; the custom-section-free counts are structural lower counts for these compiled binaries, not measured final JS glue distributions or a claim that further optimization is impossible. The renderer emitted one nonfatal unused `automatic_threads` warning. No bundled-font feature was requested. No PhotoCraft PSD work was performed.

## Reproduce

1. Clone VectorCraft to a scratch directory `vectorcraft` and check out the revision above. Copy this repository's `docs/wasm-spike` directory to a sibling directory `spike`. Relative dependency paths in the reproducer then point to the checkout.
2. Install the `wasm32-unknown-unknown` target for Rust 1.99.1. A native host linker is needed for procedural macro dependencies.
3. From the scratch parent directory, run separately:

```text
cargo build --manifest-path spike/Cargo.toml --no-default-features --features svg --release --target wasm32-unknown-unknown
cargo build --manifest-path spike/Cargo.toml --no-default-features --features render --release --target wasm32-unknown-unknown
```

Copy the first output before the second command overwrites it. Each output is `spike/target/wasm32-unknown-unknown/release/dooh_vectorcraft_spike.wasm`. The small reproducer exposes wasm-bindgen entry points that call the real SVG importer/exporter and renderer; it does not link a desktop application. The SVG bridge's transitive dependencies already include the renderer's shared dependencies. The standalone workspace avoids resolving the upstream desktop workspace's egui patches. The initial full-workspace attempt was stopped during desktop dependency fetching; it was not counted as a compile failure.

For the custom-section-free count, parse the WASM section stream after its 8-byte header, read each section's unsigned LEB128 payload length, and sum the header plus encoded sections whose ID is not zero. This excludes names, producers, target-feature metadata and wasm-bindgen descriptors. Retain the original module for actual wasm-bindgen packaging.

The reproducer is original bridge code, not vendored VectorCraft code. Upstream libraries remain Apache-2.0/MIT dependencies used only in the scratch build. If a later change ships upstream source or WASM, include the applicable upstream LICENSE/NOTICE files in both web and extension distributions and reassess browser semantics and CSP at that point.
