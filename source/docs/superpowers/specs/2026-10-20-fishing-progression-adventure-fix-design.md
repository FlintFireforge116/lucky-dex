# LuckyDex Fishing Progression + Adventure Fishing Design

**Target release:** v0.69.0
**Date:** 2026-10-20

## Goal

Turn Fishing from a flat location picker into a progression-driven side activity where each fishing spot has a meaningful ecological identity, better rods reveal new catches at previously visited locations, and regions unlock sequentially. At the same time, simplify Adventure Fishing into a fast Gen III-style encounter trigger and correct the global Struggle fallback bug in Adventure battles.

This design preserves all existing Fishing Book entries, sizes, records, rods, bait, Fishing Tokens, Lucky Coins and achievements wherever reasonably possible.

---

## 1. Fishing Lodge progression model

### Region order

Fishing regions unlock in this order:

1. Kanto
2. Johto
3. Hoenn
4. Sinnoh
5. Unova
6. Kalos
7. Alola
8. Galar
9. Paldea

Only Kanto is available to a new Fishing save.

### Spot order

Each region has four authored fishing spots. The first spot is unlocked when the region opens. Remaining spots unlock in order.

The current spot unlock rule is:

- Catch **3 distinct Pokémon species** at the current spot to unlock the next spot.

The fourth spot acts as the regional capstone. Completing the regional requirement unlocks the next region.

### Region completion rule

A region is complete when:

- all four spots have been unlocked, and
- the player has logged the configured regional species target.

The exact regional target should be stored in data rather than hard-coded into UI. Default target should be set conservatively during implementation so normal play does not require near-total completion of the region's pool.

### Revisit behaviour

Unlocked spots remain permanently revisitable.

Returning later with a better rod or different bait can reveal catches that were unavailable during the first visit. This is intentional and is a core reason to revisit older locations.

### Locked UI

Locked regions and spots remain visible but disabled.

Their lock card must state the next requirement explicitly, e.g.:

- `Catch 1 more species at Vermilion Harbour.`
- `Complete Kanto Fishing to unlock Johto.`

The UI must never expose uncaught species names through lock requirements.

---

## 2. Authored location pools

### Replace round-robin distribution

Remove the current round-robin assignment of regional Water Pokémon to four locations.

Each fishing spot receives an authored local pool based on the Pokémon that make sense for that location, habitat, game identity and generation history.

Cross-generation species are allowed and encouraged where they are canonically or thematically appropriate.

Examples:

### Kanto

**Cerulean Waters**
- early freshwater species
- examples: Magikarp, Goldeen, Psyduck, Poliwag

**Vermilion Harbour**
- coastal/harbour species
- examples: Tentacool, Krabby, Horsea, Shellder

**Safari Pond**
- Safari/freshwater species
- examples: Magikarp, Poliwag, Psyduck, Dratini where appropriately gated

**Seafoam Coast**
- cold/coastal/cave-adjacent species
- examples: Shellder, Seel, Horsea, more advanced coastal catches

The same design principle applies to Johto through Paldea.

### Pool data structure

Each spot should define its own pool entries rather than inheriting a region-wide round-robin pool.

Each entry should support at least:

- species ID
- minimum rod tier
- rarity/weight
- optional bait affinity
- optional size bias

This allows rod and bait progression without duplicating pool logic.

### Local Old Rod guarantee

Every fishing spot must have at least one genuinely local Old Rod catch.

Do not borrow an Old Rod species from another location as a silent fallback.

If an authored pool has no valid Old Rod catch, that is a data error that tests should fail.

---

## 3. Rod progression

Rod quality changes both catch mechanics and encounter access.

### Old Rod

Purpose: intentionally weak starter gear.

- only basic/common local species
- no advanced evolutions
- no rare/high-tier species
- smallest catch zone / hardest control assistance

Examples of catches that should not normally appear on Old Rod:
- Vaporeon
- Poliwhirl
- Gyarados
- high-stage evolutions generally

### Good Rod

- broader local pool
- selected middle-stage or stronger species where appropriate
- better catch zone

### Super Rod

- evolved and rare local species
- difficult/high-value catches
- better catch zone

### Deep Sea Rod

- exceptional, deep-water and ultra-rare local species where appropriate
- widest catch zone / best control assistance
- does not guarantee an easy catch; rare species movement can remain difficult

The rod should never override locality. A Deep Sea Rod at Safari Pond reveals the advanced Safari Pond pool, not arbitrary region-wide Pokémon.

---

## 4. Fishing progression save data

Add progression fields additively under Fishing state.

Suggested structure:

```js
progression: {
  unlockedRegions: ['kanto'],
  unlockedSpots: {
    kanto: ['cerulean-waters']
  },
  spotSpecies: {
    'kanto:cerulean-waters': [129, 118]
  },
  completedSpots: {},
  completedRegions: {}
}
```

Exact storage shape may differ if the existing save model has a better-compatible pattern.

### Migration

Existing v0.68.x saves must keep:

- Fishing Book discoveries
- size records
- count records
- best values
- junk/treasure discoveries
- rods
- bait inventory
- Fishing Tokens
- Lucky Coins
- achievements
- settings/developer flags

For existing players, progression should be reconstructed from existing Fishing Book/history where possible instead of resetting everyone to the first spot.

At minimum:

- if a player already owns upgraded rods, preserve them
- existing catches should count toward progression when their species belongs to authored local pools
- previously used regions should not lose recorded catches

Migration must be deterministic and idempotent.

---

## 5. Fishing setup UX

The Fishing setup page becomes a progression map/list rather than four unrestricted selectors.

### Region selection

Show regions in progression order with:

- unlocked/locked state
- regional completion summary
- number of species logged
- next unlock requirement

### Spot selection

Within an unlocked region show the four spots in order with:

- location art thumbnail
- unlocked/locked state
- local species caught / target
- current completion state
- current rod-accessible species count

### Rod/Bait selection

Rod and bait remain selected separately after choosing a spot.

The setup must communicate that changing rods can reveal new local species at old spots.

---

## 6. Location-specific artwork

Each Fishing spot must map to artwork that visually represents that exact spot or a close canonical equivalent with visible water.

Rules:

1. Prefer existing LuckyDex local canonical assets.
2. Prefer exact named-location map/image when available.
3. Crop/position toward fishable water.
4. Do not use a dry regional scene for a named pond/coast/harbour.
5. Keep a local fallback for offline/runtime failure.

Each spot should have explicit `scene` and `objectPosition`/crop metadata rather than depending on a generic region image.

---

## 7. Adventure Fishing flow

Adventure Fishing is not a minigame. It is a short encounter flavour interaction.

### Flow

Player taps `FISH` / uses a rod.

The current location image remains visible with a compact Gen III-style message window.

Sequence resolves automatically:

#### No bite

`Not even a nibble...`

After a short readable delay, return to the normal Adventure location screen / ready state automatically.

#### Bite escapes

`Oh! A bite!`

then

`It got away...`

After a short readable delay, return automatically.

#### Hooked Pokémon

`Oh! A bite!`

then

`A Pokémon's on the hook!`

Automatically transition into the existing Adventure wild battle after the message timing.

### No limbo controls

Remove the current extra:

- `CAST AGAIN`
- confirmation `A`
- any state that waits indefinitely after the outcome

One cast must resolve completely without requiring the player to discover an extra button.

### Encounter system

Successful hooks continue to use the existing Adventure battle/capture engine.

Do not duplicate capture, party or collection logic inside Fishing.

---

## 8. Global Adventure Struggle fix

### Current bug

The Adventure battle fallback currently allows Struggle when a Pokémon has no usable **damaging** move.

That is incorrect.

A Pokémon with a usable status move such as Splash must use that move rather than Struggle.

### Correct rule

Struggle is available only when **no known move with PP remaining is usable**.

Examples:

- Magikarp knows only Splash with PP → use Splash; no Struggle.
- Magikarp knows Splash + Tackle and Tackle has PP → AI can choose either according to normal AI; no Struggle.
- Every known move has 0 PP → use Struggle.

### One action per turn

A battler must never execute a normal move and then Struggle as a second action in the same turn.

Add an explicit regression for Magikarp to guarantee this.

---

## 9. Testing requirements

### Fishing progression

Tests must cover:

- only Kanto/first spot unlocked on a fresh save
- catching 3 distinct species unlocks the next spot
- duplicate catches do not inflate progression
- region completion unlocks the next region
- locked spots cannot be selected through UI or direct action dispatch
- migration preserves existing v0.68.x Fishing state
- migration is idempotent

### Authored pools

Tests must cover:

- every spot has a non-empty pool
- every spot has at least one local Old Rod species
- Old Rod contains no species explicitly marked for higher rods
- advanced/evolved species are gated appropriately
- better rods reveal additional species at at least representative spots
- spot pools differ materially within the same region

### Location art

Tests must cover:

- all fishing spots have explicit scene metadata
- pond/coast/harbour spots use water-containing art or designated water crop
- Safari Pond specifically uses a pond-containing Safari asset

### Adventure Fishing

Tests must cover:

- no-bite automatically returns to ready state
- escaped bite automatically returns to ready state
- hooked Pokémon automatically enters exactly one wild battle
- no `CAST AGAIN` or confirmation `A` limbo remains

### Battle / Struggle

Tests must cover:

- Splash with PP prevents Struggle
- Tackle with PP prevents Struggle fallback
- Struggle only when all moves are exhausted
- exactly one action occurs per battler per turn

### Release verification

- focused Fishing/Adventure/battle regressions
- existing Arcade Fishing tests
- shared Arcade help/records tests
- stress/simulation where useful
- run repository-wide test command and report any environment blockers separately
- do not claim full suite if Playwright remains unavailable

---

## 10. Release/versioning

This is a feature-level Fishing progression release and should be versioned as:

- **LuckyDex v0.69.0**
- **versionCode 6900**

Update all release identity locations consistently.

The handoff must include the matching full Termux commands automatically.

---

## Out of scope for v0.69.0

- new Fishing rods beyond the existing four
- additional bait types
- multiplayer Fishing
- entirely new Fishing currencies
- changing the current Fishing Book visual design beyond what progression requires
- expanding to non-Water Pokémon unless individually justified by authored location pools
- rewriting the Adventure battle engine beyond the Struggle/action bug

