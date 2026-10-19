# LuckyDex v0.62.1 Test Report

## Hotfix scope

Fix Stadium 2 Kids Club failing to open after Streaming Stampede was registered in v0.62.0.

Root cause: `stadium2KidsClub.games` contained `streamingStampede`, but the shared Kids Club tile metadata map in `arcade-world.js` did not. `renderVenue()` dereferenced `kids[g].sprite`, so entering Stadium 2 threw before the venue could render.

## Regression protection

A Stadium 2 entry regression now verifies that every game registered in the Stadium 2 venue has corresponding Kids Club tile metadata before the renderer dereferences it.

The failure was reproduced first against the v0.62.0 wiring, then the missing `streamingStampede` tile metadata was added.

## Verification

- Streaming Stampede + v0.62.1 focused tests: 13/13 passed.
- Existing Rampage Rollout v0.61.1-v0.61.3 regression tests, run against the cumulative overlay: 16/16 passed.
- JavaScript syntax checks: 8/8 changed JS files passed `node --check`.
- Release metadata: package.json, package-lock.json, Gradle versionCode/versionName, asset-builder UA, runtime build marker and HTML version are aligned at v0.62.1.

The complete repository suite was not run from this patch-only workspace because the full source scripts/assets are not present here. The normal GitHub checkout should run `npm test` after removing the obsolete exact-version v0.61.3 release test.
