# LuckyDex v0.69.199 — Classic card choices, filters, and Technical Machine synergy

Builds on v0.69.198 (EX Delta Species complete).

## Improvements
- Classic battle option actions may now carry the ID of an actual card, without changing effect resolution or action selection indices.
- Holon Transceiver searches of deck and discard show the correct Holon Supporter art, including distinct selectable copies; Holon Lass and Holon Farmer card choices are also linked to card identities. Options without actual cards still display their normal text.
- The Classic deck editor / Test Lab `Filter cards` modal groups expansions under collapsible eras (Original, Gym, Neo, e-Card, EX, Snap, Modern), using the canonical shared set list, with an All expansions reset. Set filtering remains single-set, and other filters are unchanged.
- Porygon2 EX Delta Species #25 explicitly marks its Technical Machine attack condition in deck metadata. The shared synergy engine records conditional status effects separately from unconditional effects, prioritises compatible Technical Machines, and adjusts deck summaries to reflect whether a TM is present.
- The Classic auto-builder limits TM support for Porygon2 to two compatible copies from available, permitted sets, and avoids incompatible Team/type-specific Machines.

## Validation
- 34/34 tests across EX Delta Species, Test Lab decks, and new v0.69.199 checks.
- 11/11 tests across Classic deck filter and builder audit + clear-deck behavior.
- Additional targeted shared synergy tests passed.
- Version identifiers: Android versionName 0.69.199 / versionCode 7179, splash and runtime 0.69.199.

## Install the incremental patch from Termux
```
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.199.zip -d source
git add source
git commit -m "LuckyDex Classic options, era filter, TM synergy v0.69.199"
git push origin main
```

The patch archive paths are relative to the `source/` directory; the full source archive is a separate GitHub repo snapshot. Manual in-app UI verification on Android is still recommended.
