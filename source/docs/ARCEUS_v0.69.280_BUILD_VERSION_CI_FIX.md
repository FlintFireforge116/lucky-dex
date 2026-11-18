# LuckyDex v0.69.280 — cross-set CI version consistency fix

## Verified cause of v0.69.279 GitHub build failure

GitHub Actions run 44370923107 successfully completed the authentic 111-print
Arceus audit, but `:app:auditSupremeVictorsForApk` failed on the stale
Supreme Victors stage-1 test expecting `versionName 0.69.274`.
The boot JavaScript also still identified itself as 0.69.274, while Gradle
and both visible HTML version labels used 0.69.279.

## Fix

- Replace the stale hardcoded Supreme Victors release assertion with a
  cross-release agreement check between Gradle, boot JS, and both UI labels.
- Set all four version locations to 0.69.280 and increment versionCode.
- Preserve every historic print and battle-mechanic assertion; no tests skipped.
- Continue running the same `auditSupremeVictorsForApk` and
  `auditArceusForApk` tasks before assembling the Android APK.

## Regression rule

Do not pin a permanent prior-set test to a specific release version.
Any release may retain the historical set audit, but the version assert
should compare the runtime and presentation versions against the current
Gradle versionName.
