# DOOH Versioner

Local Bannerflow-style tool for DOOH ad versioning and auto-resize. One master design is adapted to booked M2R screen sizes and to many versions, including English and Arabic (RTL). This repository is prototype **v1.5**: the static UI, the layout engine, agent skills, and the problem pack.

## Folder map

| Path | What it is |
|---|---|
| `proto/` | Static prototype deployed to the URL above: `index.html`, `adapt.js`, `presets.js`, and `mockup-tag.html` (Load & tag mockup). |
| `engine/` | Layout engine. `adapt.ts` and `layout-lib.ts` are the source; `build/adapt.cjs` is the bundle the tests load. `engine/tests/` are the Node checks. |
| `ai/` | Design rules, layout-parameter JSON schema, scoring rubric, and an example payload. The prototype proposes layout numbers only; provider keys stay out of the browser. |
| `SPEC.md` | Product spec: goals, tag grammar, M2R preset notes, and the v1.x changelog. |
| `layouts/` | Screen layout library (`library.json`) and `validate.py`. Screen-size lists (ScreenAdapter, Alshaheed, AE Screen Manager, combiners) are embedded in `proto/presets.js`. |
| `reports/` | All-preset audit (`audit-all-presets.csv` / `.html`). |
| `shots/` | Generic prototype screenshots. |
| `samples/` | Generic sample SVG and layered PSD fixtures. |
| `skills/` | Agent skills (`SKILL.md` for each `dooh-*` skill and the app/UX skills) and drafts in `skills/_drafts/`. |
| `docs/` | Architecture, setup, validation and release documentation. |

## Run the engine tests

The tests are plain Node scripts against `engine/build/adapt.cjs`. From the repo root:

```bash
for t in engine/tests/*.test.js; do echo "== $t"; node "$t" || echo "FAILED $t"; done
```

`presets.test.js` and `paste.test.js` read screen-list JSON from `/workspace/repos/screen-adapter/ScreenAdapter_Config.json` and `/workspace/repos/sm2/` (`AE_ScreenManager_Config.json`, `Alshaheed_Screens_ScreenManager.json`, `AE_ScreenManager_Combiners.json`). Those lists are embedded in `proto/presets.js`. `artwork.test.js` reads `samples/sample.svg`, and parses `samples/sample.psd` only when `ag-psd` is installed at `/tmp/agp/node_modules/ag-psd`.

## Open the prototype locally

Serve `proto/` and open the printed URL. The page loads `ag-psd` from a CDN, so PSD import needs network access.

```bash
npx --yes serve proto
```

Or with Python:

```bash
python3 -m http.server 8000 --directory proto
```

Then open `http://localhost:3000` (or `http://localhost:8000` for the Python server).