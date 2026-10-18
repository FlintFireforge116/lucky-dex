# LuckyDex v0.19.0 Arcade Fidelity Pass — Design Specification

**Date:** 2026-10-05  
**Baseline:** LuckyDex v0.18.0  
**Goal:** Make the Arcade feel like a collection of real Pokémon minigames and places rather than generic web-game panels.

## 1. Product Direction

v0.18 fixed navigation and result-state structure, but its world selector still reads as a strip of cards and several games only loosely resemble their source inspirations. v0.19 keeps the stable save/reward/navigation platform while rebuilding the presentation and, where needed, the mechanics of the minigames around their canonical counterparts.

The priority order is: **recognisable source-game composition -> satisfying motion/feedback -> phone usability -> economy compatibility**.

## 2. Shared Visual Rules

- The world selector is an illustrated continuous route, not a row of UI cards.
- During play, generic dark panels, long instructional paragraphs and dashboard-like stat clusters are removed or heavily reduced.
- Game-critical HUD is overlaid into the scene in compact forms.
- Controls resemble the original game where practical while retaining 44px+ touch targets.
- Pokémon sprites remain crisp and can use the existing sprite source/fallbacks; environments and props use local assets/CSS art.
- Decorative art must use layered lighting, texture, depth and environmental detail rather than flat geometric placeholder blocks.
- `prefers-reduced-motion` removes decorative motion but not timing-critical animation.

## 3. Continuous Arcade World

The Arcade home becomes a single horizontal world journey. Each venue occupies roughly one phone viewport width and sits in one continuous landscape strip with a visible path linking stops. The selected landmark is large and central; neighbouring stops peek in at the edges. Venue copy is a lightweight overlay, never a card that defines the stop's dimensions.

Eight stops remain: Kalos Amie Garden, Goldenrod Game Corner, Celadon Prize Machine, Lilycove Contest Hall, Stadium Classroom, Oreburgh Mining Museum, Ruins of Alph and Indigo Quiz Studio.

The world must restore the selected stop on return and preserve Game -> Venue -> World back navigation.

## 4. Berry Picker

Rebuild around Pokémon-Amie's real composition:

- one large berry tree dominates the upper half;
- berries visibly hang from branches;
- one to three Pokémon pop in/out along the lower edge;
- each Pokémon has a thought bubble containing its requested berry;
- drag from tree to the thought bubble is the primary interaction; tap berry -> Pokémon remains a fallback;
- waiting bubbles shake before timeout;
- correct fast deliveries show bright note/sparkle feedback, slower valid deliveries show subdued feedback;
- Easy/Normal/Hard use 60-second runs; Unlimited ends after three failed/wrong requests;
- berry variety scales 3 / 5 / 7 and returns to 5 for Unlimited.

Economy continues through `LuckyDexArcadePlatform.awardRun()`.

## 5. Head It

Rebuild to match Pokémon-Amie's rhythm:

- three caught Pokémon line the lower edge;
- yarn falls continuously under `requestAnimationFrame`;
- finite difficulties run for 60 seconds, not fixed ball counts;
- Easy emphasizes one active lane, Normal two, Hard all three; Unlimited uses all three and ends on the third miss;
- standard pink yarn, disruptive small/slow yarn, fast purple yarn and occasional bonus variants are visually distinct;
- hit quality uses early/good/sweet-spot timing around the contact marker;
- combo builds Fever at 15 consecutive hits and Fever doubles hit score;
- finite games end with one oversized bonus yarn opportunity before results;
- impact stars, squash/deflection, Pokémon head-bump and local grade text provide immediate feedback.

## 6. Tile Puzzle

Replace the sliding puzzle entirely. Pokémon-Amie's Tile Puzzle is a swap puzzle made from a moving picture.

- source scene contains three caught Pokémon with continuous subtle movement;
- Easy = 4 rows × 5 columns; Normal = 5×6; Hard = 6×8;
- every tile is present; there is no empty square;
- tap one tile then a second tile to swap them; optional swipe may swap with the adjacent tile in the swipe direction;
- the moving source scene continues animating through the shuffled tile arrangement;
- solved board reconstructs the coherent moving picture, then celebratory stars/confetti play before results;
- move count and elapsed time remain compact HUD values.

A canvas implementation is preferred so every tile can render an exact live crop of one animated source scene.

## 7. Voltorb Flip

Keep the established board generation/payout but make the interaction recognisably HGSS:

- green 5×5 board with row/column clue cards integrated beside/below the grid;
- unrevealed tiles use card backs, revealed tiles clearly show 1/2/3 or Voltorb;
- memo mode is first-class: a selected hidden tile can be marked with possible Voltorb/1/2/3 values without flipping;
- tap hidden tile in normal mode flips it; memo mode edits memo marks;
- level/bank/memo controls are arranged like a compact handheld-game side panel rather than generic app buttons;
- clear, bust and cash-out use shared exact-reward results.

## 8. Berry Blender

Retain the existing v0.16.4 retail-derived timing/speed model, but rebuild presentation around Ruby/Sapphire/Emerald:

- circular blender dominates the screen;
- four stations sit around it with the player at the bottom and NPC stations around the remaining sides;
- pointer continuously rotates around the blender;
- BEST/GOOD/MISS flashes at the station that acted;
- NPC hits are visibly animated instead of only updating counters;
- RPM is large and central enough to read without looking away from the spinner;
- speed-up/slow-down feedback is conveyed through motion, sound-compatible visual pulses and machine shake;
- controls are primarily tapping the machine/player station; the separate A button remains as an accessibility fallback.

## 9. Clefairy Says

Replace Moon Stage/Clefairy Match with a faithful Pokémon Stadium-inspired classroom memory game:

- teacher Clefairy with glasses at a chalkboard;
- four arrow directions form each lesson sequence;
- player Clefairy and three CPU pupils sit at desks facing the board;
- teacher demonstrates the sequence, then the player repeats it using four large direction controls;
- wrong input or timeout triggers a toy-hammer bonk reaction and costs one of five health pips;
- rounds become longer/faster; game ends after five rounds or when player health reaches zero;
- result ranks performance by rounds survived / mistakes and awards through the shared platform;
- the old moon-stage animation files remain unused compatibility assets and are no longer loaded for Arcade play.

## 10. Fossil Excavation

Rebuild to evoke Diamond/Pearl Underground mining:

- irregular rock wall rather than a visible square-cell board;
- one to four buried silhouettes/items can exist under layered hardness;
- pickaxe/chisel = small precise footprint; hammer = larger high-damage footprint;
- every strike contributes to a visible wall-stability crack meter; the wall collapses when stability is exhausted;
- metal/stone obstruction patches resist excavation and force route choices;
- exposed fossil/item art appears progressively as covering layers are removed;
- success occurs when all treasure silhouettes are fully revealed before collapse.

## 11. Custom Games

### Poké Ball Drop
Keep the v0.18 three-ball lifecycle, but make the machine feel physical: cabinet frame, lit pegs/pockets, ball trail, impact flashes, mechanical launcher and a stronger jackpot light sequence.

### Unown Decoder
Keep mechanics, but present the game as a Ruins of Alph stone chamber: carved slab, torch/light ambience, large Unown glyphs and stone answer tablets. Remove generic dark-app chrome from the playfield.

### Who's That Pokémon?
Keep quiz logic, but stage it like an anime interstitial: full-stage radial/gradient background, dominant silhouette, oversized question treatment, quick dramatic reveal wipe, then answer state. The silhouette/reveal area must be the visual focus.

## 12. Navigation / Economy / Saves

- v0.18 `LuckyDexArcadeSession` remains the result contract.
- `LuckyDexArcadePlatform.awardRun()` remains the source of reward truth.
- existing collections, coins, inventory, bests, daily rewards and venue memory survive upgrade.
- package ID and signing key remain unchanged.
- Ditto Transform and Safari remain hidden from visible Arcade navigation.
- no energy, entry fee, ads or real-money mechanics.

## 13. Release / Acceptance

Release as `versionName '0.19.0'`, `versionCode 200`, build marker `0.19.0-arcade-fidelity`.

Acceptance requires:

1. World stops each occupy a substantial viewport width and form one continuous route; no bunched strip/card presentation.
2. Venue landmark art is locally packaged and visibly richer than v0.18 placeholder art.
3. Berry Picker uses one large tree over Pokémon requesters and 60s/three-miss source-game run structure.
4. Head It is time-driven with combo/Fever, variant yarn and final bonus yarn.
5. Tile Puzzle is a moving-picture swap puzzle at 4×5 / 5×6 / 6×8; no empty slot remains.
6. Voltorb Flip exposes usable Memo mode and HGSS-like board/clue composition.
7. Berry Blender visually behaves as one continuous four-station spinner.
8. Clefairy is a classroom arrow-memory game with teacher/hammer/five-hit structure.
9. Fossil Dig uses layered excavation and wall stability/collapse rather than a flat tool-counter grid.
10. Ball Drop, Unown and Quiz receive scene-level visual upgrades without regressing their v0.18 reward lifecycle.
11. Exact rewards still use the shared result layer and are awarded once.
12. Full regression/static/syntax/ZIP checks pass; Android compile remains verified by GitHub Actions when local SDK/wrapper is unavailable.
