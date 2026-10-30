# DOOH Versioner

Local Bannerflow-style tool for DOOH ad versioning and auto-resize. One master design is adapted to booked sizes and to many versions, including English and Arabic (RTL). This repository is prototype **v1.5**: the static UI, the layout engine, agent skills, and the problem pack.

This is a **private** repository. `samples/real/` and `shots/client-rio` are confidential client artwork (Bolton Group, Rio). The same Rio captures also sit at the repo root as `shots/real-*.png` and `shots/mock-tag-*.png`. Keep them here; do not publish them.

The static prototype is deployed at [https://dooh-versioner-proto.vercel.app](https://dooh-versioner-proto.vercel.app). `proto/` is unchanged. The Vite app uses that same v1.5 renderer.

## App

```bash
npm install
npm run dev      # Vite, open the printed URL
npm test         # engine/tests under Vitest
npm run build    # production bundle in dist/
```

Upload PNG, JPG, SVG, or PSD masters (language from the filename suffix). Tick screens, review the EN/AR grid, click a tile to enlarge, then export a PNG zip. With no upload, tiles use the prototype's built-in template. Sample SVG and sample PSD buttons load the placeholder artwork already in `src/engine/presets.js` (not client Rio files).

| Path | What it is |
|---|---|
| `src/engine/adapt.js` | `proto/adapt.js` (layout, kashida, masters, language, multi-face, audit). |
| `src/engine/presets.js` | `proto/presets.js` (screen JSON plus the sample SVG/PSD). |
| `src/engine/render.js` | Tile drawing from `proto/index.html`: PSD pixels, colour overlay, drop shadow, glow, stroke, tagline split, language masters. |
| `src/data/` | Screen list built with the v1.5 importer from the Screen Manager JSON in `src/data/screens/`. |
| `src/engine/__tests__/` | The checks from `engine/tests/`, run by Vitest. |

## Folder map

| Path | What it is |
|---|---|
| `proto/` | Static prototype deployed to the URL above: `index.html`, `adapt.js`, `presets.js`, and `mockup-tag.html` (Load & tag mockup). |
| `engine/` | Layout engine. `adapt.ts` and `layout-lib.ts` are the source; `build/adapt.cjs` is the bundle the tests load. `engine/tests/` are the Node checks. |
| `ai/` | Design rules, layout-parameter JSON schema, scoring rubric, and an example payload. The prototype proposes layout numbers only; provider keys stay out of the browser. |
| `SPEC.md` | Product spec: goals, tag grammar, M2R preset notes, and the v1.x changelog. |
| `layouts/` | Screen layout library (`library.json`) and `validate.py`. Screen-size lists (ScreenAdapter, Alshaheed, AE Screen Manager, combiners) are embedded in `proto/presets.js` and packed under `screens/` inside the problem-pack zip. |
| `reports/` | All-preset audit (`audit-all-presets.csv` / `.html`). |
| `shots/` | Prototype screenshots, plus confidential client Rio shots and mockups: `real-best.png`, `real-worst.png`, and `mock-tag-*.png`. The problem pack stores the JPG set at `shots/client-rio/`. |
| `samples/` | Placeholder `sample.svg` and `sample.psd`, plus confidential client renders in `samples/real/renders/`. The Rio PSD originals are not in git; see `samples/real/README.md`. |
| `skills/` | Agent skills (`SKILL.md` for each `dooh-*` skill and the app/UX skills) and drafts in `skills/_drafts/`. |
| `docs/` | `docs/dooh-versioner-problem-pack.zip`: spec, engine, `screens/` configs, reports, skills, and confidential `shots/client-rio/`. |

## Run the engine tests

The tests are plain Node scripts against `engine/build/adapt.cjs`. From the repo root:

```bash
for t in engine/tests/*.test.js; do echo "== $t"; node "$t" || echo "FAILED $t"; done
```

`presets.test.js` and `paste.test.js` read screen-list JSON from `/workspace/repos/screen-adapter/ScreenAdapter_Config.json` and `/workspace/repos/sm2/` (`AE_ScreenManager_Config.json`, `Alshaheed_Screens_ScreenManager.json`, `AE_ScreenManager_Combiners.json`). Those lists are embedded in `proto/presets.js` and packed under `screens/` in `docs/dooh-versioner-problem-pack.zip`. `artwork.test.js` reads `samples/sample.svg`, and parses `samples/sample.psd` only when `ag-psd` is installed at `/tmp/agp/node_modules/ag-psd`.

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

`.gitignore` lists only `node_modules`, `.vercel`, and `.env*`. The `#real` hash fetches `../samples/real/Rio_EN.psd` and `Rio_AR.psd` when those files are on disk and the static server root is the repo (see `samples/real/README.md` for where the originals live).
