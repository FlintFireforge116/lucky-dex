# LuckyDex v0.22.2 Device Geometry + Touch Hotfix — Test Report

## Scope

This patch is based on screenshots captured on the user's real Samsung device. It fixes four concrete regressions visible there:

1. fixed-position app/Arcade UI rendering underneath Android status/navigation bars;
2. Berry Picker drag failing on the real WebView touch path despite Pointer Events working in desktop Chromium;
3. Arcade world/venue art rendering as a narrow landscape strip between blurred filler bands;
4. Fossil Dig rendering broken multi-cell/sliced backgrounds that looked like rows of metal.

## Implementation checks

- Android WebView is now hosted in a `FrameLayout`; system-bar/display-cutout `WindowInsets` are applied as layout margins around the WebView, not WebView padding. This makes CSS fixed positioning and `100dvh` resolve inside the actual usable phone area.
- Berry Picker keeps Pointer Capture for mouse/stylus and uses an explicit `touchstart` / document-captured `touchmove` / `touchend` path for Android touch input.
- Berry Picker Pokémon are smaller/lower in the scene so more of the tree remains visible.
- World and venue art now use `object-fit: cover` with no blurred filler pseudo-background.
- Fossil Dig is a 6x7 board with 12 digs. Every tile is one-tap only and reveals exactly one final state: empty soil, metal, or one intact fossil item.

## Automated verification

### Node / source contracts

Passed:

- `tests/arcade-ball-drop.test.cjs`
- `tests/arcade-classics.test.cjs`
- `tests/arcade-platform.test.cjs`
- `tests/arcade-session.test.cjs`
- `tests/restore-regressions.test.cjs`
- `tests/v022-targeted.test.cjs`
- `tests/v022-update-compat.test.cjs`
- `tests/v0221-ui-focus.test.cjs`
- `tests/v0222-device-regressions.test.cjs`

The browser-suite Node tests could not run in this harness because the interrupted workspace no longer contained the npm `playwright` package. Product code was not changed to bypass that limitation.

### Real touch-event regression

A minimal Chromium mobile context (`isMobile=true`, `hasTouch=true`) loaded the exact `arcade-amie.js` production source and used Chrome DevTools `Input.dispatchTouchEvent` for a real `touchStart -> touchMove -> touchEnd` gesture.

Result:

- correct requested berry dragged to the customer;
- served counter changed `0 -> 1`;
- drag ghost cleaned up;
- no page errors.

This specifically verifies the new Touch Events path instead of the old mouse/pointer emulation that produced a false positive on v0.22.1.

### Fossil model/render regression

- generated board: 42 cells (6 rows x 7 columns);
- start durability: 12 digs;
- board aspect ratio: approximately 7:6, giving square cells;
- repeat clicks on revealed cells do not consume another dig;
- no old multi-cell fossil-slice model remains;
- visual structure smoke produced a clean uniform board with single-cell reveal states.

### General source integrity

- all top-level `app/src/main/assets/*.js` files pass `node --check`;
- active Arcade CSS brace counts balance;
- duplicate HTML IDs: 0;
- version metadata: `0.22.2`, versionCode `222`;
- application id / localStorage save origin compatibility preserved.

## Limitation

The harness browser currently blocks navigation to both local HTTP and `file://` full-app URLs by administrator policy, so a full end-to-end browser navigation replay could not be rerun here after the screenshot-driven fix. The targeted Berry touch path was still tested in Chromium using `page.set_content` plus the exact production script, and the rest of the patch is protected by source/model regressions.

## Device verification requested

On the next APK, check specifically:

- Adventure top bar is below Samsung status icons;
- bottom app navigation and Arcade action buttons sit above the Samsung navigation/gesture area;
- Berry Picker berries visibly follow a finger drag and drop onto a Pokémon;
- World and venue art fill the scene rather than showing blurred top/bottom bands;
- Fossil Dig shows one coherent 6x7 rock grid and each tap changes only the tapped square.
