# LuckyDex v0.52.0 Verification Report

## Scope

This release adds **Pikachu’s Beach** as a new Arcade game at **Summer Beach House / Route 19**, based on the supplied LuckyDex v0.51.0 source.

### Implemented

- Pokémon Yellow-style surf loop with a 6000 HP timer.
- Automatic shore progress and recurring launch waves.
- Left/right airborne rotation controls placed below the playfield.
- Yellow Radness table preserved in the core:
  - 1 flip: 50
  - 2 same-direction flips: 150
  - 2 mixed flips: 180
  - 3 same-direction flips: 350
  - 3 mixed flips: 500
- Clean landings increase surf momentum; wipeouts reduce it.
- Clear score = Radness + remaining HP.
- Easy / Normal / Hard with different landing tolerance, wave cadence, airtime and pace.
- Summer Beach House Arcade venue and local lightweight beach artwork.
- Permanent Arcade Records for clears, Hard/flawless clears, score, Radness, remaining HP, tricks, wipeouts and Lucky Wave history.
- Dedicated beach-styled result presentation.
- Seven Pikachu’s Beach achievements.
- Rare **Lucky Wave** with Settings controls: Off / Vanilla 2% / Test 25% / Always 100%.
- Lucky Wave uses the existing reserved-safe rare reward pipeline.

## Lucky Wave reward verification

The shared reward table used by Lucky Wave was directly exercised at representative rolls and exposes all five requested reward classes:

- Lucky Coins / money
- Card Dust
- Pack Voucher / ticket
- Card
- Sealed booster pack

Dynamic delivery tests also verify that profile rewards grant once, card/booster rewards resolve before claiming, concurrent delivery does not duplicate the prize, and switching saves during asynchronous card resolution leaves the old-save reward reserved instead of granting it to the replacement save.

## Focused verification

Command:

```text
node --test tests/v0520-pikachu-beach-core.test.cjs tests/v0520-pikachu-beach-integration.test.cjs tests/v0520-pikachu-beach-prizes.test.cjs tests/v0510-release.test.cjs tests/v0510-seek-exploration.test.cjs tests/v0510-seek-persistence.test.cjs tests/v0510-seek-prizes.test.cjs tests/v0510-seek-runtime.test.cjs tests/v0505-pokemon-seek-core.test.cjs tests/v0505-pokemon-seek-integration.test.cjs tests/v0504-dream-world-top-layout.test.cjs tests/v0503-dream-world-ui-results.test.cjs tests/v0480-arcade-catalog.test.cjs
```

Result: **75 / 75 passed**.

Syntax checks also passed for the modified Pikachu’s Beach, Arcade world/platform/session/records, app-state and achievement JavaScript files.

## Wider suite

`npm test` was run from the clean source tree.

The first three test programs completed successfully:

- `adventure-battle-v0404.test.cjs`: 5 / 5
- `adventure-battle-v0411.test.cjs`: 23 / 23
- `adventure-battle.test.cjs`: 18 / 18

The wider runner then stopped when `adventure-core.test.cjs` attempted to load the unavailable `playwright` module. This is an environment/dependency stop, not a LuckyDex assertion failure. An `npm ci` attempt to obtain the dependency timed out in this environment.

## Visual/browser verification limitation

Fresh automated browser screenshots were not claimed for this release. Playwright is not installed in the clean environment, and a direct system-Chromium fallback is blocked from loading local/test pages by the environment’s browser policy. Static integration tests verify that the playfield exists before the rotation controls, there is no horizontal-style game rewrite/obstacle system, and the dedicated result/theme wiring is present, but the user should still visually inspect the game on-device.

## Baseline scope audit

A recursive comparison against the supplied v0.51.0 source showed changes only in expected release/integration files plus the new Pikachu’s Beach assets/tests. Existing Dream World game files were not rewritten. The historical v0.51.0 release-marker test was narrowly relaxed so future releases must remain **at least v0.51.0** while still checking package/lock agreement and Android application/signing identity.

## Android build

No APK build is claimed. This source environment has Java but no ready Gradle wrapper/system Gradle toolchain for a verified Android build.

## Version / identity

- versionName: `0.52.0`
- versionCode: `5200`
- applicationId remains `com.example.luckydex`
- signing key alias check remains `luckydex`
- No Codex was used for this implementation.
