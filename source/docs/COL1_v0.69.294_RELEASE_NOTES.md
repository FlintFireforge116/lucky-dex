# LuckyDex v0.69.294 — Call of Legends

## Integration scope

This is an **incremental patch over v0.69.293 Triumphant audit**. It includes 106 distinct Call of Legends prints: 95 main numbered cards and 11 SL shiny secrets, with registered battle and deck-building metadata for all 106.

## Mechanics

The print-to-rule translator reuses the proven HGSS attack/power rules where printed identity matches, plus explicit Call of Legends support for Lost Zone Pokémon/Energy and the **Lost World** alternative victory condition. It also provides choice flows for Lost Remover, Research Record, Sage's Training, Selfish Draw, Lightning Self-Generation, and other attacks.

Reprinted Special Darkness and Special Metal Energy effects now function in the shared battle engine alongside their Undaunted prints. Shiny Entei, Raikou and Suicune **Extreme Speed** Poké-Bodies count matching physical basic and Special Energy cards.

## Independent local verification

* 106/106 card prints enabled (0 gated).
* 138 attack effects mapped; complete card schema audit: 0 errors, 0 warnings, 0 review flags.
* 16/16 selected-set CPU decks valid; 296/296 smoke actions executed, zero skipped.
* 16/16 targeted Call of Legends tests passed.
* 96/96 pooled tests passed across HGSS (Unleashed/Undaunted/Triumphant), the HGSS base set and Call of Legends.
* All changed JavaScript modules pass `node --check`.
* Source is pinned in `data/classic/col1-print-compact.json` with SHA256 `ca9e2d472331f0e92ac82d8f91197e5e0c2a654601a4a4dc9b69df4522fe3640`. The APK's Gradle tasks regenerate and check COL1 offline.

**Verification limit:** No Android APK was compiled or physically tested on device in this environment. The GitHub Actions APK build and user gameplay testing are still required. A passing smoke audit checks core scenarios but does not prove every interaction with every previous set.

## Install in Termux

```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.294_COL1_CALL_OF_LEGENDS.zip -d source

git add source
git commit -m "LuckyDex v0.69.294 Call of Legends complete set integration"
git push origin main
```

The ZIP contains paths *relative to `source/`*; the command does not nest `source/source`.
