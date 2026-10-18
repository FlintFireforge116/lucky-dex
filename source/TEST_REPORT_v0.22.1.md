# LuckyDex v0.22.1 Phone UI Focus — Test Report

## Scope
This patch is intentionally narrow. It does not redesign the Arcade again. It focuses on phone composition and touch reliability on top of the v0.22 restoration baseline.

## Changes verified
- Berry Picker drag now uses Pointer Capture so Android/WebView continues delivering movement/up events after the finger leaves the berry element.
- Berry Picker clears stale selection after a delivery attempt.
- Berry Service uses a portrait layout grid and dedicates the remaining screen height to the live scene.
- Berry Picker customer Pokémon are smaller and lower in the scene; the tree/berry area is visually dominant.
- Berry Picker help text overlays the lower scene instead of consuming a permanent layout row.
- Arcade game pages explicitly fill the usable app viewport and top-compose instead of vertically centering short content like web cards.
- Short-phone rules compact headers/actions while preserving touch target size.
- Arcade scrollbars are hidden; emergency vertical overflow remains available if an unusually small viewport requires it.
- Extra bottom breathing room is reserved for gesture/navigation areas.
- Browser regression coverage was extended so every active Arcade primary control must fit at 360x800, 393x873 and 412x915, and Berry Picker must use >55% of phone height.

## Working-tree verification
- Static Node test programs: PASS
  - arcade-ball-drop.test.cjs
  - arcade-classics.test.cjs
  - arcade-platform.test.cjs
  - arcade-session.test.cjs
  - restore-regressions.test.cjs
  - v022-targeted.test.cjs
  - v022-update-compat.test.cjs
  - v0221-ui-focus.test.cjs
- JavaScript syntax: 18/18 top-level asset JS files PASS (`node --check`).
- Duplicate HTML IDs: 0.
- CSS brace balance: PASS for arcade.css, arcade-amie.css, berry-blender.css and clefairy-scene.css.
- Release metadata: `versionName 0.22.1`, `versionCode 221`.

## Browser/phone QA performed locally
The environment cannot install the Node Playwright dependency from npm, so the repository's Node Playwright suites could not be executed locally in this session. Equivalent focused checks were run with the Python Playwright package and system Chromium.

### Berry Picker interaction fixture — 360x800
- Live game height: 800 px.
- Berry stage height after patch: ~578 px (~72% of screen).
- Real Pointer Capture drag from the requested berry to the customer: PASS.
- Served counter after drag: increments from 0 to 1.
- Start/restart control remains inside the viewport with extra bottom clearance.

### Full Arcade DOM phone audit
Audited all 9 active Arcade games at 360x800, 393x873, and 412x915 using the real HTML/CSS/runtime owners in an inlined Chromium fixture.
- Primary control visible: PASS for all games at all three sizes.
- Internal vertical overflow: 0 px for all tested game screens.
- Berry Picker stage >55% of viewport: PASS.
- Additional 320x700 stress check: all 9 primary controls remain visible with no page-like game overflow.

The updated repository browser tests will also enforce these constraints in CI when Playwright is installed normally.

## Save/update compatibility
- applicationId remains `com.example.luckydex`.
- WebView save origin remains `file:///android_asset/index.html`.
- save key remains `luckyDexSave`.
- Legacy Head It save fields remain tolerated.
- v0.22.1 increases Android versionCode to 221.

## Local build limitation
No Gradle wrapper/system Gradle is available in this source/runtime, so the Android APK compile/signing step remains a GitHub Actions/Codex verification step.
