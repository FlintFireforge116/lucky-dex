# Stormfront (DP7) — v0.69.261, one-pass integration report

**Source archive:** Pokémon TCG Data `cards/en/dp7.json`, bundled under `data/classic/dp7-print-source.json`. All **106 official prints** are registered, covering 103 numerical prints and three SH collector cards. Art URLs, stages, Pokémon stats, weaknesses, resistances, retreat and printed descriptions are retained.

## Current verified scope

- **90/106** have executable battle outcome definitions and are admitted to deck-building and CPU deck generation; **16/106** are intentionally gated until printed effects can be resolved correctly. This is **not** a claim of a fully finished 106-card playable set.
- Source/JavaScript registration is connected through `tcg-classic-battle-data.js`, set picker, opponent generator, deck builder, Android asset loading and v0.69.261 version labels.
- Existing battle engine routines reused for attacks, statuses, damage modifiers, selected targets, Energy movement, ability activation and Special Energy attachments.
- The paired Trainer + resolution system is intentionally **not simulated as generic one-card trainers**. Energy Link is **not** made playable as an inert Tool.

## Pending prints (gate before build)

1. 7 Mismagius — Tool/TM discard choice and Horror Chant.
2. 11 Torterra — delayed Land Shake and Sunshine Song evolution chain.
3. 16 Drifblim — Lifting deck-to-Bench-plus-Energy assignment.
4. 17 Dusknoir — between-turn Spirit Pulse.
5. 21 Mamoswine — restartable coin-chain/self-damage.
6. 30 Tyranitar — reactive Darkness Drive.
7. 48 Sableye — Impersonate and Overeager starting-player rule.
8. 83 Energy Link — Tool-holder restricted repeatable physical Energy transfer.
9. 87 Marley's Request — opponent chooses from differing named discarded Trainers.
10. 88 Poké Blower + — one- or two-copy branch and target.
11. 89 Poké Drawer + — one- or two-copy branch.
12. 90 Poké Healer + — one- or two-copy branch.
13. 96 Dusknoir LV.X — conditional Knock Out into a Stadium.
14. 97 Heatran LV.X — Burn persistence and discarded attack-Energy recovery.
15. 99 Raichu LV.X — hand Energy discard, selected Bench hit and second attack.
16. 100 Regigigas LV.X — deliberate friendly KO and physical Energy retrieval.

## Checks

- `sh scripts/prepare-stormfront.sh` — complete offline regeneration and **11/11** source-level Stormfront tests passed, including all enabled attack actions, sampled CPU 30-card builds, a subset of passive mechanics, and Special Energy switches.
- Selected previous-set tests: **56/56** passing (DP6 complete/independent audit and Fossil dependency suites). Updated the previously hard-coded old-version assertion to check cross-file version agreement instead.
- Node syntax and Python code checks run on modified files. **Actual Android APK build and phone interaction testing not performed locally**; pushing to GitHub starts these steps.

This release is a substantial integration rather than completion. Do not remove gates merely to make the coverage report say 106/106.
