# LuckyDex v0.36.0 — Dig! Dig! Dig! Design

Date: 2026-10-11
Status: Design approved in conversation; written-spec review pending
Target: LuckyDex source v0.35.17 → v0.36.0

## 1. Goal

Add **Dig! Dig! Dig!** as the second Pokémon Stadium / Kids Club game in LuckyDex. The game must keep the original Stadium concept simple and recognisable while presenting it as a polished **Gen III / GBA-style reinterpretation** that fits LuckyDex.

The player controls Sandshrew and races three COM Sandshrew down four vertical shafts. Progress is made by rapidly alternating LEFT and RIGHT inputs. Pokémon stats, caught-Pokémon selection, equipment and boosts do not affect the game.

This release also proves that `stadiumKidsClub` is a genuine multi-game venue rather than a one-game wrapper around Ekans’ Hoop Hurl.

## 2. Non-goals

v0.36.0 does **not**:

- alter Ekans’ Hoop Hurl gameplay or presentation;
- implement another Stadium minigame;
- add caught-Pokémon stats to Kids Club;
- add power-ups, stamina, rhythm multipliers, streak buffs or rubber-banding;
- build a large generic Kids Club engine before one is needed;
- add a separate Kids Club venue or separate Stadium 2 venue;
- depend on runtime network assets;
- use AI-generated cave art or stretch Pokémon sprites.

## 3. Existing integration points

The implementation must extend the current structures rather than bypass them:

- `app/src/main/assets/arcade-world.js`
  - `stadiumKidsClub` currently owns `['ekansHoop']`.
  - Add `digDigDig` as the second game.
  - Add game name, objective and owner mapping.
- `app/src/main/assets/arcade-platform.js`
  - Add migrated/preserved default state for `digDigDig`.
- `app/src/main/assets/arcade-session.js`
  - Add Kids Club run/reward metadata for `digDigDig`.
  - Use the existing shared result surface.
- `app/src/main/assets/index.html`
  - Add the Dig! Dig! Dig! game shell.
  - Load the new CSS/core/game scripts.
- `app/src/main/assets/achievements-v0341.js`
  - Add a small Dig! Dig! Dig! achievement set.
- Existing local Sandshrew sprite:
  - `arcade/sprites/actors/pokemon/27.png` (35×39).
  - Preserve aspect ratio and render only at integer pixel scaling where possible.

## 4. Core game rules

### 4.1 Race format

- Four racers: YOU + COM 1 + COM 2 + COM 3.
- Every racer is Sandshrew.
- One race per run.
- Three difficulties: Easy, Normal and Hard.
- A race begins after a short `3 → 2 → 1 → DIG!` countdown.
- All racers start at progress `0` and aim for `RACE_DISTANCE = 80` accepted digs.

### 4.2 Player input

Controls:

- Touch / pointer: large `L` and `R` buttons occupying the lower control area.
- Keyboard: Left / Right arrows and A / D.
- Keyboard auto-repeat must be ignored (`event.repeat`) so held keys cannot generate free digs.

Input rule:

1. The first LEFT or RIGHT input is accepted.
2. Thereafter, only the opposite side from the last accepted input is valid.
3. A valid alternating input advances progress by exactly one dig.
4. Repeating the same side does **not** reduce progress or add a hidden penalty; it simply produces no dig.
5. Only accepted inputs update the expected side.

This deliberately avoids a combo/streak power system. Fast, accurate alternation is the entire player skill test.

### 4.3 CPU behaviour

CPU opponents use the same conceptual alternating-input model, driven by deterministic simulation with injectable RNG for tests.

Each CPU receives independently generated cadence parameters at race creation. The player’s current progress must never influence a CPU’s cadence, errors or pauses.

CPU profile ranges:

| Difficulty | Base valid-input interval | Error/hesitation character | Expected race feel |
| --- | --- | --- | --- |
| Easy | 210–300 ms | frequent small hesitations | comfortably beatable |
| Normal | 155–225 ms | moderate natural variance | competitive |
| Hard | 120–185 ms | low error, still human-like | demanding but beatable |

Each CPU varies within the profile through:

- per-racer base interval;
- bounded interval jitter;
- occasional repeated-side error that produces no progress;
- occasional short hesitation.

There is **no catch-up logic, adaptive difficulty or rubber-banding**.

### 4.4 Finish and ranking

- When the first racer reaches 80 accepted digs, start a four-second finish grace period.
- Racers continue digging during that grace period.
- Finished racers are ordered by finish timestamp.
- At grace expiry, any unfinished racers are ranked by progress, then by most recent accepted-dig timestamp as a stable tie-breaker.
- This prevents a race hanging forever if the player stops tapping while still allowing close finishes to resolve visibly.
- The result screen reports 1st–4th.

For career timing, the player receives a completion time only if the player actually reaches the bottom before the grace period ends. A progress-ranked unfinished result may receive placement/reward but must not create a false best time.

## 5. Difficulty and rewards

Difficulty changes CPU capability only. It does not alter the required 80 player digs.

Lucky Coin rewards:

| Place | Easy | Normal | Hard |
| ---: | ---: | ---: | ---: |
| 1st | 80 | 100 | 130 |
| 2nd | 55 | 70 | 90 |
| 3rd | 35 | 45 | 60 |
| 4th | 20 | 25 | 35 |

These values intentionally sit below long Ekans Master-score payouts and below full Pokémon Dash race payouts because a Dig! Dig! Dig! run is shorter.

The reward must go through `LuckyDexArcadePlatform.awardRun()` exactly once per completed race.

## 6. Persistence

Extend `ARCADE_DEFAULTS` and `ensureArcadeState()` with:

```js
digDigDig: {
  gamesPlayed: 0,
  wins: 0,
  podiums: 0,
  bestTimeMs: null,
  bestTimes: { easy: null, normal: null, hard: null },
  winsByDifficulty: { easy: 0, normal: 0, hard: 0 }
}
```

Rules:

- `gamesPlayed`: increment once when a result is finalised.
- `wins`: increment for 1st place.
- `podiums`: increment for places 1–3.
- `bestTimeMs`: best completed player time across all difficulties.
- `bestTimes[difficulty]`: best completed player time at that difficulty.
- `winsByDifficulty[difficulty]`: increment only for a win on that difficulty.
- Opening, abandoning, backing out or closing a race before finalisation must not increment completion statistics or award coins.
- Migration must preserve unrelated `arcade` keys and tolerate missing/partial legacy Dig state.

## 7. Visual direction — hard Gen III constraint

The gameplay presentation must look like a minigame that could plausibly have appeared alongside Ruby/Sapphire/Emerald, not like a modern mobile game reskin.

### Required style

- crisp pixel-art presentation;
- Gen III-style framed panels and compact HUD;
- GBA-like typography treatment where the existing app fonts permit it;
- nearest-neighbour / `image-rendering: pixelated` for pixel assets;
- no glossy gradients;
- no oversized rounded modern cards inside the playfield;
- no stretched Pokémon;
- no generated cave illustration.

### Existing authentic/local assets to reuse

The repo already contains extracted Gen III cave assets used by Dash and documented in `docs/DASH_GEN3_ASSETS.md`:

- `arcade/dash/gen3/cave-floor.png` — 16×16, Granite Cave extraction.
- `arcade/dash/gen3/cave-wall.png` — 16×16, Granite Cave extraction.
- `arcade/dash/gen3/cave-floor-dark.png` — 16×16, cave extraction.
- `arcade/dash/gen3/cave-rock.png` — 16×16, Granite Cave extraction.
- `arcade/dash/gen3/shallow-water.png` and/or other documented Gen III water tiles for the final underground-water layer.
- `arcade/kids-club/emerald-gym-floor.png` may be used in framing/menu space where appropriate.

Use these already-proven local assets for v0.36.0. Do not introduce new Dig-specific terrain art or runtime asset fetching in this release.

### Shaft presentation

- Four equal vertical shafts remain visible together.
- Labels: `YOU`, `COM 1`, `COM 2`, `COM 3`.
- Sandshrew remains visually anchored around the lower-middle of each shaft during most of the race.
- The earth strip scrolls upward behind each Sandshrew according to that racer’s progress, creating the sensation of downward movement.
- Soil should transition through visible strata as progress increases: lighter cave earth → rockier/darker earth → final breakthrough/water layer.
- Use the 35×39 Sandshrew sprite at integer scaling where viewport width permits. Small-screen fallback may reduce to native 1× rather than fractional distortion.
- Accepted left/right digs may alternate a tiny pixel offset/pose class and dust burst. Do not deform the sprite.
- At 100%, the final layer breaks and the racer drops/bursts into the underground-water finish area.

## 8. Screen flow

### 8.1 Ready state

Inside `digDigDigGame`:

- Kids Club header + Sandshrew mascot.
- `DIG! DIG! DIG!` title.
- One-line instruction: alternate LEFT and RIGHT to dig.
- Easy / Normal / Hard buttons.
- START button.
- Best time for the selected difficulty may be shown compactly if available.

No race movement occurs until START.

### 8.2 Countdown

- Hide/disable ready controls.
- Show four shafts and racers at the surface.
- Display `3`, `2`, `1`, `DIG!` in a centred Gen III-style overlay.
- Inputs before `DIG!` do nothing.

### 8.3 Racing

Compact HUD:

- current place;
- elapsed time;
- selected difficulty.

Main space:

- four vertical shafts;
- independent terrain scrolling;
- Sandshrew digging feedback;
- minimal progress markers rather than modern full-width progress bars.

Bottom controls:

- large LEFT and RIGHT touch zones;
- touch ownership must prevent page scrolling/gesture leakage while interacting with the controls.

### 8.4 Result

After the grace period:

- freeze race simulation;
- show ordered 1st–4th standings in a compact Gen III panel;
- then use the existing `LuckyDexArcadeSession.showResult()` surface for the canonical LuckyDex completion/reward presentation;
- expose `PLAY AGAIN` and Kids Club back navigation through the existing session lifecycle.

## 9. Lifecycle and pause behaviour

Follow the proven Ekans/Dash lifecycle conventions:

- `open()` mounts `digDigDig` to the Arcade session and shows the ready screen.
- `close()` cancels animation/timers and resets transient state.
- backgrounding / `visibilitychange` pauses an active countdown/race/grace period.
- resume restores remaining countdown/grace timing and CPU scheduled actions without granting elapsed background progress.
- pagehide should pause rather than silently finish.
- result completion must be guarded so save mutation and coin awards happen exactly once.

## 10. Implementation structure

Add:

- `app/src/main/assets/arcade-dig-dig-dig-core.js`
  - pure deterministic rules;
  - input alternation;
  - race creation;
  - CPU cadence generation and stepping;
  - finish/grace/ranking;
  - reward lookup.
- `app/src/main/assets/arcade-dig-dig-dig.js`
  - DOM lifecycle;
  - pointer/keyboard ownership;
  - countdown / requestAnimationFrame orchestration;
  - pause/resume;
  - rendering;
  - state persistence, awards and shared result surface.
- `app/src/main/assets/arcade-dig-dig-dig.css`
  - all Dig-specific Gen III presentation.

Do **not** create a separate generic alternating-input module in v0.36.0. Keep the primitive clean inside the Dig core. Thundering Dynamo can later reuse or extract it once there are two real consumers.

## 11. DOM contract

The exact nesting may vary, but tests should rely on stable IDs/data attributes including:

- `digDigDigGame`
- `digDigDigStage`
- `digDigDigReady`
- `digDigDigStart`
- `[data-dig-difficulty="easy|normal|hard"]`
- `digDigDigCountdown`
- `digDigDigPlace`
- `digDigDigTimer`
- `digDigDigRace`
- `digDigDigPlayerLane`
- `digDigDigCpu1Lane`
- `digDigDigCpu2Lane`
- `digDigDigCpu3Lane`
- `digDigDigLeft`
- `digDigDigRight`
- `digDigDigPauseOverlay`
- `digDigDigResume`

## 12. Achievements

Keep the initial catalogue compact:

1. **Down We Go** — win one Dig! Dig! Dig! race.
2. **Tunnel Vision** — win 10 races.
3. **Hard Ground** — win once on Hard.
4. **Rapid Excavator** — record a completed time of 12.0 seconds or faster.

The 12.0-second Rapid Excavator threshold is part of this approved specification. If testing proves it unreasonable, revise the specification explicitly rather than silently changing it during implementation. No achievement may require a hidden mechanic.

## 13. Test plan

### Core unit tests

Prove:

- first side is accepted;
- same-side repeat is rejected without penalty;
- proper alternation advances exactly once per accepted input;
- keyboard/touch-facing core calls cannot advance beyond one dig per accepted event;
- player finishes at exactly 80 accepted digs;
- seeded/injected RNG creates deterministic CPU runs;
- Easy/Normal/Hard produce appropriately separated cadence envelopes;
- CPU progress is independent of player progress;
- first finisher starts the four-second grace period;
- finish timestamps determine completed-racer order;
- unfinished racers rank by progress at grace expiry;
- reward lookup matches the place/difficulty table.

### Lifecycle tests

Prove:

- ready → countdown → racing → grace/result transitions;
- early input during countdown is ignored;
- pause freezes countdown, race and grace timing;
- resume does not give CPUs background progress;
- abandoned races do not count or award;
- completed races count once;
- repeated `finish` calls cannot double-award;
- best times update only for actual completed player finishes;
- legacy/partial save state migrates safely.

### Integration tests

Prove:

- `stadiumKidsClub.games` contains `ekansHoop` and `digDigDig`;
- Ekans remains intact;
- Dig has name/objective/owner/session metadata;
- all required shell IDs exist;
- CSS/core/game scripts are loaded in safe order;
- `arcade-session` recognises the new game;
- achievements read the new persisted state safely.

### Mobile/presentation regression tests

Where browser tooling is available, verify:

- four shafts remain on screen at supported portrait widths;
- controls do not cause page scroll during rapid tapping;
- no Sandshrew image is rendered with a distorted aspect ratio;
- pixel assets render with pixelated/nearest-neighbour treatment;
- pause overlay survives background/foreground;
- result/back/replay navigation returns to the Kids Club correctly.

## 14. Release acceptance criteria

v0.36.0 is complete when:

1. Kids Club visibly offers both Ekans’ Hoop Hurl and Dig! Dig! Dig!.
2. A player can choose Easy/Normal/Hard and complete a four-Sandshrew race on touch or keyboard.
3. Alternating L/R is the only player speed mechanic.
4. CPU difficulty is fair, variable and non-rubber-banded.
5. The game looks unmistakably Gen III and uses authentic/local pixel assets without stretching Pokémon art.
6. Results, rewards, persistence and achievements work exactly once per completed race.
7. Backgrounding safely pauses the run.
8. Ekans and all existing Arcade games remain regression-safe.
9. Focused Dig tests and the existing non-browser regression suite pass.
10. Asset provenance remains documented and no runtime network request is introduced.

## 15. Scope boundary for the following release

After v0.36.0 is stable, the preferred Kids Club follow-up is **Magikarp’s Splash**. Do not pre-build its mechanics in this release.
