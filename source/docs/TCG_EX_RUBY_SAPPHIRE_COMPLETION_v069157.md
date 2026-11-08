# LuckyDex v0.69.157 — EX Ruby & Sapphire mechanics completion

## Reference and scope

- English Pokémon TCG EX Ruby & Sapphire, official `ex1` card identities #1–109.
- Printed reference: `PokemonTCG/pokemon-tcg-data/cards/en/ex1.json`.
- All 109 prints are registered and marked `battleEnabled`; prior v0.69.156 had 57 battle-enabled and 52 gated. Gameplay eligibility is distinct from *exhaustively validating all possible interactions*.
- The six Basic Energy prints #104–109 remain collection/catalogue entries rather than cards in the 30-card draw deck. LuckyDex continues generating basic Energy separately in the Energy Zone; effects that search for basic Energy use the Energy supply or discard/hand as their text requires.
- Eight original Pokémon-ex (#96–103) remain Basic and award two Prize cards when Knocked Out. No changes to Pocket combat or to Classic deck size.
- Actual card scans use the existing `images.pokemontcg.io/ex1` URL pattern; offline availability is not claimed.

## Completed effects

- Attacks: coin damage / conditional damage / status, precise discard requirements, hand disruption, evolving/recovery, chosen Bench or Active targeting, healing, self-damage, suppression and retreat / attack locks.
- Powers / Bodies: Firestarter, Energy Draw, Psy Shadow, Energy Trans, Water Call, Natural Cure, Natural Remedy, Rough Skin, Protective Dust, Withering Dust, Intimidating Fang, Lazy, Hard Cocoon and Drive Off.
- Trainers: Energy Removal 2, Energy Restore, Energy Switch, Lady Outing, Lum Berry, Oran Berry, PokéNav, Energy Search, plus standard Pokémon Reversal, Poké Ball, Potion, Switch and Professor Birch.
- Special Energy: printed Darkness, Metal and Rainbow Energy with condition-specific damage and damage prevention, an adaptable **single** Rainbow Energy unit, and attachment-triggered self-damage.
- Player choices: specified Energy cards/types, source and destination Pokémon, hand/discard selections, optional recovery count and selected top-deck cards.

## Classic adaptation notes (do not silently change)

- Original EX-era Double Battle / two Defending Pokémon references are adapted to LuckyDex's single-Active battlefield. E.g. Hariyama's Super Slap Push damages that single Defending Pokémon; Seaking's Fast Stream cannot move Energy onto a *second* Defending Pokémon, so that portion is inapplicable while its printed 30 damage remains.
- Printed Basic Energy searches are adapted to the Energy supply; they do not add Basic Energy cards to the 30-card deck.
- Original 'from hand' triggers remain hand-specific; regular generated Energy Zone attachments do not trigger them. Effects which put generated basic Energy into the **hand** are counted as hand attachments when later used.
- Special Rainbow Energy counts as exactly **one** adaptable Energy unit rather than many simultaneous energy units for cost calculation.

## Testing and outstanding scope

- `node --test source/tests/v0714*.test.cjs source/tests/v0715*.test.cjs`: **189/189 passed** (focused EX cards and old-set regression checks).
- Added direct rule tests for Special Energy, target and source choices, Power and attack effects, Tools at checkup, original Pokémon-ex knockout prizes, and Advanced CPU simulations.
- Corrected the generic Energy-choice API so the acting Pokémon's UID is never mistaken for a limit on the eligible Energy-source Pokémon; Legendary Mewtwo's Energy Control remains selectable.
- Corrected Super Slap Push's damage, and both Mewtwo ex Energy Absorption and Energy Restore 'Done' options to end cleanly.
- This testing is not exhaustive across every card pairing and no Android APK visual / device tests have been run. Report any unexpected effect for a targeted follow-up.

## Next chronological expansion

EX Sandstorm (`ex2`).
