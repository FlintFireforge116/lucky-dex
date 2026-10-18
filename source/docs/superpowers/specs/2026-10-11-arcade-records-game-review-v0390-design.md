# LuckyDex v0.39.0 — Arcade Records & Game Review Design

## Status

Approved conversational design captured as a written architectural spec for review before implementation planning.

## Intent

LuckyDex Arcade runs should finish with enough information to understand what happened, not merely a placement or payout. Competitive games need a proper scoreboard; solo games need a useful performance review. Players should also be able to revisit durable personal records and their ten most recent completed runs per game from one Arcade Records screen.

The system must feel like part of the existing Gen III-inspired Arcade rather than a generic analytics page. It must reuse existing game statistics wherever possible, remain save-compatible, and avoid an unbounded history log.

This release also includes two game-balance corrections requested during play testing:

- Rock Harden Normal CPUs must stop producing Perfect Harden results so consistently.
- A successful Magikarp Quick Splash must produce a genuinely faster rebound cycle so skilled timing can recover ground.

The independently approved Bulk Dust Exchange feature is **not implemented by this spec**. It is a separate bounded workstream that may ship in the same v0.39.0 release.

---

## Scope

### In scope

1. Upgrade the shared Arcade completion sheet into a reusable **GAME REVIEW** system.
2. Add a proper final scoreboard for multiplayer/CPU-competition games.
3. Add game-specific performance review sections for every completed Arcade game using the shared session layer.
4. Persist a maximum of **10 completed runs per game**.
5. Add a dedicated **ARCADE RECORDS** screen accessible from the Arcade hub/world flow.
6. Allow a result screen to jump directly to that game's records section.
7. Preserve all existing permanent bests, wins, totals, trophies, achievements, rewards and save data.
8. Retune Rock Harden Normal CPU grade distribution.
9. Speed up successful Magikarp Quick Splash rebound physics for both player and CPUs.
10. Surface newly completed Arcade achievements in the post-game review without auto-claiming them.

### Out of scope

- Online/global leaderboards.
- Comparing records between users or devices.
- Cloud telemetry or server storage.
- Replays/video playback.
- Recording abandoned/incomplete runs.
- Retrofactively fabricating the last ten runs from old aggregate statistics.
- Moving existing game-specific permanent records into a new monolithic schema.
- Bulk Dust Exchange implementation details.

---

## Existing architecture to preserve

`app/src/main/assets/arcade-session.js` already owns the shared completion sheet and accepts result data from games. Existing games also persist their own durable bests/totals in `state.arcade`, with normalization in `arcade-platform.js`.

v0.39.0 extends those seams instead of replacing them:

- **Game module owns gameplay and authoritative run facts.**
- **Arcade session owns transient review presentation.**
- **Arcade records owns the compact rolling history and records navigation.**
- **Existing per-game state remains the source of truth for all-time stats/PBs.**
- **Achievement catalogue remains the source of truth for achievement completion/claim state.**

No game may award a second Arcade completion merely because a review/history entry was recorded.

---

## Architecture

### 1. Standardized run-review contract

Extend `LuckyDexArcadeSession.showResult(gameId, opts)` to accept a structured review object while remaining backward-compatible with current callers during migration.

The normalized review model contains:

- `gameId`
- `title`
- `mode` / `difficulty` when applicable
- `outcome` (`win`, `podium`, `complete`, `failed`, `cashed`, etc.)
- `primaryMetric` — the main score/time/place shown at the top
- `scoreboard[]` — optional ordered competitor rows
- `stats[]` — game-specific labelled review statistics
- `personalBest[]` — PB/current comparison rows
- `rewards` — already-awarded reward presentation only
- `newAchievements[]` — newly completed achievement metadata, never auto-claimed
- `historyEntry` — compact durable snapshot to append once
- existing replay/change/back callbacks

The session layer sanitizes and renders this model but never invents game results.

### 2. Arcade records store

Add `state.arcade.records` through `ensureArcadeState()`:

```text
records: {
  version: 1,
  games: {
    [gameId]: {
      recent: [RunHistoryEntry, ...] // newest first, max 10
    }
  }
}
```

There is deliberately no duplicated permanent-stat block. All-time records are read from current existing state fields through per-game record adapters.

`RunHistoryEntry` stores only what is needed to reconstruct a useful review later:

- schema version
- completion timestamp
- mode/difficulty
- outcome
- primary metric
- compact scoreboard when the game has competitors
- compact run-specific stats
- reward summary
- PB flags achieved on that run
- newly completed achievement IDs on that run

Entries must be sanitized and size-bounded before save. Unknown future fields are ignored safely when rendering older/newer saves.

### 3. Game adapters

Create a focused records/review registry rather than hard-coding every game's labels in `arcade-session.js`.

Each supported game adapter provides:

- display name and venue label
- whether it is `competitive` or `solo`
- formatter for permanent record cards using existing state
- sanitizer/formatter for recent-history entries
- optional game-specific labels for scoreboard and stats

Gameplay modules still produce authoritative result values. Adapters only format/present them.

### 4. Arcade Records screen

Add one dedicated full-screen Arcade view reachable from the Arcade hub/world UI through an **ARCADE RECORDS** button.

Top-level view:

- Gen III-style header
- summary count of tracked games/runs
- one record card per supported game
- each card shows the most relevant permanent PB/totals for that game
- card opens the game's detail view

Game detail view:

- permanent records/totals from existing state
- difficulty/mode records where relevant
- last **10 completed runs**, newest first
- tapping a run opens that stored review in read-only form
- empty history copy explicitly says that older aggregate stats are preserved but detailed history starts with v0.39.0

The records screen is informational only: it never re-awards rewards or achievements.

---

## Review presentation

### Competitive scoreboard games

These receive an ordered scoreboard with placement and the game's natural result metric:

- **Pokémon Dash** — all racers, final place/time; player row highlighted.
- **Dig! Dig! Dig!** — four racers, finish time for finishers or final dig progress for non-finishers.
- **Magikarp's Splash** — four scores and shared-rank ties.
- **Rock Harden** — four final scores plus HP/KO state; shared-rank ties preserved.

The scoreboard uses the actual final ranking from the game core. It must not independently re-rank rounded/display values.

### Solo/game-review titles

These receive the same GAME REVIEW shell but replace the competitor scoreboard with meaningful run facts:

- **Ekans' Hoop Hurl** — score, hoops, streak, shiny hits, tier/difficulty.
- **Berry Picker** — served count, score, best combo/misses, mode.
- **Tile Puzzle** — time, moves, difficulty/mode, PB comparison.
- **Voltorb Flip** — bank/result, board level or relevant completion facts already available from the run.
- **Ball Drop** — balls used, coin haul, jackpots/special prizes, card/booster haul.
- **Berry Blender** — performance result, timing/accuracy metrics already produced by the game, payout.
- **Clefairy** — final round/streak/banked coins and relevant sequence performance.
- **Fossil Museum** — recovered/total finds, losses, collapse/manual-clear status, haul.
- **Unown** — streak, mode, score/bank and PB.
- **Quiz** — correct answers, score, mode, final timer/streak as applicable.

If a title cannot supply a proposed stat authoritatively, the first implementation must omit that stat rather than infer or fabricate it.

---

## Result-screen structure

The GAME REVIEW screen presents, in order:

1. Game/result title and difficulty/mode.
2. Main score/place/time metric.
3. Scoreboard **or** solo performance block.
4. Personal performance breakdown.
5. PB/record comparison including **NEW RECORD** callouts where applicable.
6. Rewards actually awarded by the completed run.
7. Newly completed achievements from this run, if any.
8. Buttons: **PLAY AGAIN**, optional **CHANGE**, **RECORDS**, **BACK TO VENUE**.

Existing card-reveal sequences remain first-class. When a run has cards to reveal, card reveals occur before the GAME REVIEW summary exactly as the current result system already supports.

The RECORDS button opens the Arcade Records detail page for `gameId` without recording another history entry.

---

## Achievement integration

Achievements must remain durable-state-driven and claimable only through the existing achievement system.

At run start/completion plumbing, capture a lightweight snapshot of **completed Arcade achievement IDs** immediately before the authoritative game-result state update, then compare it after the update. The difference becomes `newAchievements` for the review/history entry.

Requirements:

- Secret achievements that become complete may be revealed by the result screen because the player has now earned them.
- Already-complete but unclaimed achievements are **not** repeatedly reported as new.
- Result review does not claim rewards.
- Reopening a stored run from history does not trigger achievement evaluation or reward logic.
- Existing Rock Harden, Dig and Magikarp achievement inputs must remain unchanged except where the approved balance/physics changes naturally alter future performance.

The central achievement module should expose a read-only completed-ID snapshot helper rather than duplicating achievement thresholds inside games.

---

## History-write rules

A run is appended to history only when all of these are true:

- gameplay core considers it completed/finalized or the game has a legitimate explicit cash-out/end state;
- its normal reward/stat completion guard has accepted the completion once;
- the result model has been normalized successfully.

Rules:

- Maximum **10** entries per game.
- Newest first.
- 11th entry drops the oldest.
- Restart/replay does not duplicate the previous run.
- Opening/closing results repeatedly does not duplicate history.
- Android pause/resume cannot create a second history write.
- Abandoned/backed-out runs are never stored.
- Stored rewards are display snapshots only and can never be replayed into the economy.

---

## Permanent record cards

The records registry reads existing durable state rather than moving it. Initial record-card content should include:

### Kids Club

**Ekans**
- best score
- best streak
- games played
- total hoops / shiny hits

**Dig**
- overall best time
- Easy / Normal / Hard best times
- wins / podiums / games played

**Magikarp**
- overall best score
- Easy / Normal / Hard best scores
- best Quick chain
- wins / podiums / games played

**Rock Harden**
- overall and per-difficulty best scores
- best Perfect count
- best winning HP
- Gold Rocks perfected/rewards claimed
- wins / podiums / games played

### Dash

- overall quick-race best time
- per-difficulty quick bests
- races / wins / podiums
- existing league/trophy records

### Other Arcade games

Use the best/totals that already exist in LuckyDex state. Where a game currently has only one durable PB, show that one rather than adding fake aggregate metrics merely to fill space.

---

## Rock Harden Normal rebalance

Current Normal CPU selection targets approximately 57.5% Perfects before its secondary grade selection. Play testing shows this presents as CPUs repeatedly getting PERFECT and makes Normal feel too close to Hard.

Change the target profile to:

- **Easy:** keep existing behaviour at approximately 37% Perfect, ~14% miss.
- **Normal:** target **40% Perfect**, approximately **9% miss**, with **Good** the dominant non-miss grade.
- **Hard:** preserve approximately 76% Perfect and current low miss rate.

Recommended Normal constants:

```text
perfectRate: 0.40
missRate:    0.09
goodShare:   0.84
```

Normal lead-time ranges should still visually produce believable Perfect/Good/Safe holds; no rubber-banding and no reading the player's state to choose a grade.

Acceptance balance is measured over deterministic seeded simulations rather than a single round. Normal must clearly separate from Hard and must show more Good results than Perfect results over a representative sample.

---

## Magikarp Quick Splash acceleration

A successful Quick Splash currently starts another jump immediately but then follows the same flight timing curve as a normal jump. That makes the timing reward feel insufficient for catching a leader.

Add a per-jump Quick flag and time-compress successful Quick jumps to **84% of normal flight duration** (approximately 16% faster overall), while preserving the same hold-to-height mapping and peak-height presentation.

Consequences:

- faster ascent to the overhead counter;
- earlier counter hit;
- faster descent/landing;
- more scoring opportunities across a sustained Quick chain;
- genuine ability to recover ground through skill.

The Quick timing window itself remains unchanged unless testing exposes a regression:

- 110 ms early
- 90 ms late

Player and CPUs use exactly the same Quick flight physics. CPU `quickChance` remains a timing/decision probability, not a different movement speed.

At the 20-second cutoff, existing rule remains: no new jump may begin after cutoff, but an already-airborne jump may finish under the current finalization rules.

---

## Save compatibility and normalization

`ensureArcadeState()` must normalize `records` defensively:

- absent `records` => empty version-1 store;
- malformed/non-array `recent` => empty array;
- strip invalid entries;
- cap every game to 10;
- preserve unknown unrelated `state.arcade` keys;
- preserve every existing game record exactly unless its current normalizer already repairs malformed values.

No migration may synthesize fake history from `gamesPlayed`, wins or PB fields.

Save-size guard: history entries must remain compact and bounded. The implementation should reject/strip arbitrary large nested payloads rather than serializing runtime objects wholesale.

---

## Navigation and visual design

### Arcade hub/world

Add a clearly visible **ARCADE RECORDS** action without replacing existing venue navigation.

### Visual language

- GBA/Gen III-inspired panels, beveled borders and compact bitmap-like typography consistent with the Arcade.
- Player rows use the existing LuckyDex highlight language.
- 1st/2nd/3rd placements are visually distinct without modern medal emoji dependence.
- NEW RECORD uses a brief highlight/pulse, not a persistent modern glow.
- Recent-run timeline uses compact cards suitable for phone portrait layout.
- Records detail and result review must scroll internally on small phones rather than expanding behind browser/native controls.

No charts are required for v0.39.0. Ten readable recent runs are preferable to a tiny trend graph.

---

## Error handling

- If record persistence fails, the already-awarded game reward and existing game stats remain authoritative; history failure must never roll them back.
- If a game supplies malformed optional scoreboard/stats data, sanitize/drop that row and still show the review.
- If achievement snapshotting is unavailable, show the result without a new-achievement section; never block completion.
- If an old history entry belongs to an unknown/removed game ID, preserve it in state but omit it from current records navigation.
- Stored result screens are read-only. No callback/reward functions are serialized.

---

## Testing strategy

### Shared records/session tests

- Normalized review model accepts competitive and solo results.
- Scoreboard order and shared-rank labels are preserved from authoritative input.
- Completed run appends exactly once.
- Replay/result reopen/pause paths cannot duplicate history.
- 11th run removes only the oldest, leaving exactly 10.
- Malformed save history normalizes safely.
- Stored history review never awards currency/items/cards/achievements.
- Old save with no records retains every existing PB/trophy/stat.
- Result RECORDS button targets the correct game detail.

### Game-adapter tests

At minimum each supported game must prove:

- it creates a review/history entry on legitimate completion;
- the primary metric is correct;
- its important game-specific stats are preserved;
- quit/abandon is not recorded.

Competitive games additionally test complete scoreboard ordering and ties.

### Achievement tests

- one newly completed Arcade achievement is reported once;
- already complete/unclaimed achievement is not reported as new on the next run;
- secret achievement can be revealed after completion;
- history reopen does not mutate claim state.

### Rock Harden balance tests

- seeded Normal sample targets the approved Perfect range and has Good > Perfect;
- Hard remains materially more precise than Normal;
- no rubber-banding/player-score dependency.

### Magikarp tests

- identical held duration produces the same peak-height intent on normal vs Quick jump;
- Quick total flight duration is exactly `normal * 0.84` within floating tolerance;
- Quick reaches the counter earlier;
- both player and CPU Quick jumps use the same scale;
- cutoff and pause shifting remain correct.

### Browser/layout tests

Where Playwright is available:

- post-game scoreboard is readable at target Android portrait dimensions;
- Arcade Records cards and 10-run detail list do not overflow horizontally;
- card reveal -> game review -> records navigation works;
- back/replay/change callbacks still work;
- all current venue/game navigation remains reachable.

If Playwright is unavailable in the extracted source environment, the release report must explicitly record those tests as unavailable rather than passed.

---

## Release target

- Version: **v0.39.0**
- Android `versionCode`: **3900**

The final release may also include the independently approved bounded Bulk Dust Exchange feature, but that feature must be implemented/tested as a separate workstream and may not share persistence logic with Arcade Records.

---

## Acceptance summary

v0.39.0 Arcade Records & Game Review is complete when:

- every relevant finished Arcade title receives a proper post-run review;
- Dash/Dig/Magikarp/Rock show proper final scoreboards;
- Arcade Records is accessible from the Arcade hub;
- every supported game exposes meaningful permanent records and up to 10 recent completed runs;
- a stored run can be reopened read-only;
- existing saves/PBs/rewards/achievements remain compatible;
- new Arcade achievements are surfaced once in the run that completes them;
- Rock Harden Normal visibly produces fewer Perfects and Good is its dominant successful grade;
- Quick Splash is approximately 16% faster while preserving its height behaviour;
- no history/review action can duplicate gameplay rewards.
