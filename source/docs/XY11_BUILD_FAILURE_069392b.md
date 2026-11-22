# LuckyDex Steam Siege v0.69.392b — CI deck-quality repair

Both GitHub APK builds (workflow runs 45058315119 and 45061209660) failed at task `:app:auditV07333ClassicDeckQualityForApk`, not during Android compilation or the XY11 attack-cost tests. The 76-playable-print Stage 2 catalogue has only a small number of functionally usable Trainer prints in a single-set build. The generic builder previously relaxed its 18-Pokemon cap only when **raw Trainer count** was <=4; XY11 had seven enabled Trainer prints, but several required Fossil, Spirit Link, physical Special Energy or matchup-specific targets. The competitive seed assembled 22/30 cards, and CI stopped.

Changes:
- Emergency mono-set builder uses `trainerIsUseful` to count functional Trainer prints; keeps ownership, energy, no-dead-Trainer, 4-of, and complete-family checks.
- All-set regression asserts 30/30 for every locally populated set and two styles; its expected count tracks registered non-stub sets (at least the previous 59).
- XY11 full preflight also executes the exact CI cross-set 8-test quality suite, plus 2 new XY11 regression tests.
- No gameplay effect mappings or printed attack costs changed; app version remains v0.69.392 for this build-only hotfix.

This patch was locally tested using the supplied repository ZIP plus the latest v0.69.392 overlay. GitHub APK success must still be checked after applying and pushing.
