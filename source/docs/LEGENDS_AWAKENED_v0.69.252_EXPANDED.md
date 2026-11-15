# LuckyDex v0.69.252 — Legends Awakened expanded battle implementation

## Scope

The next Classic set **Legends Awakened (dp6)** has 146 collector-numbered cards. This build makes **45 prints battle-enabled** (18 previous + 27 new), with **101 still gated** from real battles and deck building until their printed actions are implemented. This is **not** full-set completion. Set/collection records and artwork URLs remain registered for all 146.

## New print-complete battle cards (27)

| Print | Pokémon | Verified attack and outcome categories |
|---|---|---|
| 11 | Mewtwo | Hypnoblast Sleep, Psychic per defending Energy |
| 20 | Bellossom | Heal all own Pokémon, count Bellossom/Vileplume, Burn coin |
| 35 | Poliwrath | Focus Punch previous opposing-turn damage requirement, Submission recoil |
| 53 | Drifblim | Temporary damage reduction, opponent chooses Whirlwind switch |
| 61 | Lucario | Named Active/Bench target choice, conditional additional damage |
| 62 | Luxio | Chosen Bench damage, tails discards all Lightning Energy |
| 63 | Marowak | Heavy Bone attack-specific next-turn lock, Bone Rush coin-until-tails damage |
| 65 | Metang | Paralysis coin, Bullet Punch two-coin bonus |
| 72 | Swalot | Remaining-HP comparison, Poison |
| 74 | Tauros | Coin per Tauros, Thrash heads bonus/tails recoil |
| 86 | Buneary | Remove conditions and heal before self-Sleep, double coin |
| 88 | Chinchou | Water-Energy-dependent Aqua Spark |
| 89 | Corphish | Actual random opposing-hand card discard on heads |
| 94 | Gligar | Coin-gated attack and status, bonus attack |
| 96 | Gloom | Sleep Powder, Frustration targets only undamaged opposing Pokémon |
| 97 | Gloom | Space Out heal/Sleep, Stinky Nectar Confusion and Poison |
| 98 | Gulpin | Choose defender attack to lock, Paralysis coin |
| 103 | Houndour | Opponent chooses Roar switch, Bite |
| 106 | Meowth | Pay Day conditional physical draw, three-coin Fury Swipes |
| 109 | Nosepass | Nose Poke bonus with Probopass on own Bench |
| 113 | Pineco | Both Benches damaged and self-recoil after attack |
| 114 | Poliwag | Heads Confusion, tails Sleep |
| 119 | Skitty | Temporary opponent Active damage penalty, Scratch |
| 123 | Swinub | Chosen physical discard retrieval only on heads |
| 124 | Taillow | Focus Energy applies to next-turn Peck only |
| 125 | Tentacool | Temporary damage/effect prevention, heads Energy discard |
| 128 | Yanma | Real Active-to-Bench U-turn switch, coin-flipped protection |

The prior 18 battle-enabled prints remain unchanged. Every newly enabled print has both attacks modelled; cross-set shared effect support was checked.

## Rules and limitations

- `docs/LUCKYDEX_MASTER_RULES.txt` remains authoritative for player-approved LuckyDex adaptations (Energy Zone, Bench limit, card zones, Prize choices). Where a card needs a choice, present a visible choice instead of silently choosing an arbitrary target.
- Do not promote any print with unsupported mandatory effects. LV.X, Formes, Poké-Powers and Poké-Bodies, Fossil dependencies, Trainers and Stadiums remain explicitly gated as needed.
- `scripts/dp6_verified_outcomes.py` records individual print-exact effects and `scripts/dp6_extra_print_snapshots.py` contains the manually checked source text. The offline fallback is updated by `scripts/augment_dp6_bundled_fallback.py`; the full printed catalogue is reconstructed by `scripts/build-legends-awakened.py` using the archived dataset.
- The `scripts/prepare-legends-awakened.sh` step **must run in Termux or before CI APK compilation**. On first use it downloads archived complete print data to `data/classic/dp6-print-source.json` and caches it for future offline rebuilds; no runtime app web fetch is required. The bundled fallback contains printed metadata for enabled prints but is incomplete for the 101 gated prints until preparation.
- No device APK playtest or visual UI check has been performed; source-only tests are not equivalent to user testing.

## Tests

Run from `source/`:

```bash
node --test tests/v07251-legends-awakened-stage1.test.cjs tests/v07252-legends-awakened-expanded.test.cjs
```

The suite includes printed card registration, coin results, conditional damage, selected Active/Bench targeting, opponent-choice switch, temporary effect state, discard retrieval, recoil, energy movement, original 18 regressions, and CPU filtering. `scripts/prepare-legends-awakened.sh` runs both suites after rebuilding the JS catalogue. Independent set audit remains PARTIAL until all 101 gated prints are implemented.

## Install / prepare (ZIP root is the repository root)

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.252_LEGENDS_AWAKENED_EXPANDED.zip -d .
cd source
sh scripts/prepare-legends-awakened.sh
```

The new version is **0.69.252** (Android versionCode 7240). Do not unzip this archive using `-d source` because its entries already start `source/`.


## Handoff correction (same app version; source-relative ZIP)

The earlier **repository-root** `LuckyDex_patch_v0.69.252_LEGENDS_AWAKENED_EXPANDED.zip` is preserved as a historical release but must NOT be unpacked under `source/`. Use the repackaged `LuckyDex_patch_v0.69.252_TERMUX_SOURCE_LAYOUT.zip` instead. Its ZIP members are relative to `source/` and contain no `.github` root files. The repository's existing `source/**` GitHub Actions trigger handles the push; `source/app/build.gradle` automatically calls `scripts/prepare-legends-awakened.sh` before APK asset merge, fetching archival print metadata and running both integration test suites. Manual prepare is optional.

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.252_TERMUX_SOURCE_LAYOUT.zip -d source
git add source
git commit -m "LuckyDex v0.69.252 Legends Awakened and Termux source-relative handoff"
git push origin main
```

This changes packaging and build preparation only; battle-enabled count stays 45 of 146. The older install block above applies **only** to the older ZIP and is superseded for the new package.
