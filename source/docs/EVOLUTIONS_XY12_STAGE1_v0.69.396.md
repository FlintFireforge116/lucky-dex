# LuckyDex v0.69.396 — XY Evolutions (XY12), Stage 1

## Verified source and current release status

* XY12 is the final main XY-era expansion: **113 official printed cards**, 83 Pokémon, 20 Trainers, 10 physical Energy, 129 printed attacks, 11 printed Ability printings and 4 Pokémon BREAK, with no dual-type Pokémon.
* Source: pinned PokémonTCG/pokemon-tcg-data `cards/en/xy12.json` at commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, Git blob `7e80c06b0f3e5621058a29e26c90023d1033e65f`.
* All 113 prints are available in the in-app catalogue. **83 are gameplay-enabled and 30 remain gated** for missing/timing-sensitive effects. Do **not** describe this as a completed 113-card gameplay implementation or final independent audit.
* Alternate-art/secret prints are preserved, not silently deduplicated. Generic attack names do not imply equivalent effects across card numbers.
* Reused and validated engine effects include Poison/Paralysis attacks, Mega Spirit Link exemptions, multiple bench hits, per-coin damage, self-damage, discard restrictions, face-down effects, selected attack locks, and Pokémon BREAK inheritance.
* The printed Basic Energy reprints `xy12-91` to `xy12-99` are real **physical** Energy cards, and `xy12-90` Double Colorless Energy provides two Colorless. Printed card searches/discards must not consume imaginary physical cards from the separate hybrid Energy Zone.
* Evo / Spirit Link dependencies for Mega Venusaur, Charizard, Blastoise, Slowbro and Pidgeot are registered in both the battle engine and deck builder; unused Spirit Links must not be auto-added.
* XY12 includes original-era parody / novelty printings. Imakuni?'s Doduo singing and card-throwing text is gated; never make a fake game mechanic to claim readiness.

## Remaining 30 gated print numbers

See `docs/XY12_BUILD_COVERAGE.json` for precise per-print reasons. At this stage: **7, 11, 15, 16, 18, 25, 31, 32, 36, 40, 46, 47, 51, 53, 55, 58, 59, 60, 66, 67, 71, 72, 74, 80, 87, 106, 107, 108, 112, 113.**

These involve signature Abilities (Charizard Energy Burn, Arcanine Burning Road, Starmie Space Beacon, Electrode Buzzap Thunder, Machamp Counterattack, etc.), timed attack locks or protection (Mewtwo Barrier, Porygon Conversion 3), precise selected-card Supporter resolution (Brock's Grit, Misty's Determination), and special attacks. Do not enable until gameplay, choice timing and resource zones are tested.

## Required full release checks (before push)

```sh
python3 source/scripts/check-gradle-source.py --self-test
(cd source && python3 scripts/preflight-xy12-release.py --full && python3 scripts/preflight-xy11-release.py --full && python3 scripts/preflight-xy10-release.py --full)
```

The XY12 full preflight runs the generated-catalogue tests **and** `tests/v07333-classic-deck-quality.test.cjs` (the historical CI blocker), so early sets and XY11 cannot silently lose 30-card deck legality. Gradle's `generateXY12ForApk` and `auditXY12ForApk` must follow `auditXY11ForApk` and precede Android asset merge. Local green tests do **not** prove a GitHub APK build; verify the actual Actions result after pushing.

## Next integration tasks

1. Implement gated Abilities with specific activated/passive hooks and status suppression, not `noop`.
2. Implement card-specific attack timing and move/discard choices (including Porygon's **expiring** Weakness override); do not extend effect lifetime by accident.
3. Complete Trainer searches, including strictly physical discard/deck/hand selections and optional choices.
4. Bring all 113 prints to verified FULL, then run the independent card-by-card audit and build/deck-synergy regression.
