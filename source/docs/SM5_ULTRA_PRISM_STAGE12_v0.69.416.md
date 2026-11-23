# LuckyDex v0.69.416 — Ultra Prism Stage 12

## Scope

Cumulative Ultra Prism source patch continuing Stage 11 without reverting previously working Prism Star, Unit Energy, or prior battle rules.

Four newly text-locked mechanics:

- **Luxray, Volt Bolt:** targets one opposing Pokémon for 150 attack damage, applying Weakness/Resistance on Active targets only, then discards attached Lightning-providing Energy without deleting unrelated attached Energy or duplicating physical card references.
- **Alolan Exeggutor, Exeggutor's Paradise:** offers an optional actual matching evolution card from the physical deck for each Benched Exeggcute, preserving existing Pokémon attachments.
- **Infernape, Flaming Fighter:** raises between-turn Burn damage to six counters on opponent-owned Burned Pokémon only, respecting suppression and preventing duplicate stacking.
- **Missing Clover**, both SM5 #129 and #168: one copy reveals the deck's actual top card; exactly four copies can be played as one action to take precisely one Prize, preserving physical cards and final-Prize win conditions.

Fast Raid is not included in the four new mappings and is not claimed as newly supported.

## Release checks

- New Stage 12 gameplay cases: **15 passed, 0 failed**.
- Combined SM5 Stage 2–12 gameplay: **215 passed, 0 failed**.
- Crimson Invasion SM4: **124 passed**.
- Burning Shadows SM3: **146 passed**.
- Guardians Rising SM2: **114 passed**.
- Sun & Moon SM1: **64 passed**.
- Evolutions XY12 full release gate: **passed**.
- Gradle source guard: **passed**.
- Full official 178-print SM5 preflight: **must run during Termux preparation**, because the SHA-pinned canonical compact source is downloaded on device; no local claim of full completion.
- GitHub APK compilation: **not yet independently confirmed**.

## Installation

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.416_SM5_ULTRA_PRISM_STAGE12.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.416 Ultra Prism stage 12" && \
git push origin main
```

Preparation and audits run before the commit. ZIP paths are relative to `source`.
