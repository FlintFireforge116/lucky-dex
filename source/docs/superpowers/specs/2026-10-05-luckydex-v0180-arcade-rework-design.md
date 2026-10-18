# LuckyDex v0.18.0 Arcade Rework — Design Specification

**Date:** 2026-10-05
**Baseline:** LuckyDex v0.17.0
**Scope:** Arcade navigation/presentation foundation plus targeted game rebuilds. No new large game families in this release.

## 1. Purpose

v0.17.0 proved that the Arcade can support themed locations, shared rewards and multiple game types, but the presentation still reads as a prototype: the location selector is a vertical card list, venue contents expand below the selector, several games devote too much screen space to chrome rather than play, and end/reward states are inconsistent or unclear.

v0.18.0 rebuilds that presentation foundation before more minigames are added. The goal is for the Arcade to feel like a connected Pokémon world of recognisable venues, with each game opening into a focused, animated, self-explanatory play experience.

## 2. Product Principles

1. **The game is the main focus.** During play, most of the usable phone screen belongs to the game scene/board rather than instructions, stat cards or empty chrome.
2. **Locations feel like places.** The Arcade home is a continuous world route with landmark art, not a list of UI cards.
3. **Navigation changes pages.** Selecting a location opens a dedicated venue page. Selecting a game opens a dedicated game view. Nothing important merely expands underneath the current content.
4. **Every run explains itself.** Before/during play the user can see what ends the run and what rewards are possible. At the end, a clear results state always appears.
5. **Unlimited play, controlled economy.** No energy, tickets, entry fees, ads or real-money gates. Rewards are deliberately modest so minigames are enjoyable rather than the dominant farming method.
6. **Touch-first.** Every primary action must work cleanly on a phone without hover. Where a game uses swipes/dragging, tapping remains a sensible fallback when practical.
7. **Do not rescue weak concepts just because code exists.** Ditto Transform is removed from the visible Arcade in this release; its stored save values remain compatible but it is not presented as a game.

## 3. Continuous Arcade World

### 3.1 World selector

Replace the v0.17 vertical `.arcade-zone-card` stack with one horizontally swipeable/scroll-snap world route.

The selector should resemble a game world/level selector rather than a carousel of ordinary cards:

- a continuous illustrated landscape/path behind the venues;
- one large landmark in focus near the centre;
- previous/next landmarks partially visible to imply horizontal travel;
- swipe/drag and left/right buttons both move between stops;
- scroll snaps cleanly to a stop;
- the selected venue name and short description appear near the landmark;
- a clear **ENTER** action opens the venue;
- daily reward availability can appear as a small badge on the venue, never as a paragraph of UI copy;
- the route remembers the last selected venue when returning from a game.

No emoji are used as venue artwork. Each venue uses a local PNG/WebP landmark illustration or sprite-style asset. Art should evoke the actual Pokémon location when a canonical location exists (for example a Game Corner building, contest hall, museum, ruins, etc.). The navigation engine must not depend on a specific image size so better art can be swapped in later.

### 3.2 Initial v0.18 venues

The world engine is data-driven. v0.18 exposes these stops:

| Venue | Games in v0.18 | Landmark direction |
| --- | --- | --- |
| **Kalos Amie Garden** | Berry Picker, Head It, Tile Puzzle | bright Kalos garden / Amie play area |
| **Goldenrod Game Corner** | Voltorb Flip | recognisable Game Corner exterior/interior motif |
| **Celadon Prize Machine** | Poké Ball Drop | prize-counter / machine landmark |
| **Lilycove Contest Hall** | Berry Blender | contest hall landmark |
| **Moon Stage** | Clefairy Match | moonlit stage / Mt. Moon-inspired landmark |
| **Oreburgh Mining Museum** | Fossil Excavation | museum/mining landmark |
| **Ruins of Alph** | Unown Decoder | ruin glyph/stone landmark |
| **Indigo League Quiz Studio** | Who's That Pokémon? | Indigo/TV studio landmark |

This replaces the generic **Discovery District** and **Performance Stage** groupings. A venue may currently contain only one game; the system must allow more games to be added later without restructuring navigation.

### 3.3 Venue pages

Selecting a world landmark opens a dedicated venue view that replaces the world selector on screen.

Venue page requirements:

- prominent landmark/banner art and venue name;
- concise flavour line only;
- large game tiles/buttons for that venue;
- each game tile shows game name, one-line objective, reward summary, and run-ending condition;
- a consistent `‹ WORLD` control returns to the same selected landmark;
- if the venue has one game, it still uses the venue page so future games can be added consistently;
- no venue content appears below the world route.

### 3.4 Game navigation

Selecting a game opens its dedicated full game view. Game exit returns to the owning venue, not to the bottom of the Arcade home and not to an arbitrary default venue. Android/back-button handling follows the hierarchy:

`Game -> Venue -> World -> main app navigation`

## 4. Shared Game Session UX

### 4.1 Compact session strip

Every visible Arcade game gets a small shared session strip near the top of the game view. It must be compact enough that it does not steal the playfield.

It communicates, as appropriate:

- **RUN:** progress/end condition (e.g. `7 / 10 orders`, `Ball 2 / 3`, `2 misses left`, `Endless — cash out`);
- **REWARD:** expected reward model (e.g. `Up to 60 coins`, `Jackpot 1000`, `Daily Berry available`);
- live score/bank only where meaningful.

The strip describes rules, not animation narration.

### 4.2 Standard result state

Every finite game must end with an unmistakable result overlay/sheet. It shows:

- **GAME COMPLETE** / suitable thematic equivalent;
- score or performance metric;
- exact Lucky Coins earned;
- exact daily item earned, if any;
- personal best/new-best status when relevant;
- **PLAY AGAIN** and **BACK TO [VENUE]** actions.

The user must never need to infer that a game has finished from controls silently stopping.

For endless/bank games, the result state appears when the run fails or the user cashes out.

## 5. Berry Picker — Presentation Rework

The v0.17 mechanics are retained because they work; presentation and scene behaviour are rebuilt.

### 5.1 Scene composition

- the playfield occupies the majority of the screen;
- berry trees/branches visibly hold the selectable berries rather than presenting berries as detached UI controls;
- 2–4 caught Pokémon customers appear in the garden depending on difficulty;
- each customer displays a large thought bubble containing the berry it wants;
- patience is shown around/in the thought bubble or as a small local indicator, not a separate distant stat card;
- Pokémon react visibly: happy bounce/sparkle on correct berry, disappointed/angry reaction on timeout/wrong berry;
- berry trees react when a berry is picked and replenish visually;
- background is a bright Amie garden rather than an empty panel.

### 5.2 Interaction

Retain both:

- drag berry -> requesting Pokémon;
- tap berry then tap Pokémon fallback.

Touch targets must be large enough for one-handed phone play.

### 5.3 Run structure/results

Existing scoring/difficulty/reward rules remain unless tests show an economy issue. The compact session strip makes the number of requests/remaining time and reward clear. Finishing the run always opens the shared result state.

## 6. Head It — Full Gameplay Rebuild

v0.17 Head It is not retained as a visual/gameplay implementation; only its save compatibility, difficulty names and reward integration may be reused.

### 6.1 Playfield

- three caught Pokémon stand along the bottom of an Amie-style scene;
- Pokémon have subtle idle motion so the scene never looks static;
- yarn balls spawn above the lane and fall smoothly using `requestAnimationFrame` or equivalently continuous frame-based positioning, not coarse timer jumps;
- yarn rotates while falling;
- shadows/contact cues make the timing point readable;
- tapping a Pokémon performs a visible head-bump animation;
- a successful hit launches/deflects the yarn upward briefly with squash, stars/particles and score feedback;
- Perfect/Good/Miss feedback appears at the impact location and disappears quickly;
- combo feedback is energetic but never covers the playfield;
- occasional large bonus yarn is clearly different and has more dramatic hit feedback.

### 6.2 Timing

Difficulty retains Easy / Normal / Hard / Unlimited but the speed curve must feel active from the first few balls and become meaningfully faster. The game should not spend long periods waiting for a ball to descend.

Touching the wrong Pokémon or badly mistiming the hit counts according to the mode rules. Unlimited keeps a clear remaining-misses indicator and ends immediately when the final miss is consumed.

### 6.3 Results

All finite modes end after their defined ball count. Unlimited ends on its miss limit. Every ending triggers the shared results state with exact coins/item reward and best score.

## 7. Tile Puzzle — Full Rebuild

The v0.17 DOM/layout implementation is replaced. Save/best values can migrate, but the visual board is rebuilt from first principles.

### 7.1 Screen layout

The puzzle board is the dominant element: approximately square, centred, and as wide as the phone allows without horizontal page scrolling.

Above it: only the compact session strip and difficulty control.
Below it: minimal `RESHUFFLE` / `NEW PUZZLE` controls as appropriate.

Remove the large 2×2 stat-card cluster, oversized target card, instructional paragraphs and dead black space from the active puzzle view.

A small target preview may sit in a corner/above the board but must not compete with the board.

### 7.2 Image construction

Use a higher-resolution Pokémon image when available (official-artwork-style image preferred; sprite fallback permitted). Each visible tile is one exact crop of the same source image.

Implementation requirements:

- CSS grid or canvas geometry must use mathematically identical square cells;
- image crop/background-position is derived from the tile's solved row/column;
- no stretched fragments;
- the empty slot is visually obvious;
- the completed board reconstructs one coherent image with no large gaps/bars.

### 7.3 Controls

Support both:

- tap an adjacent tile to slide into the empty slot;
- swipe an adjacent tile toward the empty slot.

A swipe must be recognised from pointer/touch delta and resolved only when the gesture direction actually points into the neighbouring empty cell. Non-adjacent/invalid gestures do nothing rather than corrupting the board.

The existing solvability guarantee remains mandatory for 3×3, 4×4 and 5×5 modes.

### 7.4 Completion

On solve:

1. briefly fill/reveal the final image so the user sees the completed picture;
2. trigger the shared result state with time, moves, coins/item and best status;
3. allow play again or return to Kalos Amie Garden.

## 8. Poké Ball Drop — Round/Reward Cleanup

The v0.17 physics and reduced ordinary payouts remain.

Changes:

- remove **NEW ROUND** / **NEXT ROUND** controls entirely;
- one run is exactly three balls;
- after each landing, show a clear short-lived landing result (`400 points · +24 coins`, `JACKPOT · +1000 coins`, etc.);
- balls 1 and 2 automatically ready the next ball after the landing result;
- after ball 3, do not silently reset;
- immediately show the shared result state with total score and exact total coins earned;
- **PLAY AGAIN** starts a fresh three-ball run;
- jackpot remains 1000 coins and is called out separately from ordinary conversion;
- the session strip always shows `Ball N / 3` and reward summary.

There is no concept of a second round inside one run.

## 9. Ditto Transform Removal

The v0.17 Ditto Transform game is removed from visible Arcade navigation and from active game entry points in v0.18.

Requirements:

- preserve old save fields such as best score/bank data so upgrading does not damage a save;
- old hidden DOM/hooks may be removed if no other script depends on them, otherwise leave a non-visible compatibility shim;
- no `DITTO TRANSFORM` game tile appears in the world/venue UI;
- no replacement game is added in v0.18 merely to fill the space;
- a future game such as Pokémon Seek, a Dream World activity or another Stadium minigame can use the vacated slot/location later.

## 10. Existing Games — Minimum v0.18 Integration

Voltorb Flip, Berry Blender, Clefairy Match, Fossil Excavation, Unown Decoder and Who's That Pokémon do not receive major mechanical rewrites in v0.18.

They must nevertheless adopt:

- venue/world navigation hierarchy;
- compact run/reward/end-condition information;
- unmistakable end/result state with exact reward;
- proper return to owning venue.

Any existing custom result overlay can remain if it satisfies the shared information requirements; do not rewrite stable game logic solely for visual uniformity.

## 11. Reward/Economy Rules

- No Arcade entry cost.
- No energy/ticket timer.
- No real-money or ad mechanic.
- v0.17 shared daily reward state remains additive and compatible.
- Ordinary repeat-play coin rewards remain modest.
- Poké Ball Drop ordinary conversion stays at the reduced v0.17 rate; the 1000 jackpot is unchanged.
- Result screens must show the **actual awarded value**, not merely a theoretical maximum.
- Daily item availability is optional metadata on world/venue/game UI; it must never block repeat play after being claimed.

## 12. Technical Structure

Prefer focused v0.18 modules rather than growing the legacy files indefinitely.

Expected responsibilities:

- `arcade-world-v0180.js/css` — world route, venue definitions, navigation hierarchy, landmark rendering/scroll state;
- `arcade-session-v0180.js/css` — compact session strip and standard result helpers;
- `arcade-amie-v0180.js/css` — Berry Picker presentation, rebuilt Head It and rebuilt Tile Puzzle;
- `arcade-expansion-v0180.js/css` only if a small compatibility override is cleaner than modifying v0.16.6 directly;
- `index.html` — minimal shells/containers and ordered script/style includes;
- v0.17 platform/save reward code remains the source of truth unless a narrowly defined helper must be added.

Do not duplicate coin awarding or daily-claim logic in individual games. Games report results to the shared platform/session layer.

## 13. Accessibility / Phone Behaviour

- minimum practical touch target ~44 CSS px;
- no essential hover-only interaction;
- no page-level horizontal overflow; the world route owns its own horizontal scroller;
- horizontal world swipe must not trap vertical page scrolling unnecessarily;
- Tile Puzzle gesture handling uses Pointer Events where possible and does not disable normal page scrolling outside the board;
- game boards fit within typical Android portrait widths without needing zoom;
- `prefers-reduced-motion` reduces decorative motion but does not remove gameplay-critical movement/timing cues.

## 14. Save / Upgrade Compatibility

v0.18.0 is an in-place update over the stable-signed v0.17.0 build.

- application/package ID unchanged;
- stable signing key unchanged;
- versionCode strictly increases;
- no destructive save reset;
- existing card collection, opened sets, coins, inventory, expedition state, Arcade best scores and daily reward state survive;
- Ditto-specific state may remain unused rather than deleted.

## 15. Acceptance Criteria

The release is acceptable when all of the following are true:

1. Opening Arcade shows a horizontally navigable continuous world with illustrated landmark stops; no stacked v0.17 zone cards remain visible.
2. Entering a venue replaces the world view; games are not appended below the world selector.
3. Leaving a game returns to its venue; leaving the venue returns to the same world landmark.
4. No visible Arcade landmark uses an emoji as its main art.
5. Berry Picker gameplay remains mechanically functional but the garden scene, berry trees, thought bubbles and Pokémon reactions make the playfield the visual focus.
6. Head It has continuous visible yarn motion, Pokémon hit reactions, impact feedback, meaningful speed escalation and clear run completion.
7. Tile Puzzle displays one coherent square image puzzle, supports adjacent tap and swipe movement, remains solvable in all grid sizes, and completes visibly.
8. Poké Ball Drop has no `NEW ROUND`/`NEXT ROUND`; a three-ball run ends automatically with score and exact winnings.
9. Ditto Transform is not visible or launchable from Arcade navigation.
10. Every visible game states its run-ending condition/reward and produces an unmistakable result state showing exact awarded reward.
11. Existing saves migrate without loss and the signing certificate remains unchanged.
12. Full static/regression suite, JS syntax checks, duplicate-ID checks and ZIP integrity checks pass before source packaging; GitHub Actions remains the authoritative APK compile check.

## 16. Explicitly Deferred

Do **not** expand v0.18 scope with additional new games while this foundation is being rebuilt. Deferred candidates include:

- Pokémon Dash;
- Gen III Slots and Roulette;
- Pikachu's Beach;
- Pokémon Jump;
- Stadium 1/2 minigame collections;
- Dream World games;
- Pokémon Seek / replacement for Ditto Transform;
- expedition temporary boosts beyond the already-supported item rewards.

These become safer to add once the world/venue/session framework is proven on-device.
