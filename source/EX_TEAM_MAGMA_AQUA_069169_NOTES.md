# LuckyDex v0.69.169 — EX Team Magma vs Team Aqua

Base: **v0.69.168** (the deck-builder Energy cohesion release).

## New Classic set

- All 97 numbered cards from EX Team Magma vs Team Aqua (`ex4`), including 77 Pokémon, 17 Trainers and three Special Energy cards.
- 145 printed attacks (143 Pokémon attacks, two Team Technical Machine attacks), ten Poké-Powers/Bodies and seven Pokémon-ex with two-Prize rules.
- Team Aqua / Team Magma names, evolution families, 2004 card text, dual typings, weakness/resistance, artwork URLs, Energy requirements and deck-builder strategy metadata.
- Normal collection, player deck filtering, automatic builder, Test Lab and CPU opponent-expansion selection are all registered through the shared `ex4` set identifier.
- Team Energy restrictions, turn-end discards, Double Rainbow restrictions and reduction, Team Hideout Stadiums, Power Saver and Team-specific Tools are resolved by Classic combat logic.
- Existing mono-Energy deck-builder preference from v0.69.168 remains in place. Mixed Energy is still permitted for deliberate two-type attacks and explicit mixed-type builds.

## Verification

`node --test tests/v07163-ex-sandstorm.test.cjs tests/v07164-ex-sandstorm-audit.test.cjs tests/v07165-ex-dragon.test.cjs tests/v07166-ex-deck-builder-audit.test.cjs tests/v07167-classic-mono-energy.test.cjs tests/v07168-classic-energy-cohesion.test.cjs tests/v07169-ex-magma-aqua.test.cjs`

69/69 automated tests passed at packaging time, including attack execution across two RNG paths, Trainers, both Technical Machines, sample numerical outcomes and player/CPU deck legality. Android touchscreen testing and exhaustive combinations across the entire 2,000+ card collection are not covered by these tests.

## Format considerations

LuckyDex uses a 30-card, single-Active Classic battle adaptation with an ordered external Energy Zone. Original multi-Active effects are adapted to one Active. Some card-choice effects, including between-turn auto-evolutions, use a deterministic eligible target rather than reproducing the tabletop UI exactly. This should not be interpreted as full official tabletop rules compliance.
