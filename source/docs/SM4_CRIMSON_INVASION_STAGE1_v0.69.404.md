# LuckyDex v0.69.404 — Sun & Moon: Crimson Invasion (SM4), Stage 1

## Release scope

- Added all **126 distinct SM4 collector prints** (#1–124, 63a and 84a) to the player and CPU catalogue, set picker and deck builder. The pinned official source includes **193 attacks**, **23 Abilities**, **25 Pokémon-GX prints** and **4 Energy prints**.
- **54/126 prints are battle-enabled** in this first release; **72 remain deliberately gated** until every printed attack, Ability, Trainer or Energy rule on each card is correctly supported. Gated prints remain represented in the catalogue but are excluded from battle decks. Do not remove the gates merely to inflate coverage.
- The original SM4 card source is bundled offline in `data/classic/sm4-print-compact.json` and verified by SHA-256 before generation. The GitHub/Gradle build must never depend on a runtime fetch for this set.
- Implemented and exercised initial supported effects on **both player and CPU**. The release outcomes test includes Pikachu Pika Draw, Cacnea Sucker Punch's Darkness condition, Silvally-GX Rebel-GX and Gyro Unit, Piloswine Rest, and Regirock's Registeel-only attack modifier. Unimplemented complex GX, Ability, Trainer, Stadium and Special Energy mechanics remain gated.
- Retains the Energy Zone hybrid rules: Basic Energy searches use independent per-Energy flips when translated to Energy Zone retrieval; physical-card searches, Special Energy attachment, discard recovery and printed exceptions are not turned into free Energy.

## Mandatory tests and acceptance

`python3 scripts/preflight-sm4-release.py --full`

This checks offline print source, version and registry assertions, generated coverage, actual attack completions, effect outcomes, and historical XY10 and Energy-search rules. `preflightSM4ContractForApk`, `generateSM4ForApk` and `auditSM4ForApk` must remain linked to Gradle's actual APK build. The old cross-set Gradle/source tests must accept app version **0.69.404** while continuing to verify gameplay. Do not claim a GitHub build passes solely on local green tests.

## Future audit checkpoints

Verify all 126 canonical collector IDs (including the alternate-numbered prints), costs and exact printed attack texts; GX used once per game; per-side deck quality; player and CPU choice completion; physical vs Energy Zone conservation; Stadiums, Tools and passive Abilities; bench and prize rules; and cross-set regression tests. Re-enable a gated card only after the actual engine outcome is tested.
