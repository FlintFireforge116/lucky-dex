# LuckyDex v0.34.6 verification report

## Scope

- Fantastical Parade (`B2`) now models its official regular-pack +1 variant: 5.238% of regular packs add a sixth card.
- The sixth slot is restricted to `One Shiny` / `Two Shiny`, targeted at 68.18% / 31.82% respectively.
- Normal online and cached/offline pack builders both preserve the legitimate sixth card.
- Jungle (`base2`) collation now derives canonical printed rarity from collector number: 1–16 Rare Holo, 17–32 Rare, 33–48 Uncommon, 49–64 Common.
- Fossil (`base3`) receives the same metadata hardening: 1–15 Rare Holo, 16–30 Rare, 31–45 Uncommon, 46–62 Common.
- Android/app release identity bumped to `0.34.6` / `346`; application ID remains `com.example.luckydex`.

## TDD/regression evidence

- `tests/v0346-fantastical-wotc-collation.test.cjs` was run before implementation and failed because Fantastical Parade remained fixed at five cards.
- After implementation it passes, including exhaustive canonical rarity-band assertions for all 64 Jungle cards and all 62 Fossil cards.
- `tests/v0346-release.test.cjs` was run before the release bump and failed against v0.34.5; after the version bump it passes.
- Prior pack/collation regressions v0.34.3–v0.34.5 remain green.

## Focused verification

Commands completed successfully:

- `node --check app/src/main/assets/pack-policy-v0343.js`
- `node --check app/src/main/assets/card-rarity-v0253.js`
- `node --check app/src/main/assets/app-v0167.js`
- `node tests/v0343-pack-policy.test.cjs`
- `node tests/v0343-pack-builder.test.cjs`
- `node tests/v0343-pack-collation.test.cjs`
- `node tests/v0343-rarity-audit.test.cjs`
- `node tests/v0344-collation-tightening.test.cjs`
- `node tests/v0345-live-collation.test.cjs`
- `node tests/v0346-fantastical-wotc-collation.test.cjs`
- `node tests/v0346-release.test.cjs`

A 1,000,000-pack policy simulation produced 5.2027% Fantastical Parade bonus packs; among bonus slots, 68.086% targeted One Shiny and 31.914% targeted Two Shiny. These are consistent with the configured 5.238% and 68.18% / 31.82% probabilities.

## Full active test inventory

The repository contains **212** `.cjs` test programs.

- **191 passed**
- **21 could not start because the `playwright` module is not installed in this execution environment**
- **0 other failures**

`npm test` starts normally and passes the first test program, then stops when the first Playwright-backed browser test attempts to load the unavailable module. To avoid hiding later failures, all 212 test programs were then executed individually and classified as above.

## Asset verification

Passed:

- Arcade authentic scenes/sheets/crops: 44
- Offline Arcade sprites: 2,098
- Unretouched Arcade actors: 2,078
- Venue assets: 8
- Adventure images: 829; species: 1,025; registry objects: 37
- Fossil Museum images: 42

## APK/build limitation

There is no Gradle wrapper or Android SDK build environment in this runtime, so an APK was not compiled locally. `scripts/verify-release.py` therefore cannot complete because it expects `artifacts/LuckyDex-v0.34.6-debug.apk`. The existing GitHub workflow remains the APK build step.
