# LuckyDex v0.20.0 Test Report

**Date:** 2026-10-05  
**Baseline:** LuckyDex v0.19.1  
**Release:** `versionName '0.20.0'`, `versionCode 210`  
**Build marker:** `0.20.0-authentic-arcade`

## Scope

v0.20.0 is the authentic-asset and phone-geometry rebuild requested after v0.19.1. It replaces the active generated venue presentation with actual-game screenshot/extracted-asset paths, removes native horizontal world scrolling, preserves source-game aspect ratios, and keeps each game's initial primary control visible/tappable on portrait phones.

## Authentic asset ownership

- Active world art points only to `arcade/authentic-v0200/venues/`; no active v0.20 world path references `venues-v0190`.
- Pokémon-Amie surfaces reference actual Berry Picker, Head It and Tile Puzzle screenshots.
- Voltorb Flip uses an actual HGSS gameplay screenshot plus HGSS-faithful tile assets.
- Berry Blender uses extracted `pret/pokeemerald` center/outer/arrow graphics over a source-game frame.
- Clefairy Says and Underground Mining use actual-game screenshot imagery as the dominant scene.
- Unown Decoder, Who's That Pokémon and Poké Ball Drop use actual Pokémon location imagery rather than generated venue paintings.
- `scripts/fetch_arcade_v0200_assets.py` owns deterministic download/fallback URLs and validates file signatures. GitHub Actions runs fetch + validation before Gradle; failure aborts the build.

The sandbox used for this source pass blocks arbitrary external binary downloads, so the authentic screenshot binaries are not claimed as locally fetched here. The source ZIP contains the deterministic fetch manifest/workflow; GitHub Actions is the authoritative asset-fetch and Android-compile stage.

## Verification run

### Logic / regression

- All `tests/arcade-*.test.js` suites: **PASS**.
- `pytest -q`: **38 passed, 0 failed**.
- All `app/src/main/assets/*.js` files passed `node --check`.
- CSS brace balance: **PASS**.
- Duplicate `id=` values in `index.html`: **0**.

### Android portrait geometry

`python3 scripts/browser_smoke_v0200.py --browser /usr/bin/chromium`

Result: **PASS — 2 viewports × 10 visible games**.

Checked at **360×800** and **412×915**:

- world computed `overflow-x` is `hidden`;
- document horizontal overflow is zero;
- no native horizontal scrollbar can overlay venue art;
- each game's initial primary action intersects the viewport and is the actual topmost hit target;
- Start/New Game actions are fully visible at both sizes, including the tightest Tile Puzzle and Voltorb layouts.

### Save/signing compatibility

- Package/application ID unchanged.
- `app/luckydex-dev.keystore` SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`.
- Existing v0.19 mechanic/save/reward modules remain the underlying owners; v0.20 is presentation/world ownership plus narrow null-safe launch integration.

## Remaining authoritative CI check

GitHub Actions must still complete:

1. `python3 scripts/fetch_arcade_v0200_assets.py`
2. `python3 scripts/fetch_arcade_v0200_assets.py --check`
3. `gradle --no-daemon :app:assembleDebug`

This verifies that all third-party/extracted authentic images are reachable from the runner and that the final Android APK compiles with those local assets packaged for offline runtime use.
