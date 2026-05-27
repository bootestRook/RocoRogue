# Progress

## 2026-05-26
- Loaded `planning-with-files` skill because this is a multi-step code task.
- Checked previous-session catchup; script exited 1 without output.
- Inspected repository root and git status. Worktree has large pre-existing churn, so changes will be tightly scoped.
- Located battle override files and the relevant drawer/card event flow.
- Added targeting state sync, capture ball selection, trainer-battle capture blocking, selected-card styles, target dim/marker/ring styles, and cache-buster updates.
- Ran `node --check rocorogue-public/assets/battle-ui.js`; syntax check passed.
- Browser-verified bag item selection: selected item count 1, view enters `roco-target-item`, and target side is allied `p1`.
- Fixed selected-card frame clipping after user report by moving the highlight inside the card and removing selected-card translation.
- Browser-verified fixed selection frame: selected card has no transform, internal `::after` border is active, and card bounds stay inside the panel.
- Browser-verified trainer-style capture: capture opens its page, all 5 ball cards are disabled, no ball is selected, and no targeting mode starts.
- Browser-verified switch selection: selected switch card count 1, confirm modal stays hidden, and allied active side receives the target marker.
- Added special switch rule for `首领之力`/`愿力强化`: before sending a final switch command, clear those two item flags so switching another spirit does not consume the item or apply the effect.
- Ran `node --check rocorogue-public/assets/battle-ui.js`; syntax check passed after the special-rule change.
- Browser-verified the special rule with `愿力强化`: selected the item/ally target, switched to another spirit, reopened bag, and `愿力强化` remained `2/2` and unarmed.

## 2026-05-27
- Started asset cleanup task.
- Created `task_plan.md` for scoped cleanup tracking.
- Will remove only resources with strong evidence of being unused, preserving dynamic game asset directories.
- Removed 13 unused image files totaling 5,811,261 bytes.
- Cleaned stale pet-box asset-map keys and stopped the placeholder generator from producing the removed pet-box placeholders.
- Verified deleted resource names no longer appear in runtime/tool references.
- Ran `node --check rocorogue-public/assets/pet-box/pet-box-assets.js`; passed.
- Ran bundled Python `py_compile` for `tools/generate_pet_box_placeholder_pngs.py`; passed.

## 2026-05-28
- Loaded `planning-with-files` skill for the full asset migration and audit task.
- Checked previous session catchup; script exited 1 without output.
- Inspected git status and repository root. Worktree is already dirty, so changes will stay tightly scoped to asset placement and path references.
- Updated `task_plan.md` with the current migration/audit phases.
- Inventoried visual assets by directory. Found all large dynamic art folders at `rocorogue-public` top level.
- User clarified root `图标生成` generated PNGs are out of scope; they will not be moved or audited further.
- Error: a PowerShell `rg` command with mixed quotes failed to parse. Resolution: rerun with single-quoted regex.
- Discovered explicit top-level asset references in bundled CSS/JS, `asset-manifest.json`, `asset-missing.json`, `rocorogue-public/README.md`, and `tools/generate_pet_box_placeholder_pngs.py`.
- Error: an `rg` command using Windows wildcard path arguments failed with invalid filename syntax. Resolution: use `rg -g` file filters instead.
- Moved runtime art directories into `rocorogue-public/assets`: `abilities`, `ability-buffs`, `conditions`, `heads`, `items`, `portraits_256`, `skills`, and `types`.
- Rewrote URL references in `asset-manifest.json`, `asset-missing.json`, bundled CSS/JS, `battle-ui.js`, and pet-box JS to point at `/assets/...`.
- Fixed overbroad replacement that changed `wiki/skills` bundle keys; restored them to non-asset `wiki/skills`.
- Updated the pet-box placeholder generator portrait source path and `rocorogue-public/README.md`.
- Regenerated `asset-manifest.json` from the actual files under `rocorogue-public/assets` after discovering the old inventory included stale/missing entries.
- Verified no stale top-level art URLs remain after filtering non-art `wiki/skills` bundle keys.
- Ran `node --check` for `battle-ui.js`, `pet-box-view.js`, `pet-box-mock-pets.js`, and `index-xu9RZIac.js`; all passed.
- Ran bundled Python `py_compile` for `tools/generate_pet_box_placeholder_pngs.py`; passed. The system `python` is only a Windows Store stub, so bundled Python was required.
- Verified `asset-manifest.json` has 3502 entries and every entry exists when read with UTF-8 encoding.
- Updated `index.html` and `run.bat` cache-busters to `20260528-assets-1` so the actual entrypoint reloads the migrated JS/CSS references.
- Ran `cmd /c run.bat`; it opened `http://127.0.0.1:4173/?v=20260528-assets-1#/mechanics?view=pet-box`.
- Browser-verified the `run.bat` URL plus `/team` and `/battle` routes: no image elements use old top-level art directories. Hidden/deferred image elements that reported incomplete were individually fetched and returned HTTP 200.
- Final command checks passed: JS syntax checks, UTF-8 manifest existence check, and stale top-level art URL scan.
- Started processing user-requested generated frame art from `图标生成`. Current folder contains two PNGs: `黄色通用底框图.png` and `黑色通用底框图.png`; earlier arrow filenames are not present now.
- Chroma-key cut out the two generated common frame PNGs, cropped them to their visible subjects, cleared transparent RGB pixels, and saved them to `rocorogue-public/assets/ui/common/`.
- Updated `asset-manifest.json` to include every image file under `rocorogue-public/assets`; it now contains 3557 entries.
- Reprocessed the common frame PNG edges to remove remaining chroma-key green fringe. Alpha validation now reports transparent corners and zero green-fringe pixels on both outputs.
- Revalidated `asset-manifest.json`: 3557 entries, both common frame assets present, and zero missing files.
