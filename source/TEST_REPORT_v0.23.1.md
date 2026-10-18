# LuckyDex v0.23.1 verification

## Red/green regression
`tests/v0231-polish.test.cjs` was written before implementation and initially failed because `HOTSPOT_BLUEPRINTS` did not exist. After implementation it passes and covers:
- five authored hotspot positions per biome;
- scene-matched Viridian and Seafoam clue placement contracts;
- curated encounter tiers and Ultra Beast exclusion;
- no random Viridian legendary tier and no Pheromosa;
- Arcade locations bottom-nav visibility contract;
- venue/minigame full-screen nav hiding contract;
- centered holo hit-label contract.

## Fresh non-browser verification
Passed:
- `tests/adventure-battle.test.cjs` — 18/18 subtests
- `tests/adventure-model.test.cjs` — 13/13 subtests, including 1,000 route seeds per destination
- `tests/arcade-ball-drop.test.cjs`
- `tests/arcade-classics.test.cjs`
- `tests/arcade-platform.test.cjs`
- `tests/arcade-session.test.cjs`
- `tests/restore-regressions.test.cjs`
- `tests/v022-targeted.test.cjs`
- `tests/v022-update-compat.test.cjs` updated for v0.23.1 metadata
- `tests/v0221-ui-focus.test.cjs`
- `tests/v0222-device-regressions.test.cjs`
- `tests/v0231-polish.test.cjs`

## Browser/runtime limitation
The current execution environment blocks Chromium navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, including both `file://` and localhost HTTP. Node Playwright installation also timed out in this container. Therefore no new v0.23.1 full-app screenshot/runtime claim is made here. The source-level and pure-runtime regressions above are the verification evidence for this package; GitHub/Android device testing should remain the final visual check.

## Android build limitation
This extracted source has no Gradle wrapper and the container has no system Gradle, so a new APK was not compiled locally. Use the existing GitHub Actions build path with the established signing-secret configuration.
