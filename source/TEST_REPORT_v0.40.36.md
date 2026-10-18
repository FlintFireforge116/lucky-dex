# LuckyDex v0.40.36 Test Report

## Scope

- Added **Impact Trial — Defense** as the next Pokémon Challenge Course / Goldenrod Pokéathlon Dome game.
- Added its **Golden Hazard** rare event and Settings test control.
- Kept **Golden Target · Power Trial** exposed in Settings.
- Fixed the **Gold Rock** Settings dropdown starting blank.
- Added Impact Trial records, persistence, rewards and achievements.

## Impact Trial design implemented

- Choose any caught Pokémon; bundled species **Defense** is used as the stat advantage.
- Player execution remains more important than raw Defense: a correctly timed perfect response can take zero damage, while Defense mainly softens mistakes.
- Five distinct hazards: Rolling Boulder, Swinging Weight, Donphan Charge, Rockfall and Heavy Training Ram.
- Each hazard clearly calls for **DODGE** or **BRACE**, with an impact-timing line and Easy / Normal / Hard timing profiles.
- Uses the existing Challenge Course dome presentation with local pixel assets and a new local pixel training-ram asset.
- Golden Hazard default odds: **2% per run**. Settings: Off / Vanilla 2% / Test 25% / Always 100%.
- Golden Hazard prizes use the existing reserved/claim-safe rare arcade reward path.

## Achievements

Added seven Impact Trial achievements:

- First Stand
- Dome Defender
- Still Standing
- Iron Wall
- Untouchable Form
- Fortress
- Golden Guard (hidden rare-event achievement)

## Gold Rock root cause

The saved rare-event odds are numeric. JSON normalizes `0.10` to `0.1`, but the HTML option value was the string `"0.10"`. The old settings binding assigned `String(0.1)` directly to the select, which has no exact `"0.1"` option, so the browser displayed a blank selection.

The Settings binder now matches rare-odds options numerically (`Number(option.value) === Number(savedValue)`) before assigning the option's canonical string value. This fixes Gold Rock and prevents the same trailing-zero bug for other rare-event controls.

## Verification

- `tests/v0436-impact-trial.test.cjs`: 9/9 passing.
- Affected records, rare-reward, Settings, achievements and Power Trial regression programs pass.
- `node --check` passes for all modified/new JavaScript runtime files.
- Arcade assets: 44 scene/sheet/crop checks, 2,098 sprite checks and 2,078 actor checks pass.
- Venue asset verification passes.
- Adventure asset verification passes: 829 images / 1,025 species / 37 registry objects.
- Fossil Museum asset verification passes: 42 images.

### Environment note

The complete historical `npm test` command cannot be executed in this container because its browser tests require the Playwright npm package, and this environment cannot reach npm to install the package. The supplied v0.40.35 source also contains a pre-existing stale `adventure3-preservation.test.cjs` checksum for `arcade/kids-club/SOURCES.md`; that same test fails unchanged against the untouched uploaded baseline. Neither issue is caused by this update.
