# LuckyDex v0.48.1 Verification Report

## Scope

v0.48.1 corrects the v0.48.0 Arcade navigation interpretation and polishes the Mauville Slot Machine presentation.

### Arcade navigation

- Restores the pre-v0.48.0 Arcade venue carousel as the main Arcade browser.
- Replaces separate Game Corner entries with one top-level **Game Corner** venue.
- Game Corner opens a regional submenu:
  - Goldenrod → Voltorb Flip
  - Celadon → Poké Ball Drop
  - Mauville → Mauville Roulette + Mauville Slot Machine
- All existing game IDs, records, achievements, save state and game owners are unchanged.
- Game Corner games return to their selected regional submenu after play; Back from a regional submenu returns to the Game Corner location list.
- Legacy Goldenrod/Celadon Arcade venue selections migrate to the consolidated Game Corner entry.

### Mauville Slot Machine presentation

- Reels now use continuously scrolling vertical symbol strips while live instead of frame-swapping static three-symbol windows.
- Each STOP press freezes that reel on its actual resolved position, preserving the existing slip/Reel Time mechanics.
- Stake buttons now show only **25 / 50 / 75 Lucky Coins**; redundant 1 / 2 / 3 coin display text was removed.
- The large spinning/instruction message block was removed.
- Compact outcome feedback remains for wins, jackpots, Replay, Pika Power and misses.
- Stop controls sit directly beneath the three reels and the cabinet presentation is closer to the Gen III machine layout without a large right-hand black display.

## Focused tests

Fresh source verification covered:

- v0.48.0 Slot Machine core/integration tests
- v0.47.0 Roulette integration tests
- corrected Arcade venue/Game Corner tests
- v0.48.1 Game Corner navigation tests
- v0.48.1 Slot Machine presentation tests
- v0.48.1 release identity
- Arcade records/achievement state checks

The current Arcade/Goldenrod/achievement non-browser regression set passed **145 / 145** when historical release-identity snapshots were excluded. The two historical snapshots that hard-code v0.42.5 and v0.43.0 fail only because the current app is v0.48.1; v0.48.0's release snapshot is likewise superseded by v0.48.1.

## JavaScript syntax

Fresh `node --check` passed for:

- `arcade-world.js`
- `arcade-slot-machine.js`
- `arcade-slot-machine-core.js`
- `arcade-session.js`

## Offline asset integrity

Fresh validators passed:

- Venue assets: 8
- Adventure assets: 829 images covering 1,025 species
- Fossil Museum assets: 42 images
- Sleeves: 202 / 202
- Gen III Dash native asset/provenance checks
- Complete Fossil Dig asset audit

## Source audit versus v0.48.0

Before adding this report, the bounded diff was:

- 7,540 baseline files byte-identical
- 14 intended existing files changed
- 3 intended v0.48.1 tests added
- 0 baseline files removed

No product image assets were changed.

## Release identity

- Android application ID: `com.example.luckydex`
- versionName: `0.48.1`
- versionCode: `4801`
- No Codex used.

Browser/Playwright screenshot automation is not claimed for this build; phone presentation still benefits from the normal in-app visual check.

## Packaged ZIP verification

The finished archive was unpacked into a clean directory and the packaged bytes passed:

- ZIP CRC/integrity check
- JavaScript syntax for Arcade world and Slot Machine runtime
- **31 / 31** focused packaged tests covering Slot Machine core/integration, Game Corner navigation, Roulette integration, Arcade records/achievements and v0.48.1 release identity
