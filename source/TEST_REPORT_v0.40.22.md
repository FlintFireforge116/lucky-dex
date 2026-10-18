# LuckyDex v0.40.22 Test Report

## Scope
Run, Rattata, Run plus one new Snore War Endless prestige milestone:
- add Run, Rattata, Run as the eighth Pokémon Stadium / Kids Club game;
- rapid RUN input builds momentum while JUMP clears six hurdles;
- hurdle collisions cause a 650 ms stumble and momentum loss;
- Easy / Normal / Hard CPUs use different run cadences, jump error rates and hesitation;
- first finisher starts a 3-second finish window for the remaining racers;
- add Lucky Coin settlement, Game Review, Arcade Records, save migration and five achievements;
- add hidden 500-hit Snore War Endless achievement, **Sleep Is For The Weak**.

## TDD evidence
`node --test tests/v0422-run-rattata-run.test.cjs tests/v0422-release.test.cjs`
- RED before implementation: Rattata core/UI/state/records/achievements were absent and release identity remained v0.40.21.
- A later scoreboard-label regression was also demonstrated RED: all four core racers lacked stable labels before the fix.
- GREEN after implementation: feature contracts and release identity pass.

## Race tuning
Deterministic course simulation was used before fixing the fast-finish achievement threshold:
- ~140 ms RUN cadence: ~14.28 s finish;
- ~125 ms: ~12.75 s;
- ~110 ms: ~11.22 s;
- ~100 ms: ~10.20 s;
- ~90 ms: ~9.18 s.

Deterministic CPU reference finishes were approximately:
- Easy: 15.10 s;
- Normal: 12.24 s;
- Hard: 9.79 s.

The **Quick Feet** achievement is therefore set to **10.00 seconds or less**. It requires a genuinely fast, clean run rather than merely beating the Normal CPUs.

## Achievements
Run, Rattata, Run:
- Off to the Races — first win.
- Gutsy Rattata — win on Hard.
- Track Star — win Easy, Normal and Hard; includes a Pack Ticket.
- Hurdle Hero — win without hitting a hurdle.
- Quick Feet — finish in 10.00 seconds or less.

Snore War:
- Sleep Is For The Weak — hidden 500-hit Endless milestone; rewards 5,000 Lucky Coins, 300 dust and 3 Pack Tickets.

## Mobile visual QA
Rendered the ready and live-race states using the packaged game shell/CSS and local assets.
- 412×915: no horizontal overflow; ready panel and START fully visible; live RUN/JUMP controls fully visible.
- 360×740: no horizontal overflow; START remains inside the game panel.
- 320×640: no horizontal overflow; START remains inside the game panel.
- Live controls use shrink-safe `minmax(0, ...)` columns.
- Course presentation reuses LuckyDex's existing Gen III Dash route grass/path textures and local Rattata sprite.

## Focused verification
Fresh combined run:
`node --test tests/v04*-release.test.cjs tests/v0390-arcade-records-registry.test.cjs tests/v0414-thundering-dynamo.test.cjs tests/v0415-kids-club-scroll.test.cjs tests/v0416-thundering-dynamo-tuning.test.cjs tests/v0417-snore-war.test.cjs tests/v0418-snore-war-smooth-pendulum.test.cjs tests/v0419-snore-war-start-visibility.test.cjs tests/v0420-snore-war-ranking-duration.test.cjs tests/v0421-snore-war-endless-achievements.test.cjs tests/v0422-run-rattata-run.test.cjs tests/adventure3-preservation.test.cjs`
- **60/60 tests passed**.
- Adventure preservation: **5,942 protected files** matched the baseline.
- All release identity guards through v0.40.22 passed.
- Modified JavaScript syntax checks: PASS.

## Offline asset audits
- Venue assets: 8 local venue assets: PASS.
- JavaScript source parse audit: 510 sources: PASS.
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects: PASS.
- Fossil Museum assets: 42 images: PASS.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The run then stopped at `adventure-core.test.cjs` because the Node Playwright module is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.22
- Android versionCode: 4022
- Android versionName: 0.40.22
