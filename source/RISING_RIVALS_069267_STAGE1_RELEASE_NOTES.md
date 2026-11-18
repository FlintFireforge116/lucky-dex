# LuckyDex v0.69.267 — Rising Rivals verified first pass

## Scope
- 120 authentic Platinum—Rising Rivals collector prints: numbers 1–114 and RT1–RT6.
- 188 printed attacks and 45 printed Poké-Powers/Bodies in the offline source archive.
- 49 cards enabled for Classic battle and autobuilding. 71 more are visible in the catalogue but cannot be used in automated decks until their rules are implemented and checked.
- Rising Rivals in Classic set selection, ownership mapping, player and CPU autobuilder, and card image lookup.
- Existing Platinum Pokémon SP / Level-Up rules remain available. New Rotom Shift uses a one-turn type override.
- Fixed an effect-choice freeze for a move-Energy attack with no eligible Benched Pokémon.

## Release gates and tests
- `python3 scripts/build-rising-rivals.py` refuses to build with an altered or incomplete source archive.
- Gradle `preBuild` / `merge*Assets` depends on the Rising Rivals archive regeneration and `node --test tests/v07267-rising-rivals-stage1.test.cjs`.
- 6 Rising Rivals tests passed, including card archive/identity, enabled effects, playable moves, CPU-generated 30-card decks for 9 types, Undevelop and Turtwig GL Overgrow/Giga Drain.
- 273 existing Classic preflight tests passed; combined 117-test Stormfront/Platinum/Rising Rivals regression also passed.

## Important limitation
This is Stage 1 and **not** the full 120-card mechanic implementation. A battle-ready count is not a per-card outcome certification. More involved SP, Level-Up, Rotom, prize/turn effects, Stadiums, Trainers and Special Energy need further passes before being enabled. This release does not make unsupported attacks into generic damage-only moves.

## Install
Extract this patch into `~/lucky-dex/source` and commit `source` as usual. No Termux preparation script is required; GitHub's APK build regenerates and checks the set offline.
