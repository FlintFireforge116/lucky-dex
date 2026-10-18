# LuckyDex v0.34.2 verification report

## Scope

This release replaces the Android-native Card Binder set dropdown with a LuckyDex-styled in-app set picker while preserving the v0.34.1 collection, achievement, Arcade visibility, stability and save-compatibility work.

### Card Binder set picker

- Added a compact selected-set panel beneath the TCG / TCGP tabs.
- Removed the native set `<select>` from the visible Card Binder UI while retaining it as the filtering/state source of truth.
- Added an in-app dark LuckyDex set picker with:
  - search available only while the picker is open;
  - TCG / TCGP-specific owned-set lists;
  - `All owned sets` first;
  - friendly release dates;
  - unique-card completion counts;
  - per-set progress bars;
  - selected-set highlighting;
  - distinct completed-set treatment.
- Card Binder's old large progress panel is hidden in card mode to avoid duplicating the selected-set information. Pokédex and Sealed Packs continue using it.
- Existing card filters, card search, sort, source tabs and set filtering remain wired to the existing collection state.

## Version / identity

- Version name: `0.34.2`
- Android versionCode: `342`
- Application ID remains `com.example.luckydex`.
- Save key and existing persistent state contracts remain unchanged.

## Automated verification

Active Node test inventory: **195 programs**.

- **174 passed**.
- **21 browser-integrated programs could not start in this environment because the `playwright` package is not installed**.
- **0 other test failures**.

New focused regression test:

- `tests/v0342-collection-set-picker.test.cjs`
  - custom picker markup exists;
  - set search exists only within the picker UI;
  - set filtering works by name and release date;
  - friendly release-date formatting;
  - completion percentage calculation;
  - completed-set styling contract;
  - v0.34.2 release identity.

Relevant earlier collection / preservation regressions also pass, including:

- `tests/v0280-collection-browser.test.cjs`
- `tests/v0341-bugfix-achievements.test.cjs`
- `tests/v0340-preservation.test.cjs`

## Asset verification

Passed:

- 44 authentic Arcade scenes/sheets/crops checksum validation;
- 2,098 offline Arcade sprite validation;
- 2,078 unretouched Arcade actor source/output validation;
- 8 local Arcade venue assets;
- Adventure asset verification: 829 images, 1,025 species, 386 back sprites, 37 registry objects, 0 errors;
- Fossil Museum asset verification: 42 images.

## Android build limitation

The current execution environment contains neither Gradle nor an Android SDK, so an APK was not compiled locally. The existing GitHub Android workflow remains the APK build/signing path.
