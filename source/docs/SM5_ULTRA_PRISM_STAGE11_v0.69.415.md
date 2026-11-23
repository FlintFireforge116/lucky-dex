# LuckyDex v0.69.415 — Ultra Prism Stage 11 implementation and audit

This is a cumulative source patch incorporating all previous Ultra Prism stages, including the corrected Stage 5 Prism Star release tests, and adding fourteen exact-printed-effect mappings. It does not claim all 178 prints have been enabled. Unsupported cards remain explicitly gated. The complete 178-print preflight and actual Android APK build still require verification on Termux/GitHub.

## Fourteen new attack mechanics

- **Dust Cannon** — damage increases with the opposing Active Pokémon's effective retreat cost.
- **Draco Meteor Barrage** — one coin per attached Grass Energy, including a valid one-unit Grass-providing Special Energy.
- **Iron Head** — repeated coin flips until tails, damage only per heads.
- **Spike Armor** — put six damage counters on the attacking Pokémon after a damaging hit, including a knockout.
- **Hone Claws** — increases Pierce's base 30 damage to 90 on the following own turn.
- **Weak Kneed** — one flip before the Defending Pokémon's attack during the following opponent turn.
- **Sticky Smokescreen** — two independent flips; a single tails cancels that attack.
- **Exact Revenge** — only counts a Fighting Pokémon knocked out by damage from an opposing attack on the preceding turn, not an unrelated knockout.
- **Own the Place** — discards an opponent-owned Stadium only, then prevents attack damage and effects through their following turn.
- **Dangerous Lick** — heads until first tails, +50 damage per heads, paralysis only on first-flip tails.
- **Coax** — choose up to three Basic Pokémon of different types from the actual deck, retaining physical card identities.
- **Snuggly Generator** — one individual Lightning Basic Energy search per eligible Nuzzle Pokémon on the Bench; coin for each virtual Energy Zone search; fails do not generate Energy.
- **Flower Tornado** — reallocate actual Grass Energy units/Grass-providing Special Energy cards among different Pokémon with repeated choices and Stop.
- **Magical Swap** — choose opponent-owned source and destination for each damage counter, with optional Stop; never moves counters on own Pokémon.

All mappings are guarded by attack name + whitespace-normalised *complete canonical printed text* in `scripts/sm5_stage11_verified.py`. The Gradle and SM5 release gates include `tests/v07436-ultra-prism-stage11-outcomes.test.cjs`; the release contract now expects v0.69.415 / versionCode 7415. The Stage 11 game engine changes also track actual opposing-attack KO card identities for Exact Revenge. No optimistic no-op implementations were introduced.

## Verification in the local source workspace

| Test | Result |
|---|---|
| New Stage 11 live-game outcome suite | **24/24 passed** |
| Combined SM5 Stages 2–11 gameplay suite | **200/200 passed** |
| SM4 Crimson Invasion full release gate | **124/124 passed** |
| SM3 Burning Shadows full release gate | **146/146 passed** |
| SM2 Guardians Rising targeted release and deck suite (bounded concurrency) | **114/114 passed** |
| SM1 Sun & Moon full release gate | **64/64 passed** |
| XY12 Evolutions full release gate (before final KO provenance bookkeeping change) | **passed** |
| Gradle source guard; JS/Python syntax | **passed** |
| ZIP integrity, path structure and file-by-file byte parity | **passed** |
| Complete SHA-pinned 178-print Ultra Prism gate | **Termux preparation required** |
| Android APK build in GitHub Actions | **not independently confirmed** |

## Termux install and release check

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.415_SM5_ULTRA_PRISM_STAGE11.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.415 Ultra Prism stage 11" && \
git push origin main
```

`sh source/scripts/prepare-sm5.sh` performs the SHA-pinned catalogue fetch and release tests; the `&&` chain aborts before push on any failure. The fully downloaded 178-print gate is not available in the offline patch workspace. Do not report the set complete until `docs/SM5_BUILD_COVERAGE.json` confirms 178 playable with zero gated and the full audit has passed.
