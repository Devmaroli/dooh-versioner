# DOOH Versioner

Local Bannerflow-style tool for DOOH ad versioning and auto-resize. One master design is adapted to booked M2R screen sizes and to many versions, including English and Arabic (RTL). This repository is prototype **v1.5**: a static UI plus the layout engine it runs.

The static prototype is deployed at [https://dooh-versioner-proto.vercel.app](https://dooh-versioner-proto.vercel.app).

## Folder map

| Path | What it is |
|---|---|
| `proto/` | Static prototype (`index.html`, `adapt.js`, `presets.js`). This is what is deployed to the URL above. |
| `engine/` | Layout engine. `adapt.ts` and `layout-lib.ts` are the source; `build/adapt.cjs` is the bundle the tests load. `engine/tests/` are the Node checks. |
| `ai/` | Design rules, layout-parameter JSON schema, scoring rubric, and an example payload. The prototype proposes layout numbers only; provider keys stay out of the browser. |
| `SPEC.md` | Product spec: goals, tag grammar, M2R preset notes, and the v1.x changelog. |
| `layouts/` | Screen layout library (`library.json`) and `validate.py`. The screen-size lists the UI imports (ScreenAdapter, Alshaheed, AE Screen Manager, combiners) are embedded in `proto/presets.js`. |
| `samples/` | Placeholder artwork only (`sample.svg`, `sample.psd`). Real client masters go in `samples/real/` and are not committed. |
| `shots/`, `reports/`, root `v0*.png` | Prototype screenshots and the all-preset audit report. |

## Run the engine tests

The tests are plain Node scripts against `engine/build/adapt.cjs`. From the repo root:

```bash
for t in engine/tests/*.test.js; do echo "== $t"; node "$t" || echo "FAILED $t"; done
```

`presets.test.js` and `paste.test.js` read screen-list JSON from `/workspace/repos/screen-adapter/ScreenAdapter_Config.json` and `/workspace/repos/sm2/` (`AE_ScreenManager_Config.json`, `Alshaheed_Screens_ScreenManager.json`, `AE_ScreenManager_Combiners.json`). Those files are the same lists embedded in `proto/presets.js`; they are not stored as separate JSON in this repo. `artwork.test.js` reads `samples/sample.svg`, and parses `samples/sample.psd` only when `ag-psd` is installed at `/tmp/agp/node_modules/ag-psd`.

## Open the prototype locally

Serve `proto/` and open the printed URL. The page loads `ag-psd` from a CDN, so it needs network access for PSD import.

```bash
npx --yes serve proto
```

Or with Python:

```bash
python3 -m http.server 8000 --directory proto
```

Then open `http://localhost:3000` (or `http://localhost:8000` for the Python server).

Client artwork and secrets are not part of this tree. `samples/real/`, `shots/real-*`, `shots/mock-tag-*`, `node_modules/`, `.vercel/`, and `.env*` are gitignored. The `#real` hash tries to fetch `../samples/real/Rio_EN.psd` and `Rio_AR.psd`; that path works only when those local files exist and the static server’s root is the repo, not `proto/`.
