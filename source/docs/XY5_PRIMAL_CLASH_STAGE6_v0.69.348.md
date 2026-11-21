# Primal Clash Stage 6 — LuckyDex v0.69.348

Build prerequisite: v0.69.347 succeeded in GitHub Actions (run #636).

## Completion work

- Formerly gated printed attacks: Spreading Flames, Amnesia, Shell Protection, Giant Whirlpool (regular and alternate-print Kyogre-EX), Electric Shock, Electricannon, Rock Shower, Resistance Desert, Dredge, False Swipe, Trick, Twister, Dragon Blast, and Replace.
- All Energy movements use real physical references or the existing Basic Energy Zone/discard accounting. Dredge searches the Zone for Basic Energy and the actual physical deck for Special Energy.
- Optional attack modifiers resolve before damage. Dynamic heads for Rock Shower/Twister are rolled before damage; Twister chooses physical discards afterwards. Wonder Energy prevents Twister's discard effect where applicable.
- EX-only guard normalization in the shared engine: both pokemonEX and pokemonEx recognised, and non-EX attack effects remain allowed during Resistance Desert. This also fixes older preventEx guards with the same metadata mismatch.
- Trick preserves Tool ownership and moves one original Tool card; Replace repeatedly moves individual attached Energy units with a clear Done choice.
- Omega Barrier has NOT been certified across bespoke older Trainer handlers. All six Ω Barrier prints remain deliberately gated, along with six additional unsupported prints. The conservative 164-print generator remains authoritative, and partial cards are excluded from player/CPU auto-decks.

## Verification

- New battle-state test: tests/v07348-primal-clash-attack-completion.test.cjs.
- Included in :app:auditXY5ForApk, after generation of the pinned official 164-print XY5 catalogue and before asset merge.
- The expected completed catalogue is 152 battle-ready / 164 prints; 12 prints remain gated, pending CI verification. No APK build success is claimed for this version until GitHub Actions reports it.
- Local and cross-era regression tests (including dynamic Energy and protection checks) are mandatory.

## Standard Termux deployment

```
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.348_PRIMAL_CLASH_STAGE6.zip -d source

git add source
git commit -m "LuckyDex v0.69.348 Primal Clash attack completion"
git push origin main
```
