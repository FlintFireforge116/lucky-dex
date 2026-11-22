# LuckyDex v0.69.377 — BREAKthrough independent audit

## Baseline

`0.69.376` completed the 165-print BREAKthrough catalogue and successfully
built in GitHub Actions run `45020904916`. Audit changes are based on that
release. No card was removed or gated.

## Defects found and corrected

1. **Inherited passive Abilities**: BREAK and LV.X attacks and activated
   Abilities were inherited correctly, but two modifier loops and the passive
   protection resolver read only the current card. Florges BREAK therefore lost
   the printed Florges **Calming Aroma** Fairy Energy-cost reduction. All three
   shared lookups now use `upgradeAbilities`, preserving suppression rules.
2. **Parallel City after Sky Field**: when Sky Field had allowed an enlarged
   Bench, Parallel City previously did not enforce its selected player's
   three-Pokemon limit. It now reuses the existing selectable non-KO Bench
   discard sequence. The other side retains the post-Sky Field five-card
   limit, with the selected side reduced to three.
3. **Sky Field versus Narrow Gym ordering**: regression testing caught and
   corrected an interaction in the initial audit fix. The existing sequence
   (discard to five from Sky Field; then return to hand for Narrow Gym)
   remains intact.
4. **Version-check durability**: the XY8 regression test now derives the
   actual Gradle version dynamically rather than hard-coding a specific
   release. It checks title and boot JS match. This audit is version
   `0.69.377` in Gradle, title UI and boot JS.

## Tested

Three new audit tests reproduce inherited passive cases and the live
Parallel City/Sky Field discard sequence. Also run selected test groups:

| Group | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| v07333–v07359 | 259 | 0 | 19 |
| v07360–v07369 | 78 | 0 | 4 |
| v07370–v07377 | 90 | 0 | 2 |
| **Total** | **427** | **0** | **25** |

Skipped tests generally require the generated official-card catalogues. The
APK build-time XY8 catalogue verification remains strict at **165/165**. The
current patch has not itself completed a GitHub APK build.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.377_BREAKTHROUGH_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.377 BREAKthrough independent audit fixes"
git push origin main
```
