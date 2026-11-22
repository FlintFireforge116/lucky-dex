# XY9 BREAKpoint — mechanic-first first-pass integration (LuckyDex v0.69.378)

**Baseline:** v0.69.377 BREAKthrough independent audit (GitHub Actions run #45023013473 succeeded on 2026-11-22).

**Official catalogue:** `PokemonTCG/pokemon-tcg-data/cards/en/xy9.json`, pinned commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, Git blob SHA `dcfa9ec1b6b0ff6a0b446114c9d567c598cf71ce`.

- 126 distinct printed cards (including alternate numbers 98a, 98b and 107a).
- 159 attacks, 14 Abilities, 5 BREAK Pokémon.
- **Projected approximately 91/126 battle-ready, 35 gated** based on verified mechanic mappings. Treat `docs/XY9_BUILD_COVERAGE.json` as authoritative after the GitHub generator; it is generated at APK-build time.
- A disabled card is still catalogued for identity/collection, but it MUST NOT enter a playable deck or be treated as fully implemented.

## What is reused

The existing LV.X/BREAK previous-evolution inheritance, Stage and Bench evolution rules, Mega Evolution plus Spirit Link exemption, conditional bonus damage, coin damage, statuses, damage counters, Stadium handling, Zone Energy search, and standard Trainer choices. Separate print IDs share effect implementations only where their printed effects agree.

## New, tested additions

1. **Gyarados-EX — Stormy Seas**: repeat flips until tails, then consume eligible Water Energy from the Classic Energy Zone, or present a physical card-selection prompt when the 30-card draw deck actually contains Basic Water Energy. This is the standing Energy Zone conversion rule; do not silently award inexhaustible free Energy.
2. **M Gyarados-EX — Blast Geyser**: optional +20 damage per Water Energy attached, with a two-card deck discard after the choice; omit the discard if the player declines the bonus.
3. **Manaphy-EX — Aqua Tube**: Water-attached team member gains no Retreat Cost, using the existing modifier engine.
4. **Trevenant — Nervous Seed**: an opposing Basic's attack costs one more Colorless while Trevenant is Active. Trevenant BREAK inherits this passive through shared previous-card logic.
5. Gyarados and Scizor Spirit Links are mapped to their matching Mega Pokémon and guarded against irrelevant deck-builder inclusion.
6. Explicit regression tests for printed identity, version synchronisation, all enabled DSL effects, two auto-built decks, actual Energy movement, optional attack damage, and shared passives.

## Remaining cards (group by mechanic — do NOT tackle as 35 unrelated implementations)

| Mechanic family | Printed numbers |
|---|---|
| New attacks, choices and Ability interactions | 6, 20, 21, 30, 31, 33, 35, 40, 41, 49, 57, 59, 62, 67, 68, 70, 73, 80, 83, 93 |
| Stadiums, Tools, Supporters, Items, Energy | 96, 97, 98, 98a, 98b, 99, 102, 103, 104, 108, 109, 110, 113 |
| Strict **Basic** Fire Energy condition (not flexible Special Energy) | 92, 121 |

Priority shared hooks: global Ability suppression (Greninja/Garbodor), two-faced Stadium (Reverse Valley using Parallel City infrastructure), multi-card Trainer action (Puzzle of Time), exact-card return following KO (Splash Energy), activated attack-copy and discard-selection UI. Verify CPU and human targeting on both sides. Do not mark any currently gated card playable merely because an attack looks simple if any other printed effect remains absent.

## Build order and tests

`app:generateXY9ForApk` runs **after** the completed XY8 audit and **before** `app:auditXY9ForApk`. The whole-app early deck-quality test explicitly skips XY9's temporary source stub. On GitHub, the post-generator XY9 audit verifies all 126 print IDs, attack Energy costs and validation of every enabled effect, and generates competitive/random 30-card decks to check Energy compatibility, legality and dead Trainers.

Local source-only mode skips the 126-card generated catalogue check; **never claim a successful APK build based solely on local test passes**. Verify the GitHub Actions run after pushing.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.378_BREAKPOINT_MECHANIC_FIRST.zip -d source
git add source
git commit -m "LuckyDex v0.69.378 BREAKpoint mechanic-first integration"
git push origin main
```
