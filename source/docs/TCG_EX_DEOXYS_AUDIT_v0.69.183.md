# LuckyDex 0.69.183 — EX Deoxys Classic audit and Energy Charge fix

## Energy Charge / Energy Zone

- Fixed EX Deoxys Energy Charge (ex8-86): on heads it now gives the player a choice of up to two discarded Energy cards, including both basic Energy stored in Classic's `energyDiscard` and physical Special Energy in `discard`.
- Recovered basic Energy returns to the bottom of the separate `energySupply` queue, preserving the visible next-Energy preview; recovered Special Energy returns to the shuffled 30-card draw deck. A single available card is recovered once, and no discarded cards means no selection prompt.
- This also fixes Camerupt ex8-4 Energy Draw, which now selects discarded basic Energy and the receiving Pokémon, and Metagross ex8-11 Super Connectivity, which selects eligible Psychic/Metal Energy from either discard zone and puts a damage counter on the Active only when recovery succeeds.
- Electrike ex8-60 now searches the separate Energy Supply for Lightning Energy. Lady Outing ex8-87 now lets manual players choose up to three *different* basic Energy types from Energy Supply into their hand.

## Move resolution and deck synergy

- Altaria ex8-1's 20-damage attack hits only the Defending Pokémon, never the whole opposing Bench.
- Golbat/Zubat Self-control and Grumpig Carefree now enforce their printed status immunities; Natu and Xatu Mirror Coat reflect incoming Poison/Burn; Swablu Fluff flips to guard when already damaged.
- Xatu ex8-29 Psyloop counts the opposing player's in-play Stadium, Supporter and Pokémon Tools across Active and Bench, not the current player's Stadium.
- EX Deoxys status metadata now distinguishes offensive Special Conditions from self-sleep and condition immunities: e.g., Jirachi, Slaking, Golbat, Natu and Zubat are no longer misclassified as status-control attackers. Moves that choose any Special Condition correctly register all five possibilities. Healing role uses the shared `healing` tag.
- Lady Outing remains manually playable, but is excluded from player/CPU **automatic deck building** because its search-to-hand effect is a poor automatic 30-card choice in the separate Energy Zone format.

## Tests and handoff

- Fifteen added targeted regression tests cover Energy Charge with both Energy discard systems, single/no-card/tails edge cases, Camerupt, Metagross skip/attach, Electrike, Lady Outing, Altaria, Xatu, themed metadata and legal 30-card CPU/player deck builds.
- Existing EX Deoxys 21-case tests remain in the source and should be run with the added audit tests before installation.
- The unpacked `source/` GitHub tree remains canonical. The patch is an overlay; it does not replace the source directory.
