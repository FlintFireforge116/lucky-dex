# LuckyDex v0.19.1 Test Report

**Build marker:** `0.19.1-startup-hotfix`  
**Android version:** `versionName '0.19.1'`, `versionCode 201`  
**Baseline:** v0.18.0 source export

## Scope

v0.19.1 is the startup hotfix for the v0.19.0 Arcade fidelity pass. It keeps the v0.18 world/venue/result architecture and centralized reward ownership, but replaces the presentation/mechanics that still read as generic web games.

### World / art
- Viewport-scale world stops (roughly one phone width each) replace the narrow strip presentation.
- Eight local venue scenes live under `app/src/main/assets/arcade/venues-v0190/`.
- Landmark art was redrawn in a deliberate handheld/pixel-art language so locations read as game environments rather than flat geometric placeholders.
- Stadium Classroom replaces Moon Stage as the Clefairy venue; `moonStage` remains a save migration alias only.

### Pokémon-Amie games
- Berry Picker: single large tree, 1/2/3 requesting Pokémon by difficulty, 60-second finite modes, Unlimited three-miss mode, drag + tap fallback.
- Head It: 60-second finite modes, 1/2/3 active lanes, slow/standard/fast yarn, Fever at 15 combo, final giant bonus yarn, Unlimited three-miss mode.
- Tile Puzzle: moving-picture swap puzzle with every tile present at 4×5 / 5×6 / 6×8; no empty-slot sliding mechanic.

### Classic / custom games
- Voltorb Flip: 5×5 HGSS-style board/clue composition with Memo marks for Voltorb / 1 / 2 / 3.
- Berry Blender: existing continuous retail-derived spinner/RPM engine retained, with four-station Hoenn-style presentation.
- Clefairy Says: classroom teacher sequence, four pupils, arrow input, toy-hammer failures, five-hit / five-round structure.
- Fossil Excavation: layered Underground wall, pickaxe/hammer footprints, metal obstructions and wall stability/collapse.
- Poké Ball Drop / Unown Decoder / Who's That Pokémon?: mechanics/reward owners preserved; presentation upgraded to cabinet / ruins chamber / anime-interstitial scenes.

## Regression and static verification — working source tree

Run on the final source tree before packaging:

- **12/12 Arcade Node test files PASS**
- **27/27 pytest tests PASS**
- **All `app/src/main/assets/*.js` files pass `node --check`**
- **CSS brace-balance check PASS**
- **Duplicate HTML ID checks PASS** (covered by pytest)
- **v0.19 script ownership/order checks PASS**
- **v0.19 local landmark presence/size checks PASS**
- **Legacy Voltorb/Clefairy DOM replacement null-safety regression PASS**
- **Head It final bonus-yarn termination regression PASS**
- `keytool -list` succeeds for the existing signing key
- Keystore SHA-256 remains `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

## Android build / device status

This source export does not contain a Gradle wrapper and the environment has no system `gradle`, so the APK cannot be compiled locally here. The existing GitHub Actions workflow remains the authoritative Android compile/signing check after `LuckyDex_source.zip` is uploaded.

A physical Android-device pass has **not** been claimed. Source/static checks cover phone-oriented sizing and touch controls, but WebView swipe feel, touch latency, animation cadence and visual balance still need confirmation in the built APK. For this startup hotfix, a headless Chromium DOM/runtime smoke was run with the packaged HTML/CSS/JS injected directly (local/file navigation is blocked by the environment); it confirmed the title Start handler is attached, the button is the hit target at its centre, and clicking it dismisses the title. This is useful startup evidence but is not counted as Android device validation.

## Package verification

A candidate `LuckyDex_source.zip` was re-extracted into a clean directory and verified from the extracted bytes:

- ZIP CRC / `testzip()` — **PASS**
- Arcade Node suites — **12/12 test files PASS**
- pytest — **27/27 PASS**
- JavaScript syntax — **24/24 asset JS files PASS `node --check`**
- CSS brace balance — **PASS**
- signing keystore list/hash — **PASS**, hash unchanged

After this report is written into the source tree, the ZIP is rebuilt once more and the same extraction verification is rerun against the final deliverable.

## v0.19.1 startup regression fix

- Root cause: `clefairy-flow.js` was intentionally no longer loaded in v0.19, but `app-v0167.js` still dereferenced `nextMemoryRound`, `cashMemory`, `replayMemory`, and `memoryTap` at top level. The first missing global aborted script evaluation before `wireV5()` attached the title Start handler.
- RED regression added to require optional guards around all four superseded legacy handlers.
- Browser-level smoke after the fix confirmed `#titleContinueBtn` has a function handler, is the hit target at its centre, and clicking it applies `hidden-title` to the title screen.
- Full Node/pytest/JS syntax/signing checks rerun after the fix.
- Device/APK compile remains delegated to GitHub Actions.
