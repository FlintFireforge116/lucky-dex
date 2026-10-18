# LuckyDex Fossil Dig + Oreburgh Mining Museum Design

**Date:** 2026-10-06  
**Status:** Design approved in chat; awaiting written-spec review  
**Scope:** Replace the current Fossil Dig minigame and add a persistent Oreburgh Mining Museum collection room. Achievements are explicitly deferred, but the data model must support them later.

## 1. Product intent

Fossil Dig should stop feeling like a one-tap grid and become a compact version of the Sinnoh Underground excavation loop: search a layered rock wall, use a wide hammer and precise pickaxe, expose multi-tile Pokémon-world objects, and decide how aggressively to dig before the wall collapses.

The Oreburgh Mining Museum becomes the long-term reason to keep digging. It is a single top-down room based on the authentic Gen IV Oreburgh Mining Museum interior, with no player avatar and no movement controls. Its existing cases and pedestals begin visually empty. Archaeological exhibits physically appear in the room only after the player discovers them.

Success means:
- digging itself is tactile and strategic rather than a fixed tap counter;
- a dig can contain several recognisable Pokémon-world finds, not only fossils;
- first archaeological discoveries permanently fill the museum;
- duplicate archaeological discoveries remain economically useful;
- treasure, Adventure items, coins, and rare TCG cards have appropriate destinations;
- the museum visibly changes from sparse to full as the save progresses;
- current saves and the permanent Android update identity remain compatible.

## 2. Player flow

The existing **Oreburgh Mining Museum** Arcade venue becomes the entry point for two activities:

1. **Fossil Dig** — start a new excavation wall.
2. **Museum Collection** — view the persistent museum room.

Returning from either activity returns to the Oreburgh venue rather than the global Arcade root.

No walking avatar is used anywhere in the museum. The collection room is a tap-first inspection scene.

## 3. Fossil Dig gameplay

### 3.1 Board

- Target board: **12 columns × 9 rows** (108 cells), responsive to phone width.
- Each cell stores a rock depth rather than a binary covered/revealed state.
- Normal cells begin with approximately 2–4 rock layers, with controlled variation so the wall has visual texture without producing unwinnable objects.
- Buried objects occupy multi-cell masks and never overlap.
- A generated wall should normally contain **3–6 buried objects**, weighted by size and rarity.
- Generation must retry/fallback safely if a requested shape cannot be placed.

### 3.2 Tools

Two persistent tool buttons mirror the Underground feel:

**Pickaxe**
- precise single-cell strike;
- removes substantially more depth from the targeted cell;
- low wall-stability cost;
- intended for tracing and finishing exposed objects.

**Hammer**
- broad 3×3 strike around the target;
- removes a smaller amount of depth from several cells at once, with a stronger centre hit;
- significantly higher wall-stability cost;
- intended for quickly locating buried shapes.

Exact tuning belongs in implementation tests/playtesting rather than being hard-coded by this spec, but the intended relationship is approximately **2–3× more stability damage per hammer strike than pickaxe strike**.

### 3.3 Wall stability and collapse

- Replace `DIGS LEFT` entirely with **WALL STABILITY**.
- The wall begins at 100% stability.
- Every strike reduces stability according to the tool.
- At 0%, the wall collapses immediately and the run ends.
- Fully excavated finds remain awarded.
- Partially exposed finds are lost, including partially exposed TCG cards.
- A run may also finish voluntarily once all generated objects have been recovered; no unnecessary strikes are required.

### 3.4 Layered reveal

Rock removal must be visibly progressive:
- deep layer: opaque rock;
- middle layer: cracked/thinner rock;
- shallow layer: partial hints of the object can show through;
- zero depth over an object cell: that portion of the object is fully visible;
- zero depth over empty ground: excavated substrate.

The object should visually exist underneath the rock as one coherent sprite/mask rather than each cell looking like an independent reward tile.

A buried object counts as recovered only when **every cell in its excavation mask is fully uncovered**.

### 3.5 Feedback

- Pickaxe: small impact animation/dust and light haptic.
- Hammer: larger dust/crack effect, stronger haptic, brief local shake/impact response.
- Full object recovery: distinct sparkle/flash and a concise find banner.
- Wall collapse: strong crack/collapse response, then results.
- Respect reduced-motion preferences and keep all gameplay usable without animation.

## 4. Buried item catalogue

The item catalogue is data-driven. Every entry defines at minimum:

- stable `id`;
- display name;
- category;
- rarity/weight;
- sprite path;
- multi-cell shape/mask;
- museum eligibility;
- duplicate/treasure coin value where relevant;
- flavour text if it can become a museum exhibit;
- reward destination.

### 4.1 Museum archaeological exhibits

Initial museum-capable catalogue should include:

**Fossils**
- Helix Fossil
- Dome Fossil
- Old Amber
- Root Fossil
- Claw Fossil
- Skull Fossil
- Armor Fossil
- Cover Fossil
- Plume Fossil
- Jaw Fossil
- Sail Fossil
- Fossilized Bird
- Fossilized Dino
- Fossilized Drake
- Fossilized Fish

**Signature archaeological object**
- Odd Keystone (Spiritomb)

**Relic collection**
- Relic Copper
- Relic Silver
- Relic Gold
- Relic Vase
- Relic Band
- Relic Statue
- Relic Crown

**Geological/curio displays**
- a curated subset of stones/minerals such as Hard Stone, Everstone and evolution stones where suitable assets exist.

This is an initial catalogue, not a permanent ceiling. Additional Pokémon-world archaeological objects can be added later without save-schema changes.

### 4.2 Non-museum dig finds

These make excavation varied but do not occupy museum cases:

- Poké Ball / Great Ball / Ultra Ball and selected interesting Ball variants;
- Adventure consumables/items where an existing inventory destination exists;
- direct Lucky Coin caches;
- sellable treasures such as Nuggets, Big Nuggets, Pearls, Big Pearls, Stardust, Star Pieces, Rare Bones and Comet Shards;
- rare TCG card finds.

### 4.3 TCG cards

- A buried TCG card is deliberately uncommon and should feel like a jackpot discovery.
- The card is represented as a recognisable multi-tile card-shaped object beneath the wall.
- The card is chosen from the existing card catalogue/collection systems, not from a Fossil Dig-only fake card pool.
- It is only granted when fully excavated.
- It is added to the normal Card Collection and is never a museum exhibit.
- The reward algorithm may occasionally produce a meaningful hit; it must not be restricted to Common cards, but its expected value must remain much lower than opening packs as a primary collection method.

## 5. Reward routing

Recovered objects are routed according to type:

| Find type | First copy | Later copies / result |
|---|---|---|
| Museum archaeological exhibit | Auto-donated to Museum | Automatically sold for its Lucky Coin duplicate value and shown in haul |
| Sellable relic/treasure not in Museum | — | Automatically sold for Lucky Coins |
| Lucky Coin cache | — | Lucky Coins granted directly |
| Adventure Ball/item | — | Added to existing Adventure inventory through the existing inventory bridge/API |
| TCG card | — | Added to normal card collection |

The results sheet lists the actual haul instead of collapsing the run into a single generic coin number.

A first museum donation gets a stronger one-time message, e.g. **NEW MUSEUM EXHIBIT — HELIX FOSSIL**.

## 6. Oreburgh Mining Museum collection room

### 6.1 Visual direction

Use the **authentic Gen IV Oreburgh Mining Museum room** as the visual basis, not a generic museum and not a new art style.

Implementation should source a clean, provenance-recorded room asset or reconstruct the exact room from authentic tiles if necessary. The room may be cleaned/edited so exhibit cases start empty, while preserving the recognisable Oreburgh layout, furniture, desk, walls, floor and display-case style.

The user's supplied Oreburgh reference image is a visual reference, not the preferred production-resolution asset if a cleaner source can be obtained.

Asset provenance must be recorded alongside existing arcade asset-source documentation.

### 6.2 Interaction model

- No avatar.
- No virtual joystick, pathfinding or walking controls.
- One top-down room, fitted responsively to the available screen.
- No checklist layered over the room during normal viewing.
- Empty displays are **completely blank**: no silhouette, question mark, lock, label or hidden-name hint.
- Once discovered, an exhibit sprite appears physically in its assigned case/pedestal.
- Only occupied exhibits are tappable.
- Tapping an exhibit opens a compact museum plaque/sheet.

### 6.3 Exhibit plaque

Plaque contains:
- item name;
- short original LuckyDex flavour/lore text;
- total number excavated;
- optional first-discovery information if useful and stable.

Do not copy long canonical game descriptions verbatim; write concise original flavour text consistent with the Pokémon object.

Example tone:

> **OLD AMBER**  
> Golden amber preserving traces of an ancient Pokémon. Its contents made fossil revival possible.  
> **Excavated: 4**

### 6.4 Room layout

Exhibits are curated into meaningful physical groups instead of an arbitrary grid:

- Kanto fossils together;
- Hoenn fossils together;
- Sinnoh fossils together;
- Unova/Kalos fossils together;
- Galar fossil pieces grouped as a set;
- Odd Keystone given a prominent standalone pedestal/display;
- Relic items grouped in a treasury/archaeology case;
- stones/minerals in a geological case.

The room should look intentionally sparse on a new save and increasingly rich as discoveries accumulate.

## 7. Persistence and save compatibility

Add a backward-compatible museum state under Arcade, conceptually:

```js
state.arcade.museum = {
  exhibits: {
    "helix-fossil": {
      discovered: true,
      foundCount: 4,
      firstFoundAt: <optional timestamp/version-safe value>
    }
  }
}
```

Requirements:
- old saves with no museum data initialise safely;
- no existing Arcade, card, Adventure, coin, Dust or profile data is reset;
- `foundCount` increments for every fully recovered museum item, including duplicates;
- first copy changes `discovered` and is not sold;
- later copies increment the count and award duplicate coins;
- partially uncovered items never modify persistent museum state;
- state shape must allow future achievements to inspect museum completion without parsing UI text.

## 8. Architecture

The current Fossil Dig implementation in `arcade-classics.js` is too small/simple for this feature. Avoid turning that file into a large museum engine.

Recommended separation:

- new `app/src/main/assets/arcade-fossil-museum.js`
  - item catalogue and masks;
  - dig-site generation;
  - strike/reveal/collapse rules;
  - reward routing;
  - museum persistence helpers;
  - museum-room rendering and plaque interaction;
  - public API namespace (e.g. `LuckyDexFossilMuseum`).
- `arcade-classics.js`
  - delegates Fossil Dig open/close to the new module or retains only a thin compatibility wrapper for existing Arcade calls.
- `arcade.css`
  - layered wall, tool selector, effects, museum room and plaque styles.
- `arcade-platform.js` / venue wiring as needed
  - Oreburgh Mining Museum offers Dig and Museum Collection without disrupting the continuous-world Arcade shell.
- `app-v0167.js` (or current state initialisation owner)
  - backward-compatible museum default/migration only if the new module cannot safely lazily initialise it.
- `arcade/authentic-v0200/mining/` and/or a dedicated museum asset folder
  - authentic room, cleaned display-room variant, impact textures/effects as required.
- existing item sprites under `arcade/sprites/items/`
  - reused wherever available rather than duplicating assets.

The excavation engine should expose pure/testable helpers for board generation, masks, strikes and recovery state where practical.

## 9. Balance constraints

- Normal dig: 3–6 objects.
- Common treasure should be easy to encounter; museum completion should require repeated play.
- Odd Keystone, premium relics and TCG cards are rarer than ordinary fossils/treasures.
- TCG cards must not make Fossil Dig more efficient than Packs for card acquisition.
- Duplicate museum sale values should make repeat fossils welcome without becoming the dominant Lucky Coin farm.
- Hammer must be useful for scouting but dangerous to spam; pickaxe must be safer but slower.
- A skilled player should often recover several finds, but full-wall clears should not be automatic.

Exact weights and coin values are implementation tuning constants and should be centralised in the catalogue/config, not scattered through click handlers.

## 10. Testing and acceptance criteria

### 10.1 Pure/runtime tests

Cover at minimum:
- generated board dimensions;
- 3–6-object target generation under normal conditions;
- object masks never overlap;
- all object mask cells stay within board bounds;
- pickaxe and hammer affect the intended cells differently;
- hammer costs more wall stability than pickaxe;
- object is not recovered when partially exposed;
- object is recovered exactly once when its full mask is exposed;
- collapse prevents incomplete rewards;
- first museum copy is donated and not sold;
- museum duplicate increments `foundCount` and awards coins;
- TCG reward routes to collection only after full excavation;
- Adventure item routes through existing inventory API;
- old save without museum state migrates safely.

### 10.2 Browser/device tests

Cover at minimum:
- Fossil Dig opens from Oreburgh Mining Museum;
- tool switching is touch-friendly;
- board fits phone width without page-level horizontal scrolling;
- visible rock layers change after strikes;
- partial item art appears progressively;
- stability UI updates and collapse result appears;
- results sheet lists actual finds;
- Museum Collection opens as one room with no avatar controls;
- new-save room has empty cases with no hidden hints;
- a discovered exhibit appears in its assigned physical location;
- tapping it opens the correct plaque;
- museum persists after reload;
- returning from Dig/Museum returns to Oreburgh venue.

### 10.3 Asset checks

- every catalogue sprite path exists;
- museum room asset exists locally/offline;
- asset provenance is documented;
- no runtime network dependency is required for museum or digging.

## 11. Explicitly deferred

Not part of this implementation:
- achievement UI/rewards;
- fossil Pokémon revival mechanic;
- museum NPC/player movement;
- multiple museum rooms/floors;
- freeform exhibit placement;
- online leaderboards;
- trading museum artifacts;
- a separate archaeology inventory for duplicates.

The museum data model should make future achievements such as **Unearth the Odd Keystone**, **Complete every fossil exhibit**, and **Complete the Oreburgh Museum** straightforward without changing existing saves.

## 12. Definition of done

The feature is complete when:

1. the old one-tap 6×7 Fossil Dig has been replaced by layered multi-tile excavation with pickaxe, hammer and wall stability;
2. multiple Pokémon-world object categories can be physically uncovered in a wall;
3. first archaeological discoveries automatically populate a persistent, authentic-looking Oreburgh Museum room;
4. empty museum cases reveal no future contents;
5. discovered exhibits can be tapped for flavour text and counts;
6. duplicate archaeology, treasure, Adventure items, coins and TCG cards route to their agreed destinations;
7. saves migrate without loss;
8. all relevant new and existing regression tests pass in the environments where their dependencies are available;
9. Android application ID and permanent signing identity remain unchanged.
