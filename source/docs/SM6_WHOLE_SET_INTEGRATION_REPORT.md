# LuckyDex SM6 Forbidden Light — whole-set integration and test report

**Release version:** v0.69.418  
**Date:** 23 November 2026  
**Status:** whole-set source registration and reused-mechanic pass; **not a completed playable set** until the generated coverage ledger and missing complex mechanics pass independent battle tests.

## Canonical source and scope

- Source: PokémonTCG/pokemon-tcg-data, immutable upstream commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, `cards/en/sm6.json`.
- Verified blob SHA: `7c9956b85945322c9c981db7a231be36fc524224`.
- 150 official prints: 1–146 plus additional collector numbers `2a`, `102a`, `112a`, `113a`.
- 120 Pokémon, 27 Trainers, three Special Energy prints; 211 printed attacks, 25 printed Abilities, 26 GX prints, five Prism Star prints.
- **The generated playable count is unknown locally.** The compact card source and its attestation must be fetched on a network-connected Termux device by `sh source/scripts/prepare-sm6.sh`, which writes `docs/SM6_BUILD_COVERAGE.json` and `docs/SM6_CURRENT_GAP_LEDGER.md`. Never infer complete playability from the number of mapped effects or passing tests.

## Implemented in this consolidated pass

- Added SM6 to game and CPU card catalogue, deck builder, opponent generator, set picker, HTML loading and printed ID lookup.
- Added SHA-verified, full 150-print generator preserving attack costs, printed text, Abilities, GX status, Prism Star metadata, physical card rules and alternate art variants. Unsupported mechanics are explicitly gated and cannot be used in battle or a deck.
- Reuses the existing SM1–SM5 verified effect registry by printed-text signature. Adds 51 locally text-locked SM6 attack descriptors, including conditional damage, field counting, Bench-target damage, attack restrictions, recovery and opponent status. Mappings are individually validated by the engine but not assumed to prove every card playable.
- Added one-unit Unit Energy FightingDarknessFairy support for physical prints `sm6-118` and `sm6-146`, with no multiple-colour overpayment and shared player/CPU accounting.
- Added first-pass Abilities and Trainer effects only where existing execution supports them. New effects whose cost, trigger or card movement is not verified remain gated.
- Updated Android version `0.69.418`, build code `7418`, older source contract versions, stale regex assertions, release-guard parity, and the pre-generator deck-quality exemption. Preserved existing card logic and older expansion tests.
- Added tests `v07440` full generated catalogue (runs after canonical source preparation), `v07441` energy/schema, and `v07442` actual battle outcomes.

## Local verification actually completed

| Check | Result |
|---|---|
| SM6 static release-contract and Gradle parity | PASS |
| SM6 local energy/schema tests (v07441) | 4/4 PASS |
| SM6 battle outcomes (v07442) | 7/7 PASS |
| SM5 Stages 2–13 gameplay regression | 227/227 PASS |
| Crimson Invasion SM4 complete preflight | 124/124 PASS |
| Burning Shadows SM3 complete preflight | 147/147 PASS (deck-quality gate updated) |
| Guardians Rising SM2 complete preflight | 115/115 PASS (deck-quality gate updated) |
| Sun & Moon SM1 generated test suites, bounded concurrency | 65/65 PASS |
| Evolutions XY12 full preflight | PASS; 113 prints enabled and the bundled deck-quality suite passes 10/10 |
| Local SM6 full generated 150-print suite (v07440) | **NOT RUN** — source file not present locally; required in Termux |
| GitHub Actions APK build | **NOT RUN** — requires user push |

## Outstanding mechanics — block rather than fake

The SM6 generator produces an exact print-level list, grouped by effect blockers. The new mechanics still needing their complete battle execution and player/CPU audits include:

- Ultra Beast mechanics: Beast Ring, Beast Energy ◇, Ultra Recon Squad, Ultra Space and Prize-based GX effects.
- Prism Star effects and specific card triggers: Volcanion ◇, Diancie ◇, Arceus ◇ and Lysandre ◇. Existing one-copy/Lost Zone rules alone are not sufficient.
- Advanced Pokémon effects: Naganadel-GX Stinger-GX, Greninja-GX evolve-from-hand triggers, Malamar Psychic Recharge, Yveltal-GX Doom Count-GX, Ultra Necrozma-GX's Energy discard/GX damage, and remaining special passive Abilities.
- Trainer/Tool/Stadium exceptions: Bonnie, Metal Frying Pan, Lysandre Labs, Mysterious Treasure and any genuinely unhandled printed choices. **Energy Recycler** and **Secret Blessings** deliberately remain gated because the existing generic discard-search handler returns physical cards to hand, whereas those prints require returning them to the deck.

No partial implementation should mark those prints `battleEnabled` until outcome tests exercise actual card identity, source/destination, legality, and real opponents.

## Installation / release gate

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.418_SM6_FORBIDDEN_LIGHT_FULL_SET_INTEGRATION.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
sh source/scripts/prepare-sm6.sh && \
git add source && \
git commit -m "LuckyDex v0.69.418 Forbidden Light full-set integration" && \
git push origin main
```

**Do not push if preparation fails.** SM5 is prepared first because GitHub's SM6 Gradle task depends on SM5's generator and audits. The SM6 preparation step creates the exact playable/gated ledger. A **complete-set** claim separately requires:

```sh
cd ~/lucky-dex/source
python3 scripts/audit-expansion-readiness.py --set sm6 --require-complete --check-release --report docs/SM6_CURRENT_GAP_LEDGER.md
```

That last command is deliberately expected to fail while any cards remain gated; it is a completion test, not the partial integration build gate.
