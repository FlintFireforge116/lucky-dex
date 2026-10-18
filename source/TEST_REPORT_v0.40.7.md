# LuckyDex v0.40.7 — Test / Handover Report

## Scope

v0.40.7 builds on the verified v0.40.6 baseline and implements the approved rare-events/profile pass:

- Berry Picker rare special-delivery requests.
- Shiny Unown question events with letter-matched TCG / TCG Pocket card rewards.
- Dedicated Achievements sub-screen reached from a compact Profile summary.
- Shared v0.40.6 rare-reward persistence/claim-once system reused rather than duplicated.

## Berry Picker

- Special event is rolled once per Berry Picker run at a 3% starting rate.
- At most one special request can surface in a run.
- The selected run event is persisted, including ordinary/no-special rolls, so closing/reopening cannot reroll the jackpot chance.
- Special reward types: card, sealed booster, Card Dust, Pack Voucher.
- The special request replaces the normal berry/request presentation for that customer.
- Correct delivery banks the special reward; the actual grant occurs at end-of-run through the shared claim-once path.
- Missing the request forfeits that run's special reward.
- Failed grant does not silently consume the claim; the persisted attempt remains recoverable.

## Shiny Unown

- Each new persisted question has a 0.4% starting chance of one shiny glyph.
- At most one glyph in the question is selected.
- Ordinary and shiny question states are persisted so closing/reopening the same question cannot reroll the shiny chance.
- A successful shiny question resolves a random card whose name begins with the shiny letter.
- Candidate source may be physical Pokémon TCG or Pokémon TCG Pocket.
- Wrong answer / timeout forfeits that question's special reward.
- Reward granting uses the same shared claim-once mechanism as Tile Puzzle and Berry Picker.

## Achievements

- The large challenge list no longer occupies the main Profile flow.
- Profile now contains a compact Achievements summary card with earned/total count.
- Tapping the summary opens a dedicated achievements sub-screen.
- Existing Active / Complete / Secrets/category filtering and claim behavior remain intact.
- Bottom Profile navigation resets back to the Profile main view without modifying the protected shared `navigate()` function.

## TDD / focused verification

The new v0.40.7 feature contracts were written and observed failing before implementation, then passing after implementation:

- `tests/v0407-special-events.test.cjs`
- `tests/v0407-integration.test.cjs`
- `tests/v0407-release.test.cjs`

Compatibility checks included the existing Tile Puzzle rare-reward contracts, Berry Picker contracts, Unown contracts, achievement/category contracts, profile/arcade regression contracts and shared-function preservation checks.

## Full runnable test sweep

A file-by-file sweep of every `tests/*.cjs` program was run after the final compatibility fix:

- 326 runnable test programs: PASS
- 500 reported passing test/subtest assertions across those programs
- 0 genuine runnable failures
- 32 programs: BLOCKED because Playwright is not installed in this execution environment

The Playwright-blocked programs were classified separately rather than counted as passes. They include the browser/runtime/mobile-layout families for Adventure, Arcade and recovery tests.

## Syntax verification

`node --check` passed for all changed/new production JavaScript:

- `app/src/main/assets/arcade-special-events-v0407.js`
- `app/src/main/assets/arcade-amie.js`
- `app/src/main/assets/arcade-unown.js`
- `app/src/main/assets/app-v0167.js`
- `app/src/main/assets/achievements-v0341.js`

## Offline asset verification

All supplied offline asset validators passed:

- 44 authentic Arcade scenes/sheets/crops checksum-valid.
- 2,098 offline Arcade sprites checksum-valid.
- 2,078 unretouched Arcade actor assets checksum-valid.
- 8 venue assets verified.
- Adventure asset verifier: 829 images, 1,025 species, 386 back sprites, 37 registry objects, 0 errors.
- Fossil Museum: 42 images verified.

## Preservation / release identity

- Protected shared-function contract: 211 shared declarations preserved exactly.
- Preservation contract: 5,953 protected baseline files preserved; only explicitly intentional newer-release files excluded.
- Package/app/runtime identity aligned at `0.40.7` / Android `versionCode 4007`.
- Existing application ID and supplied signer remain unchanged.

## Device checks requested

Because browser automation is unavailable here, verify these on the Android build:

1. Profile -> Achievements -> Back and bottom Profile navigation.
2. Berry Picker normal runs behave identically when no rare event occurs.
3. If a rare Berry request eventually appears, its transformed request/tree visual is readable and delivery behaves normally.
4. Unown ordinary questions remain visually unchanged; a shiny event should be unmistakable when encountered.
5. Existing Tile Puzzle rare events still work after the shared reward bridge expansion.

Rare Berry and shiny Unown events are intentionally uncommon, so absence during a short manual session is expected.
