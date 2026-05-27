# Findings

## Initial Notes
- User provided two reference images:
  - Selected card/item should use a pronounced selected visual similar to the highlighted item in reference 1.
  - Targeting mode should darken the scene while showing a dot on the target and a glowing ring under it, as in reference 2.
- Existing git worktree is very dirty with many `D` plus matching `??` entries. Treat as pre-existing and avoid unrelated edits.

## Code Locations
- Battle UI override lives in `rocorogue-public/assets/battle-ui.js` and `rocorogue-public/assets/battle-ui.css`.
- Bottom-right action buttons are generated from `ACTIONS` and wired in `wireActions`.
- Drawers are toggled through `toggleDrawer(view, name)` using classes `roco-show-bag`, `roco-show-capture`, and `roco-show-switch`.
- Bag cards are custom `.roco-item-card` nodes that proxy to hidden/core `.item-bar[data-item-slot]` toggles.
- Switch cards are native `.switch-card.switchable` nodes inside `.switch-panel`; the override currently intercepts click and opens a confirm modal.
- Capture ball cards are custom `.roco-ball-card` nodes with no current click handler.

## Behavioral Gaps
- Bag item selection currently marks `roco-item-armed`, but it does not dim the field or mark the active allied target.
- Switch selection currently shows a confirm dialog instead of the requested target overlay.
- Capture selection currently has no selected state or target overlay.
- Capture execution/engine support is unclear in the minified bundle; for this requested UI rule, we can at least prevent capture selection in trainer/dual-control style battles and mark the enemy active target when allowed.

## Implementation Notes
- The minified runtime only exposes item use as a prefix to a later move/switch command (`use energybottle`, `use wish`, `use boss`) and has no discovered capture command.
- Capture blocking uses explicit wild/trainer flags if present; otherwise it treats non-solo modes or opponents with more than one team member as trainer battles.
- Switch selection now uses the selected card plus field target marker. Clicking the marked allied active pet, or clicking the same selected switch card again, confirms the switch through the original command path.
- `首领之力` and `愿力强化` are represented by `useBossItemThisTurn` and `useWishItemThisTurn`. Clearing those flags immediately before the final switch command prevents the minified runtime from emitting `use boss, switch ...` or `use wish, switch ...`.

## Asset Cleanup 2026-05-27
- Scope: identify and remove art files that are clearly unused by the local web project.
- Safety rule: broad game asset folders may be referenced dynamically by IDs or manifests, so only remove files with strong evidence of being generated verification screenshots, temporary source assets, or orphaned UI art.
- Runtime-confirmed removals: `battle-bg.png`, `message-banner.png`, `move-card-frame.png`, five unused pet-box UI placeholders, and five verification screenshots.
- Preserved dynamic asset directories: `portraits_256`, `heads`, `skills`, `abilities`, `ability-buffs`, `conditions`, `types`, and `items`.
