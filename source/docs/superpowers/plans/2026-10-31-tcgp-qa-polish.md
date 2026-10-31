# TCG Pocket QA/polish v0.69.37 implementation plan

Goal: preserve supplied v0.69.36 features while finishing deck QoL, Solo progression, records, battle feedback and more real card mechanics.
Spec: C:/Users/sjwal/.codex/attachments/c1c2c1de-7df0-4972-863b-88b7e738d6f1/Pasted text.txt
Source of truth: lucky-dex-main.zip SHA256 40bbd6a980e3a8bd64cd4ce7af87abbfc9dcff8ec34635bc2a4a507ad7ef4e70; Git baseline d1deb0b083bef83d9d736d37049c04b826da5e00. Build labels 0.69.35/7016 are stale; user confirms this is v0.69.36. New release 0.69.37/7018.

Architecture: extend existing UMD reducer, visual editor, workspace, deck algorithms and achievements provider. No old workspace/code imported. Card support stays conservative. All changes use red/green tests and real card/whole-battle validation where practical.

## Audit before behavior
Confirmed 2450 identities, 1707 FULL, 743 PARTIAL, 0 UNSUPPORTED; cutoff October30; 4534 released prints. Confirmed missing dirty guard, default-destroying filter reset, unrestricted type filters, saved-deck rename/art selection, useful recipes, CPU levels, Solo roster and log-based records. Hero text still says prototype/first slice. Opponent sleeve hard-coded to default. Progress normalization discards new fields. Existing browser geometry/interactions baseline running separately. Dual C1 tests are green before modifications.

## Tasks and ownership
- [x] Deck editor/workspace: snapshot dirty state + Save/Discard/Cancel, saved management/preview, preferred owned print, filter summary/clear/default/type constraints, coherent recipes and Developer details. Own editor JS/CSS/workspace, new deck tests. Verify actual browser navigation/save/reload and ownership/copy legality.
- [x] Solo/AI/progression: four public-information legal-action AI tiers; 16 legal coherent challenge decks; unlocking and first-clear-safe rewards; idempotent records and normal achievements. Own Solo/AI/progress/provider + tests. Verify full matches and state/reward replay.
- [x] Mechanics: classify exact blockers; reuse existing operations/compositions; preserve dual types and restrictions. Own normalizer/core/effects + tests. Root alone regenerates catalogue. No fake FULL or no-ops.
- [x] Root integration: navigation dirty guard, home challenge selection/records, chosen sleeve both sides, inspection/failed-action feedback, state migration fields, selected-print battle display, version marker alignment. Tests before changes.
- [x] Root release audit/reporting: check post-cutoff releases, include provenance and explicit unavailable/unreviewed data, report per-set unique counts and delta from exact archive; full relevant regression runner (whole historical suite explicitly not claimed); independent review; APK and changed-file delivery with baseline hash audit.

## Shared contracts
Editor requestLeave(callback) invokes callback clean or after successful Save/Discard, never Cancel; root routes app navigation through this guard. Recipes exposed as workspace.RECIPES metadata shared with Solo where legal. Solo CHALLENGES includes difficulty, Energy, firstClear/repeat; createBattle annotates challengeId/difficulty/battleId/testMode. Progress helper fields preserved by decks.ensureBattleState. No separate AI mechanics; only legalActions/applyAction and public board information. Root owns BattleUI and main app wiring.

## Review focus
Reload/replay must not duplicate rewards; leaving/replacing drafts must never silently discard; preferred art must not alter mechanics/copy limits/ownership; AI must not inspect hidden hand/deck; future released sets must not be silently treated as current complete coverage. Existing portrait drag/inspect/Bench geometry, auto Energy, paired test setups and achievements remain intact.

## Final verification and limits

See docs/TCGP_IMPLEMENTATION_REPORT_v06937.md and delivery QA evidence. Release remains limited to the reviewed October30 inventory, with First Partners explicitly tracked as a released source gap. No Android device was available; APK build/signature/assets are checked, installation is unverified.
