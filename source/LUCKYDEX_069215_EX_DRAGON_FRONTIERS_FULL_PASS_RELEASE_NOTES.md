# LuckyDex v0.69.215 — EX Dragon Frontiers full pass

**Patch base:** 0.69.214, source-relative, changed files only. **Version:** 0.69.215 / Android versionCode 7195. 12 November 2026.

## Implemented

- Xatu δ (#25) Extra Feather is now recognised as a **Stage 2 Pokémon-ex attack booster**. Focusing Xatu auto-adds an owned, complete Stage 2 ex family; focusing a Stage 2 ex can add complete Natu/Xatu and Taillow/Swellow support lines. Xatu's Darkness attack does not unnecessarily pollute a Stage 2 ex's Basic Energy Zone.
- Stage 2 ex support is metadata-driven and covers Xatu δ (+damage), Swellow δ (retreat), Altaria ex δ (hand Basic Energy acceleration), Kingdra ex δ (damage protection). Altaria ex is paired only with a physical Basic-to-hand source, respecting the separate Basic Energy Zone. Both players and CPU lose the unusable Extra Boost action when no valid hand Energy or recipient exists.
- Extra Feather now stacks **+10 for each active, unsuppressed Xatu**, only on Stage 2 Pokémon-ex attack damage and before Weakness/Resistance.
- Typhlosion δ gets Psychic **and** Fire Energy to use the printed Burning Ball status bonus. Tool-dependent Ledian δ and Quagsire δ receive actual owned Tool cards in their automatic decks.
- Repaired attack status metadata: Arbok δ inflicts Burn and Poison; Vibrava δ inflicts Confusion; self-Sleep effects are not misclassified as opponent Sleep.
- Updated project master rules to v2.9, appended a documented set-wide audit and a new 13-test Node regression suite.

## Confirmed source checks

- Every one of the **101 ex15 card IDs** remains a distinct registered, battle-enabled print with its card text; **83 Pokémon** are focus-buildable into valid **30-card** decks given four test copies of each print.
- **27 seeded opponent deck** generation cases across all eight Basic Energy types produced legal decks.
- Every printed EX15 Pokémon attack was exercised as an executable command with its Energy costs supplied. This is an execution/choice-flow smoke test, **not a proof of every move's exact damage/side effects**; targeted outcome tests from earlier EX15 suites remain part of the validation.
- **198/198** selected `v07205`–`v07215` adjacent EX-era regression checks passed (11 files), including **89/89** in the four Dragon Frontiers-focused suites.
- Independent older EX2/EX3 single-type Energy/deck scoring tests showed **three failures already present on unchanged v0.69.214**, verified using the original builder: these are not newly introduced by this patch; logged for a separate older-set cleanup.

## How to apply in Termux

The ZIP paths are relative to `~/lucky-dex/source/`, **not** `~/lucky-dex/`. Preserve your canonical source and current data; apply over v0.69.214:

```bash
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.215.zip -d ~/lucky-dex/source/
cd ~/lucky-dex/source
node --test tests/v07215-ex15-full-pass.test.cjs
```

## Not certified

An APK has not been built or uploaded to GitHub in this delivery. **Android touchscreen**, save migration and complete Advanced/Expert CPU long-match behaviour remain untested. EX14's four previously PARTIAL cards remain gated. See `docs/EX_DRAGON_FRONTIERS_v0.69.215_FULL_PASS.md` for the exact test ledger.
