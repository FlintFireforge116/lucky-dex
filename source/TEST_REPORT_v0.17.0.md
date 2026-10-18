# LuckyDex v0.17.0 Test Report

## Scope
Arcade zone navigation, Berry Picker, Head It, Tile Puzzle, shared Arcade rewards/save migration, Poké Ball Drop economy rebalance, and Ditto Transform redesign.

## Product rules implemented
- Four zones: Kalos Amie Garden, Game Corner, Discovery District, Performance Stage.
- No Arcade entry fee or energy gate.
- Repeated play remains available; coin rewards are intentionally modest.
- Daily item bonuses are once per game per local date and do not block replay.
- Berry Picker daily item: Berries.
- Head It daily item: Potion, with limited Great Ball upgrade thresholds.
- Tile Puzzle daily item: Poké Balls / Great Ball on Hard.
- Poké Ball Drop: ordinary points × 0.06, minimum 15 when positive, capped at 90; each genuine centre jackpot separately adds 1000 Lucky Coins.
- Ditto Transform: one Ditto in early rounds, two from Round 8; collection sprites use a deterministic dot-face overlay while transformed. Existing `bestDitto` and run-bank cash-out state remain compatible.

## Automated verification
- `node tests/arcade-platform-v0170.test.js`
- `node tests/arcade-amie-v0170.test.js`
- `node tests/arcade-zones-v0170.test.js`
- `node tests/arcade-ditto-v0170.test.js`
- `python -m pytest -q`
- `node --check` for every JavaScript asset
- HTML ID uniqueness check
- Release script-order assertion
- Stable signing keystore SHA-256 and Gradle signing values assertion
- Tile Puzzle: 600 seeded solvability/inverse-replay checks across 3×3, 4×4 and 5×5 boards

## Build note
Local source verification does not claim an Android APK build. The existing GitHub Actions workflow must run `:app:assembleDebug` from the packaged source and succeed before the APK itself is considered build-verified.
