# LuckyDex v0.69.369 — Ancient Origins CI recovery

## Verified failures from GitHub Actions

- v0.69.367 (run #656) failed `:app:auditXY7ForApk`: Stage 1 test still expected M Sceptile-EX #8 to be gated. v0.69.368 already corrected that expectation, and this patch RETAINS that correction and the Stage 5 gameplay code.
- v0.69.368 (run #657) failed `:app:prepareLegendsAwakenedForApk`: older tests `Hitmontop does 20 per heads; Gut Spin ...` and `Spoink Bounce offers keep or switch ...` observed an unswitched Active after a nested optional switch.

## Actual switch issue

A `chooseOption` effect resolves the selected child effect with `resolvingChoice:false`, even though the user already picked the yes/no action. The generic `switch` handler previously offered a follow-up Bench choice only if `resolvingChoice` was true, so it could silently attempt an undefined Bench index and end without switching. For optional printed switch effects with no selected Bench index, now explicitly offer `switchBench` whenever an eligible Bench exists, regardless of the `resolvingChoice` flag. When the player picks the Bench, perform the switch and log it only if successful; when there is no Bench, do not start an empty choice.

## Coverage

- Existing Legends Awakened batch-3 tests verify Hitmontop's Gut Spin and Spoink's Bounce actually switch.
- New `tests/v07369-ancient-origins-ci-recovery.test.cjs` asserts both attacks prompt for a Bench after the yes/no choice, both decline paths leave Active unchanged, and no-Bench cases do not deadlock.
- The new test is included in `auditXY7ForApk`.
- Ancient Origins Stage 1–6 plus both Legends Awakened suites: 76 passed, 0 failed, 2 skipped (build-generated catalogues); cross-set regression selection: 109 passed, 0 failed, 3 skipped (build-generated catalogues).
- JavaScript syntax and ZIP integrity checked locally. **A GitHub APK build of v0.69.369 has not yet been verified.**

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.369_ANCIENT_ORIGINS_CI_RECOVERY.zip -d source
git add source
git commit -m "LuckyDex v0.69.369 Ancient Origins CI recovery"
git push origin main
```
