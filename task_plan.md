# Task Plan

## Goal
Clean art resources that are clearly unused by the current RocoRogue web project without touching dynamically loaded game assets.

## Phases
- [complete] Inventory art resources and discover loading patterns.
- [complete] Classify safe-to-remove files.
- [complete] Remove only files with strong evidence of being unused.
- [complete] Verify references and summarize changes.

## Constraints
- Do not delete broad dynamic directories such as pets, heads, skills, abilities, types, conditions, items, or ability buffs unless a specific file is proven unreachable.
- Preserve unrelated existing worktree changes.

---

## Goal 2026-05-28
Unify all in-project art resources under `rocorogue-public/assets`, arrange them by clear asset categories, audit all references, and update code/resource references accordingly.

## Phases 2026-05-28
- [complete] Inventory art files and current reference patterns across the project.
- [complete] Decide canonical placement under `rocorogue-public/assets` without inventing resource semantics.
- [complete] Move art files and update every discovered code/data reference.
- [complete] Verify no stale references remain and run syntax/build checks.
- [complete] Verify UI through `cmd /c run.bat` using `.rocorogue-port`.

## Errors Encountered 2026-05-28
| Error | Attempt | Resolution |
|-------|---------|------------|
| PowerShell `rg` regex with mixed quotes failed to parse. | Initial reference search. | Reran with single-quoted regex. |
| Windows wildcard path arguments failed in `rg`. | Targeted file search. | Switched to `rg -g` file filters. |
| Broad `/skills` replacement touched `wiki/skills` bundle keys. | First mechanical path rewrite. | Restored `wiki/assets/skills` back to `wiki/skills`; kept real image URLs under `/assets/skills`. |
| Browser route check still saw old top-level paths. | First route verification after code changes. | Updated cache-busters in `index.html` and `run.bat`, then reloaded through the actual `run.bat` URL. |

## Constraints 2026-05-28
- Preserve unrelated user changes in the dirty worktree.
- Do not change data values, default behavior, copy, or styles beyond path/reference changes required by the asset move.
- Do not save verification screenshots in the repository root.
