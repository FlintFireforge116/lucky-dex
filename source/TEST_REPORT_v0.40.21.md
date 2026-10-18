# LuckyDex v0.40.21 Test Report

## Scope
Snore War Endless plus achievement coverage for the two newest Kids Club games:
- add MATCH / ENDLESS mode selection to Snore War;
- preserve Match mode unchanged;
- Endless ends on the player's third miss and ignores CPU-only elimination states;
- accelerate Endless beyond the normal Match cap while retaining a finite playable speed cap;
- add Endless records and Game Review output;
- add five Thundering Dynamo achievements and six Snore War achievements.

## TDD evidence
`node --test tests/v0421-snore-war-endless-achievements.test.cjs tests/v0421-release.test.cjs`
- RED on v0.40.20: no Endless miss limit/speed cap/mode UI/state fields/records or new achievement IDs; release identity remained 0.40.20.
- GREEN after implementation: 7/7 v0.40.21 contracts pass.

## Match preservation
Compared all 96 Match-mode centre timestamps from v0.40.20 against v0.40.21.
- Maximum timing delta: 0 ms.
- Existing two-crossing sleep, live-place, final survival ordering, smooth-pendulum and ready-panel fixes remain covered by their prior regression tests.

## Endless rules
- Player run ends on miss 3.
- A miss still sleeps Drowzee for exactly two centre crossings total.
- CPU Drowzee continue to attempt crossings and can sleep/wake, but three sleeping CPUs do not finish Endless.
- Match full-period cap remains 720 ms.
- Endless continues accelerating to a 560 ms full-period cap after an additional 30-second ramp.
- The 560 ms cap remains above four timing-window widths (480 ms), preventing overlapping centre timing windows.

## Achievements
Thundering Dynamo:
- Power On! — first win.
- High Voltage — Hard win.
- Full Circuit — win Easy/Normal/Hard; includes a Pack Ticket.
- Clean Current — 100% accuracy round.
- Human Dynamo — 500 career correct presses.

Snore War:
- Wide Awake — first Match win.
- No Snoozing — Hard win.
- Sleep Specialist — win Easy/Normal/Hard; includes a Pack Ticket.
- Eyes Wide Open — 50-hit streak across Match/Endless bests.
- Hypnosis Marathon — 100 Endless hits.
- Insomniac — hidden 200 Endless hits prestige achievement.

## Focused verification
- 50/50 achievement/records/platform/Kids Club/Dynamo/Snore War/preservation subtests passed.
- 19/19 release identity guards from v0.40.0 through v0.40.21 passed.
- Adventure preservation: 5,942 protected files matched the baseline.
- Modified JavaScript syntax checks: PASS.

## Offline asset audits
- Venue assets: 8 local venue assets: PASS.
- Adventure assets: 829 images, 1,025 species, 386 back sprites, 37 registry objects: PASS.
- Fossil Museum assets: 42 images: PASS.

## Full-suite attempt
`npm test`
- 46 subtests passed with 0 failures before the first browser-backed test.
- The run then stopped at `adventure-core.test.cjs` because Playwright is not installed in this execution environment (`MODULE_NOT_FOUND: playwright`).
- Browser-backed tests after that point are not counted as passes.

## Release identity
- package/runtime version: 0.40.21
- Android versionCode: 4021
- Android versionName: 0.40.21
