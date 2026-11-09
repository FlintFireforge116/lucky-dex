# EX FireRed & LeafGreen — v0.69.176 rules audit

Built against v0.69.175. Preserves full 116-card ex6 set, all 171 attacks, ex rarities, previous Classic cards, normal and Test Lab deck saves, CPU set restrictions, and mono-type preferences.

## Corrections

- PokéDex HANDY909: reorder the top six cards of the owner's deck via six explicit selections rather than silently leaving their order unchanged.
- VS Seeker: select which Supporter to recover from your own discard, without defaulting to the most recent one.
- Energy Removal 2: perform one coin flip and, on heads, select the opponent's Pokémon and the exact attached Basic or Special Energy to discard.
- Energy Switch: select the source Pokémon and Basic Energy type, then its destination. Does not silently take the first Energy.
- Switch: choose the Bench Pokémon to bring Active instead of always using the leftmost slot.
- Super Scoop Up: on heads, select your Pokémon and return the whole evolution stack, attached Tool/Special Energy and Basic Energy to your hand; matches existing Neo-era Scoop Up rules.
- Butterfree Whirlwind: damage the existing defender first; the defending player then chooses which Benched Pokémon replaces it.
- Clefairy Gesture: switch the chosen opposing Benched Pokémon into Active.
- Jigglypuff Sleep Inducer: switch the chosen opposing Benched Pokémon before inflicting Sleep. Between-turn Sleep recovery can still occur as normal.
- Fearow Shot Air: hit the selected opposing Benched Pokémon for the separate 20 damage, not always the leftmost one.
- Raichu Thunder Reflection: choose its recipient and exactly how many attached Lightning Energy to move.
- Slowbro Strange Behavior: select a damaged friendly Pokémon to transfer exactly one counter to Slowbro; prevent KOing Slowbro.
- Wigglytuff Assistance: remove only one chosen Special Condition from your own Active Pokémon, not every condition.
- Haunter Head Trip and Wigglytuff Assistance: Bench-only activated Powers are no longer offered when the user has these Pokémon Active.

## Verification

- All 116 ex6 cards in the Classic catalogue; both player and CPU set filters include ex6. 160 player/CPU-only ex6 deck builds produced legal 30-card decks.
- 20 original ex6 tests and 15 additional outcome-level tests cover choices, damage, movement, the user/defender choice side, and legal deck metadata.
- Cross-set regression suites run against Sandstorm, Dragon, Magma vs Aqua, Hidden Legends, and FireRed/LeafGreen.
- This is not an exhaustive cross-card compatibility guarantee. Android touch testing remains outstanding.
