# Adventure regional roguelike — v0.32.0 plan

Approved brief: the attached systems request. This is an additive extension of v0.31.0, not a replacement collection/save model.

## Source audit and architecture
- Save remains `luckyDexSave`, current save version 7. Ownership is keyed by `id:n` / `id:s`, with count, level, remaining EXP, metadata and a three-member team. Preserve all keys, values, currencies, cards, Dash records and old `adventureV2` runs.
- Existing EXP curve is `80 + 30 × level`, cap 50. Centralize normalization, grants and move learning in `adventure-progression.js`; safely fill missing level with 5, retain valid level/EXP and initialize moves from verified learnsets.
- Add `adventureRegional` (schema 1) and `tmInventory`; one serializable seeded run owns choices, HP, PP, enemy teams, node claims and completion. Save every action before animation; suspension disposes visual work only.
- Data modules: nine-region registry, three populated campaigns (Red/Blue Kanto, Gold/Silver Johto, Emerald Hoenn), eight Gyms, four Elite Four and Champion each, distinct location encounter pools/events. Other regions are clearly unavailable, no invented tables.
- Regional engine: three branching encounter layers and one checkpoint per location; distinct wild/trainer, healing/TM/event/shop, rare/cache choices. The final location is Victory Road, followed by a five-trainer League gauntlet.
- Persistent owned levels/EXP remain useful. Regional combat starts at at most level 8 with a stage cap increasing by four; high-level collections retain their permanent levels and learnsets while campaign battle levels are capped. Regional battle EXP advances both campaign and owned progression, preventing instant early-game trivialization. Document values and adaptations in balance notes.
- Shared battle module: actual move IDs, power/type/category, PP, simplified heal/guard/status effects, sequential opponent teams and smarter move choice for bosses. Compatibility aliases `quick` / `type` use real moves; no visible placeholder attacks. Preserve Roam/capture semantics and existing lifecycle API.
- New phone UI: regional selection, current chapter node graph (large buttons), badge strip, next Gym / overall progress, party HP/PP, battle, result, and searchable filtered TM/move-learning flow. Keep legacy expeditions reachable through a separate explicit entry.
- Ball Drop is an independent change: matching sloped triangle visuals/collision, mirrored containment, powers and rewards preserved, small deterministic impulse only as a secondary failsafe.

## Verification and implementation ledger
- [x] Tests first: level/EXP migration, moves, TM compatibility/replacement, regional generation/actions/claims, enemy team progression and mobile lifecycle.
- [x] Implement progression, regional engine and shared real-move combat; preserve old saves and old run state.
- [x] Implement phone regional/map/move UI and actual app integration; inspect screenshots.
- [x] Integrate validated regional/move data and Ball Drop changes; review system interactions.
- [x] Run targeted + full existing inventory, compare inherited failures, offline audits, Android build/signing.
- [x] Bump to 0.32.0 / 320, package source and APK, extract exact source ZIP and rerun contracts; hash handoff files.

## Assumptions and intentional scope
- Initial three regions are enough to validate reusable architecture without placeholder content for nine regions.
- Mainline teams are compressed into sequential singles fights; this is not a double-battle simulator. Gym order uses a fixed badge sequence rather than free-form overworld traversal.
- Existing national default-form species data and local art are reused; moves/teams are verified from source datasets. Status/damage categories are adapted transparently, not represented as a full official simulator.
- No achievement, pack theatrics, collection search, prize-currency or Voltorb changes are included.

Independent review: enemy residual status damage, captured permanent-level cap bypass, and owned move synchronization cap bypass fixed with red-to-green tests. Added guarded regional TM replacement, capped EXP and three-slot capture safeguards. Engine structure supports variable checkpoints/trials/tournament finales without populated placeholder region content.

Final full inventory: 162/175; all 13 failures baseline-confirmed. New feature programs15/15, Ball Drop15/15, Dash11/11, legacy shared battle18/18. Android build/signing and5,869 source assets verified. Archive outcomes recorded in sibling verification JSON.
