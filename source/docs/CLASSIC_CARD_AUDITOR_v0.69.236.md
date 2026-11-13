# LuckyDex v0.69.236 — Classic expansion auditor

## Purpose and usage

This is a **lightweight automated preflight** for a Classic TCG expansion, not a substitute for reading every printed card or using the Android UI. It is installed under `source/scripts/audit-classic-set.cjs` and loads the actual Classic card registry, the shared battle-effect validator, CPU opponent generator, and optionally the battle core. It uses only Node's standard library; no npm install is required.

From your repository:

```sh
cd ~/lucky-dex/source
node scripts/audit-classic-set.cjs --set dp2 --smoke
```

Outputs `source/generated/classic-audit-dp2.json` and `.md` and exits with a failure status when it finds a **definite** error. `--no-write` prints the summary only. `--no-cpu` skips CPU deck generation. `--all --no-cpu` scans all registered Classic sets to identify historical technical debt (older sets may have genuine or schema-era-specific warnings). With `--set <id>`, the auditor can run for any set in the battle data registry, including a partially implemented upcoming set. `--smoke` intentionally supports one set at a time.

The default target is `defaultSetId` in `source/data/classic-card-audit-contract.json`; change that field when starting a new expansion. The GitHub APK workflow runs the auditor's tests and the configured set's preflight **before** building the APK. This adds a short automatic gate on every push. Do not switch the default target until the new expansion is integrated into the main Classic data registry.

## What it actually validates

1. **Set completeness and registrations:** declared print totals, unique card IDs, main card lookup, enabled/partial status and deck eligibility mismatch.
2. **Effects:** known effect primitives and parameters via the same runtime effect validator, absent or explicitly incomplete effects, stale printed placeholder descriptions, and a *heuristic* scan of named custom dispatch rules.
3. **Evolution and deck metadata:** missing/unknown parents, level-up prerequisites, attack Energy cost codes, basic role/synergy array structure and contradictory Energy plans.
4. **Manual review inventory:** optional choices, private information, coin tosses, move timing, Energy movement, status effects and deck searches. The report lists exactly which card IDs need dedicated scenarios rather than treating these risks as a success/failure counter.
5. **CPU builder:** for a fully enabled set, build 30-card decks at eight Energy types × two seeds, and validate actual resulting deck legality. Partially implemented sets produce review items rather than hard builder failures.
6. **Optional live synthetic execution (`--smoke`):** create legal Classic battle state and try each enabled attack and Trainer from **both player and CPU sides**. Automatically resolve choices, deliberately stop optional repeatable Energy movement, and avoid identical Wager responses endlessly tying. Exceptions, missing legal actions and unresolved choices are separately reported; successful execution is **not** printed-effect correctness.
7. **Evidence ledger:** name every card's effects, risk tags, and test files that mention its collector ID. A static mention is not an outcome assertion; reviewers must inspect/test concrete pre- and postconditions.

`source/data/classic-card-audit-contract.json` maps those checks to the relevant `C-RELEASE-GATE` clauses of `source/docs/LUCKYDEX_MASTER_RULES.txt`. The TXT document remains the normative source for rules and human judgment. The JSON is intentionally a small set of executable gate definitions and risk patterns, not a duplicate copy of the whole TXT document.

## v0.69.236 baseline results (dp2)

- **124/124 enabled, 0 definite catalog/effect errors, 0 metadata warnings.**
- **16/16 generated 30-card CPU decks valid** across eight types and two seeds.
- **356/356 attack/Trainer action paths execute** in synthetic player-and-CPU battle states; 0 skipped or unresolved synthetic choices.
- **168 attacks, 37 abilities, 10 Trainers, 3 Energy prints** represented in the ledger.
- Risk tags and a small number of nonblocking *manual review* flags remain. These are not equivalent to actual defects. Printed effect branches, real-world CPU decision quality, Android card-art choices, prize timing, coin animations and device UI are still part of the independent human/targeted-test audit.

During development of the preflight, the checker caught **Glalie #25 Craggy Face** and **Dewgong #45 Cold Fat** displaying a stale `remains gated` ability description even though the shared core already implements their damage-reduction behaviours and previous outcome tests exercise them. Their displayed descriptions are updated; no new damage engine semantics are claimed here. We retain review flags for any passive resolved directly by the battle core so the next full set audit can verify suppression and ordering.

## Shipping checklist for the next set

1. Add all printed cards into the Classic registry, with unfinished cards explicitly `PARTIAL` and unavailable.
2. Update `defaultSetId` in `source/data/classic-card-audit-contract.json` to the new set ID.
3. Run the auditor during implementation and fix its hard errors; investigate warnings, especially missing evolution branches and unusable Energy plans.
4. Implement focused two-sided regression tests for the flagged special mechanics, including real choice options and pre-/post-resolution state; do not call a generic no-crash smoke a card-certified outcome.
5. Run `node --test tests/v07236-classic-card-auditor.test.cjs` and `node scripts/audit-classic-set.cjs --smoke` plus the set's and cross-era regression suites. Inspect Markdown + JSON ledger and record any untested edge cases honestly.
6. Push to GitHub. The APK workflow will now reject definitively broken Classic metadata/effects and malformed CPU decks for a completed configured set. Android gameplay testing is still required.

This patch is only a developer tool, two display-description corrections, CI preflight integration and version bump. It adds no expansion cards and does **not** claim to fix older unrelated historical issues.
