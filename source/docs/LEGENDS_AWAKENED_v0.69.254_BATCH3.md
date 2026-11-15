# LuckyDex v0.69.254 — Legends Awakened batch 3

## Scope

Legends Awakened (Diamond & Pearl dp6): 146 collection prints registered; **62/146 battle-ready**, up from 45/146 in v0.69.253. **84 remain gated**, including unimplemented Formes, LV.X, Fossils, Trainers and several complex Pokémon interactions. Being visible in collection is NOT equivalent to battle readiness.

## 17 newly battle-enabled prints

| Card # | Pokémon | Audited interactions |
|---:|---|---|
| 3 | Froslass | Destiny Bond Psychic discard and next-turn KO; Icy Breath Sleep + 10 to each enemy Bench |
| 4 | Giratina | Bench selection, prevention flip, damage based on defender counters |
| 17 | Yanmega | Sonic Wave blanket Bench damage + defender-selected switch; Pursue and Turn threshold and switch |
| 22 | Crawdaunt | Gripthrow coin and return of opponent's Pokémon/attached cards; Technical Machine-dependent bonus |
| 29 | Groudon | Choice of 0–2 Fighting Energy from hand; self-Bench quake and attached Energy discard |
| 32 | Kyogre | Choice of 0–2 Water Energy from hand; enemy-Bench waves and attached Energy discard |
| 47 | Camerupt | Eruption checks BOTH actual top deck discards for Energy; Take Down recoil |
| 58 | Lanturn | Rushing Water move of opposing Energy between Pokémon; Confuse Ray |
| 59 | Lanturn | Energy Split targets Energy-bearing opposing Pokémon; Aqua Bolt Water Energy scaling |
| 70 | Seadra | Physical Water Energy discard choice and damage bonus; Waterfall |
| 71 | Starmie | Star Boomerang optional full hand return; Core Flash targets only opponent Pokémon with Powers/Bodies |
| 93 | Exeggcute | Call for Family chooses Grass/Psychic Basics from real deck; Hypnosis |
| 101 | Hitmontop | Three-coin damage; Tyrogue-line-dependent optional switch |
| 102 | Horsea | Smokescreen attack coin gate; Reverse Thrust switch |
| 107 | Misdreavus | Basic Energy deck search; Payback when opponent holds exactly one Prize |
| 121 | Spoink | Psybeam Confusion; optional Bounce switch |
| 122 | Staryu | Recover energy discard and actual damage healing; Spinning Attack |

## Shared engine and review

- Card-exact outcomes take precedence over generic heuristics; every verified print is compared with synthetic regenerated catalogue data before an APK build.
- Optional switch effects with multiple choices must request a legal Pokémon after “switch”, not silently resolve without a target.
- A full eight-card Classic hand cannot block a mandatory return. Older overflow goes to the bottom of its owner's actual draw deck, for either player.
- All new attacks have positive smoke tests, plus focused effect/target/coin/state tests. The current stage-3 focused suite has 18 tests; all four key suites (stage 1, stage 2, stage 3 and Classic hand-cap) together passed 56/56 source-level tests. A broader cross-set run passed 240/242; the two failures are older `v07199-classic-choice-era-and-tm.test.cjs` checks which also fail unchanged on the reconstructed v0.69.253 baseline (Porygon2 autobuilder expectation and a stale UI string assertion). These are not new regressions; neither is claimed fixed in this patch.
- The GitHub Actions APK build for v0.69.253 succeeded (#542). **This v0.69.254 code has not yet been pushed or APK/device-tested.**

## Termux handoff

The ZIP is **source-relative** (entries begin with `app/`, `docs/`, `scripts/`, `tests/`), so extract with `-d source`, not `-d .`. The `source/app/build.gradle` build task automatically runs archival metadata preparation and tests.
