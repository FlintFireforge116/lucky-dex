# Adventure 2.0 implementation plan

Specification: `REQUEST.md`; design/contracts: `DESIGN.md`. Execute the authorized overhaul inline with focused independent asset/model/battle tasks; root integrates the single owner.

1. Audit baseline mechanics, economy, saves, public hooks and DOM consumers. Preserve v0.22.3 source/checkpoint; capture baseline screens.
2. Pure deterministic state/route/event/perk model with failing-to-passing tests: many seeds, connected reachable boss, support, choices, event idempotence, unknown-field migration and run serialization.
3. Authentic FRLG local map/environment/battle/trainer/object assets plus complete offline species metadata. Verify encodings/hashes, document sources and inspect asset contact sheets.
4. Battle engine/presentation module retaining economy and shared Pokémon semantics; test commands, capture, faint, switch, supplies, five boss modifiers and resumed actions.
5. One Adventure controller: immersive map/destinations, contextual Roam, chain/discoveries, branching route, events/perks/camp, boss/results, compact party/Bag and retreat/resume flows.
6. Deliberate core extraction: remove old Adventure implementations/DOM/handlers; wire bridge/navigation/back/pause/save refresh without changing other systems. No appended override generation.
7. Browser regressions at three phone sizes plus reduced usable viewport; repeated routes, offline errors, reload/process-style persistence, exactly-once rewards and resource cleanup. Retain full existing suite for Arcade/Cards/Trade/Collection/Packs.
8. Inspect all requested visual scenes/contact sheets and iterate. Focused independent review; repair important findings with reproduced regressions.
9. Freeze v0.23.0 / code230 only after integration gates; build original-signer APK, verify packaged source/assets, export source/QA/report/hashes. Record native device limits explicitly.

Progress/rulings: `PROGRESS.md`. Each stage gets a logical commit; no final half-migration checkpoint.
