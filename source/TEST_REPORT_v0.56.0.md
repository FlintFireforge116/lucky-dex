# LuckyDex v0.56.0 Test Report

## Scope

v0.56.0 adds **Furret’s Frolic** as the next single Pokémon Stadium 2 · Kids Club game.

- Stadium 2 ROM-backed control/rule model: hold a direction to enter the grass, release to spring back toward centre, A / HIT shoots a nearby ball toward the player goal.
- 60-second four-player match.
- Poké / Great / Ultra / Master ball scoring values: 1 / 2 / 3 / 5.
- Higher-value ball tiers unlock as the round progresses.
- Furret and Girafarig player choice.
- Easy / Normal / Hard CPU reaction, movement and shot-accuracy profiles.
- Persistent Arcade records, session review, Lucky Coin rewards and four achievements.
- Master Ball late-match appearance is exposed in Settings for testing. The default 8% post-unlock rate is LuckyDex tuning, not claimed as an exact recovered ROM constant.

## Verification

### Furret-focused / Stadium 2 integration

New v0.56.0 core, integration, state and release tests were written red-first and then made green. Stale historical exact-game-list expectations were updated only where the new Stadium 2 catalogue legitimately adds Furret’s Frolic.

### Shared Arcade / Stadium / Picross regression

Targeted `node --test` run covering Arcade platform/session/records, Clear Cut Challenge, Gutsy Golbat, Picross, the v0.55.7-v0.55.8 Picross/10-pack follow-ups and all v0.56.0 Furret tests.

Result: **116 / 116 passing**.

### Syntax checks

`node --check` passes for the new Furret core/runtime and the touched shared Arcade/runtime files.

### Full historical runner

`npm test` passes the first three non-browser suites (**5 + 23 + 18 = 46 tests**) and then stops at the inherited environment limitation when `adventure-core.test.cjs` loads:

`Error: Cannot find module 'playwright'`

The error originates from `scripts/recovery-browser.cjs`. It is an environment/dependency limitation rather than a Furret assertion failure.

## Release identity

- package version: `0.56.0`
- Android `versionName`: `0.56.0`
- Android `versionCode`: `5600`
- application ID remains `com.example.luckydex`
- no Stadium 2 ROM / `.n64` / `.z64` / `.v64` / `.rom` file is bundled
- no Codex used
