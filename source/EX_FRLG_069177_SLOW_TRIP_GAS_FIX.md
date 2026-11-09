# LuckyDex v0.69.177 — EX FireRed & LeafGreen: Slow Trip Gas timing fix

Apply on top of v0.69.176, unpack under `~/lucky-dex/source/`.

- Gastly EX FireRed & LeafGreen #63 Slow Trip Gas now schedules Confusion to the end of the opponent's next turn instead of applying it immediately.
- Classic delayed effects tied to a Pokémon are removed if it evolves or switches out, consistent with clearing ongoing attack effects. No change to other formats' delayed effects.
- Existing EX Team Magma/Aqua delayed Poison/Sleep effects continue to use the same shared scheduler.
- Regression tests check immediate state, opponent turn end, switch, evolve and previous EX4 delay behavior.

Automated result: 142/142 across Sandstorm, Dragon, Magma/Aqua, Hidden Legends, FireRed & LeafGreen, CPU bench choices and the new timing tests. Android device verification remains outstanding.
