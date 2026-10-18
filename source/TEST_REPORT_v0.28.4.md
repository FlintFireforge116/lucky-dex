# LuckyDex v0.28.4 test report

## Scope
v0.28.4 is a focused Arcade polish release based on v0.28.3:
- Unown Decoder typed modes now use a dedicated fixed fullscreen answer screen so the Android keyboard does not reflow the underlying Arcade game page.
- Clefairy Match retains the v0.28.3 faster pacing, removes the move-history icon row, cleans the Star and Moon pose eyes while preserving those dedicated body poses, and rebalances coin growth.

## Release identity
- Android application ID: `com.example.luckydex` (unchanged)
- Android `versionCode`: `284`
- Android `versionName`: `0.28.4`
- package/package-lock/runtime/visible app versions: `0.28.4`
- Permanent signer file remains `app/luckydex-dev.keystore`.
- Signer SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`

## Unown Decoder keyboard-safe typed screen
Normal and Hard questions now open a dedicated `position: fixed` answer view using `100dvh`. The view contains the category, complete Unown glyph message, clue when the mode allows one, mirrored timer, answer field, and Decode control. The underlying Arcade layout no longer needs to compress around the software keyboard.

The answer screen can be dismissed without ending the question; the main Decoder screen exposes an `ENTER ANSWER` control to reopen it while the timer continues. Correct/incorrect canonical reveal is mirrored into the answer screen and remains visible for the existing 650 ms reveal window before returning to the streak decision/result flow.

## Clefairy visual/UI polish
- v0.28.3 pacing is unchanged: Star 968 ms, Song 1129 ms, Moon 1065 ms, Spin 935 ms; inter-action pause remains 100 ms.
- `clefairy_pose_star.png` and `clefairy_pose_moon.png` retain their original pose silhouettes/body positions, with the inconsistent eye drawings cleaned to matching closed-eye expressions.
- The move-history/emoticon strip between the stage and the four answer buttons has been removed from markup and game logic.

## Clefairy reward curve
The old per-round linear award `50 + 30 × round` is replaced with:

`round(85 × 1.17^(round - 1))`

This trims the easy early accumulation while letting genuinely deep memory streaks become more valuable later.

Selected cumulative banks:
- Round 3: 300
- Round 6: 781 (old curve: 930)
- Round 7: 999 (old curve: 1190)
- Round 10: 1901 (old curve: 2150)
- Round 12: 2788 (old curve: 2940)
- Round 15: 4767 (old curve: 4350)

## Targeted verification
Passed:

```text
node -c app/src/main/assets/arcade-unown.js
node -c app/src/main/assets/clefairy-memory.js
node -c app/src/main/assets/clefairy-scene.js
node tests/v0284-clefairy-polish.test.cjs
node tests/v0284-unown-answer-screen.test.cjs
node tests/v0284-release.test.cjs
node tests/v0283-clefairy-pace.test.cjs
node tests/v0283-unown-data.test.cjs
node tests/v0283-unown-ui.test.cjs
node tests/v0283-unown-flow.test.cjs
node tests/v0283-unown-browser.test.cjs
node tests/v0283-arcade-regression.test.cjs
node tests/v0283-release.test.cjs
```

The historical v0.28.3 release/browser checks were made forward-compatible with the v0.28.4 version increment and dedicated answer-screen UI while keeping their original regression coverage.

## Full test-program sweep
`npm test` was attempted and stops when it reaches the first test that directly requires Playwright because the declared `playwright@1.62.1` development dependency is not installed in this execution environment.

Every `tests/*.cjs` program was then run individually:
- 122 test programs: PASS
- 14 Playwright-dependent programs: unavailable because `playwright` is not installed
- 1 known pre-existing baseline failure: `v0223-ball-stalls.test.cjs`
- 0 unexpected failures

The known Ball Drop seeded stress failure is unrelated to v0.28.4. `app/src/main/assets/arcade-ball-drop.js` is byte-for-byte unchanged from v0.28.3 (SHA-256 `9492033d5bd40b82318fcfc19c470d92576bf93e25b9cd8d199413855efca6e0`).

## Offline asset integrity
All required offline audits passed after the Clefairy pose cleanup:

```text
python3 scripts/fetch_arcade_v0200_assets.py --check
  PASS: 44 authentic scenes/sheets/crops
  PASS: 2,098 Arcade sprites
  PASS: 2,078 unretouched Arcade actors

python3 scripts/verify_v0223_venues.py
  PASS: 8 venue assets

python3 scripts/verify_adventure_assets.py
  PASS: 829 images, 1,025 species, 386 back sprites, 37 registry objects

python3 scripts/verify_fossil_museum_v0250_assets.py
  PASS: 42 images
```

## Android build availability
This container has no project `gradlew` wrapper and no system Gradle executable, so an APK build/signature inspection was not available here. Source-level package/version/signer checks pass; this report does not claim an APK was built in this environment.
