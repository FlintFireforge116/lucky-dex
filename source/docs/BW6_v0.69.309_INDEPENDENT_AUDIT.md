# LuckyDex v0.69.309 — Dragons Exalted independent audit

**Baseline:** v0.69.308. Patch must be applied over an installed v0.69.308 source directory (`unzip -d source`).

## Confirmed gameplay defects and fixes

1. **Ninetales #19, Hexed Flame.** Original dynamic attack added 20 damage for Burn alone, but its print says +50 for **each** Special Condition on the Defending Pokémon. Corrected to count Poison, Burn, Sleep, Paralysis and Confusion, before the Weakness/Resistance calculation. Direct tests verify zero, one, two and three conditions.
2. **Marowak #61, Vortex Chop.** Original code looked at the opponent's Retreat Cost rather than Resistance. Corrected to +30 if the Defending Pokémon has *any Resistance*, regardless of the Retreat Cost or resistance type. Direct tests verify both cases.
3. **Probopass #82, Magnetic Lines.** The old handler offered only Basic Energy counters and forced the transfer. The card says you *may* move an attached Energy, which includes physical Special Energy. The corrected UI offers **Do not move Energy**, all available Basic types and each attached Special Energy card, then chooses the opposing Bench recipient. Physical Special Energy retains its unique UID and identity. Tests verify both Basic and Special transfers and decline.
4. **Registeel-EX #81/#122, Triple Laser.** The generic three-target damage handler wasn't configured to apply normal Weakness/Resistance to the opposing Active Pokémon. Now all three targets remain distinct, the Active follows the standard attack matchup pipeline, and the Bench ignores Weakness/Resistance as printed. Tested with a Metal-weak Active and two Metal-weak Benched targets.
5. **Shedinja #48, Empty Shell.** The printed no-Prize effect is an Ability, but the knockout resolver treated its `noPrize` metadata as unconditional. Now it awards zero Prizes while the Ability works and the ordinary one Prize if **Garbotoxin suppresses Empty Shell**. Verified through genuine knockout battle actions.

## Tests and coverage

- **128/128 cards** enabled; 200 printed attacks and 20 Abilities retained. The pinned source generator was re-run successfully, with no catalog mutations.
- **34/34** Dragons Exalted focused tests passing (29 original + 5 independent audit tests).
- **293/293** recent Classic pooled regression tests passing (`tests/v0729*.test.cjs` + `tests/v0730*.test.cjs`).
- **402/408** synthetic set smoke scenarios executed; 6 skipped because the synthetic field offered no legal target for the tested effect. **0 exceptions, 0 unresolved choices, 0 definite catalog errors, 0 warnings**.
- **16/16** sampled generated CPU decks passed. The original set suite's 90-seed mixed-type/Dragon CPU legality sweep passed within the 34 dedicated tests.
- **57 static review flags remain.** These represent under-tested specialised effects, not independently verified successes. The tests do **not** prove all 200 attacks have had real on-device action flows exercised.
- **Android/Gradle APK compilation, GitHub Actions and phone gameplay remain unverified.** The Node test suite and version-marker check were run in the container.

## Build wiring and master rules

- `tests/v07309-dragons-exalted-independent-audit.test.cjs` becomes a mandatory APK build gate, chained after the existing v0.69.308 set tests.
- Gradle `versionCode 7309`, `versionName 0.69.309`; JavaScript build and both UI labels synchronised.
- `docs/LUCKYDEX_MASTER_RULES.txt` updated to preserve these five rule corrections for future sets.

## Termux install

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.309_BW6_DRAGONS_EXALTED_INDEPENDENT_AUDIT.zip -d source

git add source
git commit -m "LuckyDex v0.69.309 Dragons Exalted independent audit"
git push origin main
```
