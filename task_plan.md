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
