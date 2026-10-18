# LuckyDex v0.22.0 Targeted Restore — Test Report

Date: 2026-10-05

## Scope

This pass starts from the v0.21 recovery baseline and deliberately keeps its single-owner runtime architecture. It implements the user's targeted restore/polish list without reintroducing the retired multi-generation Arcade override stack.

### Delivered changes

- Head It removed from active Arcade UI/router/DOM while legacy `bestHeadIt` save fields remain accepted.
- Poké Ball Drop radius increased from 20 to **30** everywhere in the physics/drawing path; 3-ball lifecycle and jackpot economy unchanged.
- Moon/Pond Clefairy memory game restored from the v0.17 scene implementation into one current cancellable owner.
- Historical v0.16.4-style Berry Blender timing/presentation restored in the current single owner (continuous rotation, BEST/GOOD/MISS, NPC stations, speed/RPM/progress).
- Tile Puzzle now shows a persistent TARGET thumbnail generated from the exact source canvas and uses richer Amie scene compositions with multiple Pokémon/background detail.
- Fossil Excavation changed to a **7×8**, **18-dig**, one-tap-per-cell reveal model. Revealed cells are inert; metal/empty/fossil contents are predetermined and revealed once.
- Arcade no longer requests Android immersive fullscreen. Native WebView insets remain the safe-area boundary.
- Arcade world/venue/game mode hides LuckyDex app chrome only after Arcade is actually entered.
- `#arcadeWorldView` now explicitly fills **100%** of the usable Arcade viewport; this fixes the previous content-height collapse that left the world at ~322 px on a 360×800 viewport.
- Kalos venue/world art switched from the Berry Picker gameplay screenshot (`amie-play.jpg`) to the packaged Pokémon-Amie hub capture (`amie-garden.jpg`).
- Berry Picker stage flexes vertically to use available phone height.
- Settings now has Import Save alongside Export Save. Import validates JSON and requires explicit confirmation before replacing `luckyDexSave`.
- Android identity/update invariants remain unchanged: package `com.example.luckydex`, origin `file:///android_asset/index.html`, primary key `luckyDexSave`, stable signer preserved in the local working tree.

## Static/model verification

Fresh run from the final working tree:

- `arcade-ball-drop.test.cjs` — PASS
- `arcade-classics.test.cjs` — PASS
- `arcade-platform.test.cjs` — PASS
- `arcade-session.test.cjs` — PASS
- `restore-regressions.test.cjs` — PASS
- `v022-targeted.test.cjs` — PASS
- `v022-update-compat.test.cjs` — PASS
- JavaScript syntax: **18/18** top-level runtime asset JS files passed `node --check`.
- Duplicate HTML IDs: **0**.

The Node Playwright tests could not be run through `npm test` in this harness because the local `node_modules` dependency was not present and npm installation is network-blocked here. The same production source was exercised with the already-installed Python Playwright/Chromium runtime instead (see below).

## Real Chromium phone QA

Production `index.html` and local assets were loaded with all remote requests blocked. An in-memory localStorage shim was used only because this harness blocks top-level file/http navigation for browser automation; application JS and CSS were not mocked.

Viewports tested:

- **360×800**
- **393×873**
- **412×915**

For all nine visible Arcade games:

- no page errors
- no console errors
- initial Start/New Game control visible
- button centre was the actual topmost tap target
- no horizontal document overflow
- controls remained inside the viewport

World measurements after the full-height regression fix:

- 360×800 → world view **360×800**
- 393×873 → world view **393×873**
- 412×915 → world view **412×915**

Normal LuckyDex top/bottom chrome is hidden in Arcade mode and returns after leaving Arcade.

Screenshots: `artifacts/python-qa/`

## Started-state visual QA

Started-state screenshots were captured at 360×800 for the changed games:

- Berry Picker
- Tile Puzzle
- Poké Ball Drop
- Berry Blender
- Clefairy Match
- Fossil Excavation

Results:

- no runtime/console errors
- Tile Puzzle TARGET source is a real generated image (`336×202`) and is displayed persistently at ~`86×52` next to the active puzzle
- Fossil first reveal changed exactly one cell; board moved from 56 covered cells to 55, with 17 digs left from the 18-dig start
- restored Moon/Pond Clefairy scene renders and accepts START
- restored Blender renders historical circular machine/timing HUD and accepts START BLENDER
- enlarged Poké Ball is used by the live physics board

Screenshots/contact sheet: `artifacts/started-qa/`

## Navigation / lifecycle smoke

A fresh browser navigation smoke completed with **0 failures / 0 uncaught errors**:

1. Open Trade
2. Leave Trade → Adventure
3. Enter Arcade
4. Open/start/leave Poké Ball Drop
5. Return to world
6. Open/start/leave Berry Blender
7. Return to world
8. Open/start/leave Clefairy
9. Return to world
10. Open/start/leave Fossil Excavation
11. Return to world
12. Open/start/leave Tile Puzzle
13. Return to world
14. Leave Arcade
15. Reopen Trade

At the end, Trade was active and normal app chrome was restored (`topbar: flex`, `bottom-nav: grid`).

Evidence: `artifacts/navigation-smoke.json`.

## Save/update compatibility

Verified in source/tests:

- `applicationId 'com.example.luckydex'`
- `versionCode 220`
- `versionName '0.22.0'`
- WebView remains `file:///android_asset/index.html`
- save key remains `luckyDexSave`
- legacy `bestHeadIt` remains tolerated despite Head It retirement
- GitHub workflow supports restoration of the established signing identity through `LUCKYDEX_KEYSTORE_BASE64`
- local working-tree keystore SHA-256 remains:
  `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

The distributable GitHub source ZIP intentionally excludes the private keystore, matching the v0.21 recovery packaging convention. CI must restore the same signer secret for an APK to update an already-installed LuckyDex copy without uninstalling.

## Android build status

No Gradle wrapper or system Gradle is available in this harness, so no local APK compile/sign claim is made. The existing GitHub Actions workflow remains the authoritative Android compile/sign/installable-artifact check.

## Remaining work suitable for Codex

The mechanical/restore list is substantially implemented and stable in browser QA. A later Codex pass can focus narrowly on visual asset selection and art direction, especially replacing additional venue images if desired, without touching runtime ownership, save migration, or the restored game mechanics.
