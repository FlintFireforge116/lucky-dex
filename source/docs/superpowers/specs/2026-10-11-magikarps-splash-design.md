# LuckyDex v0.37.0 — Magikarp's Splash Design

## Status
Approved direction: faithful Pokémon Stadium Magikarp's Splash mechanics, recreated as a Gen III LuckyDex Kids Club game.

## Goal
Add the third Pokémon Stadium / Kids Club activity to LuckyDex: Magikarp's Splash. Preserve the original game's simple timing skill loop while presenting it as if it were a polished Generation III GBA-era minigame.

## Binding design principles
- Stadium mechanic first; Gen III presentation second.
- No caught-Pokémon stats, team selection, power-ups, combo multipliers or monetisation mechanics.
- Four competitors remain visible: YOU + COM 1 + COM 2 + COM 3.
- 20-second score attack.
- No rubber-banding. CPU behaviour is generated independently of player performance.
- Touch must be responsive and forgiving enough for Android latency without trivialising the timing challenge.
- Reuse LuckyDex's proven Berry Blender timing/input/lifecycle patterns without coupling Magikarp to the Berry Blender runtime or refactoring Berry Blender.
- Preserve Ekans' Hoop Hurl and Dig! Dig! Dig! unchanged.

## Existing framework to reuse
Berry Blender already proves the project patterns needed for a timing game:
- requestAnimationFrame-driven timing;
- explicit timing windows and hit classification;
- pointer/touch ownership and press feedback;
- ignored keyboard repeat events;
- pause/resume-safe game clocks;
- short-lived impact feedback and particles;
- Arcade session/reward integration.

Magikarp should follow those patterns in its own isolated owner/core files. It must not import or mutate `LuckyDexBerryBlender`.

The current Kids Club venue already exposes `ekansHoop` and `digDigDig`; v0.37.0 adds `magikarpSplash` as the third game.

Local Pokémon art is already available at `arcade/sprites/actors/pokemon/129.png` and matching shiny/alternate sprite stores. Use the normal Gen III Magikarp sprite and preserve its native aspect ratio.

## Core game loop
### Round length
- Countdown: `3 → 2 → 1 → SPLASH!`
- Active round: 20.00 seconds.
- At 0.00, new player/CPU launch inputs stop. Any Magikarp already in the air may complete that jump; a counter hit from that already-started jump remains valid. Then scores lock and results are shown.

### Player input
Primary mobile control: one large `SPLASH` button.
Keyboard: `Space` and `A`.

Input model:
1. Press begins a jump immediately.
2. Continuing to hold during the early ascent adds upward impulse up to a capped hold duration.
3. A short tap produces a low hop that does not reach the overhead counter.
4. A sufficiently held jump reaches the counter and can score exactly once that jump.
5. Release ends the extra upward impulse; normal gravity completes the arc.
6. Pressing again in the landing timing window queues an immediate rebound/Quick Splash.

Repeated OS keydown events while a key is held must be ignored.

### Landing / Quick Splash window
Use a small buffered timing window around touchdown so Android input latency does not make the mechanic frame-perfect:
- early buffer target: ~110 ms before touchdown;
- late buffer target: ~90 ms after touchdown.

A valid landing press starts the next jump without the normal grounded recovery delay and increments the Quick Splash chain.

Missing the landing window resets the chain and incurs a short grounded recovery before the next normal launch is allowed.

Exact physics constants may be tuned during implementation, but the behavioral contract is fixed: low taps cannot score, deliberate holds can score, and precise landing timing materially increases scoring rate.

### Counter scoring
- One point per successful overhead counter strike.
- Maximum one point per jump.
- The switch visibly depresses/bumps on contact and the lane counter increments immediately.
- No score multiplier; displayed score is the number of successful counter hits.

## CPU opponents
CPU performance is independent of player state and must never inspect player score, jump phase, combo chain or remaining relative lead.

Each CPU models:
- hold duration accuracy;
- landing-window accuracy;
- occasional late/early landing miss;
- grounded hesitation after a miss;
- small run-to-run variance generated at round start / from a seeded RNG.

Target 20-second score bands:
- Easy: commonly 12–18
- Normal: commonly 19–24
- Hard: commonly 25–29, with occasional excellent runs around 30

These are tuning targets, not hard score clamps. Simulated distributions must overlap slightly so CPU performances do not look scripted.

Hard should require a genuinely strong player rhythm from first release; avoid repeating Dig v0.36.0's under-tuned Hard launch.

## Gen III visual recreation
### Overall art direction
The game should look like a lost Ruby/Sapphire/Emerald side activity, not a modern mobile game and not a literal N64 UI port.

Use:
- authentic/local Gen III water or compatible tiled Hoenn water assets already in LuckyDex;
- sandy/cream Hoenn-style platforms;
- GBA-style dark green/blue pixel borders and window framing;
- limited palette and hard-edged pixel shadows;
- crisp nearest-neighbour Pokémon rendering;
- pixel splash/droplet effects;
- mechanical overhead counters/switches rendered in Gen III pixel language.

Avoid:
- modern glossy gradients;
- rounded app cards inside the game field;
- blurred/stretched sprites;
- AI-generated-looking background artwork;
- oversized HUD chrome that crowds the playfield.

### Four-lane playfield
Landscape concept retained even on portrait phones: four vertical competitor lanes across one shared stage.

Each lane contains:
- name strip (`YOU`, `COM 1`, `COM 2`, `COM 3`);
- overhead mechanical score counter;
- overhead strike switch;
- Magikarp jump space;
- Gen III platform/water landing area;
- subtle lane-specific feedback without separating lanes into giant modern cards.

The player lane receives a restrained Gen III highlight strip, consistent with Dig's YOU treatment.

### Magikarp rendering
- Use the local Gen III #129 sprite.
- Scale only with aspect ratio preserved and image-rendering appropriate for pixel art.
- The fish may translate/rotate/squash through CSS/DOM animation, but the source sprite itself must never be stretched independently on X/Y.
- Landing pose: brief squash/tilt + water droplets.
- Successful strike: tiny recoil/flash on the counter, not a giant screen effect.

### Feedback
A successful score should read immediately through several small cues:
- switch bump;
- score digit tick/pop;
- short `+1` pixel marker;
- light haptic where supported;
- tiny impact particles.

A Quick Splash should be communicated by:
- instant rebound;
- small `QUICK!` / pixel spark feedback;
- current chain shown compactly for the player only.

Do not add a combo score multiplier.

## HUD and controls
Top compact HUD:
- TIME
- YOU score / current place
- LEVEL (Easy/Normal/Hard)

Primary bottom control:
- one large `SPLASH` button, sized for one-thumb use;
- active/held state visibly depresses using hard pixel offsets rather than soft modern scaling;
- `touch-action: none` or the project's proven equivalent prevents scroll/gesture theft during active play.

During the ready state, show concise controls and difficulty selection. Hide explanatory clutter once the countdown begins.

## Results
At round completion show all four ranked results with score, then LuckyDex's standard Kids Club result/reward surface.

Placement is determined by score. Ties use deterministic tie handling fixed in the core; if the player ties for the highest score, do not silently demote them due to array order.

Suggested reward model follows Dig: placement-based base reward with difficulty scaling rather than score-tier rewards.

## Persistence
Add `state.arcade.magikarpSplash` with safe migration defaults for old saves:
- `gamesPlayed`
- `wins`
- `podiums`
- `bestScore`
- `bestScores: { easy, normal, hard }`
- `winsByDifficulty: { easy, normal, hard }`
- `bestQuickChain`

All writes occur only on completed rounds. Awarding/replay must remain exactly-once safe.

## Achievements
Keep achievements small and legible. Proposed set:
- first Magikarp's Splash win;
- win on Hard;
- score 25+;
- reach a strong Quick Splash chain (threshold tuned against final physics, then frozen in tests).

Avoid achievements that encourage intentionally playing Easy repeatedly instead of improving timing.

## Kids Club selector polish
With three games, Kids Club should receive a modest Gen III-specific selector treatment while other Arcade venues remain unchanged.

Each of the three entries gets:
- local Pokémon sprite/icon;
- game title;
- concise one-line mechanic;
- small Gen III colour/header treatment.

Games:
1. Ekans' Hoop Hurl — aim / trajectory
2. Dig! Dig! Dig! — alternating speed
3. Magikarp's Splash — hold / landing rhythm

No new generic menu subsystem is required.

## Architecture
Create a DOM-free Magikarp core for physics/timing/CPU/result calculation and a separate browser owner for lifecycle/render/input/session integration, following Dig/Ekans conventions.

Expected files:
- `app/src/main/assets/arcade-magikarp-splash-core.js`
- `app/src/main/assets/arcade-magikarp-splash.js`
- `app/src/main/assets/arcade-magikarp-splash.css`
- focused tests for core, lifecycle, presentation, persistence, venue integration and release identity

Modify only the required shared surfaces:
- Kids Club game registry / names / objectives / owners;
- Arcade state defaults + migration;
- session metadata;
- achievements;
- index script/style/DOM shell;
- release/version metadata;
- Kids Club selector-specific styling/render metadata.

Do not refactor Berry Blender, Ekans or Dig in v0.37.0.

## Testing requirements
Core tests must prove:
- short taps cannot score;
- enough hold reaches the counter;
- one score maximum per jump;
- landing-window input produces immediate rebound;
- outside-window input does not create a Quick Splash;
- keyboard repeat cannot synthesize extra launches;
- 20-second cutoff behavior is deterministic;
- CPU simulations are seeded/repeatable;
- CPU behavior is independent of player performance (no rubber-banding);
- difficulty score distributions meet tuned target bands over a useful seed sample;
- tie ranking is deterministic and fair to the player.

Lifecycle tests must prove:
- countdown / running / paused / result phases;
- background pause freezes timer and jump physics correctly;
- resume shifts deadlines/clock correctly;
- close/abandon awards nothing;
- completion awards and persists exactly once;
- replay starts a fresh round.

Presentation/mobile tests must guard:
- local #129 sprite use and preserved aspect ratio;
- Gen III styling and no accidental stretched Pokémon art;
- large touch target and touch ownership;
- four competitors fit phone width without horizontal page scroll;
- all new DOM IDs match owner expectations;
- Kids Club selector contains all three games while preserving Ekans and Dig.

## Release
Target release: `v0.37.0` / `versionCode 3700`.

Deliverables:
- `LuckyDex_source_v0.37.0.zip`
- `TEST_REPORT_v0.37.0.md`
- matching Termux upload block using the established `LuckyDex_source.zip` repo workflow.

## Explicitly out of scope
- Hyper difficulty
- multiplayer/network play
- caught-Pokémon stats
- shiny selector
- new generic Kids Club framework
- Rock Harden / Thundering Dynamo
- Berry Blender refactor
