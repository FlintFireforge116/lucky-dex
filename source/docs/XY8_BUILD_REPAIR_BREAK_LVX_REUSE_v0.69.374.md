# v0.69.374 BREAKthrough — GitHub build repair and LV.X reuse

- Confirmed failed GitHub Actions run #663 (45013841133): `:app:auditSupremeVictorsForApk` failed because the title UI said `v0.69.373` but Gradle/boot JS said `0.69.374`. This patch corrects BOTH HTML version markers without changing the release version.
- BREAK now shares previous-card attack and Ability inheritance with LV.X. BREAK is a normal Evolution for active/bench placement, timing and condition clearing; LV.X keeps its existing Active-only, non-evolution level-up rules. BREAK retains the previous form's type, Weakness, Resistance and Retreat Cost while using printed BREAK HP/attacks.
- The global BREAK gate in the XY8 generator is removed. Five mapped BREAK cards are newly projected battle-ready; Marowak BREAK is still gated on its as-yet unmapped Bone Revenge attack.
- Dedicated Level-X/BREAK inheritance and evolution-legality tests are added to the mandatory APK Gradle audit. `tests/v07271-supreme-victors-stage1.test.cjs` version-sync test is the build-failure regression.
- Still not fully completed: the other 52 projected gated prints are described in `docs/XY8_GATED_HANDOFF_v0.69.374.md`.
- Local tests cannot prove GitHub APK success; GitHub reruns the pinned catalogue generation and mandatory audits after push.

## Install after the failed 0.69.374 upload
```
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.374_BREAK_LVX_BUILD_REPAIR.zip -d source
git add source
git commit -m "Fix v0.69.374 APK version and reuse LV.X for BREAK"
git push origin main
```
