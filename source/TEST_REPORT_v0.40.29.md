# LuckyDex v0.40.29 Test Report

## Scope

This patch contains the requested Rattata Run, Thundering Dynamo, pack-summary, and Pokémon GO hidden-Ditto changes only.

### Run Rattata Run
- Normal player jump window increased to 650 ms.
- Easy uses 700 ms; Hard remains at the existing tighter 500 ms window.
- Existing race momentum, CPU difficulty, hurdle and finish-grace behaviour is retained.

### Thundering Dynamo
- Wrong-button drain increased from 3 to 6 charge.
- Neutral lamp transition reduced from 400 ms to 300 ms.
- Active lamp window reduced from 900–1450 ms to 700–1100 ms.
- Hard now independently chooses A or B for each new lamp, so the same button can repeat instead of always alternating.
- Hard CPU reaction range slowed from 65–140 ms to 90–170 ms.
- Hard CPU repeat-tap range slowed from 70–110 ms to 90–130 ms.
- Easy/Normal retain the readable alternating lamp pattern.

### Pack summary
- Newly acquired cards now receive an explicit `NEW` badge over the card artwork plus an `is-new` summary-card state.
- Existing `_wasNew` collection-state handling remains the authority; no duplicate new-card state was introduced.

### Pokémon GO hidden Ditto
- Added the physical Pokémon GO peel-away Ditto mechanic to the reverse-holo slot.
- Supported disguise cards are Spinarak 006/078, Numel 013/078 and Bidoof 059/078, revealing Ditto 053/078.
- The disguise renders as the visible card layer with a small lifted-corner cue.
- A swipe beginning from the lifted lower-right corner peels the disguise away and reveals Ditto.
- Normal left/right pack navigation remains available when the gesture does not begin in the peel corner.
- Pack collation is audited before the hidden-Ditto wrapper is applied, preserving the existing protected pack-builder implementation.

## Verification

### Focused regression suite
Command covered the existing Dynamo, Rattata, Pocket Rare Pack, release, and new v0.40.29 tests.

Result: **31 passed, 0 failed**.

### JavaScript syntax
`node --check` passed for all six modified/new runtime JavaScript files:
- `arcade-run-rattata-run-core.js`
- `arcade-thundering-dynamo-core.js`
- `pokemon-go-ditto-v04029.js`
- `pack-opening-v0160.js`
- `pack-flow-v0165.js`
- `app-v0167.js`

### Preservation guards
- Shared function preservation: **211 declarations preserved**.
- Supplied-file preservation: **5,938 protected files preserved**; the newly intentional pack-opening files are excluded explicitly.

### Offline asset integrity
- 44 authentic Arcade scenes/sheets/crops verified.
- 2,098 offline Arcade sprites verified.
- 2,078 unretouched Arcade actors verified.
- 8 local venue assets verified.
- 829 Adventure images / 1,025 species registry entries verified.
- 42 Fossil Museum images verified.

### Full supplied-suite parity
The supplied v0.40.28 source cannot complete `npm test` in this sandbox because Playwright is not installed and the npm registry is unreachable. A broad non-browser run was therefore compared directly against a fresh untouched extraction of the supplied v0.40.28 ZIP.

- Untouched v0.40.28 baseline: 32 failures.
- v0.40.29 patched source: 32 failures.
- **New failures introduced by this patch: 0.**
- The inherited failures split into 13 Playwright-dependent programs that cannot load the missing package and 19 stale historical release assertions already present in v0.40.28.

## Release identity
- Package/version: `0.40.29`
- Android `versionCode`: `4029`
- Android `versionName`: `0.40.29`
