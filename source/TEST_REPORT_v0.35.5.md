# LuckyDex v0.35.5 Test Report

## Release identity
- `applicationId 'com.example.luckydex'` unchanged for in-place updates.
- `versionCode 355`
- `versionName '0.35.5'`
- package/build markers updated to `0.35.5`.

## Ekans Hoop Hurl Android gesture fix
v0.35.5 fixes the live Android/WebView slingshot failure where the aim marker stayed at the initial bottom-middle position and release did not throw.

Root cause: `arcade.css` defines `.arcade-game button { touch-action: manipulation }`. That selector is more specific than the previous `.ekans-hoop-launcher { touch-action: none }`, so Android/WebView was allowed to take ownership of the drag and cancel the pointer stream before the Ekans gesture code received movement. The JS unit tests passed because they bypassed the browser CSS cascade.

Fix: the Ekans launcher now has a higher-specificity `.arcade-game button.ekans-hoop-launcher { touch-action: none }` rule. The approved control model is unchanged: pull back/down to aim forward, horizontal pull is mirrored like a slingshot, and release throws to the visible marker.

## Focused verification
Passed:
- `tests/v0355-ekans-touch-ownership.test.cjs`
- `tests/v0354-ekans-slingshot-gesture.test.cjs`
- `tests/v0353-ekans-release-endings.test.cjs`
- `tests/v0352-ekans-touch-gesture.test.cjs`
- `tests/v0355-release.test.cjs`
- `tests/v0354-release.test.cjs`

The v0.35.5 regression specifically guards against the CSS specificity conflict that caused the real Android failure.

## Regression verification
A non-browser run executed every test program that does not require the unavailable Playwright module:
- 212 test programs passed.
- 21 Playwright/browser-dependent programs were skipped because `playwright` is not installed in this extracted environment.
- `scripts/fetch_arcade_v0200_assets.py --check` passed.
- `scripts/verify_v0223_venues.py` passed.
- `scripts/verify_adventure_assets.py` passed.
- `scripts/verify_fossil_museum_v0250_assets.py` passed.

`npm test` cannot complete in this environment because the source bundle has the Playwright dependency declared but no installed `node_modules`; the first browser-dependent test stops with `Cannot find module 'playwright'`.
