# LuckyDex — HeartGold & SoulSilver: Unleashed independent audit
**Patch:** v0.69.287 · 18 November 2026 · **Base:** v0.69.286

## Source and extent
Current successful GitHub Actions build for v0.69.286 confirmed. The exact source-locked 96 English collector print records of `hgss2` (#1–95 plus Alph Lithograph TWO) are unchanged. The authenticated compact source SHA-256 remains `203cd8045793f74e38db5ce8c4561e239bdbe5cdb0db5147794c1e48e7b526db`. Catalogue contains **82 Pokémon, 14 Trainers, 142 attacks and 16 abilities**. All 96 remain battle-enabled. All six LEGEND halves are registered as three matched 2-Prize pairs.

## Confirmed gameplay errors and fixes
1. **Ninetales #20 — Heat Acceleration:** The second and third Fire Energy choices could target a different Pokémon. Now all selected discarded Fire Energy go to the first selected Pokémon, in line with the printed singular target. Metang Energy Crane remains able to distribute its Psychic Energy among different Pokémon.
2. **Jirachi #1 — Time Hollow:** One Stage 2 could be devolved *twice* with a single attack. Each chosen opposing Pokémon may now be selected at most once, with the used slot excluded from subsequent choices and effect resolution.
3. **Zubat #70 — Double Attack:** The generated print had a custom rule with no actual dispatcher handler; the attack silently dealt zero damage. It now selects two distinct opponent Benched Pokémon and deals 10 to each. An audit guard checks that every new `hgss2:` rule has a real handler.
4. **Blastoise #13 — Hydro Launcher / Suicune & Entei LEGEND #94–95 — Torrent Blade:** Their two-Water Energy return cost did not count Rainbow Energy (stored as `Miracle:1`). Both can now choose, return and track that physical Special Energy as one of two required Water cards. Damage is not applied if two cards cannot actually be returned, including when the eight-card hand limit prevents the return.
5. **Blastoise #13 — Wash Out / Mismagius #5 — Magical Trans:** These activated Powers were hidden when the only eligible Energy was Rainbow Energy. Their legality checks now use the same type-provision rules as the physical source chooser.
6. **PlusPower #80:** The HGSS Unleashed printing explicitly says **before applying Weakness and Resistance**; previous implementation used a post-Weakness modifier. Its +10 is now added before weakness/resistance. Legacy printings retain their own unchanged timing.

## Verification and limits
- **39/39** existing HGSS2 integration and completion tests passed before the patch.
- **11/11** new independent gameplay/deck-building tests passed. The CPU test in that suite generates **108** varied HGSS2-only 30-card opponent decks, checking type restriction, legality, evolution parents and matched LEGEND halves.
- **87/87** combined tests passed across HGSS2, HGSS1 and a selected Supreme Victors baseline, with no skipped/failing tests.
- Independent auditor: **96/96 enabled, zero errors, zero warnings, zero review**, **16/16** CPU audit scenarios, **308/312** synthetic actions executed. The four generic-smoke skips concern Engineer’s Adjustments and Rare Candy on both sides (missing physical prerequisite cards in the fake setup); direct focused tests cover both printed actions.
- JavaScript syntax and Python generator compilation checks passed. The complete Android APK for **v0.69.287** has not yet been built/confirmed in GitHub; gameplay on device also remains unverified.

## Release discipline
All HGSS2 integrity and effect checks remain mandatory in `:app:auditHGSS2ForApk`; this adds `v07287-unleashed-independent-audit.test.cjs` rather than disabling or weakening tests. The verified compact source file is not overwritten. The patch is relative to the canonical `source/` directory and applies on top of the existing v0.69.286 source.

### Termux
```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.287_HGSS2_INDEPENDENT_AUDIT_FIX.zip -d source

git add source
git commit -m "LuckyDex v0.69.287 Unleashed independent audit fixes"
git push origin main
```
