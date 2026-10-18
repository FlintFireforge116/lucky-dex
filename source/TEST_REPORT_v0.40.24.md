# LuckyDex v0.40.24 Verification Report

## Scope

v0.40.24 adds **Sushi-Go-Round** to Stadium Kids Club while preserving the v0.40.23 top-down Run, Rattata, Run release and prior Arcade/Adventure behavior.

## Sushi-Go-Round implementation

- Ninth Stadium Kids Club game.
- Four Lickitung: YOU, COM 1, COM 2 and COM 3.
- One-minute rounds.
- Twelve circulating conveyor plates.
- Eight food tiers worth ¥1000, ¥600, ¥350, ¥250, ¥200, ¥150, ¥50 and ¥20.
- Consecutive matching sushi increases the multiplier from x1 through x5.
- Hot Tea applies a 1.8-second stun and blocks eating while stunned.
- Easy / Normal / Hard CPU profiles vary take chance, value preference, combo preference and hot-item avoidance.
- Highest bill wins; Lucky Coin rewards vary by place and difficulty.
- Durable records: games, wins, podiums, best bill, difficulty bests/wins, best combo, total sushi eaten and hot penalties.
- Standard Game Review integration.

## Achievements

- **Big Spender** — first Sushi-Go-Round win — 300 Lucky Coins.
- **Conveyor Connoisseur** — win on Hard — 650 Lucky Coins + 30 Dust.
- **Sushi Master** — win on Easy, Normal and Hard — 1000 Lucky Coins + 1 Pack Ticket.
- **Same Again!** — reach an x5 same-sushi chain — 800 Lucky Coins + 50 Dust.
- **High Roller** — reach a ¥15,000 bill — 1200 Lucky Coins + 75 Dust.

## Focused regression verification

Command covered Arcade achievement/review/record state, v0.40.x release guards, Dynamo, Kids Club scrolling, Snore War, Run Rattata Run, Sushi-Go-Round and Adventure preservation.

Result: **80/80 tests passed, 0 failures.**

The Adventure preservation guard reports **5,942 protected files preserved**. The Arcade Records registry deliberately logs a simulated `disk full` save error while testing failure resilience; that test passes.

## Syntax checks

`node --check` passed for:

- `arcade-sushi-go-round-core.js`
- `arcade-sushi-go-round.js`
- `arcade-world.js`
- `arcade-records.js`
- `arcade-platform.js`
- `achievements-v0341.js`

## Offline asset audits

- Venue audit: PASS — 8 local venue assets.
- Adventure asset audit: PASS — 829 images, 1025 species, 386 back sprites, 37 registry objects.
- Fossil Museum audit: PASS — 42 images.

## Full project runner

`npm test` completed the first three suites with **46 passing subtests and 0 failures**:

- `adventure-battle-v0404.test.cjs`: 5/5
- `adventure-battle-v0411.test.cjs`: 23/23
- `adventure-battle.test.cjs`: 18/18

The runner then stopped before `adventure-core.test.cjs` because the environment does not have the Node `playwright` module installed (`MODULE_NOT_FOUND: playwright`). Browser-backed tests after that point are therefore **not claimed as passed**.

## Package verification

The final v0.40.24 source ZIP is extracted into a clean directory and the Sushi-Go-Round, recent Kids Club, release-identity and preservation checks are rerun against that exact packaged copy before handoff.
