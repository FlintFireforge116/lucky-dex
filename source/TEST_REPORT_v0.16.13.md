# LuckyDex v0.16.13 test report

## Scope

Bounded polish patch only:

1. Correct Poké Ball Drop canvas/cabinet proportions without changing its physics or scoring.
2. Remove intermediate Link Trade narration while preserving the final trade result.

## Regression tests

`tests/test_v01613_static.py` covers:

- prize-machine canvas uses `height:auto`, a 720:760 (`18/19`) aspect ratio, and no inherited minimum height;
- prize-machine cabinet no longer flex-grows vertically;
- intermediate Link Trade narration strings are absent;
- final `Trade complete!` result remains;
- trade result copy starts hidden and is shown only at the final reveal.

The tests were run before the fix and failed on both reported behaviours, then passed after the patch.

## Version

- Android `versionCode 173`
- Android `versionName 0.16.13`
- visible LuckyDex UI label `v0.16.13`
- stable development signing configuration/keystore preserved from v0.16.10+

## Build note

The local environment is used for static/regression validation and source packaging. The repository GitHub Actions Gradle build remains the authoritative APK compile/install test.
