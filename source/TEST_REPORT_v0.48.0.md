# LuckyDex v0.48.0 Verification Report

## Scope

v0.48.0 adds the Mauville Slot Machine to the existing Game Corner and changes the Arcade entry flow so **All Games** is the default catalogue while **Locations** is a secondary venue browser. Existing game IDs, saves, records and venue assignments are preserved.

## Slot Machine

Implemented and covered by focused tests:

- 1 / 2 / 3 coin betting scaled to 25 / 50 / 75 Lucky Coins.
- Active paylines progress from centre only, to all horizontal rows, to horizontals plus both diagonals.
- Manual left-to-right stopping for all three reels.
- Regular stops may slip by up to four symbols; Reel Time stops exactly on the requested symbol.
- Scaled Gen III payout ratios including straight 7 jackpots, mixed 7s, Azurill, Lotad, Pikachu, Cherry and Replay.
- Blue 7 jackpot changes the machine to lucky state; Red 7 jackpot returns it to normal state.
- Straight 7s end active Reel Time.
- Pika Power, Reel Time, permanent records and seven achievements.
- Reel Time rare-event control in Settings: Off / 2% / 25% / 100%.
- Interrupted charged spins refund safely rather than losing the wager.

## Arcade browser

- Arcade opens on a single All Games catalogue.
- Locations remains available as the secondary browser and groups games by the existing venue definitions.
- A game launched from All Games returns to All Games.
- A game launched from a venue returns to that venue.
- Existing venue arrows remain limited to Locations mode.
- Existing records and game routing are shared by both entry paths.

## Focused verification

Command:

```text
node --test \
  tests/v0480-slot-machine-core.test.cjs \
  tests/v0480-slot-machine-integration.test.cjs \
  tests/v0480-arcade-catalog.test.cjs \
  tests/v0480-release.test.cjs \
  tests/v0390-arcade-records-core.test.cjs \
  tests/v0390-arcade-records-state.test.cjs \
  tests/v0390-arcade-records-registry.test.cjs \
  tests/v0390-arcade-achievement-review.test.cjs \
  tests/v0470-roulette-integration.test.cjs
```

Result: **25 / 25 passed**.

The records-registry test deliberately simulates a `disk full` save failure and verifies that it is handled safely; the logged error from that test is expected.

## JavaScript syntax

Fresh `node --check` passed for:

- `arcade-slot-machine-core.js`
- `arcade-slot-machine.js`
- `arcade-world.js`
- `arcade-session.js`

## Offline asset integrity

Fresh validators passed:

- Arcade: 44 authentic scenes/sheets/crops.
- Arcade sprites: 2,098.
- Arcade actors: 2,078.
- Venue assets: 8.
- Adventure: 829 images covering 1,025 species.
- Fossil Museum: 42 images.
- Sleeves: 202 / 202.

## Wider regression comparison

A broad per-program comparison against untouched v0.47.4 was also run. The only persistent new failure among common baseline programs is the historical `v0474-release.test.cjs`, which correctly expects version `0.47.4` and therefore fails on `0.48.0`. One parallel-run Rock Harden fixture transiently reported failure but passed immediately when rerun directly. No new behavioural regression remained after direct verification.

Browser/Playwright visual automation is not counted as verified in this environment. Phone presentation should still receive the normal in-app test pass.

## Release identity

- Android application ID: `com.example.luckydex`
- versionName: `0.48.0`
- versionCode: `4800`
- No Codex used.
