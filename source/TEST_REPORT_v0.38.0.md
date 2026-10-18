# LuckyDex v0.38.0 Test Report — Rock Harden

## Release identity

- Version: `0.38.0`
- Android `versionCode`: `3800`
- Package: `com.example.luckydex`
- Feature: Pokémon Stadium Kids Club — **Rock Harden**, recreated with Gen III/GBA presentation.

## Feature verification

The v0.38.0 focused verification ran 11 Rock Harden/release programs:

- 10/10 executable non-browser programs PASS.
- 1/1 browser QA program explicitly SKIP because the extracted source environment does not have the `playwright` dependency installed.

Covered behavior includes:

- 14-species curated cocoon/armoured roster with four unique species per round.
- Shared mechanics for every species; species choice is cosmetic only.
- 100 starting HP and 18 HP/second Harden drain.
- Perfect / Good / Safe windows at 0–110 ms / 111–260 ms / earlier than 260 ms.
- Rock damage of 18 / 26 / 34 for small / medium / heavy rocks.
- Survival-first ranking, score/HP survivor ordering, later-KO eliminated ordering, and shared exact ties.
- 45-second safety cap.
- Touch pointer ownership, Space/A keyboard support, repeat suppression and pause-safe input handling.
- Additive persistence and all seven Rock Harden achievements.
- Gen III quarry shell, native-aspect pixel sprites, silver Harden filter and Gold Rock presentation hooks.

## CPU balance

200 deterministic seeded rounds per difficulty produced:

| Difficulty | Perfect | Miss |
| --- | ---: | ---: |
| Easy | 36.49% | 14.70% |
| Normal | 58.30% | 7.19% |
| Hard | 75.95% | 2.81% |

These fall inside the design targets. CPU schedules are generated independently at round creation and do not read player state; no rubber-banding is used.

## Gold Rock verification

The deterministic core contract verifies:

- `goldRoundChance === 0.10`.
- A roll below 10% creates one Gold Rock; the 10% boundary does not.
- Maximum one Gold Rock per round.
- Gold Rock cannot occupy the first four impacts.
- Gold Rock is player-lane only and replaces a normal attack rather than adding another hit.
- Only a Perfect Harden grants the prize.
- Prize weights are 40% Coins / 30% Dust / 15% Pack Ticket / 10% random card / 5% sealed booster.
- Coin rewards are 300–600; Dust rewards are 40–80; Ticket rewards are 1.
- Card rewards reuse the existing Fossil Dig tier-weighted random-card resolver.
- Booster rewards reuse the existing eligible sealed-booster resolver.
- Card/booster resolution has a 4.5-second deadline and falls back to a pre-rolled Coins/Dust/Ticket reward.
- Null resolution, rejection, grant failure and timeout all preserve a reward through fallback.
- Late async resolution after fallback is discarded.
- Closing/replaying cannot redirect or duplicate an already-earned Gold reward.
- Gold bonus Coins/Dust/Tickets do not increment Arcade game count a second time.

## Asset integrity

Rock Harden asset verification PASS:

- All 14 local Pokémon sprite PNGs are present and decodable.
- Native sprite dimensions are non-uniform and rendering preserves aspect ratio with nearest-neighbour/pixelated treatment.
- Required local Gen III quarry assets are present/readable: `cave-floor.png`, `cave-wall.png`, `cave-rock.png`, `route-rock.png`.

## Preservation verification

30/30 targeted preservation programs PASS across:

- Magikarp’s Splash v0.37.0/v0.37.1.
- Dig! Dig! Dig! v0.36.0/v0.36.1.
- Ekans’ Hoop Hurl core/integration/lifecycle/runtime/achievements.
- Fossil Dig card/booster/reward contracts.
- Arcade platform migration and session model.

Historical tests that incorrectly froze exactly three Kids Club entries or exact v0.37.1 identity were changed only to preserve their original feature/version floors while allowing later releases.

## Broad regression result

`npm test` still stops when the recovery-browser harness reaches `playwright`, which is not installed in this extracted source environment.

A direct scan found 30 test programs that import Playwright/recovery-browser. Running every remaining test program individually produced:

- **261/261 available non-browser programs PASS**
- **30 browser-dependent programs unavailable in this environment**

The browser-dependent group is not reported as passing.

## Syntax verification

`node --check` passed for all 18 modified/new JavaScript source and v0.38.0 test files checked in the release review.

## Android build capability

The supplied source archive contains Android Gradle files but does not contain `./gradlew`. Therefore an APK/Android Gradle build cannot be verified in this environment and is not claimed as passing.

## Final review focus

The author performed the required whole-change self-review because no independent subagent/reviewer tool is available in this harness. The review explicitly exercised:

1. Harden held across pause/release — PASS; paused wall-clock time adds no HP drain and paused release uses the pause timestamp.
2. One large time advance versus many small frames — PASS; one 20-second advance matched 800 × 25 ms advances exactly for the deterministic round state.
3. Simultaneous KOs/shared rank — PASS, including exact four-way wipeout ties.
4. Gold reward duplication / close / replay / late async settlement — PASS through dedicated lifecycle tests.
5. Malformed save data plus failed card/booster resolution — PASS; malformed records normalize without deleting unrelated Arcade state and reward fallback remains exactly-once.

No Critical or Important finding remained after review.

### Deferred minor

- The Gold Rock result subtitle currently says `Offline fallback from card/booster` for any card/booster resolver timeout or error. The fallback reward itself is correct and safely banked; the copy can be made more precise in a later polish pass.

## Environment / process note

The source ZIP used for this work does not contain `.git` metadata, so git worktree isolation and per-task commits were not possible. Work was performed in a fresh isolated extraction of v0.37.1 with a task ledger and RED→GREEN tests. This affects development-history provenance only, not the packaged source contents.
