# Pokémon Challenge Course + Power Trial Design

## Goal
Turn the existing Pokémon Dash venue into the **Pokémon Challenge Course**, themed around the **Pokéathlon Dome in Goldenrod**, so it becomes the single Arcade home for caught-Pokémon stat activities. Preserve the existing Pokémon Dash game intact and add **Power Trial — Attack** as the first new challenge.

## Scope for this build
This release adds the shared venue/hub architecture and one new playable challenge:

1. **Pokémon Dash — Speed** — existing game, preserved.
2. **Power Trial — Attack** — new and fully playable.
3. **Impact Trial — Defense** — visible as Coming Soon.
4. **Target Range — Special Attack** — visible as Coming Soon.
5. **Elemental Gauntlet — Special Defense** — visible as Coming Soon.
6. **Endurance Expedition — HP** — visible as Coming Soon.

The four future challenge cards do not open placeholder gameplay.

## Venue identity
- Rename the existing `dashCourse` venue to **Pokémon Challenge Course** without changing its persistent venue ID, so existing saves continue to resolve correctly.
- Replace `arcade/dash-course-v0290.svg` as the venue landmark with a **locally bundled Pokéathlon Dome / Goldenrod image**. Runtime must not depend on an external image URL.
- Venue copy should identify it as a Goldenrod athletic/challenge facility rather than a Dash-only race course.
- The venue landing page should use dedicated challenge cards showing the activity name, associated base stat, gameplay summary, and status (Play / Coming Soon).

## Shared caught-Pokémon challenge data
The Challenge Course must use a common caught-Pokémon adapter instead of each game inventing its own collection parser.

Each selectable row exposes:
- save key
- National Pokédex ID
- display name
- shiny state
- collection level
- sprite/art path
- types
- all six base stats: HP, Attack, Defense, Special Attack, Special Defense, Speed

The bundled `adventure-species.js` dataset remains the canonical offline species source. It should be extended from four stats to all six using the already bundled PokeAPI `pokemon_stats.csv` source. Existing four-stat consumers remain compatible because the current fields keep their names and values.

Pokémon Dash may continue using its existing Speed-specific API, but that API should be backed by or compatible with the shared challenge adapter rather than becoming a second source of truth.

## Core balance rule
**Player skill matters more than raw base stat.**

A high Attack stat raises the Pokémon's achievable ceiling, but it must not guarantee victory or a record. A well-played medium/low-Attack Pokémon can outperform a poorly played high-Attack Pokémon.

For Power Trial, Attack should contribute roughly one-third of the achievable result range, while charge/release/timing quality controls the larger share. Difficulty changes the execution challenge, not the Pokémon's underlying stat.

## Power Trial — Attack
### Run structure
- Choose difficulty: Easy / Normal / Hard.
- Choose any caught Pokémon.
- A run contains **five increasingly heavy targets**.
- Each target uses a two-stage player action:
  1. **Charge** — hold the input to build force, releasing near the optimal charge window. Holding too long causes power to fall away rather than letting the player simply wait for maximum.
  2. **Impact** — a fast timing marker crosses a strike zone; tap at the centre for maximum transfer.
- Final applied force combines the Pokémon's base Attack with charge quality and impact accuracy.
- The target visibly reacts to the result: failure/recoil, partial movement/cracking, or a successful smash/launch.
- Later targets require progressively more force.
- The run ends after target five or when the Pokémon fails to clear the allowed failure threshold. Results show target reached, total score, best single hit, Pokémon used and Attack stat.

### Difficulty
- **Easy:** wider optimal charge/impact windows and slower timing marker.
- **Normal:** intended default balance.
- **Hard:** tighter charge window, faster timing marker and heavier target curve.
- Coin rewards scale with difficulty and performance.

### Records
Persist at minimum:
- games played
- total clears
- best target reached
- best single-hit score
- best total score per difficulty
- best Pokémon/key used for the overall record where practical

## Power Trial rare event
Power Trial gets one optional rare event so the test-control requirement is exercised from the first Challenge Course expansion:

- **Golden Target** — a rare replacement for one target in a run. Clearing it awards a modest bonus reward and records a rare-event count. It should be visually obvious but should not turn the game into a jackpot economy source.
- Production odds: **2% per eligible run**, rolled once per run.
- Settings > Rare-event testing must expose: Off / Vanilla 2% / Test 25% / Always 100%.
- The runtime reads the saved odds setting; there must be no separate hidden force-test constant.

## Achievements
Power Trial launches with achievements, not as a later patch. Include at least:
- first completed run
- 10 runs
- first full five-target clear
- Hard full clear
- a high-accuracy / near-perfect hit achievement
- a cumulative or best-score mastery achievement
- Golden Target cleared

Existing Pokémon Dash achievements remain unchanged and continue to count Dash only.

## UI and lifecycle
- Keep `dashCourse` as the save-compatible venue ID.
- Add `powerTrial` as a normal Arcade game ID using the existing Arcade lifecycle (`open`, `close`, records/session hooks).
- Challenge Course cards should visually distinguish the six stats and clearly mark unavailable future activities.
- Reuse existing Gen III/pixel-art presentation where possible; do not introduce a visually unrelated modern UI layer.
- Mobile portrait controls must fit without clipped primary inputs.

## Error handling and fallbacks
- If a caught Pokémon is missing collection metadata, fill display/stat data from bundled species metadata.
- If an individual stat is malformed or missing, use the species value; only then fall back to a neutral value of 60.
- A missing Pokéathlon venue image must not break Arcade navigation; keep a bundled fallback image path during the transition.
- Closing or navigating away from Power Trial must cancel timers/animation frames and must not award duplicate rewards.

## Testing
Add focused automated coverage for:
- `dashCourse` ID persistence while its display identity changes to Pokémon Challenge Course.
- six activity cards, with only Dash and Power Trial enabled in this release.
- shared challenge Pokémon rows exposing six base stats for representative species.
- Power Trial force calculation: player execution can overcome a meaningful Attack-stat gap, while equal execution still rewards higher Attack.
- Easy/Normal/Hard timing profiles.
- exactly-once result/reward persistence.
- Golden Target production/test/off/always odds settings.
- Power Trial achievements and record fields.
- existing Pokémon Dash tests remain green.
- venue asset is local and packaged.

## Non-goals for this build
- Do not implement Impact Trial, Target Range, Elemental Gauntlet or Endurance Expedition yet.
- Do not redesign Pokémon Dash racing mechanics, Type Leagues or its reward economy.
- Do not rename the persisted `dashCourse` venue ID.
- Do not add a separate Training Grounds venue.
