# LuckyDex v0.69.250 — Classic Fossil autobuilder fix

**Scope:** Shared Classic automatic deck-builder (player, Test Lab, CPU, Fill/repair), not manual deck editing. Based on v0.69.249.

- Fossil Items that become Pokémon must have an actual matching evolution Pokémon in the generated deck. Owning a matching Pokémon elsewhere is insufficient, and a Kabuto line does not justify Old Amber, Root Fossil, etc.
- Keep the correct Fossil when adding a valid evolution family; when a Fossil is explicitly focused, attempt a playable matching family or return a useful error.
- Do not add Fossil Egg, Holon Fossil or Fossil Excavator without an actual Fossil evolution family in the deck.
- Remove saved orphan Fossils when Fill/repair rebuilds, without silently changing manually saved decks or deck legality.
- Exempt Clefairy Doll: it uses the shared `playFossil` engine path but is not an evolution Fossil.

**Test coverage:** `node --test source/tests/v07250-classic-fossil-deck-dependencies.test.cjs` plus existing builder/card regressions. Android device testing remains necessary.
