# LuckyDex v0.34.4 verification report

## Scope

v0.34.4 is a focused physical-pack collation correction on top of v0.34.3.

- WotC-era 11-card boosters keep the existing 7 Common / 3 Uncommon / 1 Rare-or-Holo structure, but descriptor selection is now strict so a Rare cannot leak into a Common or Uncommon slot through fallback selection.
- 30th Celebration now uses four general foil set-card slots, one guaranteed Pikachu Rare slot, and one guaranteed foil Basic Energy slot.
- The 30th Celebration Pikachu guarantee accepts the dedicated `Pikachu Rare` rarity and also collector numbers 23–52 when an upstream catalogue flattens that printed rarity to `Rare`.
- General 30th Celebration foil slots exclude the guaranteed Pikachu-Rare group, preventing a second guaranteed-slot Pikachu from leaking into another position.
- The foil Basic Energy insert uses the eight MEE identities 009–016 (Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal) with Scrydex identity artwork URLs.
- `Pikachu Rare` is classified as a normal rare/holo-tier printed rarity rather than `unknown`.

## TDD evidence

`tests/v0344-collation-tightening.test.cjs` was written before the implementation. Its first run failed because `LuckyDexPackPolicy.cardMatchesDescriptor` did not exist. A second RED check demonstrated that `Pikachu Rare` was classified as `unknown`, and a later RED check demonstrated that a numbered Pikachu Rare flattened to `Rare` was rejected by the guaranteed slot. The implementation was then changed until those regressions passed.

`tests/v0344-release.test.cjs` was also run RED against v0.34.3 identity before the version was bumped to 0.34.4 / 344.

## Focused regression verification

The following focused contracts pass:

- `v0344-collation-tightening.test.cjs`
- `v0344-release.test.cjs`
- `v0343-pack-policy.test.cjs`
- `v0343-pack-collation.test.cjs`
- `v0343-pack-builder.test.cjs`
- `v0343-rarity-audit.test.cjs`
- `v0343-rarity-reveal.test.cjs`
- `v0343-pack-diagnostics.test.cjs`
- `v0343-pack-entitlement.test.cjs`

Modified JavaScript also passes `node --check` for:

- `pack-policy-v0343.js`
- `card-rarity-v0253.js`
- `app-v0167.js`

## Full test inventory

208 `.cjs` test programs were executed individually after the change:

- **187 passed**
- **21 browser tests unavailable** because the Playwright module is not installed in this environment
- **0 other failures**

The normal `npm test` runner reaches the same environment limitation at the first Playwright-backed browser test (`adventure-core.test.cjs`). This is an environment dependency, not a product assertion failure.

## Offline asset validators

All four offline validation suites pass:

- Arcade: 44 authentic scenes/sheets/crops, 2,098 sprites, 2,078 actor outputs
- Venue assets: 8 verified
- Adventure assets: 829 images / 1,025 species
- Fossil Museum: 42 images verified

## Release identity

- application ID: `com.example.luckydex`
- versionName: `0.34.4`
- versionCode: `344`
- package version: `0.34.4`
- permanent debug signer configuration unchanged

## Build limitation

Java is available, but Gradle and ADB/Android SDK tooling are not installed in this environment. The Android APK is therefore not compiled locally; the repository's GitHub Android build workflow remains the APK build step.
