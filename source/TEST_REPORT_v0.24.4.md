# LuckyDex v0.24.4 Test Report

## Targeted chronology/signing verification
- `tests/v0244-release-dates.test.cjs` — PASS
- `tests/v0243-release-signing.test.cjs` — PASS
- `tests/v0242-pack-declutter.test.cjs` — PASS
- `tests/v0241-pack-layout.test.cjs` — PASS
- `tests/v024-pack-browser.test.cjs` — PASS
- `tests/v0241-compat.test.cjs` — PASS after release metadata was updated to 0.24.4

## Release-date registry
- 247 physical-set display-name/alias entries packaged.
- Every packaged date is exact ISO `YYYY-MM-DD`.
- Runtime Release Date sorting consults the explicit registry before remote/card-index metadata.
- Card-art index generation now consumes `scripts/physical-set-release-dates-v0244.json` and hard-fails if any of the validated 199 sets remains without a complete date.
- Chronology smoke: `30th Celebration > Pitch Black > Chaos Rising > Perfect Order > Ascended Heroes > Phantasmal Flames > Mega Evolution > Prismatic Evolutions > My First Battle > 151 > Obsidian Flames > Base Set`.

## Broader local verification
- 22 non-browser Node test programs: PASS.
- 16 Playwright/recovery-browser programs were not locally runnable in this environment because Playwright/node_modules is unavailable; they remain packaged for CI.
- Top-level asset JavaScript syntax: 18/18 PASS.
- HTML IDs: 224 total, 0 duplicates.
- Authentic Arcade assets: PASS (44 scenes/sheets/crops, 2098 sprites, 2078 actors).
- Arcade venue verification: PASS (8/8).
- Adventure asset audit: PASS (829 images, 1025 species, 0 errors).
- Embedded Python in the card-art-index workflow: syntax PASS.

## Permanent Android identity
- applicationId: `com.example.luckydex`
- versionCode: `244`
- versionName: `0.24.4`
- save key remains `luckyDexSave`
- bundled keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- signing certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`
- Gradle hard-fails if `app/luckydex-dev.keystore` is missing.

## Environment limitation
No local Gradle executable/wrapper is present here, so the Android APK itself must be compiled by the established GitHub Actions build.
