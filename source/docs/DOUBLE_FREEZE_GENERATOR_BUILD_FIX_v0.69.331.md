# LuckyDex v0.69.331 — Noble Victories generator repair

## GitHub failure diagnosed

GitHub Actions workflow #619 (v0.69.330) failed at task
`:app:auditV07328PlayerReportedBugsForApk` while checking Vanilluxe
Noble Victories bw3-29 Double Freeze.

The earlier v0.69.328/v0.69.329 patch had edited the generated
`tcg-classic-noble-victories.js` with the intended effect but had not
corrected `scripts/bw3_verified.py`. During every GitHub build the Gradle
task `generateBW3ForApk` regenerated the asset from the old rule mapping,
reverting Double Freeze to `neoRule: bw3:doubleFreeze` (which did not
resolve attack damage or create the shared visible coin log).

## Permanent correction

- `scripts/bw3_verified.py` now maps bw3-29 Double Freeze to the shared,
  validated `coinDamageStatus` effect with `coins=2`, `amount=40`,
  `minHeads=1` and `status=paralysis`.
- The generated Noble Victories asset is included for immediate use, but
  the generator is also corrected so future APK builds keep the fix.
- The player-reported-bugs APK audit explicitly depends on
  `generateBW3ForApk`, so the check cannot race ahead of the generator.
- Android `versionCode` advances to 7331 and the Gradle, boot JavaScript
  and title UI all report `0.69.331`.

## Verification

- Regenerated Noble Victories from pinned offline source, 102/102 ready.
- Noble Victories and version tests: 38 passed.
- Player reported bug tests: 5 passed. The remaining XY catalogue
  presence check requires the XY1/XY2 generator output in GitHub CI.
- Global attack-energy audit: 6 passed.
- JavaScript syntax checked.

Full Android APK build must still complete in GitHub Actions.
