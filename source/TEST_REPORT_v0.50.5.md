# LuckyDex v0.50.5 Test Report

## Scope

Dream World follow-on pass built directly from the v0.50.4 source, without Codex.

- Removes the baked-in white Pleasant Forest navigation arrows beside the Ice Cream Scoop cone via a non-interactive art mask.
- Adds **Pokémon Seek** as the third Dream World activity.
- Pokémon Seek includes Easy / Normal / Hard, a 90-second search, a 3×3 manor layout, two hiding places per room, directional movement, Listen Carefully distance hints, wrong-Pokémon reveals that pause the timer, the lost-item bonus, permanent records, a score-first Dream World result page and six achievements.
- Adds the rare **Dream Sparkle** with reserved-safe Arcade prize handling and Settings controls: Off / Vanilla 2% / Test 25% / Always 100%.
- Updates Android / package / runtime identity to v0.50.5 (`versionCode 5005`).

## TDD evidence

The v0.50.5 core, integration and release tests were written before production integration. The first run failed for the expected missing Pokémon Seek integration, missing arrow mask and v0.50.4 release identity. After implementation, those tests were rerun green.

The older Wailord Dream World integration assertion was broadened from “exactly these two games” to “Ice Cream Scoop followed by Wailord, with later Dream World games allowed”; no Wailord gameplay assertion was removed.

## Focused Dream World regression suite

Command:

```text
node --test \
 tests/v0490-ice-cream-scoop-core.test.cjs \
 tests/v0490-ice-cream-scoop-integration.test.cjs \
 tests/v0500-wailord-water-spout-core.test.cjs \
 tests/v0500-wailord-water-spout-integration.test.cjs \
 tests/v0501-dream-world-polish.test.cjs \
 tests/v0502-dream-world-mechanics.test.cjs \
 tests/v0503-dream-world-ui-results.test.cjs \
 tests/v0504-dream-world-top-layout.test.cjs \
 tests/v0505-pokemon-seek-core.test.cjs \
 tests/v0505-pokemon-seek-integration.test.cjs \
 tests/v0505-release.test.cjs
```

Result on the working source: **48 / 48 passed, 0 failed**.

The same focused suite is also run after extracting the packaged ZIP before delivery.

## JavaScript syntax checks

`node --check` completed successfully for:

- `arcade-pokemon-seek-core.js`
- `arcade-pokemon-seek.js`
- `arcade-world.js`
- `arcade-platform.js`
- `arcade-records.js`
- `arcade-session.js`
- `app-v0167.js`

## Full project suite

`npm test` was attempted. The first three test programs completed successfully; the run then stopped at `adventure-core.test.cjs` because this clean environment does not have the declared Playwright development dependency installed:

```text
Error: Cannot find module 'playwright'
Require stack:
- scripts/recovery-browser.cjs
- tests/adventure-core.test.cjs
```

This is an environment/dependency stop, not a LuckyDex assertion failure. No full-suite pass is claimed.

## Build environment

This source snapshot does not provide a locally usable Android Gradle wrapper / SDK build environment here, so no APK build is claimed. Source-level release identity and focused regressions are verified.
