# LuckyDex 0.69.332 — XY Basic Energy Zone search repair

## User-approved rule

A Classic effect explicitly searching the deck for fresh **Basic Energy** may use eligible Basic Energy from the ordered Energy Zone because the standard 30-card deck starts without Basic Energy. Real Basic Energy cards that were moved back to the draw deck remain valid physical alternatives, preserving their unique UIDs. The **destination** is still the printed one: to hand for Professor's Letter / Energy Salon; attached to a selected Pokémon for Flame Charge, Geomancy and Energy Glide. Each Zone selection removes a real queue entry and updates the next preview. Hand search respects the 8-card cap and offers Done; hand Energy does not automatically attach.

Generic any-card deck searches and top-N physical-deck inspections must never generate Zone Energy. Discard recovery must use genuine discarded cards or the Energy ledger, and hand-sourced attachments require an actual hand card. Fairy Basic Energy is supported via XY1-140.

## Implementation

- `app/src/main/assets/tcgp-battle-effects.js`: shared XY Basic search source adapter, canonical physical-card/Zone choices, correct physical and queued destinations and logs, Fairy Basic ID.
- `tests/v07332-xy-energy-zone-contract.test.cjs`: six regression tests (two-type Letter, physical+Zone, optional Done and hand cap, unique Energy Salon types, Flame Charge/Energy Glide, Fairy Geomancy).
- `app/build.gradle`: new test is part of `auditXY1ForApk`, which follows the pinned XY1 generator. Gradle/UI/boot JS version numbers synchronised to 0.69.332, build code 7332.
- `docs/LUCKYDEX_MASTER_RULES.txt`: supersedes old physical-only XY1 notes and records exact Termux commands to follow in future patches.

## Verification and limitations

- Local focused older XY1 and version checks: **33/33 passed**.
- Local combined recent XY1/XY2/energy-audit check: **78 passed, 25 skipped, 1 expected failure**. The expected failure is the pre-generation APK placeholder guard in `v07328` (XY1 is 0 cards in the source ZIP). That test remains active and must pass in GitHub after the pinned XY1 and XY2 catalogue generators run.
- `node --check` passed for modified battle-effects JavaScript.
- GitHub build v0.69.331 succeeded (workflow run #620); GitHub build v0.69.332 has **not yet been verified**. No claim of device-testing or APK completion.

## Termux

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.332_XY_ENERGY_ZONE_SEARCH.zip -d source

git add source
git commit -m "LuckyDex v0.69.332 XY Basic Energy Zone search"
git push origin main
```
