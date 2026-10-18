# Pokémon Dash v2 Design

**Date:** 2026-10-08  
**Target:** LuckyDex next major Dash release  
**Base:** v0.29.2  
**Status:** Approved design

## Goal

Transform Pokémon Dash from a functional side-scrolling minigame into a substantial LuckyDex racing mode that feels like a Gen 3-era Pokémon game while preserving the race mechanics the user already enjoys.

The redesign must make the Pokémon feel larger and more central, add meaningful progression through type-themed leagues, provide difficulty bands that make a wider range of Pokémon viable, and keep Quick Race available for immediate play.

## Core Principles

1. Preserve the current race pacing, course length, stamina/sprint loop, obstacle frequency, boost frequency, and basic overtaking model unless the top-down conversion requires a small mechanical adjustment.
2. Replace the current side-scrolling presentation with a top-down vertically scrolling course.
3. Use a Gen 3 / GBA-inspired pixel-art presentation rather than directly copying Pokémon Dash.
4. Make racers substantially larger and more visually important.
5. Keep phone controls simple and readable.
6. Make Pokémon Speed matter, but expose difficulty ranges clearly so slow Pokémon remain useful on easier difficulties.
7. Build themed leagues from reusable systems rather than 54 completely bespoke maps.

## Mode Structure

Entering the Race Course opens a dedicated Dash mode menu with two primary options.

### Quick Race

Flow:

1. Choose difficulty.
2. Choose any caught Pokémon.
3. Start a single race.
4. Show results and reward.
5. Allow replay, change racer, or return to mode menu.

Quick Race is the low-commitment mode and has no type restriction.

### Type Leagues

All 18 Pokémon types are represented as separate leagues.

- Normal
- Fire
- Water
- Electric
- Grass
- Ice
- Fighting
- Poison
- Ground
- Flying
- Psychic
- Bug
- Rock
- Ghost
- Dragon
- Dark
- Steel
- Fairy

Each league is a three-race cup.

The player must own at least one caught Pokémon of the league's type to enter. Dual-type Pokémon qualify for both of their types.

A locked league remains visible and displays a direct requirement such as:

> Catch a Ghost-type Pokémon to enter.

Each league stores trophies separately for each difficulty.

Example:

> Fire League — Easy 🥇 · Normal 🥇 · Hard 🥈 · Expert —

## League Scoring

Each three-race cup awards points by finishing position:

| Place | Points |
| --- | ---: |
| 1st | 10 |
| 2nd | 6 |
| 3rd | 4 |
| 4th | 3 |
| 5th | 2 |
| 6th | 1 |

After race 1 and race 2, show current standings before continuing.

After race 3, total points determine the league result:

- 1st overall: Gold trophy
- 2nd overall: Silver trophy
- 3rd overall: Bronze trophy
- 4th–6th: no trophy

Ties are broken by total race time across the cup.

## Difficulty System

Difficulty is primarily defined by the AI opponent Speed range, with secondary differences in AI decision quality.

| Difficulty | Typical AI Base Speed | Intended Racer Range |
| --- | ---: | --- |
| Easy | 20–65 | Slow Pokémon |
| Normal | 55–100 | Average Pokémon |
| Hard | 90–135 | Fast Pokémon |
| Expert | 125–180 | Very fast Pokémon |

Ranges deliberately overlap.

The player is never forbidden from using a Pokémon outside the suggested range. A very fast Pokémon can dominate Easy if the player wants. Higher difficulties compensate with better rewards and stronger records/trophies.

### AI Behaviour by Difficulty

**Easy**
- slower reaction time
- poor stamina management
- more hazard mistakes
- less aggressive lane changes

**Normal**
- competent reactions
- reasonable stamina management
- moderate hazard avoidance

**Hard**
- strong route choices
- good sprint timing
- fewer avoidable collisions

**Expert**
- fast reactions
- aggressive overtaking
- efficient stamina management
- strong hazard/boost routing

AI must not cheat through invisible speed boosts or infinite stamina.

## Racer Selection

The racer picker uses only the player's caught Pokémon.

Each racer card shows:

- sprite
- species name
- level
- shiny state where applicable
- base Speed
- suggested difficulty indicator

Examples:

- `SPD 30 · EASY ✓`
- `SPD 90 · NORMAL ✓`
- `SPD 150 · EXPERT ✓`

The indicator is guidance only, never a lockout.

The mode remembers the last selected racer separately for Quick Race and League use where practical.

## Camera and Course View

Dash v2 uses a top-down vertical racing camera.

- The course scrolls downward.
- The player Pokémon remains around the lower third of the screen.
- Opponents move naturally above or below the player according to relative progress.
- Overtaking is visible on-screen.
- Hazards and boosts appear ahead of the player with enough reaction time.

The race remains lane-based internally for reliable collision and AI, but the lanes are visually hidden.

Three broad racing lines remain under the hood. Left/right input moves the Pokémon smoothly between them rather than snapping instantly.

This preserves the proven race logic while removing the visual feeling of a lane game.

## Controls

Phone-first controls:

- Left
- Hold Sprint
- Right

Sprint keeps the existing stamina behaviour.

The controls remain large and thumb-friendly.

No free-roaming analogue steering is introduced in v2.

## Racer Scale

Current racers are too small and read as icons rather than characters.

Dash v2 increases the on-track visual size substantially:

- target display size: approximately 96–112 px, responsive to screen size
- roughly 1.7–2× the current apparent race size
- player may receive a subtle extra emphasis compared with AI racers
- pixel smoothing disabled

Do not place large floating name labels above every AI racer.

The player receives a small Gen 3-style marker, ring, or cursor treatment instead.

## Visual Direction

The target is **LuckyDex GBA-era Pokémon racing**, not a direct recreation of Pokémon Dash.

The environment should feel like a Gen 3 Pokémon route converted into a race track.

Visual language:

- chunky pixel terrain tiles
- grass borders
- fences
- flowers
- trees
- dirt patches
- rocks
- water edges
- route signage
- restrained pixel shadows
- minimal modern gradients
- GBA/FRLG/Emerald-inspired panel styling

The game must remain original to LuckyDex while clearly evoking the visual readability and charm of GBA-era Pokémon games.

## Type League Themes

Type leagues share reusable systems but receive distinct palettes, terrain, props, hazards, and route dressing.

Suggested themes:

- Normal — classic route / meadow
- Fire — volcanic route, ash, burnt ground, magma cracks
- Water — coast, streams, boardwalks, shallows
- Electric — power station, cables, pylons, metal surfaces
- Grass — dense woodland, flowers, tall grass
- Ice — snow, frozen pools, icy terrain
- Fighting — dojo / mountain training route
- Poison — marsh, toxic pools, industrial runoff
- Ground — desert, sand, canyon floor
- Flying — highland cliffs, bridges, open sky accents
- Psychic — crystal / surreal route
- Bug — forest, logs, webbed foliage
- Rock — canyon, quarry, stone ridges
- Ghost — graveyard / ruins at night
- Dragon — mountain summit / ancient ruins
- Dark — moonlit forest / shadowed route
- Steel — factory / rail yard / metallic route
- Fairy — luminous grove / flowers / pastel crystal accents

Theme variation should affect the actual course surface and obstacles, not only the distant background.

## Hazard and Boost Reskinning

Keep the proven gameplay semantics while adapting visuals per league.

Examples:

- slowdown zone: mud → tall grass → ash → snow → shallow water
- hard obstacle: rock → stump → crystal → machinery → gravestone
- speed boost: pad → wind tile → electric strip → magical glyph
- stamina pickup: themed berry/orb/pickup variant

The mechanical categories remain consistent so the game stays learnable.

## Race HUD

The race view should dedicate most of the screen to the course.

Compact top HUD:

- current position
- progress/distance
- stamina

Bottom control area:

- Left
- Sprint
- Right

Avoid large empty panels or stacked dashboard cards during active racing.

## Mode and Menu UI

Race Course screens move away from the current modern dashboard look.

Use:

- cream/light panels
- dark pixel-style outlines
- restrained accent colours
- compact GBA-inspired cards
- larger Pokémon sprite previews
- less empty vertical space

Difficulty is selected before the racer list so the racer cards can show how well each Pokémon matches the chosen Speed band.

## Progression and Persistence

Persist at minimum:

- Quick Race best time per difficulty where useful
- total Dash races
- total Dash wins
- selected racer memory
- league trophy per type per difficulty
- league best total points / total time where useful

Existing Dash statistics must migrate without reset.

Do not change the app package identity or signer expectations.

## Rewards

Quick Race retains the existing placement-reward philosophy, scaled by difficulty.

Type League rewards should be meaningfully larger than a single Quick Race because the player completes three races.

Higher difficulties pay more.

Exact reward numbers should be balanced during implementation while preserving the principle that Expert is materially more lucrative than Easy.

## Architecture

Preserve the current Dash race engine where practical.

Recommended split:

- `arcade-dash.js` — race runtime, state, input, AI integration
- `arcade-dash-course.js` — deterministic course generation and themed course definitions
- `arcade-dash.css` — mode menus, picker, HUD, responsive race UI
- new focused theme/config module if `arcade-dash-course.js` becomes too large

The top-down renderer can replace the existing side-scrolling renderer while retaining core speed/stamina/progress logic.

Avoid coupling Type League progression into unrelated arcade modules.

## Determinism and Reproducibility

Course layouts should remain seeded/deterministic where possible so bugs can be reproduced.

For a given seed/theme/difficulty:

- hazard layout should be repeatable
- boost layout should be repeatable
- AI field generation should be reproducible for tests

## Lifecycle Behaviour

Maintain the current Android lifecycle guarantees:

- backgrounding pauses the race
- resuming does not create a delta-time jump
- race state is not silently discarded by recent-app switching
- result rewards commit exactly once
- abandoned races cannot duplicate payouts

League race progression must also survive a temporary app background event without losing standings.

## Testing Requirements

Automated tests must cover at minimum:

1. difficulty Speed bands
2. racer recommendation indicators
3. type eligibility including dual types
4. locked league entry requirements
5. league scoring table
6. tie-break by total race time
7. trophy assignment
8. trophy persistence per type/difficulty
9. Quick Race unrestricted racer selection
10. hidden-lane movement and smooth lane interpolation
11. top-down coordinate/progress mapping
12. obstacle/boost collision after renderer conversion
13. deterministic themed course generation
14. theme hazard reskin mapping
15. AI stamina remains finite
16. AI does not exceed configured Speed rules
17. pause/resume during Quick Race
18. pause/resume during league race
19. exactly-once Quick Race rewards
20. exactly-once league completion rewards
21. save migration from v0.29.2 Dash state
22. responsive racer size/HUD integration contract

Existing Arcade, Ball Drop, Clefairy, pack-opening, save, and release-contract tests must continue to pass except for already documented inherited/environment-only failures.

## Out of Scope for v2

- free-roaming analogue steering
- online multiplayer
- ghost racing against other users
- custom player-built tracks
- item combat / Mario Kart-style attacks
- per-Pokémon unique racing abilities
- fully bespoke hand-authored maps for every individual race

These may be revisited later if the core v2 mode proves fun and stable.

## Success Criteria

Dash v2 is successful when:

- the first impression is clearly more Pokémon-like than the current build
- racers are visually prominent rather than tiny icons
- the top-down view remains easy to control one-handed on a phone
- Quick Race can be entered quickly
- Type Leagues create meaningful longer-term progression
- slower Pokémon remain genuinely usable on Easy/Normal
- faster Pokémon have a reason to exist in Hard/Expert
- each league feels visually distinct without requiring a separate engine
- current good race pacing is preserved
- app lifecycle and reward integrity remain reliable
