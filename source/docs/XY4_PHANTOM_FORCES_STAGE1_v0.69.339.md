# LuckyDex v0.69.339 — Phantom Forces, first integration

## Official collector coverage
- 124 printed records, including 24a and 65a, drawn from pinned immutable upstream Git blob.
- 162 printed attacks and 15 Abilities; exact printed costs retained.
- New set registered in Classic battle data, owned-card inspector, both deck builders, CPU selection and set picker.
- The official catalogue is generated in GitHub before assets and tests. It is not bundled as a guessed local print table.

## Implemented focus
- Night March: counts only real Pokémon cards with that attack in the active player's physical discard pile and deals 20 damage per qualifying card.
- Dimension Valley: one Colorless reduction for Psychic attacks on either side, preserving typed costs.
- Mystery Energy: Psychic-only attachment, one Psychic energy, -2 retreat per attached copy, off-type evolution cleanup.
- Double Colorless Energy: two Colorless Energy units.
- Core damage/status/coin effects use previously tested shared handlers where the printed instruction matches precisely.
- Some Trainers such as Roller Skates, Shauna, Tierno, Hand Scope and VS Seeker use working draw/reveal/search effects.
- All other printed mechanics remain discoverable but battle/deck-gated until verified, rather than permitting silent non-effects.

## Planned completion audit
Full dedicated checks for Metal Links and Dark Impulse; Wobbuffet and Aegislash prevention; M Gengar copy attack;
Crobat on-evolution damage; all Team Flare and Spirit Link Trainers; Robo Substitute; Steel Shelter;
Night March synergies (including Lampent); and opponent player-choice/KO ordering.

## Build and testing
`node --test tests/v07339-phantom-forces-stage1.test.cjs`
Legacy XY3, Global Energy/Zone, and Classic Deck Quality suites must continue to pass.
Never call the stage complete while any required printed effect is gated.
