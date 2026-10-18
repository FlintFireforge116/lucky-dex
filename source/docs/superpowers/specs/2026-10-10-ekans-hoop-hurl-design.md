# LuckyDex v0.35.0 — Pokémon Stadium Kids Club + Ekans' Hoop Hurl Design

**Date:** 2026-10-10  
**Baseline:** LuckyDex v0.34.7  
**Target:** LuckyDex v0.35.0  

## Purpose

Add the first Pokémon Stadium / Kids Club activity to the continuous LuckyDex Arcade world. The initial release introduces a reusable Kids Club venue and a faithful touchscreen interpretation of **Ekans' Hoop Hurl**, visually translated into a **Pokémon Emerald / Gen III pixel-art presentation**.

The game should feel like an authentic Pokémon minigame rather than a generic ring-toss game wearing Pokémon colours.

## Binding requirements

1. Add a new **Pokémon Stadium / Kids Club** venue to `arcade-world.js` without replacing or repurposing an existing venue.
2. The first activity in that venue is **Ekans' Hoop Hurl**.
3. Preserve the original game's core rules:
   - 60-second round.
   - Nine Diglett positions in a 3 × 3 field.
   - No more than three Diglett active at once.
   - Normal Diglett = 1 point.
   - Gold Diglett = 2 points.
   - Successful hoops clear that Diglett and cause another target to appear.
   - Player competes against three CPU Ekans and highest score wins; ties are allowed.
4. Replace the original N64 D-pad + analogue-stick control with a touch-native gesture that preserves the same two decisions: **aim** and **throw strength/distance**.
5. Use real locally stored Pokémon/game assets wherever they exist. Do not generate or hand-draw replacement Pokémon artwork when a usable game asset is already available.
6. Existing local Gen III Pokémon sprites are authoritative for Ekans and Diglett:
   - `arcade/sprites/actors/pokemon/23.png`
   - `arcade/sprites/actors/pokemon/50.png`
7. The Gen III interpretation should use extracted/RSE-style tile assets and pixel UI rather than CSS-painted pseudo-art. CSS may compose/layout assets, draw guides/trajectory indicators, and provide responsive UI, but should not replace source-game art with faux illustrations.
8. Preserve current Arcade lifecycle behaviour: entering/exiting the app, Android task switching, Back navigation, result sheets, rewards and save persistence must not lose or corrupt the current game state.
9. Package ID remains `com.example.luckydex`; signing identity remains unchanged so the APK updates in place.
10. Release identity becomes `versionName '0.35.0'`, `versionCode 350`.

## Venue

### Pokémon Stadium / Kids Club

The venue appears as a new stop in the existing Arcade route.

For the world/venue hero, prefer a real Pokémon game image over generated art. The strongest visual direction is a Gen III stadium-like location using **Pokémon Emerald Battle Frontier / Battle Dome** material. The existing Stadium classroom screenshot may remain as a source/reference asset, but the active v0.35.0 venue should visually match the Gen III interpretation where practical.

Initial activity list:

- Ekans' Hoop Hurl

Future Kids Club games will be added to this same venue, so the venue ID and game ownership should be stable and extensible.

Recommended venue ID: `stadiumKidsClub`  
Recommended game ID: `ekansHoop`

## Game presentation

### Overall composition

Portrait-first phone layout, fitting comfortably on the same devices already targeted by the Arcade.

Top to bottom:

1. Compact Kids Club header / Back control.
2. HUD with timer and four player scores.
3. 3 × 3 Diglett field occupying the majority of the screen.
4. Player Ekans launch lane at the bottom.
5. Gesture hint before the first throw only; it disappears once understood.

The stage should evoke an Emerald Battle Frontier / Battle Dome minigame board: tiled arena, crisp pixel borders, Emerald-style panels, and nearest-neighbour scaling of sprites.

### Pokémon assets

- Player and CPU launchers use the existing unretouched Gen III Ekans sprite.
- Diglett use the existing unretouched Gen III Diglett sprite.
- Gold Diglett uses the same authentic Diglett asset with a deliberately limited palette/tint treatment rather than a newly drawn character.
- If an authentic usable Ekans curled/hoop asset is located during implementation, use it for the airborne/landing state. Otherwise the launched object should remain visibly based on the real Ekans sprite and be transformed/animated rather than replaced with bespoke illustrated art.

### Arena assets

Use local or newly materialised authentic Gen III assets for arena floor, borders and decorative stadium elements. Existing `arcade/dash/gen3/` assets may be reused where they originate from real Gen III material and visually fit. Additional Emerald Battle Frontier / Battle Dome extracted assets may be stored locally if needed.

No runtime network dependency.

## Controls

### Recommended touch control: pull-and-release throw

The player's Ekans sits at the bottom centre of the lane.

- Touch/press Ekans to begin aiming.
- Drag horizontally to set left/right aim.
- Drag downward to build throw strength.
- A projected landing marker moves through the three Diglett depth rows as strength changes.
- Release to throw.

This maps the original two-part control into one natural touchscreen gesture:

- horizontal component = D-pad aim;
- pull distance = analogue throw strength.

The landing marker should show **where** a throw is intended to land but should not guarantee a hit; timing and moving targets still matter.

### Accessibility fallback

Provide tap controls below/around the launcher for players who cannot comfortably drag:

- Left / Right aim buttons.
- Near / Mid / Far distance selector.
- Throw button.

The gesture remains primary, but the game is fully playable without dragging.

## Field and target logic

- Fixed nine target sockets in three rows of three.
- At round start, populate up to three targets.
- Active target count remains at or below three.
- Each active target has a short random lifetime before ducking away if not hit.
- A vacated socket respawns after a brief random delay.
- Avoid immediately respawning the same socket too frequently.
- Gold Diglett chance is low enough to feel exciting but appears reliably across repeated rounds.
- Gold state is visually obvious beyond colour alone: add a small sparkle/star indicator so accessibility does not depend solely on hue.

## Throw / collision model

Keep the mechanic deliberately arcade-like rather than physically simulated.

A throw resolves from:

- horizontal aim lane;
- selected depth / pull strength;
- a small skill-error term based on release consistency;
- target position at landing time.

The Ekans follows a short parabolic-looking visual arc. Hit detection is based on distance from the resolved landing point to the target socket, not on transparent image rectangles.

A close hit should visibly loop/settle around the Diglett. A miss lands briefly on the field and then resets the player's Ekans.

Throws should be quick enough to permit many attempts in 60 seconds.

## CPU players

Three CPUs run concurrently.

Each CPU has:

- reaction delay;
- target selection;
- aim error;
- throw interval;
- occasional preference for Gold Diglett.

Difficulty for v0.35.0 is one balanced default rather than a new difficulty menu. CPU scores should feel competitive without routinely becoming unbeatable.

CPU throws should be represented visually enough that the field feels like a four-player Kids Club event, but should never obscure the player's targeting area.

## Scoring and results

HUD shows P1/P2/P3/P4 scores throughout the round.

At 0 seconds:

- freeze new throws;
- allow already-launched Ekans to finish;
- rank all four scores;
- ties remain ties rather than silently applying a hidden tiebreaker;
- use the shared LuckyDex result sheet.

Recommended Lucky Coin reward:

- 1st: 220 coins
- tied 1st: 200 coins
- 2nd: 150 coins
- 3rd: 110 coins
- 4th: 80 coins

This can be tuned during implementation against current Arcade rewards, but no energy timer, paywall or consumable entry fee is introduced.

Persist at minimum:

- games played;
- wins;
- best score.

Recommended save path:

`state.arcade.ekansHoop`

## Audio and feedback

Use short local effects where available:

- throw;
- successful hoop;
- Gold Diglett hit;
- final whistle/result.

If authentic sound effects are not already safely local, the release must not block on them. Visual feedback and vibration provide the baseline.

On successful hoop:

- brief score popup (`+1` / `+2`);
- target hit flash/sparkle;
- short vibration when enabled.

## Lifecycle and state

The game engine exposes the same owner contract used by the Arcade world:

- `open()`
- `close()`

It must additionally pause cleanly on document visibility loss so Android app-switching does not silently end a round.

On return from background:

- round remains paused;
- player sees a small resume overlay;
- timer does not advance while hidden.

Leaving through the game Back button intentionally abandons the current round and returns to the Kids Club venue.

## Files / architecture

Expected new production files:

- `app/src/main/assets/arcade-ekans-hoop.js`
- `app/src/main/assets/arcade-ekans-hoop.css`
- `app/src/main/assets/arcade/kids-club/...` for any additional authentic local arena assets

Expected modified production files:

- `app/src/main/assets/index.html`
- `app/src/main/assets/arcade-world.js`
- `app/src/main/assets/arcade-platform.js`
- `app/src/main/assets/arcade.css` only if venue-level styling is required
- `app/build.gradle`

Prefer keeping game-specific presentation out of the already-large global Arcade CSS.

## Testing

Implement with focused tests before production changes.

Minimum automated coverage:

1. Kids Club venue exists and owns `ekansHoop`.
2. `ekansHoop` owner can open/close through `LuckyDexArcadeWorld`.
3. Round duration is 60 seconds.
4. Target manager never exceeds three active Diglett.
5. Successful normal hit awards one point.
6. Successful Gold hit awards two points.
7. Hit target vacates and is replaced.
8. CPU players participate and accumulate scores.
9. Ties are preserved.
10. Background pause prevents timer progression.
11. Existing Arcade games remain routable.
12. Release identity is 0.35.0 / 350 and application ID is unchanged.
13. Asset paths for Ekans/Diglett exist locally and no runtime network fetch is required.

Browser/mobile QA should include 360 × 800 and 412 × 915 portrait layouts plus task-switch pause/resume behaviour.

## Acceptance criteria

The release is complete when:

- Pokémon Stadium / Kids Club is a selectable Arcade venue.
- Ekans' Hoop Hurl launches from that venue and plays a complete 60-second four-player round.
- Touch drag/release aiming is responsive on phone and has a non-drag fallback.
- The field contains a maximum of three active Diglett across nine sockets.
- Normal and Gold scoring work correctly.
- The presentation reads immediately as Gen III Pokémon using authentic local sprites/tiles rather than generated Pokémon art.
- App switching pauses rather than closes/loses the game.
- Shared Arcade results/rewards and Back navigation work.
- Existing Arcade behaviour remains intact.
- Test suite shows no new non-environmental regressions.
- A versioned `LuckyDex_source_v0.35.0.zip` is produced, with the normal stable application ID retained.
