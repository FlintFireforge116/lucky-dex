# LuckyDex 0.69.320 — Legendary Treasures / Radiant Collection Master Checklist Audit

**Set:** BW11 Legendary Treasures · **Date:** 20 November 2026 · **Previous APK:** 0.69.319, successful GitHub Actions run `44806456158` · **This patch:** 0.69.320 (APK not yet built).

## Sources and scope

- Official PokémonTCG/pokemon-tcg-data `cards/en/bw11.json`, pinned Git blob `e4e09d569e76c71943e2399221c9f904b4420096`.
- All **140 printed collector numbers**: 115 main numbered prints and 25 `RC1–RC25` Radiant Collection prints; 220 attacks and 19 abilities.
- `source/docs/LUCKYDEX_MASTER_RULES.txt`; Classic battle-effects/core and physical Basic vs Special Energy ledgers; set metadata, CPU deckbuilder, source-generation / test-gating, and cross-set regression suites.
- Independently reviewed code paths and added direct effect outcome tests. Not a statement that every action on every printed card has been exercised on an Android device.

## Verified fixes included

| Card / system | Prior behaviour | v0.69.320 change / validation |
|---|---|---|
| Gardevoir RC10, Eternal Radiance | Moving damage counters did not apply the shared attack-lock | Uses named `Eternal Radiance` next-own-turn lock; `Psybeam` remains available; transfers actual damage counters |
| Altaria #92, Cleave | Two heads discarded just one Basic Energy counter **per type** | Discards every Basic Energy counter, including multiples of the same type, and each physical Special Energy card with original UID to target owner's discard |
| Mewtwo-EX #54, X Ball; Cobalion #91, Energy Press | Selected multi-unit Special Energy could count as one; flexible types could be overcounted | Effective Energy-unit count uses shared Core calculation (including Crystal Beach and conditional Scramble/Boost); isolated-context fallback distinguishes flexible Rainbow/Blend units |
| Carnivine #5, Ambush Bite | Choice/provenance required confirmation | Regression confirms heads-only bonus, tails no discard and explicit physical Energy selection |
| Meloetta-EX RC11/RC25, Brilliant Voice | Wrote status flags directly, bypassing immunity and exclusive-condition replacement | Uses standard Status engine for both heads and tails; tests immunity and previous-condition cleanup |
| Servine #7, Wring Out | Paralyzed before ordinary effect-resolution checks | Applies at the correct attack-resolution stage, respects immunity, and doesn't reroll when choosing Energy to discard |
| Audino RC17, Relaxed Roll | Its printed “until tails” wording variation could miss the attack mapper and gate a legitimate card | Explicit `coinUntilTails ×30` mapping; generation regression verifies battle-enabled |
| Cinccino RC19, Echoed Voice | Radiant Collection reprint missed the original Echoed Voice attack mapping | Reuses next-own-turn +50 attack rule and regression tests timing |
| Energy Switch, Aqua Boomerang, Garbotoxin | Cross-system provenance and suppression issues prone to regressions | Direct tests verify Basic-only Energy movement, attached card UID return and ability suppression while a Tool remains attached |

## Coverage and automated testing

- Existing **0.69.319 APK succeeded** on GitHub Actions. Its official generation log reported **131 of 140 battle-enabled**, gated: `bw11-23`, `bw11-56`, `bw11-80`, `bw11-87`, `bw11-106`, `bw11-110`, `bw11-RC16`, `bw11-RC17`, `bw11-RC19`.
- The new two explicit mapping corrections for RC17 and RC19 are **expected** to give **133 of 140 battle-enabled, seven gated** after regeneration. This number remains *unconfirmed* until GitHub runs the new build. The full 140-print catalogue remains registered, including the gated cards.
- Local cross-set tests (BW6 to BW11): **168 registered; 164 executed passes, 0 failures, 4 skipped**. Four tests require generated official BW11 source: two existing original-suite checks and two new audit checks. Those are not counted as passes.
- New `tests/v07320-bw11-master-checklist.test.cjs` has **13 tests**: 11 executed locally, 2 source-dependent. It runs in CI after official generation along with the existing BW11 integration suite; this is not a replacement or bypass of the real checks.
- Conditional Special Energy scenarios checked against the battle Core API; both Crystal Beach suppression and activated Scramble values must continue to match Core's effective Energy calculation.
- Source-generated official deck-builder integration and the Android debug APK compile are not verified locally in this audit; the GitHub build will run those checks on push.

## Remain gated — seven complex cards

| Collector ID | Card | Open mechanism |
|---|---|---|
| 23 | Victini | Victory Star whole attack coin-sequence reroll, once per turn |
| 56 | Xatu | Fortunate Draw with non-coin Rock–Paper–Scissors vs CPU/human |
| 80 | Lucario | Reflexive Retaliation after damage, including attacker surviving the knockout |
| 87 | Spiritomb | Sealing Scream preventing both players from playing ACE SPEC cards from hand |
| 106 | Druddigon | Rough Skin after attack damage, including knockout timing |
| 110 | Cedric Juniper | Face-down Pokémon height guessing and opponent/player card draws |
| RC16 | Ursaring | Picnic Weather real Teddiursa discard-to-Bench and matching Energy/trigger transfer |

These prints must remain available in collection/browse UI but unavailable in battle-ready auto-built decks until each printed mechanic is correctly implemented and tested. The set is not yet 140/140 battle-ready.

## Packaging / release

Source-relative ZIP extracts directly to `~/lucky-dex/source`; no extra Termux preparation script. Version and GitHub Gradle audit gate updated. Run `git add source`, `git commit`, `git push` as usual. Confirm GitHub Actions APK build and official **133/140** expectation before considering the audit merged.
