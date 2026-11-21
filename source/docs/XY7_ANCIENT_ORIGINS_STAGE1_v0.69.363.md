# LuckyDex v0.69.363 — XY Ancient Origins, Stage 1

## Verified official source

- New Classic set `xy7`: **Ancient Origins**, issued 2015-08-12, 100 numbered cards plus promotional `75a` = **101 individual prints**.
- Pinned official PokémonTCG data Git blob: `4c7169ef5ef7e30f38fb074b2ee2b4009581fab4`, upstream commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`.
- Official source declares 130 printed attacks, 14 Abilities, 15 Ancient Trait prints.
- `scripts/build-xy7.py` generates the real catalogue from a content-hash-verified source at GitHub build time. The source placeholder must never be packaged as if it contained cards. Gradle `auditXY7ForApk` executes after generation and before asset merges.

## Stage 1 scope

- The full 101-print catalogue is available for collection and inspection; alternate Hex Maniac 75a is **not** collapsed into regular 75.
- Common, verified attacks/trainer actions use established effect types: direct damage, typed Energy costs, coin bonuses/conditions, protection, switching, healing, physical discard/search, and conditional damage. Each partially supported print is *not battle eligible* until **all** its printed effects work.
- New Spirit Links `xy7-70` Ampharos, `xy7-80` Sceptile, and `xy7-81` Tyranitar only waive the end-of-turn penalty for their **matching** Mega Evolution. Banette's Tool Concealment still suppresses their effects. The autobuilder avoids adding an unmatched Spirit Link, preserving manually selected Tools.
- **Not implemented yet:** theta `θ Stop` (opponent Ability protection), `θ Double` (up to two Tools), `θ Max` (full heal upon Mega/Primal evolution); ability-based type modification; the complex Forest of Giant Plants / Hex Maniac global effects; Dangerous Energy / Flash Energy ongoing rules. Their prints remain collectible but excluded from gameplay.
- Some attacks requiring special targeting/timing are intentionally gated. Never substitute a cosmetic no-op for actual effects or create Energy from nowhere.

## Verification

- Local: `node --test tests/v07363-ancient-origins-stage1.test.cjs` and prior Roaring Skies audit suites. The official 101-print catalogue checks only execute when GitHub generates source data; the local skip count is not a pass.
- GitHub APK build for v0.69.363 must be checked after the user commits. **Do not claim 101/101 battle ready**; this is a progressive integration.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.363_ANCIENT_ORIGINS_STAGE1.zip -d source
git add source
git commit -m "LuckyDex v0.69.363 Ancient Origins Stage 1"
git push origin main
```
