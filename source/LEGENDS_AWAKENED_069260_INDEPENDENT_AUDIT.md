# Legends Awakened — v0.69.260 independent source audit

**Scope:** The complete 146-print `dp6` set as implemented in v0.69.259, its actual battle engine, classic deck builder, CPU deck generation, and recorded master rules. This audit does **not** claim device-side Android testing or perfect printed-rule coverage.

## Baseline and static results

- GitHub Actions APK build **#548 for v0.69.259 passed**.
- `node scripts/audit-classic-set.cjs --set dp6 --smoke`: **146/146 battle-enabled**, **0 schema errors**, **0 warnings**, **7 manual-review flags**; **460/466** offered synthetic actions exercised, **4 skipped**. The 4 skips were Regigigas Crush Grip (Slow Start's Prize prerequisite) and Starmie Core Flash (no valid ability-bearing target), both on each side of the deliberately simple synthetic board.
- 5 review flags are intentionally delegated effects: Ditto DNA (passive), Bubble Coat (Tool damage response), Snowpoint Temple (HP passive), and both Technical Machines (printed attack attached to Trainer Tool). The other 2 are the generic smoke runner not automatically completing Unown R's repeated Energy-choice steps on player/opponent boards. The existing targeted actual-battle test confirms its choice queue can complete; these 2 are *not* assertions of a broken attack.
- All 163 existing Legends Awakened integration tests passed before modification. The source test for the printed-card generator also passed. These are narrower than 146 independent handwritten edge-case tests.

## Confirmed defects and corrections

1. Deoxys/Castform auto decks could have four identical forms with **no alternative form to search and switch into**. Builder now includes distinct, Energy-compatible owned forms in the same pool, including when an otherwise unrelated core selects one as support.
2. A Ninjask core could contain **no Shedinja** for Cast-off Shell. Builder includes its usable partner when owned and eligible.
3. Mesprit LV.X could be built without **both Azelf LV.X and Uxie LV.X**, making Supreme Blast ineffective. Builder pairs complete Basic + LV.X lines or declines an unsupported focus, and excludes Mesprit LV.X from generic incomplete support choices.
4. Technical Machine TS-1 could be chosen repeatedly when the only candidates were Basics or LV.X, which are **not** its ordinary evolution targets. Matching Stage 1/2 family presence is now required; identical DP6 Tool filler is capped at two for automated additions.
5. Basic-only focus was not consistently honoured: choosing a Basic could still select a Stage 1 or LV.X endpoint. Fixed for competitive and random focus selections. 
6. Existing global evolution-endpoint metadata counted LV.X as ordinary evolved progression; this could wrongly reject DP6 Lucario when DP2 Lucario LV.X was outside the pool. Excluded Level-Up from mandatory ordinary evolutions, without relaxing actual Stage 2 requirements.
7. Snowpoint Temple was failing to grant +20 HP to Basic-origin Pokémon LV.X. It now recognises their original Basic under the Level-Up; LV.X cards over a Stage 1 or Stage 2 remain Evolved and do not receive the bonus.
8. Poké Radar and Snowpoint Temple had understated role scoring in the builder. Their usefulness is now conditional on the actual Pokémon lineup rather than indiscriminately added or ignored.
9. The title and menu version labels were still hardcoded to v0.69.258 even after v0.69.259. They now match v0.69.260 and the Gradle/build-stamp version.

## Deliberate non-changes and limitations

- No attack print, KO sequencing, Prize conversion, Energy Zone supply, LV.X level-up or Fossil identity was changed without a confirmed reason.
- The strict single-set filter is preserved. For example, DP6 Froslass needs a Snorunt from another set; Magnezone LV.X and Rhyperior LV.X need earlier-stage prints absent from DP6. A user restricting the deck to only DP6 should be told that the line cannot be built rather than silently adding off-set Pokémon.
- A direct comparison with unmodified v0.69.259 found **three existing failures** in EX-era mono-Energy optimization regressions (`v07167`, `v07168`); they were not introduced by this patch and are not silently labelled as fixed. Two additional version-label assertions also failed in the baseline and have now been corrected by the HTML change. The broad historic full-pool tests are extremely expensive and were not fully completed in this audit.
- An automated source audit cannot guarantee every card interaction under all real CPU/player board states; device-level tests and fuller opponent decision simulations remain useful.

## Reproducible checks

```sh
cd ~/lucky-dex/source
python3 tests/test_dp6_build_pipeline.py
node --test tests/v07260-legends-awakened-independent-audit.test.cjs
node scripts/audit-classic-set.cjs --set dp6 --smoke
# CI automatically runs all eleven DP6 suites as part of the APK build.
```
