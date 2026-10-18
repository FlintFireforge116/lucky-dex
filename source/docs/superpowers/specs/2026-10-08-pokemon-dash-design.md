# LuckyDex Pokémon Dash — Design Specification

Date: 2026-10-08  
Target release: v0.29.0  
Base: LuckyDex v0.28.10  
Status: design ready for implementation planning

## 1. Goal

Add Pokémon Dash as a substantial, replayable LuckyDex arcade minigame built around the player's real Pokémon collection. It should feel like a proper race rather than a stat simulation: six visible racers move through a scrolling course, the player manages sprint stamina and lane position, hazards and boosts matter, and the Pokémon's real Speed stat provides a meaningful but not overwhelming advantage.

The feature must remain fully offline, preserve the permanent Android application identity (`com.example.luckydex`), preserve existing saves, and integrate with the existing Arcade world/session/reward architecture without destabilizing other minigames.

## 2. Release and compatibility

- Release as `versionName 0.29.0`.
- Increment Android `versionCode` from 290 to 291.
- Preserve `applicationId 'com.example.luckydex'` and the bundled permanent development signer.
- Preserve all existing save keys and existing arcade progress.
- Extend `state.arcade` additively; no destructive migration.
- No network dependency is required for racing. Species metadata comes from the bundled `adventure/adventure-species.js` table.

## 3. Arcade world integration

Add a new venue:

- ID: `dashCourse`
- Name: `Pokémon Dash Race Course`
- Kicker: `Pokémon Racing · Dash Circuit`
- Game: `dash`
- Objective: `Race your Pokémon, manage stamina, dodge hazards and finish first.`

The venue appears as a normal stop in `LuckyDexArcadeWorld.VENUES`, participates in previous/next navigation, remembers `lastArcadeVenue`, opens a normal venue screen, and routes back correctly from the game.

Because v0.28.10 contains no dedicated race-course image, the venue and race visuals will be generated from bundled app assets and CSS/canvas layers rather than introducing a runtime web dependency. The race course may reuse neutral bundled scenery textures/effects where appropriate, but the finished race must have its own visual identity.

## 4. Game shell and files

Create three focused modules:

- `arcade-dash.js` — game state, race simulation, input, render loop, AI, lifecycle, result completion, save integration.
- `arcade-dash-course.js` — deterministic course definition/generation, hazards, boosts, scenery markers and collision helpers.
- `arcade-dash.css` — racer picker, race canvas/HUD, mobile controls, pause state and result presentation.

Modify only the integration surfaces needed:

- `index.html`
- `arcade-world.js`
- `arcade-session.js`
- `arcade-platform.js`
- Android/package version metadata
- release/test documentation

The Dash engine should expose a narrow global API such as `window.LuckyDexDash` with `open()`, `close()`, `pause()`, `resume()` and testable pure helpers where practical.

## 5. Racer selection

The player chooses from Pokémon actually present in `state.pokemon`.

Each unique collection entry is eligible and retains its identity:

- species ID
- display name
- shiny state
- collection key
- level
- base Speed stat
- sprite path

The picker shows sprite, name, shiny marker when applicable, level and Speed. It supports a compact search field and Speed/name sorting if the collection is large enough to require it.

The last selected racer is saved as `state.arcade.dash.lastRacerKey` and preselected next time if that key still exists.

If the user somehow has no caught Pokémon, Dash shows a clear locked/empty state and does not silently inject a fake racer into the player's collection.

## 6. Speed and performance model

Real species Speed matters, but slow Pokémon must remain capable of winning through good play.

Use a compressed base-speed curve instead of directly multiplying raw Pokémon Speed into movement.

Recommended model:

- Clamp raw base Speed to the supported dataset range.
- Convert it into a narrow race-speed modifier using a square-root or similarly compressed curve.
- Target roughly a 15–20% total pace difference between exceptionally slow and exceptionally fast species before player input.
- Add a small level bonus capped so level never dominates species/player skill.
- Sprint, boosts, hazard avoidance and stamina management must have a larger impact on final result than the raw species-speed spread.

Shiny status is cosmetic only.

The exact constants must be centralized and unit-tested so balance can be changed without rewriting the engine.

## 7. Race format

Each race has six racers:

- 1 player racer
- 5 AI racers

The race uses a side-scrolling presentation. The player remains near the left-middle tracking zone while the course scrolls. Opponents move relative to the player so overtakes and losses of position are visible rather than represented only by HUD numbers.

The race has a fixed finish distance and several visual/course sections. A full race should be long enough for position changes and stamina decisions to matter but short enough for repeat play.

Required HUD:

- current position, `1st` through `6th`
- race progress/distance bar
- stamina meter
- player Pokémon/name
- optional compact speed feedback while sprinting/boosted

## 8. Controls

Mobile-first controls:

- Pokémon runs automatically at sustainable pace.
- Hold `SPRINT` to accelerate.
- Sprint drains stamina continuously.
- Releasing sprint regenerates stamina after a short recovery delay.
- `UP` / `DOWN` shifts the racer between lanes.
- Lane changes are quick but not instantaneous teleportation; they interpolate over a short interval.
- Touch targets are large and remain usable on narrow Android screens.
- Keyboard fallbacks are allowed for desktop testing but are not the primary design.

## 9. Course objects

The course has three logical lanes and readable object telegraphing.

Initial object set:

- Rock/rough patch: moderate temporary slowdown.
- Mud/water patch: stronger temporary slowdown.
- Speed pad: short temporary pace boost.
- Stamina pickup: restores stamina.

Objects are placed ahead of the player with enough reaction time for a lane decision. No object may spawn directly under the player or create an unavoidable full-width hazard.

Course generation should be deterministic from a race seed. This allows reproducible tests and easier debugging.

The course becomes denser later in the race, but the difficulty increase must come from decisions and timing rather than bullet-hell object spam.

## 10. AI racers

AI racers use the same core movement model and compressed species-speed advantage as the player.

Each AI receives a lightweight behaviour profile controlling:

- sprint aggressiveness
- stamina conservation
- hazard avoidance quality
- boost-seeking tendency
- reaction delay
- mistake probability

AI chooses lanes based on visible upcoming course objects and can make imperfect decisions. It must not cheat by ignoring hazards or having infinite stamina.

AI opponents are selected from the bundled species dataset and displayed with real local sprites. Prefer variety and avoid duplicating the player's exact identity where reasonable.

Race difficulty should produce competitive races without making first place automatic. Faster AI species can be dangerous but are not deterministic winners.

## 11. Rendering

Use a canvas for the active race scene and standard DOM for menus/HUD/buttons.

Canvas responsibilities:

- scrolling track and lane markings
- scenery layers/parallax
- course objects
- six racer sprites
- shadows and lightweight motion effects
- finish-line sequence

DOM responsibilities:

- racer selection
- start/replay controls
- position/progress/stamina HUD
- pause overlay
- accessibility labels

Sprites should preserve pixel-art sharpness where relevant and use local bundled files only.

The render loop uses `requestAnimationFrame`, but simulation time is capped per frame so resuming after a long background interval never advances the race by the hidden elapsed time.

## 12. Race state and lifecycle

Core states:

- `picker`
- `countdown`
- `racing`
- `paused`
- `finished`

Backgrounding or Android recent-app switching while a race is active must pause the simulation. Returning to the app resumes from the same race state without losing progress and without simulating the hidden duration.

`visibilitychange`, `pagehide`, explicit Arcade navigation and game close must all be handled safely.

Leaving Dash intentionally through the game exit may abandon the current race after persisting non-race settings such as the selected racer and historical stats. Abandoned races grant no placement reward.

No timer/RAF/listener may continue after `close()`.

## 13. Rewards and results

Lucky Coin rewards are placement-based and modest enough to fit the existing arcade economy.

Recommended initial table:

- 1st: 120 Lucky Coins
- 2nd: 80
- 3rd: 55
- 4th: 35
- 5th: 25
- 6th: 20

Rewards flow through the existing arcade award path rather than editing wallet values directly.

Persist:

- total races
- wins
- podium finishes
- best finishing time
- best time per selected racer only if doing so remains compact; otherwise global best only for v0.29.0
- last racer key

Result screen shows:

- placement
- race time
- racer name
- base Speed
- Lucky Coins earned
- new-best indicator when applicable

Actions:

- `RACE AGAIN` with same Pokémon
- `CHANGE RACER`
- standard back-to-venue behaviour

Reward completion must be guarded so it can occur exactly once even if lifecycle events or repeated callbacks fire around the finish/result transition.

## 14. Persistence shape

Extend `state.arcade` with a `dash` object. Initial schema:

```js
{
  lastRacerKey: null,
  races: 0,
  wins: 0,
  podiums: 0,
  bestTimeMs: null
}
```

`ensureArcadeState()` owns defaults/normalization. Existing saves missing the object receive defaults. Unknown newer keys are preserved through object spreading.

Active mid-race simulation does not need to survive a full process kill for v0.29.0; it must survive normal WebView background/resume while the process remains alive. A cold process restart returns safely to the picker/venue rather than awarding or restoring a half-finished race.

## 15. Error handling

- Missing selected collection key: return to picker and prompt the user to choose a racer.
- Missing species metadata: fall back to the collection entry's `baseStats.speed`; if absent, use a neutral Speed value and continue safely.
- Missing racer sprite: use the existing local sprite path/fallback behaviour and never block race completion.
- Canvas/context unavailable: show a readable Dash unavailable message instead of throwing through the Arcade shell.
- Save/reward callbacks use the existing app pathways and must not duplicate awards if a save call is delayed or repeated.

## 16. Testing

Add dedicated Node tests for pure logic and integration-contract tests for the DOM/source wiring.

Minimum coverage:

1. Arcade state migration adds Dash defaults without deleting existing keys.
2. Racer list is derived from caught Pokémon and preserves shiny/key/level identity.
3. Raw Speed compression keeps the intended slow-to-fast performance spread bounded.
4. Level bonus stays capped below the configured limit.
5. Sprint drains stamina and release regenerates it correctly.
6. Hazard slowdown and boost/stamina pickup effects apply and expire correctly.
7. Lane movement clamps to valid lanes.
8. Deterministic course seed produces deterministic objects.
9. Course generator never emits an unavoidable full-width hazard pattern in the reaction window.
10. AI stamina is finite and AI interacts with hazards/boosts through the shared rules.
11. Position ordering returns stable 1st–6th placement.
12. Finish is triggered once at the configured distance.
13. Reward mapping matches placement table.
14. Completion guard prevents duplicate Lucky Coin awards.
15. Pause/resume freezes simulation time and avoids hidden-time jumps.
16. `close()` cancels RAF/timers/listeners.
17. World venue routing recognizes `dashCourse` and `dash`.
18. `index.html` includes Dash CSS/scripts/container in correct load order.
19. Android version is 0.29.0 / code 291 and application ID/signing configuration remain unchanged.
20. Existing targeted Arcade regression tests continue to pass.

Run the existing test suite where dependencies permit. If Playwright remains unavailable in the build environment, document the limitation exactly as previous LuckyDex reports do and run all relevant Node regression tests.

## 17. Acceptance criteria

The feature is ready when all of the following are true:

- A player can enter Pokémon Dash from a dedicated Arcade race-course venue.
- The picker shows the player's actual caught Pokémon and correct Speed/level/shiny identity.
- A six-racer race visibly plays from start countdown through finish.
- Sprint/stamina and lane choices materially affect outcomes.
- Hazards and boosts are readable and avoidable.
- Raw Speed matters but does not mathematically lock slow Pokémon out of winning.
- AI racers visibly overtake/fall behind and obey the same stamina/hazard rules.
- Backgrounding pauses and returning resumes without losing or fast-forwarding the race.
- Finishing grants exactly one placement reward and updates persistent race stats.
- Replaying, changing racer, backing to the venue and reopening Dash all work cleanly.
- Existing Arcade games and collection/save behaviour remain intact.
- The Android package updates in place over v0.28.10.
