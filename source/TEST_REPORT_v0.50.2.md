# LuckyDex v0.50.2 — Dream World mechanics polish

## Scope

Baseline: `LuckyDex_source_v0.50.1.zip`.

This pass is intentionally limited to the two existing Dream World minigames and release identity. No Codex was used.

### Wailord’s Water Spout

- Removed direct touch/drag movement of Wailord from the playfield.
- Wailord movement is now left/right-arrow driven (screen arrows; keyboard arrows remain supported on desktop).
- Added a dedicated **SHOOT** button.
- A falling Pokémon caught by the water spout now remains attached to the spout and moves with Wailord instead of being auto-launched.
- Pressing SHOOT launches all currently held Pokémon. Their position on the spout still determines launch direction.
- A Pokémon that reaches the water still calls the existing fall path, resetting combo and multiplier to ×1 without deleting earned score.
- Normal remains a 15-ball objective.
- Existing Rainbow Dream Ball rare-event setting, prize reservation flow, records and achievements are unchanged.

### Ice Cream Scoop

- Removed the old aggregate `lean`, `leanLimit`, `leanCarry`, `leanGain` and `minOverlap` toppling model.
- Every placed scoop is now an independent physics body with its own position, vertical position, velocity, angular velocity, rotation, radius and mass.
- Tower support is evaluated from the loaded upper stack’s centre of mass against the physical support beneath each scoop.
- Near-edge stacks can begin to roll/slide according to difficulty friction/gravity; collapse happens when physical support is actually lost rather than when a global lean number crosses a fixed threshold.
- When collapse starts, affected scoops fall and rotate independently instead of the entire tower using one canned rotation animation.
- Existing Dream Scoop rare-event setting, reward flow, records and achievements are unchanged.

## Release identity

- package version: `0.50.2`
- Android `versionName`: `0.50.2`
- Android `versionCode`: `5002`
- `window.__LUCKYDEX_BUILD`: `0.50.2`
- Visible title/build labels: `v0.50.2`
- Android application ID and signer source are unchanged.

## Verification

### JavaScript syntax

PASS:

- `arcade-wailord-water-spout-core.js`
- `arcade-wailord-water-spout.js`
- `arcade-ice-cream-scoop-core.js`
- `arcade-ice-cream-scoop.js`

### Focused Dream World regression

PASS: **26 / 26** tests across:

- `tests/v0490-ice-cream-scoop-core.test.cjs`
- `tests/v0490-ice-cream-scoop-integration.test.cjs`
- `tests/v0500-wailord-water-spout-core.test.cjs`
- `tests/v0500-wailord-water-spout-integration.test.cjs`
- `tests/v0502-dream-world-mechanics.test.cjs`
- `tests/v0502-release.test.cjs`

This covers centred and failed ice-cream drops, independent scoop-body state, physical-support collapse, Dream Scoop forcing, Wailord progression, launch direction, colour matching, water multiplier reset, Rainbow Dream Ball forcing, arrow/shoot controls, held Pokémon behaviour, records, achievements and Settings rare-event controls.

### v0.50.1 visual-polish preservation

PASS: **5 / 5** relevant v0.50.1 presentation regressions (the historical v0.50.1 version-lock assertion is intentionally not applicable to a v0.50.2 build):

- Dream World art source remains in place.
- game UI remains non-selectable / no browser callout.
- Ice Cream Scoop visual pass and Combee supervisor remain in place.
- Wailord Dream World sea presentation remains in place.
- difficulty-specific ice-cream physical tuning is present.

### Full historical repository test command

`npm test` was attempted. The first three test programs completed successfully, then the suite stopped at `adventure-core.test.cjs` because this supplied source snapshot has no installed `node_modules/playwright` dependency (`MODULE_NOT_FOUND: playwright`). This is an environment/dependency availability blocker rather than a failing Dream World assertion. No dependency installation was performed.

### Android build

Not run in this container: the source bundle has no Gradle wrapper and there is no system `gradle` executable. Java is present, but that is not sufficient to compile or sign the APK here.

### Packaged-source verification

A fresh extraction of `LuckyDex_source_v0.50.2.zip` was syntax-checked and the same focused Dream World suite was rerun from the extracted package: **26 / 26 PASS**. ZIP CRC/integrity and byte-for-byte source-entry checks also passed during packaging.
