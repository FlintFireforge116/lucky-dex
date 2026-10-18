# LuckyDex v0.34.1 verification report

## Scope

v0.34.1 is a bounded follow-up to the v0.34.0 Pokémon Dash Emerald course overhaul. It fixes two phone UI regressions and expands the existing Profile achievement system without altering the new Dash course assets/renderer.

### Collection regression

**Symptom:** after visiting **Sealed Packs**, returning to **Card Binder** could leave the card-set selector hidden, trapping the binder on the previously selected set.

**Root cause:** the Sealed Packs mode intentionally hid the collection filter/set controls, while the newer Card Binder rebuild path repopulated those controls without explicitly unhiding them.

**Fix:** Card Binder now restores both card controls before rebuilding their options. A regression test exercises the hidden-to-visible transition helper.

### Arcade location regression

**Symptom:** Pokémon Dash (Arcade venue 9) could not be reached on the phone Arcade location screen.

**Root cause:** the nine venue buttons were laid out in four columns, which created a third row containing only venue 9. The Arcade world shell intentionally clips overflow, so that third row could be below the visible area.

**Fix:** the location grid now uses five columns, allowing all nine venue buttons to fit in two rows at the current phone layout.

## Achievement expansion

LuckyDex already had a central achievement/claim system, so this release extends that framework rather than replacing it.

### Authored catalogue

`achievements-v0341.js` adds **110 authored achievements**, including **9 hidden achievements**, across:

- Pokémon — 29
- Collection — 28
- TCG — 1 broad physical-TCG milestone
- TCGP — 8 broad Pocket/rare-pull milestones
- Adventure — 8
- Arcade — 31
- Museum — 5

These cover Pokédex generation completion, catches/encounters/battles, shinies, packs/cards/set milestones, God Packs, rare TCGP pulls, Regional Adventure Champions/clears, Pokémon Dash races and Type League trophies, multiple Arcade games, Fossil Museum progress, and authored secret/joke conditions.

### Per-set completion achievements

Set-completion achievements are generated from the actual catalogues rather than maintained as a hard-coded name list:

- every loaded physical **TCG** set receives a completion achievement;
- every built-in **TCGP** set receives a completion achievement;
- generated IDs are stable and source-qualified;
- set progress counts unique owned cards against the catalogue/set total;
- the existing legacy Celestial Storm achievement is retained rather than duplicated.

At startup, even before the physical TCG catalogue has populated, the 110 authored definitions plus the current built-in TCGP completion definitions and existing legacy achievements put the catalogue at roughly 150 achievements. Once physical TCG sets are loaded, the catalogue grows automatically by one completion achievement per physical set.

### Profile filtering and rewards

The Challenge Log now has an independent category filter:

- All
- Collection
- TCG
- TCGP
- Pokémon
- Adventure
- Arcade
- Museum

The existing **Active / Complete / Secrets** state tabs remain.

Achievement rewards can now include **Dust** in addition to the existing Lucky Coins, Tickets, shiny-charm fragments and card rewards. Existing claimed-achievement state remains keyed by achievement ID, so the expansion is additive rather than a save reset.

## Version / identity

- Android package ID remains `com.example.luckydex`.
- `versionCode`: **341**
- `versionName`: **0.34.1**
- npm/package version: **0.34.1**

## Automated verification

The final source was checked with:

- Node syntax checks on changed JavaScript.
- `tests/v0341-bugfix-achievements.test.cjs` for:
  - Card Binder control restoration;
  - nine-venue Arcade grid layout;
  - generated TCG/TCGP set achievements;
  - uniqueness/stability expectations;
  - authored achievement catalogue coverage;
  - category filter presence;
  - Dust reward handling;
  - browser/UMD access to the TCGP set catalogue;
  - v0.34.1 version identity.
- `tests/v0340-preservation.test.cjs` to preserve the supplied v0.33.1/v0.34.0 functional baseline outside the intended patch surface.
- `tests/v0340-release.test.cjs` for release/version invariants.
- the complete non-Playwright Node test set.
- Arcade, venue, Adventure and Fossil Museum asset validators.

### Browser-test limitation

This execution environment does not have the `playwright` npm package installed and cannot download packages. The repository contains **21 Playwright-dependent/browser-integration tests** in this source; those tests cannot start here and fail at module loading (`Cannot find module 'playwright'`) before any LuckyDex assertion is executed. They are therefore reported as **not run**, not passed.

All **173 non-Playwright test programs** completed successfully when run individually. The remaining **21** were blocked at Playwright module loading, with **0 other test failures**.

### Android build limitation

This environment does not provide Gradle/Android SDK tooling and the repository does not contain a Gradle wrapper, so an APK is not compiled locally in this pass. The source retains the existing package identity and is intended for the repository's established GitHub Android build workflow.
