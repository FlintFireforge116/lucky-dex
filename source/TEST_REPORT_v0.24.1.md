# LuckyDex v0.24.1 Test Report

Target: v0.24.1 / versionCode 241

## New regressions

- `tests/v0241-pack-layout.test.cjs`
  - RED on v0.24.0 because Sealed shelf existed and the selector/browser did not reserve pack controls.
  - GREEN after converting the selector to grid, making the set browser flexible, removing Sealed shelf and adding short-phone compaction.
- `tests/v0241-compat.test.cjs`
  - RED on versionCode 240.
  - GREEN at versionCode 241 / versionName 0.24.1 while preserving `com.example.luckydex`.

## Regression suite

19 non-browser test programs pass, including Adventure battle/model, Arcade models, v0.22-v0.24 compatibility, Trade market/UI, Pack Browser and the two v0.24.1 hotfix tests.

## Phone geometry check

Production HTML/CSS was rendered in system Chromium using `page.set_content` (no app-navigation dependency):

- 360×700: OPEN PACK fully visible; set browser height 111px.
- 360×800: OPEN PACK fully visible; set browser height 179px.
- 412×915: OPEN PACK fully visible; set browser height 292px.

The browser region expands/shrinks while format/price/open rows remain reserved.

## Environment limitations

- Node Playwright module is not installed in the extracted archive, so the existing Node browser suites cannot start locally.
- Direct Chromium navigation to localhost is blocked by the host administrator.
- System Chromium can still render the production HTML/CSS via `page.set_content`, which was used for the geometry check above.
- No Gradle wrapper/system Gradle is present, so GitHub Actions remains the Android compile/signing authority.
