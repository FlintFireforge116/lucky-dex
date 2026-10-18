You are taking over the Lucky Dex Android WebView game from the supplied project. Treat this as a real game-motion implementation task, not a CSS-polish task.

Read `CODEX_HANDOVER.md` first and inspect `reference/TARGET_CLEFAIRY_AND_PACK_OPENING.png` before touching code.

Your job is to implement TWO focused upgrades:

# P0 — cinematic pack opening
Rebuild the pack reveal so it feels like a genuine mobile game animation rather than a static card plus overlays.

## Required motion design
Use a single deterministic timeline per revealed card. The exact values may be tuned after visual testing, but the sequence should feel approximately like this:

1. **Spawn from depth (0–650 ms)**
   - Show the card back only.
   - Start very small and far away: e.g. scale ~0.08–0.15 and strong negative Z / perspective depth.
   - Fly toward the viewer while rotating smoothly in 3D.
   - Include at least one full Z rotation and some Y-axis rotation so it reads as an object moving through space, not a 2D scale-up.
   - Use physically convincing easing with a slight overshoot near full size.

2. **Settle (650–850 ms)**
   - Card eases into the centre and steadies.
   - Subtle ambient light gathers behind the card.

3. **Reveal flip (850–1200 ms)**
   - Use a true 3D card container with `perspective`, `transform-style: preserve-3d`, card back and card front faces, and backface visibility handled correctly.
   - Rotate the card around Y to reveal the front.
   - The real card image must be preloaded before this stage so there is no blank frame.
   - At the midpoint, fire a brief reveal flash and haptic.

4. **Rarity payoff (starts as the front becomes visible)**
   - Common: card settles with minimal sparkle.
   - Rare/Holo: small flash + modest particles.
   - Illustration / One Star style hits: stronger bloom and sparkle field.
   - Two/Three Star / equivalent high hits: dramatic gold light, more particles and a longer pause.
   - Crown / top-tier hit: full cinematic treatment.

## Gold swirl — critical requirement
For high/top-tier hits, implement the gold spiral shown in the reference as an actual animated effect, not a static border or conic-gradient ring.

Preferred implementation:
- Use Canvas or SVG paths for 2–3 glowing elliptical ribbon trails orbiting the card.
- Animate the trails continuously with requestAnimationFrame or Web Animations.
- Visually pass some ribbon segments **behind** the card and some **in front** so the swirl feels three-dimensional.
- Emit small gold particles/sparks along the ribbon path.
- Use additive/screen-style blending where supported.
- Let the swirl make roughly 1.5–2.5 revolutions, then fade while the card remains visible.

The card itself should remain sharp and readable; effects must frame it, not cover it.

## Interaction / pacing
- During the cinematic portion, disable accidental advance/swipe.
- After the reveal settles, enable swipe-left for next card and swipe-right for previous card.
- Preserve Full Screen card viewing.
- Add a small **Skip** affordance once the player has already seen the current rarity animation once, or after ~500 ms, without breaking state.
- Do not make players tap to reveal the card: reveal should run automatically once the card enters the stage.
- Haptics should scale with rarity using the existing `vibrate` bridge.

## Performance
- Target smooth 60 fps on modern Android phones.
- Only animate transform/opacity on DOM layers where possible.
- Use one or two canvases for particles/ribbons rather than dozens of DOM nodes.
- Cancel RAF/timelines immediately when leaving Pack Opening or moving to the next card.
- Preload the next card image while the current card is being shown.

## Offline preservation
v0.13 has local set/card/artwork caching. Do NOT remove or weaken it.
The reveal animation must work entirely from already-cached/local data after the pack has been generated.

## Set chronology
The set selector must be genuinely chronological, not alphabetical.
- Default ordering: **newest release first**.
- Use real `releaseDate` when present.
- When the list endpoint omits dates, preserve the API's documented chronological order or fetch/enrich the minimum metadata needed once and cache it.
- Never silently fall back to alphabetical ordering for a list that is supposed to be chronological.
- If a date is unavailable, place that set in an explicit `Unknown date` section after dated sets rather than mixing it alphabetically.
- Prefer grouping options by year / era if it improves usability, but do not make selection cumbersome.

# P1 — Clefairy Match as a real game scene
Do this after pack opening is stable.

## Scene architecture
- Keep the moonlit background static. Do NOT zoom or warp the whole scene during idle.
- Clefairy must be a separate transparent character layer.
- Reflection must be derived from the same current character pose/motion, mirrored vertically, compressed, blurred/masked and clipped to the water area.
- Use the local Clefairy pose assets already supplied. Do not replace them with full-scene screenshots.
- Preload every pose before the minigame becomes interactive.
- If a pose fails to load, gracefully fall back to idle rather than showing a blank stage.

## State animation
Use a small state machine: `idle`, `star`, `song`, `moon`, `spin`, `transition`.

### Idle
- No side-to-side movement.
- No camera zoom/breathing.
- At most a tiny 1–2 px vertical breathing motion every ~2.5–3 s, plus a subtle blink if feasible without mangling the face.
- Reflection mirrors the exact idle motion.

### Star
- Crossfade to star pose in ~80–120 ms.
- Clefairy performs a small upward hop / delighted reaction.
- A shooting star crosses the sky with a luminous trail.
- Reflection follows the hop with lower opacity/vertical compression.
- Return cleanly to idle.

### Song
- Crossfade to song pose.
- Animate a gentle body bounce / squash-and-stretch, not a full-scene scale.
- Spawn musical notes from the character and drift them upward.
- Keep the face stable; do not create eye deformation.
- Reflection follows the body motion.

### Moon
- Crossfade to moon pose.
- Brief moon bloom and scene-light increase.
- Clefairy can lift slightly / hold the pose.
- Do not zoom the entire background.
- Return to idle smoothly.

### Spin
- Use the supplied spin/clean pose if helpful, but the movement itself must be a smooth transform, not frame swapping.
- Rotate Clefairy a true 360° around its visual centre in about 650–850 ms with eased acceleration/deceleration.
- Optional small vertical hop during the spin is okay.
- Reflection rotates in sync while remaining mirrored and water-compressed.
- Add a short gold spiral/ribbon around Clefairy similar to the reference, using Canvas/SVG rather than a static glow.
- End exactly on an upright idle pose with no snapping.

## Sequence playback
- The cue sequence should visibly play inside the scene.
- Buttons may light at the same time, but the scene is the primary feedback.
- Do not show a series of screenshot frames pretending to be animation.
- Slow timing enough that the user can perceive each action.

# Code quality requirements
The current source contains history from several iterations. Do not continue the pattern of adding yet another override at the end of the file.
- Locate the active implementations.
- Consolidate/refactor the pack and Clefairy animation code into clear modules/classes/functions inside the active JS/CSS.
- Remove obsolete conflicting code for these two features after confirming it is unused.
- Keep unrelated gameplay untouched unless a change is needed to prevent regression.

# Debug / test hooks
Add lightweight developer hooks available from the WebView console, for example:
- `window.LuckyDexDebug.playPackTier(tier)` where tier can force common / holo / high / crown visuals with a local/mock card.
- `window.LuckyDexDebug.playClefairyAction('star'|'song'|'moon'|'spin')`.
These are for repeatable visual testing and should not alter the normal UI/economy.

# Acceptance criteria
Do not call the task complete until all of these are true:
- A card visibly flies in from depth, rotates continuously, flips in 3D and settles.
- A top rarity visibly gets a moving gold spiral that orbits around/behind/in front of the card.
- The effect is continuous animation, not a series of still screenshots.
- Chronological set order is demonstrably correct from release metadata/order.
- The pack flow still works offline for cached content.
- Clefairy idle has no scene warping.
- Star/Song/Moon/Spin are distinct, smooth scene actions.
- Spin is a real continuous 360° character rotation with synced reflection.
- No blank Clefairy stage in Android WebView.
- Existing save data and collection state survive unchanged.
- JS syntax checks pass and the Android debug APK builds successfully.

Once implemented, bump the app visible version to **v0.14**, document what changed in `CODEX_RESULT.md`, and leave a clean buildable tree. Do not merely provide a plan—make the changes and test them.
