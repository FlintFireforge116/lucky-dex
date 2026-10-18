# LuckyDex v0.34.5 verification report

## Scope

v0.34.5 is a focused live-path booster collation hardening patch on top of v0.34.4.

- Fixes the shared live descriptor picker used by online, offline-cached and stored booster openings.
- A `false` result from `LuckyDexPackPolicy.cardMatchesDescriptor(...)` now stays false. The previous `matcher(...) || true` expression converted every rejected slot match into an accepted match.
- Hard slot membership (allowed rarity class, descriptor-specific rules, and rare-or-higher requirements) is now enforced in both the preferred-target pass and the fallback pass.
- Classic WotC common/uncommon positions therefore cannot silently accept Rare/Holo cards when selection falls back.
- 30th Celebration's guaranteed Pikachu slot cannot silently accept an arbitrary card such as Jirachi ex. If no valid Pikachu candidate exists, construction fails safely instead of producing an invalid pack.
- The v0.34.4 30th Celebration Energy insert and Pikachu identification rules are otherwise unchanged.

## Root cause and TDD evidence

`tests/v0345-live-collation.test.cjs` was added before the implementation change and executed RED against v0.34.4. The first assertion failed because a Jungle `Rare Holo` card was returned for an Uncommon slot instead of the picker rejecting the impossible collation. The same broken fallback also allowed a non-Pikachu card to fill the guaranteed 30th Celebration Pikachu slot.

The picker was then changed so an absent matcher defaults to `true`, while an explicit `false` result remains `false`, and both selection passes apply the same hard descriptor constraints. The regression then passed GREEN.

`tests/v0345-release.test.cjs` was also executed RED while the app still identified as v0.34.4 / 344, then passed after the version bump to v0.34.5 / 345.

## Focused regression verification

The following focused contracts pass:

- `v0345-live-collation.test.cjs`
- `v0345-release.test.cjs`
- `v0344-collation-tightening.test.cjs`
- `v0343-pack-builder.test.cjs`
- `v0343-pack-collation.test.cjs`

`app-v0167.js` also passes `node --check`.

## Full test inventory

210 `.cjs` test programs were executed individually after the change:

- **189 passed**
- **21 browser tests unavailable** because the Playwright module is not installed in this environment
- **0 other failures**

The normal `npm test` runner reaches the same environment limitation at the first Playwright-backed browser test (`adventure-core.test.cjs`). This is an environment dependency rather than a product assertion failure.

## Offline asset validators

All four offline validation suites pass:

- Arcade: 44 authentic scenes/sheets/crops, 2,098 sprites, 2,078 actor outputs
- Venue assets: 8 verified
- Adventure assets: 829 images / 1,025 species
- Fossil Museum: 42 images verified

## Release identity

- application ID: `com.example.luckydex`
- versionName: `0.34.5`
- versionCode: `345`
- package version: `0.34.5`
- permanent debug signer configuration unchanged

## Build limitation

Java 21 is available, but Gradle and ADB/Android SDK tooling are not installed in this environment. The Android APK is therefore not compiled locally; the repository's GitHub Android build workflow remains the APK build step.

## Packaged-source verification

The release ZIP is re-extracted into a fresh directory and the same release identity, live collation regressions, complete individual test inventory and offline asset validators are run against the extracted archive before handoff.
