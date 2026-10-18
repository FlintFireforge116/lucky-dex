# Arcade Instructions Design

## Goal
Add one consistent help experience to every current LuckyDex Arcade game/activity so a player learns the rules before their first play and can reopen the exact same instructions later from an always-available top-right info button.

## Scope
- Cover all 35 current game IDs registered in `arcade-world.js`.
- On the first launch of a game ID, show instructions before that game's `open()` method executes.
- Persist a per-game seen flag in `state.arcade.helpSeen` and save it when the first-time instructions are dismissed.
- After the game starts, show a top-right `ⓘ` button that reopens the same instruction content.
- Instruction content uses the same four sections for every game: Goal, Controls, Rules, Tip.
- Reopened help pauses/resumes games that already expose `pause()` / `resume()`; modal input blocks interaction for all games.
- First-time help never starts gameplay under the modal.
- Android/back/Escape closes the help safely. Leaving a game clears any pending help callback and hides the info button.
- Existing per-game help (for example Impact Trial) may remain; the new shared help is the canonical cross-game entry point.
- No achievements, rare-event odds, records, rewards or gameplay balance are changed.
- No Codex.

## Architecture
Create `arcade-help.js` and `arcade-help.css` as a shared module. The module owns the 35-game instruction manifest, modal rendering, persistent seen-state helpers and the global info button. `arcade-world.js` remains the lifecycle owner and decides when to defer a game's `open()`, when to show/clear the shared info button, and when to ask an owner to pause/resume around reopened help.

`arcade-platform.js` normalizes `helpSeen` so old saves migrate without special migration code. `index.html` loads the CSS and JS before `arcade-world.js`.

## UX
The first-time modal headline is the game name with a `FIRST PLAY` kicker and a primary `PLAY` button. Reopened help uses `HOW TO PLAY` and `BACK TO GAME`. The modal is phone-first, scrollable when needed, safe-area aware and high enough in z-index to appear over fullscreen game surfaces.

The info button is a compact circular `ⓘ` fixed to the top-right safe area. It is hidden outside an active started game and hidden while the help modal itself is open.

## Persistence
`state.arcade.helpSeen` is an object keyed by game ID with boolean `true` values. Unknown or malformed entries are normalized away. Dismissing a first-time help sheet marks that game seen and calls `save()` before gameplay starts.

## Verification
Automated tests must prove: all 35 current game IDs have complete help content; first-time help defers owner `open()`; seen games open immediately; seen state normalizes safely; the info button and modal assets load; reopened help invokes owner pause/resume when supported; cleanup does not accidentally start a pending game; version/release strings advance to v0.58.0.
