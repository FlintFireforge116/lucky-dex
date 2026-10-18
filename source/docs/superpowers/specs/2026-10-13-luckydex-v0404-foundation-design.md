# LuckyDex v0.40.4 Foundation Design

## Intent

This is the first implementation slice of the reusable LuckyDex continuation plan approved on 2026-10-13. It deliberately tackles changes that can be made and verified from the supplied v0.40.3 source without external asset sourcing or a Codex handoff.

## Scope

1. Adventure local-action cleanup: remove local Wild Hunt, merge route wild/rare/cache entry points into a single meaningful `EXPLORE AREA`, retain explicit TRAINER/Gym actions, and remove no-op generic Explore buttons.
2. Journey Map: the in-journey MAP tool opens an active-region journey overview rather than the region picker. Kanto uses the bundled FireRed-derived Kanto map art; other active regions get a journey overview without changing region.
3. Battle foundation: sticky Fight/Bag/Pokémon drawers, visible player EXP, generic 2–5/multi-hit move execution, delayed Yawn sleep, and Power/PP comparison on move replacement.
4. Poké Mart: user-selectable quantities, atomic cost/inventory calculation, and one Premier Ball per 10 Poké Balls purchased.
5. Small regression cleanup that is safe in this slice: remove full regional journey from daily challenge selection, harden Card Binder mode switching, and add shared bottom-nav clearance where the existing Arcade page container is the source of clipping.

## Explicitly deferred

- Replacing every Kanto location vignette with authentic location-specific map assets.
- Rock Harden content expansion.
- Shared rare reward framework and Tile Puzzle/Berry Picker/Unown jackpots.
- Dedicated Achievements sub-screen (kept for a focused Profile pass).

## Constraints

- Preserve v0.40.3 save shape and existing player progress.
- Existing transaction rollback semantics remain intact.
- No local action may become a progression RNG gate.
- Rare / Wild Hunt mechanics remain available through their dedicated systems even when removed from route menus.
- No production behaviour change without a focused failing regression test first.
