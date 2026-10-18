# LuckyDex v0.23.2 Test Report

## Targeted regression
`node tests/v0232-adventure-polish.test.cjs`

PASS:
- Lucky Coin discovery visual/copy replaces the incorrect Lucky Egg representation.
- Wild Roam hotspots and scene use the same coordinate space; current saved hotspots resync to biome blueprints.
- Battle controller does not pre-apply final HP UI before animation.
- Sequential battle animation contains explicit opponent turn pacing and per-event HUD updates.
- release metadata is versionCode 232 / versionName 0.23.2.

## Non-browser suite
13 available non-browser test programs PASS, including:
- Adventure battle reducer/renderer: 18/18 subtests.
- Adventure model.
- Arcade Ball Drop, Classics, Platform and Session.
- v0.22 restore/update compatibility.
- v0.22.1 and v0.22.2 device contracts.
- v0.23.1 encounter/Arcade/holo contracts.
- v0.23.2 Adventure polish contract.

## Static integrity
- JS syntax: 23/23 checked files PASS.
- Duplicate HTML IDs: 0 across 217 IDs.
- Adventure CSS brace balance: PASS.

## Offline asset integrity
- 44 authentic Arcade scenes/sheets/crops PASS.
- 2,098 offline Arcade sprites PASS.
- 2,078 unretouched Arcade actors PASS.
- 8/8 local Arcade venue assets PASS.
- Adventure audit PASS: 829 images; 1,025 species; 386 back sprites; 37 registry objects.

## Browser-suite limitation
Node Playwright is not installed in this environment, so Playwright-dependent browser programs could not be rerun locally. They remain included for GitHub/CI execution after dependency restoration.
