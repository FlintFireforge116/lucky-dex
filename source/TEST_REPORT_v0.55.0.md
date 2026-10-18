# LuckyDex v0.55.0 Test Report

## Scope

v0.55.0 adds **Gutsy Golbat** as the second Pokémon Stadium 2 · Kids Club game. No other Stadium 2 minigame is added in this release.

## Gutsy Golbat implementation

- Four-Golbat cave race with one player and three CPU opponents.
- Tap/keyboard flap physics, horizontal steering, finite scrolling cave course and finish ranking.
- Ordinary heart collection, recoverable scattered hearts, Magnemite collisions (up to 3 hearts scattered), and hard rival impacts (1 heart scattered).
- Easy / Normal / Hard CPU reaction, steering and aggression profiles.
- Rare Golden Heart event worth 5 hearts, with Settings odds control (Off / Vanilla 2% / Test 25% / Always).
- Persistent Arcade records, five achievements, Lucky Coin rewards, pause/resume and Arcade result review.
- Uses existing LuckyDex Pokémon sprites only. No Stadium 2 ROM/executable/assets are bundled.

## Verification

Fresh focused + shared Arcade regression run:

```text
46 tests
46 pass
0 fail
```

Covered:
- Gutsy Golbat core mechanics, hazards, rare event, rewards and ranking
- Gutsy Golbat Arcade navigation / panel / Settings / permanent state / achievements
- v0.55.0 release identity
- Clear Cut Challenge regression
- Arcade Records registry/state/core
- Arcade Session review flow
- Pokémon Picross catalogue/completed-stage/drag regression

JavaScript syntax checks passed for:
- `arcade-gutsy-golbat-core.js`
- `arcade-gutsy-golbat.js`
- `arcade-world.js`
- `arcade-platform.js`
- `arcade-records.js`
- `achievements-v0341.js`
- `app-v0167.js`

## Full historical test runner

`npm test` was attempted. The first three test programs completed successfully, then `adventure-core.test.cjs` stopped because this environment does not have the declared `playwright` module installed:

```text
Error: Cannot find module 'playwright'
```

This is an environment dependency limitation, not a Gutsy Golbat assertion failure. The full browser suite is therefore **not claimed as passing**.

## Android build

An APK was not built locally because the source package does not contain `gradlew` and this environment has no system Gradle installation. GitHub Actions remains the Android build path.
