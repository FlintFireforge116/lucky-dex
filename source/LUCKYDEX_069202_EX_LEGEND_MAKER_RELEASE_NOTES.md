# LuckyDex v0.69.202 — EX Legend Maker

## Scope
- Adds all **93 English EX Legend Maker** cards (ex12-1 through ex12-93, including secret Pikachu δ) to the Classic TCG catalog and deck generator. Each print includes authentic attacks, card effects, HP, typing, weakness, retreat, rarity, evolution and external artwork URL.
- Card metadata records **React Energy** dependencies and payoff roles, including Flygon ex, Gorebyss/Huntail, Gengar, Machamp, Shiftry, Wailord, Roselia, and Fossil engines; printed stage-family compatibility and Dual Armor are retained.
- Implements EX Legend Maker attack and Poké-Power/Body behaviours: reactive attachments and damage reduction, Energy search, moving/reactivating Energy, evolution/KO triggers, stat adjustments, bench targeted hits, special conditions, choices (including hand/deck/discard), Mew ex Versatile, and special Stadium/Fossil interactions.
- Distinguishes **React Energy as Colorless** except where an explicitly printed effect changes it (Gorebyss/Huntail).
- CPU prefers React attachments and Flygon ex Emerge Charge React recovery, and avoids putting React Energy into unrelated decks.
- Shared builder and Energy Zone analyser now allow optional earlier-stage attack costs (e.g. Trapinch Fighting) without incorrectly requiring a third Energy type for Flygon ex's Grass/Lightning line.
- Corrects Roselia Reactive Aroma to trigger at most once between turns, as printed.

## Verified
- 27/27 EX Legend Maker-focused tests passed.
- 35/35 adjacent v0.69.198–201 regressions passed.
- 145 individual Legend Maker attack executions completed with no exceptions.
- Wider historical suite v0.69.167–168 has four test failures verified to reproduce **unchanged in v0.69.201**; no claim that suite passed.
- Android touch/UI end-to-end testing has not been performed.

## Termux / GitHub
Patch requires **v0.69.201** source. Download into `/sdcard/Download`, then:

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.202.zip -d source
grep 'versionName' source/app/build.gradle
git add source
git commit -m 'LuckyDex v0.69.202 EX Legend Maker'
git push origin main
```
