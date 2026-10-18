# LuckyDex Arcade Zones — Design Spec

**Date:** 2026-10-04
**Baseline:** LuckyDex v0.16.13
**Scope:** Arcade navigation restructure, first Pokémon-Amie game pack, central reward policy, Poké Ball Drop economy rebalance
**Out of scope:** Battle overhaul, expedition combat changes, temporary battle buffs, Pokémon Dash, Stadium/Dream World/Game Corner expansion beyond existing games

## 1. Goal

Turn LuckyDex Arcade from a flat list of unrelated minigames into a Pokémon-themed destination hub made of recognisable zones/locations. Each zone groups related games, has its own visual identity, and can grow later without making the main Arcade page unwieldy.

The first implementation wave must also add three Pokémon-Amie-inspired games — **Berry Picker, Head It, and Tile Puzzle** — while reducing Arcade coin inflation and allowing selected games to reward useful inventory items without introducing pay-to-win or play-gating mechanics.

## 2. Product principles

1. **Unlimited play.** No Lucky Coin entry fee, energy bar, stamina ticket, cooldown, or real-money gate is required to play a minigame.
2. **Score first, economy second.** High scores remain exciting even when repeat coin payouts are intentionally modest.
3. **Useful but bounded cross-mode rewards.** Arcade can award existing inventory items such as Berries, Potions, Poké Balls, Great Balls, and occasionally Ultra Balls; it must not become the dominant way to progress Expeditions.
4. **No battle-system coupling in this wave.** Do not create temporary combat buffs or new battle consumables before the planned battle/expedition overhaul.
5. **Pokémon identity matters.** Where practical, games should use Pokémon the player has actually caught rather than fixed anonymous participants.
6. **Faithful inspiration, phone-native controls.** Preserve the recognisable rules and feel of classic Pokémon minigames while adapting controls and layout for one-handed/touch play.
7. **Extensible zones.** New Game Corner, Stadium, Dream World, beach, racing, and classic-game content should slot into the hub without redesigning the top-level Arcade again.

## 3. Arcade hub architecture

### 3.1 Top-level Arcade map

Replace the current flat `arcadePicker` game grid with a location/zone browser.

Each zone is a large touch card with:
- thematic icon/mascot;
- zone name;
- short description;
- game count;
- optional daily-reward indicator when one remains available;
- visually distinct background treatment.

Selecting a zone opens a zone page inside the existing Arcade section. It does not navigate to a new Android Activity or WebView page.

### 3.2 Initial zones

#### Kalos Amie Garden
Games:
- Berry Picker — new
- Head It — new
- Tile Puzzle — new

Theme: bright garden / Pokémon-Amie play area. This is the headline zone for the first release.

#### Game Corner
Games:
- Voltorb Flip — existing
- Poké Ball Drop — existing

Future additions:
- Gen III Slot Machine
- Gen III Roulette

#### Discovery District
Games:
- Fossil Excavation — existing
- Ditto Shuffle — existing
- Unown Decoder — existing
- Who's That Pokémon? — existing

#### Performance Stage
Games:
- Berry Blender — existing
- Clefairy Match/Memory — existing

### 3.3 Future zones reserved by the model

No UI buttons are required yet, but zone IDs and navigation should not preclude:
- Pokémon Stadium / Kids Club
- Dream World
- Beach / Pikachu's Beach
- Race Course / Pokémon Dash
- Classic Games / Pokémon Jump

### 3.4 Navigation rules

- Main bottom-nav **Arcade** opens the Arcade map.
- Zone pages use a clear `‹ ARCADE MAP` control.
- Individual games use a clear `‹ <ZONE NAME>` control where practical; if the current full-screen game shell is retained initially, `‹ ARCADE` may return to the owning zone rather than the global map.
- Leaving a game with an unbanked risk/reward run retains existing confirmation behaviour where appropriate.
- Back navigation must not lose persistent scores/rewards already committed.

## 4. Central Arcade reward policy

### 4.1 Why change it

Current games award coins independently, creating inconsistent payouts and allowing low-risk games such as Poké Ball Drop to generate too much currency.

### 4.2 Reward model

Introduce a central Arcade reward layer used by new games and progressively adopted by existing games.

Each completed run can produce:
- **score** — always recorded independently of economic reward;
- **repeat Lucky Coins** — deliberately modest;
- **daily item bonus** — at most once per game per local calendar day, when the run meets that game's qualifying threshold.

No entry fee is charged.

### 4.3 Daily item bonuses

Use existing inventory only:
- Berry Picker → Berries primarily;
- Head It → Potions / occasional ball item;
- Tile Puzzle → Poké Balls / Great Balls based on difficulty;
- other zones can receive thematic mappings later.

Rules:
- one item-bonus claim per game per local calendar day;
- subsequent runs remain fully playable and can still improve high scores;
- bonus must be modest enough that Expeditions remain a meaningful source of supplies;
- Ultra Balls are rare and rank/difficulty gated;
- no Pack Tickets from repeat Arcade play in this wave.

Persist claim state in `state.arcade.dailyRewards` keyed by game ID and local date string.

### 4.4 Coin payout guidance

Central helpers should separate **display score** from **Lucky Coin payout**.

Target repeat-run values:
- ordinary short game: roughly 20–80 coins for a decent run;
- strong/hard-mode run: roughly 60–150 coins;
- exceptional event may exceed this where intentionally rare.

Poké Ball Drop:
- keep displayed slot scores `150 / 250 / 400 / 1000 / 400 / 250 / 150`;
- do **not** convert ordinary score 1:1 or near-1:1 into coins;
- normal non-jackpot three-ball rounds should usually pay tens of coins, not hundreds;
- the centre **Jackpot remains a special 1000 Lucky Coin event** when actually landed, rather than simply being a 1000-point score multiplied by the normal conversion;
- jackpot frequency must not be increased to compensate for reduced normal payouts.

Existing games do not all need complete rebalancing in the first commit, but new central helpers and Poké Ball Drop must use the new policy immediately.

## 5. Kalos Amie Garden games

## 5.1 Berry Picker

### Core loop
- 2–4 caught Pokémon appear as customers depending on difficulty.
- Each Pokémon visibly requests a berry using an icon/bubble.
- A berry tray supplies multiple berry choices.
- Player drags the correct berry to the requesting Pokémon.
- Correct delivery increases score/combo and refreshes that Pokémon's request.
- Wrong delivery or an expired patience meter breaks combo / costs time.

### Controls
Primary control is drag-and-drop via Pointer Events.
Provide tap-accessible fallback: tap berry, then tap Pokémon.

### Modes
- Easy: fewer Pokémon/berry types, slower patience drain.
- Normal: wider berry pool, faster requests.
- Hard: more simultaneous customers, shorter patience, occasional similar-looking berries.

### Collection integration
Prefer Pokémon from `state.pokemon` / caught collection. If fewer suitable caught Pokémon exist, fill remaining slots from a safe built-in fallback roster.

### Rewards
- Score based on deliveries, speed and combo.
- Modest coin conversion through central reward helper.
- Daily qualifying clear awards Berries.

## 5.2 Head It

### Core loop
- 2–4 player-owned Pokémon line the bottom of the playfield.
- Yarn balls fall toward lanes/positions.
- Player taps the appropriate Pokémon shortly before impact to head the yarn ball.
- Timing grades: Perfect / Good / Miss.
- Consecutive successful hits build combo.
- Fall speed and pattern complexity increase during the run.
- Large bonus yarn ball appears periodically and awards extra score if hit.

### Modes
- Easy
- Normal
- Hard
- Unlimited

Unlimited continues until a defined miss limit and records best streak/score.

### Controls
Tap Pokémon/lane. No continuous drag required.

### Rewards
- Score based on timing grade, combo and bonus balls.
- Modest repeat coins.
- Daily qualifying run awards a small useful inventory item, primarily Potion with occasional ball reward on harder modes.

## 5.3 Tile Puzzle

### Core loop
- Use a Pokémon image as the completed target.
- Split into a grid and shuffle tiles while preserving a solvable state.
- Player rearranges tiles until the image is restored.

### Interaction
Preferred implementation: sliding-tile puzzle with one empty slot, because it is clear on phone and guarantees a logical puzzle state.
Tap a tile adjacent to the empty slot to move it.

### Modes
- Easy: 3×3
- Normal: 4×4
- Hard: 5×5
- Unlimited/Challenge may be added later, but is not required in this wave.

### Image source
Use a Pokémon from the player's caught collection where possible. Use existing sprite/art sources already available in LuckyDex; do not add a new remote dependency solely for this game.

### Scoring
Time + move efficiency. Maintain best time per difficulty.

### Rewards
- Modest repeat coins.
- Daily qualifying completion awards Poké Balls; harder qualifying completions may award Great Balls.

## 6. State model

Extend `state.arcade` without breaking existing saves.

Required new fields, defaulting safely when absent:
- `dailyRewards: {}`
- `bestBerryPicker` by mode
- `bestHeadIt` by mode / Unlimited streak
- `bestTilePuzzle` by mode
- optional `lastArcadeZone` for returning users to their previous zone, if this does not complicate navigation

Existing v0.16.13 Arcade fields must remain valid.

Save migration must be additive only; no collection, card, Pokémon, Trade, pack, or expedition progress may be reset.

## 7. Implementation boundaries

### Existing files likely touched
- `app/src/main/assets/index.html` — zone markup and new game shells
- `app/src/main/assets/app-v*.js` — state defaults / shared reward helpers / navigation integration
- existing Arcade CSS — hub/zone styling
- new dedicated Amie CSS/JS module(s) preferred for the three games
- current quality-content module — Poké Ball Drop payout hook if that remains its owner
- Android version metadata for the release bump

### Separation
Do not place all three new games into the already-large core app script. A dedicated `arcade-amie-<version>.js` and matching CSS are preferred, with small shared navigation/reward hooks in core.

Zone metadata should be data-driven enough that adding a later Stadium or Dream World zone does not require rewriting navigation logic.

## 8. Testing and acceptance criteria

### Hub / zones
- Arcade opens zone map, not old flat grid.
- All existing games remain reachable through exactly one initial zone.
- Back navigation returns logically from game → zone → Arcade map.
- No page-level horizontal overflow at phone widths.

### Rewards
- Repeated play is never blocked by currency or cooldown.
- Each new game can issue at most one item bonus per local calendar day.
- Replaying after claiming daily reward remains possible.
- Poké Ball Drop ordinary payouts are materially lower than v0.16.13.
- Actual centre jackpot still awards the intended 1000-coin jackpot event.

### Berry Picker
- Requests, patience, correct/wrong delivery, combo and all three difficulties function.
- Drag and tap fallback both work.
- Uses caught Pokémon when available.

### Head It
- Yarn target lane, tap timing, Perfect/Good/Miss, combo, speed escalation and bonus ball function.
- Easy/Normal/Hard/Unlimited all start and end correctly.

### Tile Puzzle
- Every generated puzzle is solvable.
- 3×3 / 4×4 / 5×5 modes work.
- Completion detection is exact.
- Best times persist.

### Regression
- Existing game state/high scores remain readable.
- Collection, packs, trades and Adventure behaviour are unchanged.
- Stable APK signing remains unchanged so upgrades continue installing over v0.16.13+.

## 9. Deferred follow-up roadmap

After this wave is stable:
1. **Pokémon Dash** — caught-Pokémon race with Speed, tapping, stamina, AI and camera-follow track.
2. **Game Corner expansion** — Gen III Roulette + Slots.
3. **Stadium zone** — staged ports/adaptations of Stadium 1 and 2 Kids Club games.
4. **Dream World zone** — candidates such as Ice Cream Scoop, Wailord's Water Spout and Pokémon Seek.
5. **Classic/Beach games** — Pikachu's Beach and Pokémon Jump.
6. Revisit expedition-specific one-off boosts only after the battle/expedition overhaul defines the correct consumable model.

## 10. Non-goals for this release

- No paid currency or monetisation.
- No Arcade energy/stamina system.
- No game entry fees.
- No new battle effects.
- No Safari Zone reintroduction to Arcade.
- No Pokémon Dash implementation yet.
- No complete rebalance of every pre-existing minigame in one pass.
