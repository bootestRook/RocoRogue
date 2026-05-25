# RocoRogue public mirror

This directory contains the original public frontend bundle and assets, retained as the runtime base for RocoRogue.

## Included

- `index.html`
- Original production bundle: `assets/index-xu9RZIac.js`
- Original production CSS: `assets/index-Oin_zZIo.css`
- Public image/icon assets:
  - `portraits_256/`
  - `heads/`
  - `skills/`
  - `abilities/`
  - `ability-buffs/`
  - `conditions/`
  - `types/`
- Asset inventories:
  - `asset-manifest.json`
  - `asset-missing.json`
  - `asset-failed.json`

## Not Included

The public deployment did not expose real source maps. The original source tree, package manifest, build config, and backend services are not recoverable from the static frontend alone.

Known backend endpoints referenced by the frontend but not included here:

- `/api/feedback`
- `/api/parse-team-image`
- `http://127.0.0.1:8765/decide`

## Run Locally

```powershell
cd F:\RocoRogue\rocorogue-public
python -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/?v=1#/team
```
