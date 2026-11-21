# LuckyDex v0.69.370 — Ancient Origins Stage 7

## Base and deployment

- Based on v0.69.369 (CI recovery), which passed GitHub Actions run #658.
- Version code 7370, version name `0.69.370`; Android version text matches the APK.
- Patch is incremental over the v0.69.369 source, not a complete repository replacement.

## Newly battle-enabled prints

1. **Volcarona #17 — Solar Birth.** Select one existing Basic Pokémon from the *physical* draw deck; place it on an available Bench slot, shuffle the draw deck, and optionally attach up to two selected Basic Energy units from the *real Classic Energy Zone* to that Pokémon. No fabricated cards, no Special Energy, no consumed turn attachment. Flamethrower uses the existing audited attached-Energy discard handler.
2. **Claydol #33 — Rewind.** Remove exactly the top Evolution from each evolved opposing Pokémon (Active and Bench) and return each evolution identity to its owner's hand. Retain all physical Tools and Energy and clear temporary evolution-affected conditions; respect attack-effect protection. Hyper Beam uses the existing coin/discard handler.
3. **Whimsicott #56 — Windy Mischief.** Choose a damaged friendly Benched Pokémon and move *all* its damage counters to the opponent's Active Pokémon. Counters are not attack damage: no Weakness, Resistance, or Wide Lens multiplier. Existing attack-effect protection remains effective. Rolling Tackle is a normal damage attack.
4. **Porygon-Z #67 — Digital Reboot.** Repeat an explicit Bench-target choice to devolve as many of your own Benched Pokémon by as many stages as desired, returning each removed Evolution to hand. Choosing Done stops immediately. Energy and Tools stay attached; the Active Pokémon cannot be chosen. Dazzle Blast uses existing confusion handling.

## CPU and compatibility

- CPU chooses genuine optional Solar Birth Energy when available; explicitly finishes Digital Reboot without repeatedly stripping its own evolved Bench attackers.
- Shared effects updated via named, validated descriptors; no change to previous set card identities.
- The Stage 1 generated-catalogue test now expects #17, #33, #56 and #67 to be fully battle-enabled, preventing a stale expectation from breaking CI as happened during Stage 5.
- `tests/v07370-ancient-origins-stage7.test.cjs` is included in `auditXY7ForApk` before Android asset merge.

## Local tests

- New Stage 7 direct tests: 10 passed, 0 failed, 0 skipped.
- A selected multi-expansion suite covering Ancient Origins stages, Roaring Skies, Primal Clash and Legends Awakened: 279 passed, 0 failed, 14 skipped in the final selected multi-expansion run.
- Separately: XY Energy Zone 6/6, Classic deck quality 6/6, conditional-Energy deck synergy 7/7.
- The heavy combined full-pool deck-builder stress command exceeded the local timeout and is **not** counted as passed.
- Generated official XY7 catalogue checks run only inside GitHub; the APK build is **not yet verified** for v0.69.370.

## Termux

```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.370_ANCIENT_ORIGINS_STAGE7.zip -d source

git add source
git commit -m "LuckyDex v0.69.370 Ancient Origins Stage 7"
git push origin main
```
