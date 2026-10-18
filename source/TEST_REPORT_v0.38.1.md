# LuckyDex v0.38.1 Test Report

## Scope
Rock Harden phone-feedback polish release based on v0.38.0.

### Changes verified
- Rock schedule now reaches 44.70s of the 45.00s round instead of stopping after a fixed 16 waves.
- Deterministic .5-RNG schedule counts: Easy 18, Normal 20, Hard 22 waves.
- Visible fall/telegraph time: Easy 1150ms, Normal 900ms, Hard 700ms.
- Average deterministic cadence: Easy ~2472ms, Normal ~2212ms, Hard ~2001ms.
- The four randomly assigned species are locked across Easy/Normal/Hard selection and carried unchanged into START.
- Four unique species per setup remain required.
- If the player is the sole survivor, the round continues to the clock cap so rocks do not stop early; a CPU sole survivor may still finish early after the player is KO'd.
- Mobile arena minimum height increases from 272px to 390px at <=420px widths; <=340px uses 350px.
- Quarry lanes gain two additional Gen III cave-wall strata bands and alternating tile offset for visual depth.
- Existing silver Harden filter, Gold Rock system, rewards and seven Rock Harden achievements are preserved.
- Release identity: 0.38.1 / versionCode 3801.

## TDD evidence
New v0.38.1 tests were run before production changes and failed on the expected missing behaviours:
- no difficulty-specific fall duration,
- fixed 16-wave schedule,
- roster rerolled on difficulty change,
- mobile arena below the new height floor.

A separate last-survivor regression was then added and observed RED under the v0.38.0 immediate-finalize rule before the new player-sole-survivor contract was implemented.

## Focused verification
PASS:
- `node tests/v0381-rock-harden-polish.test.cjs`
- `node tests/v0381-rock-harden-roster-runtime.test.cjs`
- all v0.38.0 Rock Harden non-browser tests
- `node tests/v0380-rock-harden-state-achievements.test.cjs`
- `node --check app/src/main/assets/arcade-rock-harden-core.js`
- `node --check app/src/main/assets/arcade-rock-harden.js`
- `node --check app/src/main/assets/achievements-v0341.js`

The 200-seed CPU balance regression remains green after the longer schedules:
- Easy perfect ~36.88%, miss ~14.56%
- Normal perfect ~58.23%, miss ~7.01%
- Hard perfect ~76.15%, miss ~2.73%

## Wider regression
A bounded parallel sweep ran every test program that does not depend on the unavailable Playwright/recovery-browser harness:

- **263 / 263 available programs passed**
- Playwright/recovery-browser programs remain environment-unavailable because the dependency is not installed in this extracted source tree.

The old v0.38.0 release-floor test was updated from an exact-version assertion to require v0.38.0-or-later while preserving the Rock Harden bundle requirements.

## Android build capability
`gradlew` is absent from the supplied source bundle, so an APK compile cannot be claimed in this environment.

## Review
Final review was a self-review because no independent subagent reviewer is available in this harness. No new Critical or Important issue was found in the v0.38.1 diff.

Previously disclosed minor remains deferred: a card/booster Gold reward fallback can display the subtitle `Offline fallback` when the fallback was caused by timeout/resolver error rather than literal offline state. Reward correctness is unaffected.
