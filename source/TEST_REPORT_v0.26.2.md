# LuckyDex v0.26.2 verification

## User-visible fixes
- Physical booster artwork materialisation is now attached to Gradle `preBuild` during GitHub Actions, so the outer repository workflow cannot skip the artwork step when it unzips `LuckyDex_source.zip` and invokes Gradle directly.
- The booster-art builder accepts `.webp`, `.png`, `.jpg`, and `.jpeg` packshots. This covers PNG-only sets such as Perfect Order as well as WebP sets such as Jungle, Skyridge, and Shining Legends.
- The builder explicitly refuses an incomplete build if Base Set, Jungle, Skyridge, Shining Legends, or Perfect Order cannot resolve pack artwork.
- Pack-complete cards use `object-fit: contain`, three columns on phone-width screens, and a non-sticky Back to Pack Shop button so card art is not cropped or obscured.

## Verification run
- JavaScript syntax checks: PASS (`app-v0167.js`, `booster-art-v0260.js`, `tcgp-source-v0160.js`).
- Python syntax check: PASS (`scripts/build-booster-art-index.py`).
- v0.26.2 pack-art/summary regression: PASS.
- v0.26.2 release/update identity regression: PASS.
- Active non-browser regression programs: **66 PASS**.
- Offline asset integrity checks: **4 PASS**.
- Permanent keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Permanent signer certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`.
- Android identity: `com.example.luckydex`, versionCode `262`, versionName `0.26.2`.

## Environment limits
- The 19 browser/Playwright-driven programs were not run locally because Playwright/Chromium is not installed in this sandbox. The repository's GitHub workflow installs Playwright before its full test run.
- The booster asset downloader cannot reach the network from this sandbox. Representative upstream artwork was separately verified through GitHub for Jungle (`base2`), Skyridge (`ecard3`), Shining Legends (`sm35`) and Perfect Order (`me3`). The actual GitHub APK build has network access and now invokes the downloader from Gradle itself.
