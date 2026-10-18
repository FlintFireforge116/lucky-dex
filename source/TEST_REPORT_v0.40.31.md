# LuckyDex v0.40.31 Test Report

## Scope

### Pokémon Challenge Course
- Existing `dashCourse` save/venue identity is preserved, but the visible venue is now **Pokémon Challenge Course**.
- The venue uses the Pokéathlon Dome exterior from Pokémon HeartGold/SoulSilver when online, with the existing bundled Dash course artwork retained as an automatic image-error/offline fallback.
- Pokémon Dash remains the first activity and keeps its existing Quick Race, Type League, progression and records behavior.

### Power Trial — Attack
- New caught-Pokémon Attack challenge added beside Pokémon Dash.
- Player selects a caught Pokémon; its base Attack is read through the shared Arcade participant adapter.
- Five targets increase in required power: Training Crate, Stone Block, Iron Weight, Training Pillar and Grand Boulder.
- Each strike has two player-controlled phases: charge/release near the peak, then hit the moving impact marker near centre.
- Execution contributes more to final strike power than the Pokémon's raw Attack, while higher Attack still gives a measurable advantage.
- Easy / Normal / Hard alter charge windows, impact timing and target thresholds.
- Results, rewards and best scores persist through the shared Arcade systems and appear in Arcade Records.

### Rare event and achievements
- A **Golden Target** can replace one target at a vanilla rate of **2% per Power Trial run**.
- Settings exposes Off / Vanilla 2% / Test 25% / Always 100% controls for direct testing.
- Seven Power Trial achievements ship with the game, covering first play, repeat play, full clears, Hard clears, precision, mastery and the Golden Target event.

## Verification

### Focused gameplay / regression suite
Fresh targeted run covered Power Trial core/integration, Arcade platform/session, Pokémon Dash core and league behavior, Arcade records and achievement regressions.

Result: **23 passed, 0 failed**.

### Dedicated v0.40.31 suite
`tests/v0431-power-trial.test.cjs` result: **7 passed, 0 failed**.

### JavaScript syntax
`node --check` passed for all modified/new runtime JavaScript files:
- `arcade-power-trial-core.js`
- `arcade-power-trial.js`
- `arcade-platform.js`
- `arcade-world.js`
- `arcade-session.js`
- `arcade-records.js`
- `achievements-v0341.js`
- `app-v0167.js`

### Offline asset integrity
- 44 authentic Arcade scenes/sheets/crops verified.
- 2,098 offline Arcade sprites verified.
- 2,078 unretouched Arcade actors verified.
- 8 existing local venue assets verified.
- 829 Adventure images / 1,025 species registry entries / 386 back sprites / 37 registry objects verified.
- 42 Fossil Museum images verified.

### Full project runner
`npm test` was invoked. The test programs before `adventure-core.test.cjs` passed, then the runner stopped because this sandbox does not have the declared Playwright module installed (`MODULE_NOT_FOUND: playwright`). Browser-suite completion is therefore not claimed. A separate broad all-test-program attempt exceeded the sandbox execution window; no failure from that timed-out aggregate is being treated as a product regression.

## Release identity
- Package/version: `0.40.31`
- Android `versionCode`: `4031`
- Android `versionName`: `0.40.31`
