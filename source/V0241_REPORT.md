# LuckyDex v0.24.1 — Packs layout hotfix

## What changed

- Removed the non-functional Sealed shelf teaser from the Packs home screen.
- Converted `.pack-selector-card` to a fixed-row/flexible-browser grid so pack format, price and OPEN PACK remain reserved at the bottom of the card.
- Made `#packSetBrowser` the shrinking/scrolling region (`min-height: 0`, no viewport-based max-height).
- Added short-phone compaction at `max-height: 760px`.
- Kept the v0.24 search, sort, reverse-order control, hidden `#setSelect` compatibility path and pack-opening engine unchanged.

## Update identity

- applicationId: `com.example.luckydex`
- versionCode: `241`
- versionName: `0.24.1`
- save key: `luckyDexSave` (unchanged)
- GitHub signing secret contract: `LUCKYDEX_KEYSTORE_BASE64` (unchanged)

## Verification

- New v0.24.1 layout regression was observed RED on v0.24.0 and GREEN after the fix.
- New v0.24.1 update-identity regression was observed RED at versionCode 240 and GREEN at 241.
- 19 available non-browser test programs pass.
- Static Chromium layout render with production HTML/CSS keeps OPEN PACK fully visible at 360×700, 360×800 and 412×915.
- Browser navigation-based Playwright suites cannot run in this environment because Node Playwright is not installed and local navigation is administrator-blocked; CI/device testing remains authoritative for those cases.
