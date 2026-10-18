# LuckyDex v0.35.11 Test Report

## Scope
Adds seven Ekans' Hoop Hurl achievements to the existing LuckyDex achievement catalogue. No Hoop Hurl gameplay mechanics were changed.

## Added achievements
- **First Ring** — land 1 hoop — 150 Coins
- **Snake Charmer** — land 25 hoops total — 350 Coins + 20 Dust
- **Hoop Veteran** — land 100 hoops total — 900 Coins + 50 Dust
- **On a Roll** — reach a 12-hit streak / x2 multiplier — 600 Coins + 1 Ticket
- **Master Hooper** — score 80+ in one round — 1,000 Coins + 75 Dust
- **Shiny Ringer** — hit first shiny target — 750 Coins + 50 Dust — hidden
- **Shiny Sharpshooter** — hit 5 shiny targets total — 2,000 Coins + 1 Ticket — hidden

All progress is read from existing durable Hoop Hurl state:
`state.arcade.ekansHoop.{bestScore,bestStreak,totalHoops,shinyHits}`.
No save migration or minigame-state changes are required.

## Verification
### Focused tests
- `tests/v03511-ekans-achievements.test.cjs` — PASS
- `tests/v03511-release.test.cjs` — PASS
- Existing achievement catalogue regression — PASS

### Full project test runner
`npm test` begins successfully but stops on `tests/adventure-core.test.cjs` because the extracted workspace does not have the declared Playwright package installed (`MODULE_NOT_FOUND: playwright`). No browser-suite success is claimed.

### Non-browser regression suite
All test programs that do not import Playwright / `recovery-browser.cjs` were executed independently:
- **219 passed**
- **27 Playwright-dependent programs skipped**
- **0 assertion failures**

### Offline asset integrity
- Authentic Arcade scenes/sheets/crops: PASS
- Offline Arcade sprites / actors: PASS
- Local venue assets: PASS
- Adventure assets: PASS
- Fossil Museum assets: PASS

## Release metadata
- applicationId remains `com.example.luckydex`
- versionCode: **3511**
- versionName: **0.35.11**
