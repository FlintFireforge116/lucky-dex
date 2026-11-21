# LuckyDex v0.69.371 — Ancient Origins Stage 8

## Scope and build baseline

- Incremental patch over `v0.69.370` (Ancient Origins Stage 7). Run #659 was still in progress when the patch was prepared; its success is not assumed.
- Android `versionCode 7371`, `versionName 0.69.371`, matching title/menu labels.
- Adds three distinct battle-ready prints: Metagross #49, Giratina-EX #57 and alternate-art Giratina-EX #93.
- Leaves all other genuinely unfinished Ancient Origins prints gated.

## Implemented rules

1. **Giratina-EX #57 and #93 — Renegade Pulse:** prevents attacks from opposing Mega Evolution Pokémon from damaging or applying attack effects to Giratina-EX. Both original and alternate-art copies work; Ability suppression, including Hex Maniac, removes the protection. This is not a blanket immunity to all EX Pokémon.
2. **Giratina-EX — Chaos Wheel:** 100 damage, then prevents the opponent from playing Pokémon Tools, Special Energy and Stadium cards **from hand** through their next turn. Existing attachments, ordinary Items/Supporters and the Classic Energy Zone remain available. The lock expires at the correct turn boundary.
3. **Metagross #49 — Magnetic Warp:** once per turn, choose your own Benched replacement, then let your opponent select their own new Active. If either Bench is empty, no impossible selection appears. Opposing θ Stop prevents the forced switch of that protected Active Pokémon.
4. **Metagross — Iron Cannon:** explicit choice between retaining attached Metal Energy for 80 damage and discarding **all** attached Metal Energy for 160 damage. Basic Metal counts enter the physical discard ledger; Special Metal cards go to the physical discard pile. Damage is decided before the Energy discard finishes.
5. **Beginner CPU:** conserves Metal rather than boosting a non-KO Iron Cannon, but selects the boosted choice when it secures a knockout.

## Tests and CI

- `tests/v07371-ancient-origins-stage8.test.cjs` checks 11 standalone battle and CPU scenarios, all passing.
- Selected Ancient Origins Stage 1–8, earlier XY Energy, Primal Clash, Roaring Skies and Legends Awakened regressions are tested locally; catalogue-dependent assertions that require GitHub-generated official assets may be skipped locally.
- Adds the new test to the Gradle `auditXY7ForApk` task. Generated catalogue tests assert all three newly enabled prints after `generateXY7ForApk` downloads the pinned official catalogue.
- JavaScript parse checks, Python bytecode compilation and ZIP integrity are validated locally.
- GitHub APK build for this patch remains unverified until pushed.

## Termux

```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.371_ANCIENT_ORIGINS_STAGE8.zip -d source

git add source
git commit -m "LuckyDex v0.69.371 Ancient Origins Stage 8 Giratina and Metagross"
git push origin main
```
