# Pokémon TCG Pocket card coverage

Cutoff: **2026-10-30 (Europe/London)**. Generated offline from reviewed MIT imports plus independently transcribed current card facts. This report does **not** claim every card is fully implemented. Unsupported cards are excluded from legal battle decks.

| Measure | Count |
| --- | ---: |
| Included expansion/promo namespaces | 26 |
| Known collectible prints | 4547 |
| Released/obtainable prints | 4534 |
| Canonical gameplay identities | 2450 |
| FULL | 1833 |
| PARTIAL | 617 |
| UNSUPPORTED | 0 |
| Unmapped released prints | 0 |
| Unknown effect references | 0 |
| Schema errors | 0 |

FULL means every recorded mechanic compiles to a validated handler. PARTIAL means detailed rules exist but at least one mechanic or data-quality check remains unsupported; those cards are not enabled. UNSUPPORTED means detailed combat data is unavailable. External asset keys identify exact prints/reprints, but never invent missing rules. Each classification applies to the entire card, not merely its simplest attack.

Released print status: FULL 3136, PARTIAL 1398, UNSUPPORTED 0.

## Change from supplied v0.69.36

FULL 1707 → 1833; PARTIAL 743 → 617; UNSUPPORTED 0 → 0. Resolved identities: 126. Previously FULL regressions: 0.

## Unique gameplay coverage per set

Each row counts unique gameplay once within that set; cross-set reprints can legitimately appear in multiple rows.

| Set | Prints | Gameplay | FULL | PARTIAL | UNSUPPORTED | Enabled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 286 | 225 | 203 | 22 | 0 | 203 |
| A1a | 86 | 68 | 54 | 14 | 0 | 54 |
| A2 | 207 | 155 | 128 | 27 | 0 | 128 |
| A2a | 96 | 75 | 62 | 13 | 0 | 62 |
| A2b | 111 | 73 | 63 | 10 | 0 | 63 |
| A3 | 239 | 182 | 141 | 41 | 0 | 141 |
| A3a | 103 | 83 | 63 | 20 | 0 | 63 |
| A3b | 107 | 83 | 60 | 23 | 0 | 60 |
| A4 | 241 | 185 | 143 | 42 | 0 | 143 |
| A4a | 105 | 85 | 59 | 26 | 0 | 59 |
| A4b | 379 | 215 | 161 | 54 | 0 | 161 |
| P-A | 117 | 113 | 93 | 20 | 0 | 93 |
| B1 | 331 | 266 | 202 | 64 | 0 | 202 |
| B1a | 103 | 83 | 59 | 24 | 0 | 59 |
| B2 | 234 | 183 | 123 | 60 | 0 | 123 |
| B2a | 131 | 99 | 69 | 30 | 0 | 69 |
| B2b | 117 | 71 | 47 | 24 | 0 | 47 |
| B3 | 234 | 178 | 121 | 57 | 0 | 121 |
| B3a | 109 | 88 | 58 | 30 | 0 | 58 |
| B3b | 106 | 78 | 50 | 28 | 0 | 50 |
| B4 | 233 | 179 | 121 | 58 | 0 | 121 |
| B4a | 110 | 86 | 55 | 31 | 0 | 55 |
| B4b | 429 | 237 | 122 | 115 | 0 | 122 |
| P-B | 103 | 101 | 70 | 31 | 0 | 70 |
| C1 | 217 | 144 | 107 | 37 | 0 | 107 |
| P-C | 0 | 0 | 0 | 0 | 0 | 0 |

## Release audit and known source gaps

Checked 31 October2026. This reviewed inventory remains through30 October2026. [Official release information](https://pokemon.gamespress.com/en-GB/Dual-type-Cards-to-Debut-in-Pokemon-TCG-Pocket-with-new-Dual-Fusion-Ex) dates Special Pack: First Partners to31 October; its card-by-card inventory and exact gameplay joins are not in the supplied reviewed source. It is a known released source gap, not a claim of complete latest-release coverage. Individual Promo C availability exclusions remain date-based.

## Included sets

- A1: Genetic Apex (2024-10-30)
- A1a: Mythical Island (2024-12-17)
- A2: Space-Time Smackdown (2025-01-29)
- A2a: Triumphant Light (2025-02-28)
- A2b: Shining Revelry (2025-03-27)
- A3: Celestial Guardians (2025-04-30)
- A3a: Extradimensional Crisis (2025-05-29)
- A3b: Eevee Grove (2025-06-26)
- A4: Wisdom of Sea and Sky (2025-07-30)
- A4a: Secluded Springs (2025-08-28)
- A4b: Deluxe Pack: ex (2025-09-30)
- P-A: Promo A (2024-10-30)
- B1: Mega Rising (2025-10-30)
- B1a: Crimson Blaze (2025-12-17)
- B2: Fantastical Parade (2026-01-29)
- B2a: Paldean Wonders (2026-02-26)
- B2b: Mega Shine (2026-03-26)
- B3: Pulsing Aura (2026-04-28)
- B3a: Paradox Drive (2026-05-28)
- B3b: Everyday Wonders (2026-06-30)
- B4: Ruler of the Skies (2026-07-30)
- B4a: Team Rocket’s Ambition (2026-08-27)
- B4b: Deluxe Pack: Mega (2026-09-30)
- P-B: Promo B (2025-10-30)
- C1: Dual Fusion (2026-10-29)
- P-C: Promo C (2026-10-29)

## Excluded previews

- P-C-001: Not obtainable by cutoff
- P-C-002: Not obtainable by cutoff
- P-C-003: Not obtainable by cutoff
- P-C-004: Not obtainable by cutoff
- P-C-005: Not obtainable by cutoff
- P-C-006: Not obtainable by cutoff
- P-C-007: Not obtainable by cutoff
- P-C-008: Not obtainable by cutoff
- P-C-009: Not obtainable by cutoff
- P-C-010: Not obtainable by cutoff
- P-C-011: Not obtainable by cutoff
- P-C-012: Not obtainable by cutoff
- P-C-013: Not obtainable by cutoff

## Missing or unsupported mechanic families

- 7 identities: Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen.
- 5 identities: Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 5 identities: Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage.
- 5 identities: Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing.
- 5 identities: Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way.
- 4 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage.
- 4 identities: Unimplemented attack text: Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon.
- 4 identities: Unimplemented attack text: During your opponent's next turn, they can't play any Item cards from their hand.
- 3 identities: Unimplemented attack text: Your opponent can't use any Supporter cards from their hand during their next turn.
- 3 identities: Unimplemented attack text: Discard a random Energy from among the Energy attached to all Pokémon (both yours and your opponent's).
- 3 identities: Unimplemented attack text: Put 1 random Basic Pokémon from your deck onto your Bench.
- 3 identities: Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon.
- 3 identities: Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon.
- 3 identities: Unimplemented attack text: This attack's damage isn't affected by Weakness or by any effects on your opponent's Active Pokémon.
- 2 identities: Unimplemented attack text: Your opponent reveals their hand.
- 2 identities: Unimplemented attack text: Discard a random card from your opponent's hand.
- 2 identities: Unimplemented ability text: If your opponent's Pokémon is Knocked Out by damage from this Pokémon's attacks, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon.
- 2 identities: Unimplemented attack text: Flip a coin. If heads, choose 1 of your opponent's Active Pokémon's attacks and use it as this attack.
- 2 identities: Unimplemented attack text: Choose 1 of your opponent's Active Pokémon's attacks and use it as this attack.
- 2 identities: Unimplemented attack text: Shuffle your hand into your deck. Draw a card for each card in your opponent's hand.
- 2 identities: Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +60 damage.
- 2 identities: Unimplemented attack text: This attack does 10 damage to each of your opponent's Pokémon.
- 2 identities: Unimplemented ability text: If you have Arceus or Arceus ex in play, this Pokémon has no Retreat Cost.
- 2 identities: Unimplemented attack text: Flip a coin. If heads, your opponent reveals a random card from their hand and shuffles it into their deck.
- 2 identities: Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 60 more damage.
- 2 identities: Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 40 damage to the Attacking Pokémon.
- 2 identities: Unimplemented attack text: During your opponent's next turn, they can't take any Energy from their Energy Zone to attach to their Active Pokémon.
- 2 identities: Unimplemented ability text: If this Pokémon would be Knocked Out by damage from an attack, flip a coin. If heads, this Pokémon is not Knocked Out, and its remaining HP becomes 10.
- 2 identities: Unimplemented attack text: Take a {C} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.
- 2 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, whenever you attach an Energy from your Energy Zone to it, it is now Asleep.
- 2 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon cost 1 {C} more.
- 2 identities: Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 60 more damage.
- 2 identities: Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, prevent that damage.
- 2 identities: Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 50 more damage.
- 2 identities: Unimplemented attack text: During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 40 or less.
- 2 identities: Unimplemented attack text: Discard Fire{R} Energy from this Pokémon. Your opponent's Active Pokémon is now Burned.
- 2 identities: Unimplemented attack text: Put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it.
- 2 identities: Unimplemented ability text: When this Pokémon is Knocked Out, flip a coin. If heads, your opponent can't get any points for it.
- 2 identities: Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +30 damage.
- 2 identities: Unimplemented attack text: This attack's damage isn't affected by any effects on your opponent's Active Pokémon.
- 2 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may take a {R} Energy from your Energy Zone and attach it to your Active {R} Pokémon.
- 2 identities: Unimplemented attack text: You may shuffle this Pokémon and all attached cards into your deck.
- 2 identities: Unimplemented attack text: During your next turn, attacks used by your Pokémon do +20 damage to your opponent's Active Pokémon.
- 2 identities: Unimplemented attack text: Discard a Stadium in play.
- 2 identities: Missing or invalid retreat
- 2 identities: Unimplemented attack text: This attack does 30 more damage for each point you have gotten.
- 2 identities: Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may switch it with your Active Pokémon. If you do, move all of your Energy in play to this Pokémon.
- 2 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 50 more damage.
- 2 identities: Unimplemented attack text: Switch in 1 of your opponent's Benched Pokémon to the Active Spot. If you do, this attack does 50 damage to the new Active Pokémon.
- 2 identities: Unimplemented attack text: Put 3 random cards from among Silcoon and Cascoon from your deck onto your Bench.
- 2 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 100 more damage.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot, once during your turn, you may switch in 1 of your opponent's Benched Basic Pokémon to the Active Spot.
- 1 identities: Unimplemented attack text: Flip 3 coins. Take an amount of {R} Energy from your Energy Zone equal to the number of heads and attach it to your Benched {R} Pokémon in any way you like.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 80 more damage.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, your opponent can't use any Supporter cards from their hand.
- 1 identities: Unimplemented attack text: Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Put 1 random Nidoran♂ from your deck onto your Bench.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 4 times. For each time a Pokémon was chosen, do 50 damage to it.
- 1 identities: Unimplemented ability text: Once during your turn, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented attack text: Flip a coin. If heads, discard a random card from your opponent's hand.
- 1 identities: Unimplemented attack text: Choose 1 of your opponent's Pokémon's attacks and use it as this attack. If this Pokémon doesn't have the necessary Energy to use that attack, this attack does nothing.
- 1 identities: Unimplemented ability text: Once during your turn, you may look at the top card of your deck.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, your opponent shuffles their Active Pokémon into their deck.
- 1 identities: Unimplemented trainer text: Choose 1 of your {W} Pokémon, and flip a coin until you get tails. For each heads, take a {W} Energy from your Energy Zone and attach it to that Pokémon.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Ninetales, Rapidash, or Magmar do +30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Put your Muk or Weezing in the Active Spot into your hand.
- 1 identities: Unimplemented trainer text: Take 1 {F} Energy from your Energy Zone and attach it to your Golem or Onix.
- 1 identities: Unimplemented trainer text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented trainer text: Move all {L} Energy from your Benched Pokémon to your Raichu, Electrode, or Electabuzz in the Active Spot.
- 1 identities: Unimplemented trainer text: Your opponent reveals their hand.
- 1 identities: Unimplemented trainer text: Look at the top 3 cards of your deck.
- 1 identities: Unimplemented ability text: Whenever you attach a {P} Energy from your Energy Zone to this Pokémon, heal 20 damage from this Pokémon.
- 1 identities: Unimplemented ability text: Whenever you attach a {D} Energy from your Energy Zone to this Pokémon, do 20 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Choose 2 of your Benched Pokémon. For each of those Pokémon, take a {W} Energy from your Energy Zone and attach it to that Pokémon.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Overacceleration attack does +20 damage.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 4 times. For each time a Pokémon was chosen, do 40 damage to it.
- 1 identities: Unimplemented attack text: This attack also does 20 damage to 1 of your Pokémon.
- 1 identities: Unimplemented ability text: At the end of your first turn, take a {L} Energy from your Energy Zone and attach it to this Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon evolved during this turn, this attack does 20 more damage.
- 1 identities: Unimplemented attack text: This attack does 40 damage for each time your Pokémon used Sweets Relay during this game.
- 1 identities: Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 30 damage to the Attacking Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may heal 60 damage from 1 of your {W} Pokémon.
- 1 identities: Unimplemented attack text: Until this Pokémon leaves the Active Spot, this Pokémon's Rolling Frenzy attack does +30 damage. This effect stacks.
- 1 identities: Unimplemented ability text: This Pokémon can evolve into any Pokémon that evolves from Eevee if you play it from your hand onto this Pokémon. (This Pokémon can't evolve during your first turn or the turn you play it.)
- 1 identities: Unimplemented attack text: Flip a coin for each Energy attached to this Pokémon. This attack does 50 damage for each heads.
- 1 identities: Unimplemented ability text: Each {G} Energy attached to your {G} Pokémon provides 2 {G} Energy. This effect doesn't stack.
- 1 identities: Unimplemented ability text: As often as you like during your turn, you may move a {W} Energy from 1 of your Benched {W} Pokémon to your Active {W} Pokémon.
- 1 identities: Unimplemented ability text: Your opponent can't play any Pokémon from their hand to evolve their Active Pokémon.
- 1 identities: Unimplemented attack text: Put 1 random Koffing from your deck onto your Bench.
- 1 identities: Unimplemented trainer text: Put a Basic Pokémon from your opponent's discard pile onto their Bench.
- 1 identities: Unimplemented trainer text: Look at the top card of your deck. If that card is a {P} Pokémon, put it into your hand. If it is not a {P} Pokémon, put it on the bottom of your deck.
- 1 identities: Unimplemented trainer text: Put your Mew ex in the Active Spot into your hand.
- 1 identities: Unimplemented ability text: Prevent all effects of attacks used by your opponent's Pokémon done to this Pokémon.
- 1 identities: Unimplemented ability text: As often as you like during your turn, you may choose 1 of your Pokémon that has damage on it, and move all of its damage to this Pokémon.
- 1 identities: Unimplemented attack text: Take a {P} Energy from your Energy Zone and attach it to Mesprit or Azelf.
- 1 identities: Unimplemented attack text: You can use this attack only if you have Uxie and Azelf on your Bench. Discard all Energy from this Pokémon.
- 1 identities: Unimplemented ability text: If this Pokémon has any Energy attached, it has no Retreat Cost.
- 1 identities: Unimplemented attack text: If your opponent's Pokémon is Knocked Out by damage from this attack, this Pokémon also does 50 damage to itself.
- 1 identities: Unimplemented attack text: Flip 4 coins. This attack does 40 damage for each heads. If at least 2 of them are heads, your opponent's Active Pokémon is now Poisoned.
- 1 identities: Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 20 damage for each heads.
- 1 identities: Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 40 damage for each heads.
- 1 identities: Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, this Pokémon takes −100 damage from that attack.
- 1 identities: Unimplemented ability text: You must discard a card from your hand in order to use this Ability. Once during your turn, you may draw a card.
- 1 identities: Unimplemented attack text: Change the type of the next Energy that will be generated for your opponent to 1 of the following at random: {G}, {R}, {W}, {L}, {P}, {F}, {D}, or {M}.
- 1 identities: Unimplemented attack text: Halve your opponent's Active Pokémon's remaining HP, rounded down.
- 1 identities: Unimplemented attack text: Your opponent reveals their hand. Choose a card you find there and shuffle it into your opponent's deck.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, put your opponent's Active Pokémon into their hand.
- 1 identities: Unimplemented trainer text: Choose a Pokémon in your hand and switch it with a random Pokémon in your deck.
- 1 identities: Unimplemented trainer text: If the Pokémon this card is attached to is in the Active Spot and is damaged by an attack from your opponent's Pokémon, do 20 damage to the Attacking Pokémon.
- 1 identities: Unimplemented trainer text: At the end of each turn, if the Pokémon this card is attached to is affected by any Special Conditions, it recovers from all of them, and discard this card.
- 1 identities: Unimplemented trainer text: Put 1 random Glameow, Stunky, or Croagunk from your deck into your hand.
- 1 identities: Unimplemented trainer text: Choose 1 of your Electivire or Luxray. Attach 2 {L} Energy from your discard pile to that Pokémon.
- 1 identities: Unimplemented trainer text: Your opponent shuffles their hand into their deck and draws a card for each of their remaining points needed to win.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 70 more damage.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may take a {G} Energy from your Energy Zone and attach it to 1 of your {G} Pokémon.
- 1 identities: Unimplemented ability text: During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, you may choose either player. Look at the top card of that player's deck.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Rolling Spin attack does +60 damage.
- 1 identities: Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. Do 20 damage to this Pokémon instead of the usual amount for this Special Condition.
- 1 identities: Unimplemented trainer text: Heal 40 damage from each of your Pokémon that has any {W} Energy attached.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Snorlax, Heracross, and Staraptor cost 2 less {C} Energy.
- 1 identities: Unimplemented attack text: Put 1 random Weedle from your deck onto your Bench.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 30 damage to it.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, do 50 damage to it.
- 1 identities: Unimplemented ability text: Your Active Dondozo has no Retreat Cost.
- 1 identities: Unimplemented attack text: This attack also does 20 damage to each of your opponent's Benched Pokémon that has any Energy attached.
- 1 identities: Unimplemented ability text: Once during your turn, you may take a {P} Energy from your Energy Zone and attach it to this Pokémon. If you use this Ability, your turn ends.
- 1 identities: Unimplemented attack text: Flip a coin for each {M} Energy attached to this Pokémon. This attack does 50 damage for each heads.
- 1 identities: Unimplemented trainer text: Heal 30 damage from 1 of your Pokémon, and it recovers from all Special Conditions.
- 1 identities: Unimplemented ability text: During your first turn, this Pokémon has no Retreat Cost.
- 1 identities: Unimplemented attack text: Flip 2 coins. This attack does 70 damage for each heads. If at least 1 of them is heads, your opponent's Active Pokémon is now Burned.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Insatiable Striking attack does +40 damage.
- 1 identities: Unimplemented attack text: Put 1 random Wishiwashi or Wishiwashi ex from your deck onto your Bench.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 50 damage to the Attacking Pokémon.
- 1 identities: Unimplemented ability text: Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex.
- 1 identities: Unimplemented attack text: Switch this Pokémon with 1 of your Benched {L} Pokémon.
- 1 identities: Unimplemented ability text: Each of your Pokémon that has any {P} Energy attached recovers from all Special Conditions and can't be affected by any Special Conditions.
- 1 identities: Unimplemented attack text: This attack does 20 damage to 1 of your opponent's Pokémon for each Energy attached to that Pokémon.
- 1 identities: Unimplemented attack text: Put a random card that evolves from Rockruff from your deck into your hand.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon has more remaining HP than this Pokémon, this attack does 50 more damage.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, move all {F} Energy from this Pokémon to 1 of your Benched Pokémon.
- 1 identities: Unimplemented attack text: Discard a random Item card from your opponent's hand.
- 1 identities: Unimplemented attack text: 1 Special Condition from among Asleep, Burned, Confused, Paralyzed, and Poisoned is chosen at random, and your opponent's Active Pokémon is now affected by that Special Condition. Any Special Conditions already affecting that Pokémon will not be chosen.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon takes +30 damage from attacks.
- 1 identities: Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost 1 {C} more, and its Retreat Cost is 1 {C} more.
- 1 identities: Unimplemented trainer text: Heal 10 damage and remove a random Special Condition from your Active Pokémon.
- 1 identities: Unimplemented trainer text: Choose 1 of your Basic Pokémon in play. If you have a Stage 2 card in your hand that evolves from that Pokémon, put that card onto the Basic Pokémon to evolve it, skipping the Stage 1. You can't use this card during your first turn or on a Basic Pokémon that was put into play this turn.
- 1 identities: Unimplemented trainer text: Look at the top card of your deck. Then, you may shuffle your deck.
- 1 identities: Unimplemented trainer text: If the Pokémon this card is attached to is your Active Pokémon and is damaged by an attack from your opponent's Pokémon, the Attacking Pokémon is now Poisoned.
- 1 identities: Unimplemented trainer text: Choose 1 of your Palossand or Mimikyu that has damage on it, and move 40 of its damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Put 1 of your {C} Pokémon that has damage on it into your hand.
- 1 identities: Unimplemented trainer text: Choose 1 of your Alolan Marowak or Turtonator. Take 2 {R} Energy from your Energy Zone and attach it to that Pokémon. Your turn ends.
- 1 identities: Unimplemented trainer text: Discard all Pokémon Tool cards attached to each of your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: You can use this card only if you have Araquanid in play. Switch in 1 of your opponent's Benched Pokémon to the Active Spot.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Alolan Golem, Vikavolt, or Togedemaru do +30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Heal all damage from 1 of your Shiinotic or Tsareena. If you do, discard all Energy from that Pokémon.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon do −20 damage.
- 1 identities: Unimplemented ability text: Pokémon (both yours and your opponent's) can't be healed.
- 1 identities: Unimplemented attack text: Discard a random Pokémon Tool card from your opponent's hand.
- 1 identities: Unimplemented attack text: Flip 3 coins. For each heads, a card is chosen at random from your opponent's hand. Your opponent reveals that card and shuffles it into their deck.
- 1 identities: Unimplemented ability text: Your opponent's Active Pokémon takes +10 damage from being Poisoned.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, your opponent's Active Pokémon is Knocked Out.
- 1 identities: Unimplemented ability text: Once during your turn, you may switch your Active Ultra Beast with 1 of your Benched Ultra Beasts.
- 1 identities: Unimplemented trainer text: You can use this card only if your opponent hasn't gotten any points. During your opponent's next turn, all of your Ultra Beasts take −20 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: Switch out your opponent's Active Basic Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented trainer text: If the {L} Pokémon this card is attached to is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, move 2 {L} Energy from that Pokémon and attach 1 Energy each to 2 of your Benched Pokémon.
- 1 identities: Unimplemented trainer text: Attacks used by the Ultra Beast this card is attached to do +10 damage to your opponent's Active Pokémon for each point you have gotten.
- 1 identities: Unimplemented trainer text: Put 1 random Type: Null or Silvally from your deck into your hand.
- 1 identities: Unimplemented trainer text: Your opponent reveals all of the Supporter cards in their deck.
- 1 identities: Unimplemented trainer text: You can use this card only if your opponent has gotten at least 1 point. Choose 1 of your Ultra Beasts. Attach 2 random Energy from your discard pile to that Pokémon.
- 1 identities: Unimplemented attack text: Your opponent reveals a random card from their hand and shuffles it into their deck.
- 1 identities: Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 30 more damage.
- 1 identities: Unimplemented ability text: Once during your turn, you may attach a {R} Energy from your discard pile to this Pokémon. If you do, do 20 damage to this Pokémon.
- 1 identities: Unimplemented attack text: Discard all Energy attached to this Pokémon. Your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may draw 2 cards.
- 1 identities: Unimplemented attack text: If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn.
- 1 identities: Unimplemented attack text: Discard all Pokémon Tools from your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented trainer text: Choose 1: During this turn, attacks used by your Pokémon that evolve from Eevee do +10 damage to your opponent's Active Pokémon. Heal 20 damage from each of your Pokémon that evolves from Eevee.
- 1 identities: Unimplemented trainer text: At the end of your turn, if the Pokémon this card is attached to is in the Active Spot, heal 10 damage from that Pokémon.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Decidueye ex, Incineroar ex, or Primarina ex do +30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Look at a random Supporter card that's not Penny from your opponent's deck and shuffle it back into their deck. Use the effect of that card as the effect of this card.
- 1 identities: Unimplemented attack text: Flip 3 coins. This attack does 60 damage for each heads. This Pokémon is now Confused.
- 1 identities: Unimplemented attack text: This attack does 40 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost.
- 1 identities: Unimplemented ability text: Your Active Pokémon has no Retreat Cost.
- 1 identities: Unimplemented ability text: If this Pokémon has a Pokémon Tool attached, attacks used by this Pokémon cost 1 less {G} Energy.
- 1 identities: Unimplemented attack text: 1 other Pokémon (either yours or your opponent's) is chosen at random 3 times. For each time a Pokémon was chosen, do 50 damage to it.
- 1 identities: Unimplemented attack text: Take a {R} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon.
- 1 identities: Unimplemented attack text: Take a {R}, {W}, and {L} Energy from your Energy Zone and attach them to your Benched Basic Pokémon in any way you like.
- 1 identities: Unimplemented ability text: As long as this Pokémon is on your Bench, attacks used by your Pokémon that evolve from Poliwhirl do +40 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: You may discard any number of your Benched {W} Pokémon. This attack does 40 more damage for each Benched Pokémon you discarded in this way.
- 1 identities: Unimplemented attack text: If the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. This effect lasts until the Defending Pokémon leaves the Active Spot, and it doesn't stack.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may discard a random Energy from your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Take a {L} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon.
- 1 identities: Unimplemented attack text: This attack does 20 damage for each Energy attached to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, your opponent's Active Pokémon's remaining HP is now 10.
- 1 identities: Unimplemented ability text: This Ability works if you have any Unown in play with an Ability other than . All of your Pokémon take −10 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented ability text: This Ability works if you have any Unown in play with an Ability other than . Attacks used by your Pokémon do +10 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon was damaged by an attack during your opponent's last turn while it was in the Active Spot, this attack does 50 more damage.
- 1 identities: Unimplemented ability text: Once during your turn, you may move all {D} Energy from each of your Pokémon to this Pokémon.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Gear Spinner attack does +70 damage.
- 1 identities: Unimplemented ability text: Whenever you attach an Energy from your Energy Zone to this Pokémon, put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it.
- 1 identities: Unimplemented ability text: This Pokémon can't be Asleep.
- 1 identities: Unimplemented attack text: Draw cards until you have the same number of cards in your hand as your opponent.
- 1 identities: Unimplemented attack text: Change the type of a random Energy attached to your opponent's Active Pokémon to 1 of the following at random: {G}, {R}, {W}, {L}, {P}, {F}, {D}, or {M}.
- 1 identities: Unimplemented trainer text: Move a {R}, {W}, or {L} Energy from 1 of your Benched Pokémon to your Active Pokémon.
- 1 identities: Unimplemented trainer text: The {M} Pokémon this card is attached to takes −10 damage from attacks from your opponent's Pokémon, recovers from all Special Conditions, and can't be affected by any Special Conditions.
- 1 identities: Unimplemented trainer text: If the {D} Pokémon this card is attached to is in the Active Spot and is damaged by an attack from your opponent's Pokémon, your opponent reveals a random card from their hand and shuffles it into their deck.
- 1 identities: Unimplemented trainer text: If the Pokémon this card is attached to is Knocked Out by damage from an attack from your opponent's Pokémon, put it into your hand instead of the discard pile.
- 1 identities: Unimplemented trainer text: The next time you flip any number of coins for the effect of an attack, Ability, or Trainer card after using this card on this turn, the first coin flip will definitely be heads.
- 1 identities: Unimplemented trainer text: Switch your Active Pokémon that has damage on it with 1 of your Benched Pokémon.
- 1 identities: Unimplemented trainer text: Your opponent reveals their hand. Choose a Supporter card you find there and shuffle it into your opponent's deck.
- 1 identities: Unimplemented trainer text: Flip 3 coins. For each heads, a {W} Pokémon is chosen at random from your discard pile and put into your hand.
- 1 identities: Unimplemented trainer text: For each of your {F} Pokémon in play, look at that many cards from the top of your deck and put them back in any order.
- 1 identities: Unimplemented attack text: You may switch this Pokémon with 1 of your Benched Pokémon.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon is an evolved Pokémon, devolve it by putting the highest Stage Evolution card on it into your opponent's hand.
- 1 identities: Unimplemented attack text: Put 1 random Poliwag from your deck onto your Bench.
- 1 identities: Unimplemented attack text: Discard up to 2 Pokémon Tool cards from your hand. This attack does 50 damage for each card you discarded in this way.
- 1 identities: Unimplemented attack text: Take a {W} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon has damage on it, this attack can be used for 1 {L} Energy.
- 1 identities: Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may have your opponent reveal their hand.
- 1 identities: Unimplemented attack text: At the end of your opponent's next turn, do 90 damage to the Defending Pokémon.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, flip a coin. If heads, the Attacking Pokémon is Knocked Out.
- 1 identities: Unimplemented ability text: If you have Latias in play, this Pokémon has no Retreat Cost.
- 1 identities: Unimplemented attack text: Discard the top card of your deck. If that card is a {F} Pokémon, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: If this Pokémon has any {W} Energy attached, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon is Zangoose, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: If this Pokémon has 2 or more different types of Energy attached, this attack does 60 more damage.
- 1 identities: Unimplemented trainer text: The Pokémon this card is attached to can use any attack from its previous Evolutions. (You still need the necessary Energy to use each attack.)
- 1 identities: Unimplemented trainer text: Heal 60 damage from 1 of your Miltank, and it recovers from being Asleep, Paralyzed, and Confused.
- 1 identities: Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Pokémon Tool cards you find there into your hand. Shuffle the other cards back into your deck.
- 1 identities: Unimplemented trainer text: For each of your {P} Pokémon in play, look at that many cards from the top of your opponent's deck and put them back in any order.
- 1 identities: Unimplemented attack text: Choose either Poisoned or Confused. Your opponent's Active Pokémon is now affected by that Special Condition.
- 1 identities: Unimplemented attack text: This attack does 30 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost.
- 1 identities: Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 20 damage to the Attacking Pokémon.
- 1 identities: Unimplemented attack text: If you have exactly 1, 3, or 5 cards in your hand, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: If you have exactly 2, 4, or 6 cards in your hand, this attack does 30 more damage.
- 1 identities: Unimplemented attack text: Prevent all damage done to this Pokémon by attacks from Basic Pokémon during your opponent's next turn.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, take a {W} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, you may switch your Active {W} Pokémon with 1 of your Benched Pokémon.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, whenever your opponent attaches an Energy from their Energy Zone to 1 of their Pokémon, do 20 damage to that Pokémon.
- 1 identities: Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random. This attack also does 20 damage to it.
- 1 identities: Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, also do 20 damage to it.
- 1 identities: Unimplemented attack text: Discard 2 cards from your hand. If you can't discard 2 cards, this attack does nothing.
- 1 identities: Unimplemented attack text: During your opponent's next turn, if they attach Energy from their Energy Zone to the Defending Pokémon, that Pokémon will be Asleep.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may discard all Pokémon Tools from your opponent's Active Pokémon. If you do, discard this Pokémon.
- 1 identities: Unimplemented attack text: This attack's damage isn't affected by Weakness.
- 1 identities: Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon. During your next turn, this Pokémon's Wild Spin attack does +20 damage to each of your opponent's Pokémon.
- 1 identities: Unimplemented attack text: Reveal the top 3 cards of your deck. This attack does 60 damage for each Pokémon with a Retreat Cost of 3 or more you find there. Shuffle the revealed cards back into your deck.
- 1 identities: Unimplemented attack text: If this Pokémon's remaining HP is 30 or less, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: This attack does 40 more damage for each of your opponent's Pokémon in play that has an Ability.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, your opponent reveals their hand. Choose a Supporter card you find there and discard it.
- 1 identities: Unimplemented attack text: Your opponent reveals their hand. Choose a Supporter card you find there and discard it.
- 1 identities: Unimplemented ability text: Once during your turn, you may take 2 {D} Energy from your Energy Zone and attach it to this Pokémon. If you do, do 30 damage to this Pokémon.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, the Attacking Pokémon is now Poisoned.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are tails, this attack does nothing.
- 1 identities: Unimplemented attack text: Flip 2 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If both of them are tails, this attack does nothing.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, it can evolve during your first turn or the turn you play it.
- 1 identities: Unimplemented attack text: Flip 2 coins. This attack does 30 damage for each heads. If this Pokémon has Lucky Mittens attached, flip 4 coins instead.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may put a Supporter card from your discard pile into your hand.
- 1 identities: Unimplemented trainer text: A card from among both player's hands is chosen at random, revealed to the other player, and shuffled into its owner's deck.
- 1 identities: Unimplemented trainer text: Flip 2 coins. If both of them are heads, discard a random Energy from your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Attach a {R} Energy from your discard pile to your Active {R} Pokémon.
- 1 identities: Unimplemented trainer text: At the end of each turn, if the Pokémon this card is attached to has half of its maximum HP or less remaining, heal 30 damage from it. If you do, discard this card.
- 1 identities: Unimplemented trainer text: If the Pokémon this card is attached to has a Retreat Cost of 3 or more, it takes −20 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: Whenever your opponent's Pokémon is Knocked Out by damage from an attack used by the Pokémon this card is attached to, draw a card.
- 1 identities: Unimplemented trainer text: Heal 70 damage from 1 of your Carracosta or Jellicent.
- 1 identities: Unimplemented trainer text: During your opponent's next turn, if your Hariyama or Crabominable would be Knocked Out by damage from an attack, it is not Knocked Out and its remaining HP becomes 10.
- 1 identities: Unimplemented trainer text: Put 2 random Pokémon from your deck into your hand. For each Pokémon you put into your hand in this way, choose a Pokémon to shuffle from your hand into your deck.
- 1 identities: Unimplemented trainer text: Take a {P} Energy from your Energy Zone and attach it to each of your Drifblim and Mismagius.
- 1 identities: Unimplemented trainer text: Shuffle your hand into your deck. Draw a card for each card in your opponent's hand.
- 1 identities: Unimplemented trainer text: Put 2 random Basic Pokémon with 50 HP or less from your deck into your hand.
- 1 identities: Unimplemented attack text: Flip 3 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If all of them are tails, this attack does nothing.
- 1 identities: Unimplemented attack text: Choose 1 of your Benched Pokémon's attacks, except any Pokémon ex, and use it as this attack. If this Pokémon doesn't have the necessary Energy to use that attack, this attack does nothing.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 20 more damage.
- 1 identities: Unimplemented attack text: If this Pokémon has any {P} Energy attached, this attack does 40 more damage. This attack's damage isn't affected by any effects on your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon.
- 1 identities: Unimplemented attack text: Discard all Water Energy from this Pokémon. This attack does 130 damage to 1 of your opponent's Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, after you flip any coins for an attack of 1 of your {R} Pokémon, you may ignore all results of those coin flips and begin flipping those coins again. You can't use more than 1 Victory Star Ability each turn.
- 1 identities: Unimplemented ability text: At the beginning of your turn, if this Pokémon is in the Active Spot, put a random {P} Pokémon from your deck into your hand.
- 1 identities: Unimplemented attack text: If any of your {D} Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 80 more damage.
- 1 identities: Unimplemented attack text: Choose a spot from among your opponent's Active Spot and Bench. At the end of your opponent's next turn, do 70 damage to the Pokémon in the spot you chose.
- 1 identities: Unimplemented attack text: If this Pokémon evolved from Dunsparce during this turn, discard 2 random Energy from your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Take a random Energy from among {G}, {R}, {W}, {L}, {P}, {F}, {D}, and {M} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.
- 1 identities: Unimplemented attack text: This attack does 30 damage for each Pokémon Tool attached to all of your Pokémon.
- 1 identities: Unimplemented ability text: Each of your evolved Pokémon can use any attack from its previous Evolutions. (You still need the necessary Energy to use each attack.)
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, do 60 damage to it.
- 1 identities: Unimplemented attack text: Discard the top card of your deck, and if that card is an Item, this attack does 20 more damage.
- 1 identities: Unimplemented ability text: If you have another Beldum in play, this Pokémon's Retreat Cost is 2 less.
- 1 identities: Unimplemented attack text: If this Pokémon has more Energy attached than your opponent's Active Pokémon, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: Reveal the top 6 cards of your deck. This attack does 30 damage for each Pokémon you find there that has “Team Rocket” in its name. Shuffle the revealed cards back into your deck.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon has “Team Rocket” in its name, this attack does 70 more damage.
- 1 identities: Unimplemented ability text: At the end of each turn, if your opponent's Active Pokémon is Asleep, do 20 damage to that Pokémon.
- 1 identities: Unimplemented ability text: If you have another Falinks in play, this Pokémon's attacks do +20 damage to your opponent's Active Pokémon, and this Pokémon takes −20 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented attack text: You may move any amount of Energy from your Pokémon in play to your other Pokémon in any way you like.
- 1 identities: Unimplemented ability text: Your opponent's Active Pokémon's Retreat Cost is 1 more.
- 1 identities: Unimplemented attack text: If Quick-Grow Extract is in your discard pile, this attack does 30 more damage.
- 1 identities: Unimplemented ability text: As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks.
- 1 identities: Unimplemented attack text: If this Pokémon has at least 2 extra {W} Energy attached, this attack also does 50 damage to 1 of your opponent's Benched Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon has at least 3 extra {W} Energy attached, this attack also does 50 damage to 2 of your opponent's Benched Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 40 more damage.
- 1 identities: Unimplemented ability text: This Pokémon gets +30 HP for each {P} Energy attached to it.
- 1 identities: Unimplemented attack text: This attack's damage is reduced by the amount of damage this Pokémon has on it.
- 1 identities: Unimplemented attack text: Flip 2 coins. This attack does 90 damage for each heads. Your opponent's Active Pokémon is now Confused.
- 1 identities: Unimplemented attack text: Your opponent reveals a random card from their hand and shuffles it into their deck. Shuffle this Pokémon into your deck.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon has no Weakness.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon takes damage from attacks and has no Weakness.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each Trainer card in your opponent's deck.
- 1 identities: Unimplemented attack text: Put 1 random Starly from your deck onto your Bench.
- 1 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 40 more damage.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Magneton or Heliolisk do +20 damage to your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: Choose 1 of your {G} Pokémon in play. Put a random {G} Pokémon from your deck that evolves from that Pokémon onto that Pokémon to evolve it. You can't use this card during your first turn or on a Pokémon that was put into play this turn.
- 1 identities: Unimplemented trainer text: Put 2 random cards from among Magneton, Heliolisk, and Clemont's Backpack from your deck into your hand.
- 1 identities: Unimplemented trainer text: Put a random Mega Evolution Pokémon ex from your deck into your hand.
- 1 identities: Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. During your opponent's next turn, that Pokémon can't retreat.
- 1 identities: Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 80 damage to the Attacking Pokémon.
- 1 identities: Unimplemented attack text: Put a random card that evolves from Spewpa from your deck into your hand.
- 1 identities: Unimplemented attack text: If your opponent has gotten exactly 1 points, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: If the amount of Energy attached to both Active Pokémon is 5 or more, this attack does 60 more damage.
- 1 identities: Unimplemented ability text: Each of your Pokémon that has any Energy attached recovers from all Special Conditions and can't be affected by any Special Conditions.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, this attack does 70 damage to your opponent's Active Pokémon. If tails, heal 30 damage from your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Discard 2 random Energy from among the Energy attached to all Pokémon (both yours and your opponent's).
- 1 identities: Unimplemented attack text: Discard Water2 {W} Energy from this Pokémon. Your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented ability text: If a Stadium is in play, this Pokémon has no Retreat Cost.
- 1 identities: Unimplemented attack text: 1 other Pokémon (either yours or your opponent's) is chosen at random 1 time. Do 100 damage to the chosen Pokémon.
- 1 identities: Unimplemented attack text: If you have 5 or more {P} Energy in play, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: Take 3 {P} Energy from your Energy Zone and attach it to your {P} Pokémon in any way you like.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each Supporter card in your discard pile.
- 1 identities: Unimplemented ability text: When this Pokémon is first damaged by an attack after coming into play, prevent that damage.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may have your opponent shuffle their hand into their deck. For each remaining point that your opponent needs to win, they draw a card.
- 1 identities: Unimplemented attack text: If this Pokémon has any {P} Energy attached, this attack does 50 more damage.
- 1 identities: Unimplemented attack text: If you have fewer Pokémon in play than your opponent, this attack does 80 more damage.
- 1 identities: Unimplemented ability text: Basic Pokémon in play (both yours and your opponent's) have no Abilities.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 10 damage to each of your opponent's Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, look at a random card from your opponent's hand and shuffle it into their deck.
- 1 identities: Unimplemented attack text: If this Pokémon has more Energy attached than your opponent's Active Pokémon, this attack does 50 more damage.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, discard your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may put 2 random Pokémon Tool cards from your discard pile into your hand.
- 1 identities: Unimplemented attack text: Until this Pokémon leaves the Active Spot, this Pokémon's Heat-Up Crunch attack does +30 damage. This effect stacks.
- 1 identities: Unimplemented attack text: During your opponent's next turn, if this Pokémon is in the Active Spot when your opponent's Active Pokémon retreats, this attack does 40 damage to the new Active Pokémon.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon takes −80 damage from attacks from your opponent's Pokémon ex.
- 1 identities: Unimplemented attack text: This attack is used twice in a row. The second attack does 40 damage. (If the first attack Knocks Out your opponent's Active Pokémon, the second attack is used after your opponent chooses a new Active Pokémon.)
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may look at a random Supporter card from your opponent's hand. Use the effect of that card as the effect of this Ability.
- 1 identities: Unimplemented ability text: Once during your turn, you may switch out your opponent's Active Basic Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented attack text: Put 3 random cards from among Tandemaus and Maushold from your deck onto your Bench.
- 1 identities: Unimplemented attack text: Flip a coin for each Tandemaus and Maushold you have in play. This attack does 60 damage for each heads.
- 1 identities: Unimplemented trainer text: Heal 20 damage from your Active Pokémon. If you healed any damage in this way, flip a coin. If heads, put this Lucky Ice Pop into your hand instead of the discard pile.
- 1 identities: Unimplemented trainer text: As long as the Pokémon this card is attached to is on your Bench, prevent all damage done to that Pokémon by your opponent's attacks and Abilities.
- 1 identities: Unimplemented trainer text: If this card is attached to 1 of your Pokémon, discard it at the end of your opponent's turn. The {M} Pokémon this card is attached to takes −50 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: Heal 90 damage from 1 of your {P} Pokémon that has 2 or more {P} Energy attached. If you healed any damage in this way, discard 2 {P} Energy from that Pokémon.
- 1 identities: Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Stage 1 Pokémon you find there into your hand. Shuffle the other cards back into your deck.
- 1 identities: Unimplemented trainer text: You can use this card only if your Pokémon in play have 3 or more different types of Energy attached. Move all Energy from each of your Benched Pokémon to your Active Pokémon.
- 1 identities: Unimplemented trainer text: You can use this card only if you have Galarian Obstagoon in play. Discard 2 random Energy from your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, you may heal 60 damage from 1 of your Pokémon ex that has any Energy attached. If you do, discard a random Energy from that Pokémon.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon is a Grass or Metal Pokémon, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost {C}{C} more.
- 1 identities: Unimplemented ability text: Once during your turn, you may discard 1 Fire Energy from this Pokémon in order to use this Ability. During this turn, attacks used by your Fire Pokémon do +50 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: If this Pokémon's remaining HP is 50 or less, attacks used by this Pokémon do +60 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin. If heads, the Defending Pokémon is now Paralyzed.
- 1 identities: Unimplemented attack text: If you have no cards in your deck, this attack can be used for 1 Water Energy.
- 1 identities: Unimplemented attack text: Discard a Lightning Energy from this Pokémon.
- 1 identities: Unimplemented attack text: If you have 4 or more Lightning Energy in play, this attack does 70 more damage.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each Psychic Pokémon in your discard pile.
- 1 identities: Unimplemented attack text: If this Pokémon's remaining HP is 60 or less, this attack does nothing.
- 1 identities: Unimplemented attack text: If your Pokémon in play have 3 or more different types of Energy attached, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon.
- 1 identities: Unimplemented attack text: Take a Metal Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random for each Metal Energy attached to this Pokémon. For each time a Pokémon was chosen, do 40 damage to it.
- 1 identities: Unimplemented attack text: Flip 3 coins. For each heads, discard a random Energy from your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: The Stage 2 Pokémon this card is attached to has no Retreat Cost.
- 1 identities: Unimplemented trainer text: Discard a random Energy from among the Energy attached to all of your opponent's Pokémon that have an Ability.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may flip a coin. If heads, that player puts a random Pokémon from their deck into their hand. You may play only 1 Stadium card during your turn. Put it next to the Active Spot, and discard it if another Stadium comes into play. A Stadium with the same name can't be played.
- 1 identities: Unimplemented attack text: If this Pokémon's remaining HP is 110 or less, this attack does 80 more damage.
- 1 identities: Unimplemented attack text: Flip 3 coins. This attack also does 20 damage for each heads to each of your opponent's Benched Pokémon.
- 1 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon has more remaining HP than this Pokémon, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: 1 attack from among the Pokémon in your opponent's hand and deck is chosen at random, and you use the chosen attack as this attack.
- 1 identities: Unimplemented attack text: If your opponent has exactly 2, 4, or 6 cards in their hand, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: Discard 2 random Energy from among the Energy attached to all of your Pokémon.
- 1 identities: Unimplemented attack text: During your opponent's next turn, they can't play any Trainer cards from their hand.
- 1 identities: Unimplemented attack text: This Pokémon also does 100 damage to itself and 50 damage to all Benched Pokémon (both yours and your opponent's).
- 1 identities: Unimplemented ability text: Once during your turn, you may switch your Active {M} Pokémon with 1 of your Benched Pokémon.
- 1 identities: Unimplemented attack text: Take a {W} and a {L} Energy from your Energy Zone and attach them to this Pokémon.
- 1 identities: Unimplemented attack text: Discard a {W} and a {L} Energy from this Pokémon.
- 1 identities: Unimplemented trainer text: Your opponent discards cards from their hand until they have 4 cards in their hand.
- 1 identities: Unimplemented trainer text: Shuffle 2 cards from your hand into your deck. Draw a card. If you can't shuffle in 2 cards, you can't use this card.
- 1 identities: Unimplemented trainer text: During this turn, if your opponent's Active Pokémon is Knocked Out by damage from an attack used by your Haxorus, you get 1 more point.
- 1 identities: Unimplemented trainer text: Draw a card for each Mega Evolution Pokémon ex in play (both yours and your opponent's).
- 1 identities: Unimplemented trainer text: At the end of each player's turn, that player draws cards until they have 3 cards in their hand.
- 1 identities: Unimplemented attack text: The Defending Pokémon loses all Abilities. This effect lasts until the Defending Pokémon leaves the Active Spot.
- 1 identities: Unimplemented attack text: Flip 3 coins. For each heads, discard a {R} Energy from this Pokémon. This attack does 30 more damage for each {R} Energy you discarded in this way.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 160 damage to it.
- 1 identities: Unimplemented attack text: Flip a coin for each {R} Energy attached to this Pokémon. This attack does 30 more damage for each heads.
- 1 identities: Unimplemented attack text: If this Pokémon evolved from Poliwhirl during this turn, this attack does 50 more damage.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented attack text: If this Pokémon has any {F} Energy attached, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: Move 2 random Energy from this Pokémon to 1 of your Benched Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 20 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Discard a {W} Energy from this Pokémon, and this attack also does 40 damage to 1 of your opponent's Benched Pokémon.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in play, it is {W} and {F} type.
- 1 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage, and your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may move 30 damage that your Active Pokémon has on it to this Pokémon.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon takes +20 damage from attacks.
- 1 identities: Unimplemented attack text: During your next turn, attacks used by your {F} Pokémon do +30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip a coin until you get tails. For each heads, discard the top card of your opponent's deck.
- 1 identities: Unimplemented attack text: Take a {C} Energy from your Energy Zone and attach it to this Pokémon.
- 1 identities: Unimplemented attack text: During your opponent's next turn, they can't play any Pokémon from their hand to evolve their Pokémon.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in play, it is {F} and {D} type.
- 1 identities: Unimplemented attack text: If your opponent has any {P} Pokémon in play, this attack does 50 more damage.
- 1 identities: Unimplemented ability text: During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to each of your opponent's Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, you may remove a random Special Condition from your Active Pokémon.
- 1 identities: Unimplemented ability text: If you don't have Regirock, Regice, and Registeel on your Bench, this Pokémon can't attack.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Psych Up attack does +30 damage.
- 1 identities: Unimplemented trainer text: Discard a Pokémon Tool card from a Pokémon (yours or your opponent's), or discard a Stadium card in play.
- 1 identities: Unimplemented trainer text: If the Pokémon this card is attached to is Knocked Out by damage from an attack from your opponent's Pokémon, draw cards until you have 5 cards in your hand.
- 1 identities: Unimplemented trainer text: During your opponent's next turn, all of your Watchog and Stoutland take −100 damage from attacks from your opponent's Pokémon ex.
- 1 identities: Unimplemented trainer text: Put 1 of your {W} Pokémon in play, except any Pokémon ex, into your hand.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may put a random Basic {G} Pokémon from their deck into their hand.
- 1 identities: Unimplemented trainer text: Attacks used by each {F} Pokémon in play (both yours and your opponent's) do +20 damage to the opponent's Active Pokémon ex.
- 1 identities: Unimplemented trainer text: When applying the opponent's Active Pokémon's Weakness to damage from attacks used by Pokémon in play (both yours and your opponent's) that aren't Mega Evolution Pokémon ex, apply Weakness as ×2.
- 1 identities: Unimplemented attack text: Flip 3 coins. If 1 of them is heads, this attack does 20 more damage. If 2 of them are heads, this attack does 50 more damage. If all of them are heads, this attack does 120 more damage.
- 1 identities: Unimplemented attack text: If this is the first time this Pokémon has used an attack after coming into play, this attack does 20 more damage, and your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented attack text: During your next turn, the Defending Pokémon takes +50 damage from attacks.
- 1 identities: Unimplemented attack text: Flip 2 coins. If both of them are heads, discard your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: If this is the first time this Pokémon has used an attack after coming into play, during your opponent's next turn, they can't use any Trainer cards from their hand.
- 1 identities: Unimplemented ability text: Attacks used by your Future Pokémon cost 1 less {C} Energy.
- 1 identities: Unimplemented ability text: During Pokémon Checkup, heal 10 damage from each of your Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon evolved from Sneasel during this turn, this attack does 20 more damage.
- 1 identities: Unimplemented attack text: This attack does 40 more damage for each time your Pokémon have been Knocked Out during this game.
- 1 identities: Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented attack text: Discard an Energy from this Pokémon, and this attack also does 20 damage to each of your opponent's Benched Pokémon.
- 1 identities: Unimplemented attack text: Discard 2 Energy from this Pokémon. During your opponent's next turn, this Pokémon takes −30 damage from attacks.
- 1 identities: Unimplemented attack text: Discard all Energy from this Pokémon. Knock Out your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each type of Energy attached to this Pokémon.
- 1 identities: Unimplemented trainer text: The Ancient Pokémon this card is attached to gets +40 HP.
- 1 identities: Unimplemented trainer text: Attacks used by the Future Pokémon this card is attached to do +20 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Attach 3 different types of Energy from your discard pile to your Ancient Pokémon in any way you like.
- 1 identities: Unimplemented trainer text: Shuffle 1 of your Future Pokémon in play into your deck.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may shuffle a Basic Pokémon from their hand into their deck. If they do, they draw a card.
- 1 identities: Unimplemented ability text: At the end of your opponent's turn, if this Pokémon is in the Active Spot, put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it.
- 1 identities: Unimplemented attack text: This attack does 40 damage for each Pokémon Tool attached to all of your Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon has a Pokémon Tool attached, you may heal 30 damage from 1 of your Pokémon.
- 1 identities: Unimplemented attack text: Choose 2 of your Benched Pokémon. For each of those Pokémon, take a {P} Energy from your Energy Zone and attach it to that Pokémon.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each {P} Energy attached to all of your Pokémon.
- 1 identities: Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have 1 or more of the same type of Energy attached, this attack does 60 more damage.
- 1 identities: Unimplemented attack text: If this Pokémon didn't move from the Bench to the Active Spot this turn, this attack does nothing.
- 1 identities: Unimplemented attack text: 1 of your opponent's Active Pokémon's attacks is chosen at random. During your opponent's next turn, that Pokémon can't use the chosen attack.
- 1 identities: Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. Do 40 damage to this Pokémon instead of the usual amount for this Special Condition.
- 1 identities: Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, this Pokémon takes −80 damage from that attack.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in the Active Spot, your opponent can't play any Stadium cards from their hand.
- 1 identities: Unimplemented attack text: This attack does 20 more damage for each Pokémon in your discard pile.
- 1 identities: Unimplemented trainer text: Return all Pokémon Tools attached to each Pokémon (both yours and your opponent's) to their owner's hand.
- 1 identities: Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Pokémon you find there that have the Puppy Pile attack into your hand. Shuffle the other cards back into your deck.
- 1 identities: Unimplemented trainer text: Choose 1 of your {W} Pokémon in play with a maximum HP of 50 or less. Put a random {W} Pokémon from your deck that evolves from that Pokémon onto that Pokémon to evolve it.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may choose a card in their hand and switch it with a random Pokémon Tool card in their deck.
- 1 identities: Unimplemented ability text: Once during your turn, you may use this Ability. 1 Special Condition from among Burned, Confused, and Poisoned is chosen at random, and your opponent's Active Pokémon is now affected by that Special Condition. Any Special Conditions already affecting that Pokémon will not be chosen.
- 1 identities: Unimplemented attack text: You may discard 1 of your Benched Basic {G} Pokémon. If you do, this attack does 70 more damage.
- 1 identities: Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned and Paralyzed. Shuffle this Pokémon and all attached cards into your deck.
- 1 identities: Unimplemented attack text: If you haven't gotten any points, this attack does 60 more damage.
- 1 identities: Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may heal 20 damage from your Active {G} Pokémon.
- 1 identities: Unimplemented attack text: This attack does damage to your opponent's Active Pokémon equal to this Pokémon's remaining HP.
- 1 identities: Unimplemented attack text: This Pokémon recovers from all Special Conditions.
- 1 identities: Unimplemented attack text: Discard 3 {W} Energy from this Pokémon, and this attack does 50 damage to each of your opponent's Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may prevent all damage from—and effects of—attacks from your opponent's Pokémon done to this Pokémon until the end of your opponent's next turn.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.
- 1 identities: Unimplemented attack text: This attack does 50 more damage for each point your opponent has gotten.
- 1 identities: Unimplemented attack text: This attack does 10 more damage for each Item card in your discard pile.
- 1 identities: Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have the same amount of Energy attached, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: If you have the same number of cards in your hand as your opponent, this attack does 40 more damage.
- 1 identities: Unimplemented attack text: Before doing damage, shuffle all Pokémon Tools from each of your opponent's Pokémon into their deck.
- 1 identities: Unimplemented attack text: During your opponent's next turn, this Pokémon takes +50 damage from attacks.
- 1 identities: Unimplemented attack text: Discard all Energy from this Pokémon. Choose a spot from among your opponent's Active Spot and Bench. At the end of your opponent's next turn, Knock Out the Pokémon in the spot you chose.
- 1 identities: Unimplemented attack text: Draw a card for each Poochyena you have in play.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon has less remaining HP than this Pokémon, this attack does 80 more damage.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Overacceleration attack does +70 damage.
- 1 identities: Unimplemented ability text: This Pokémon may have up to 2 Pokémon Tool cards attached to it.
- 1 identities: Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may attach an Energy from your discard pile to your Active [Dragon] Pokémon.
- 1 identities: Unimplemented attack text: Discard all {R} and {L} Energy from this Pokémon, and this attack does 50 damage for each Energy you discarded in this way.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may look at the top 4 cards of your deck and put all Item cards you find there into your hand. Shuffle the other cards back into your deck.
- 1 identities: Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have 1 or more of the same type of Energy attached, this attack does 30 more damage.
- 1 identities: Unimplemented trainer text: At the end of your turn, if the {D} Pokémon this card is attached to is in the Active Spot, do 10 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: Prevent all effects of attacks used by your opponent's Pokémon done to the Pokémon this card is attached to. (Existing effects are not removed.)
- 1 identities: Unimplemented trainer text: You can use this card only if your Pokémon in the Active Spot has the Psychic attack. Choose 1 of your opponent's Benched Pokémon and move a random Energy from it to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: During this turn, 1 of your opponent's Pokémon is chosen 1 more time for the Draco Meteor attack used by your Pokémon.
- 1 identities: Unimplemented trainer text: Switch your Active Stage 1 Pokémon with 1 of your Benched Pokémon.
- 1 identities: Unimplemented trainer text: Take a {C} Energy from your Energy Zone and attach it to 1 of your Stage 2 Pokémon.
- 1 identities: Unimplemented trainer text: At the end of each player's turn, that player heals 20 damage from each of their Pokémon that has any {W} Energy attached.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may discard the Energy that has been generated in their Energy Zone. If they do, the next Energy is produced.
- 1 identities: Unimplemented attack text: If Volbeat is in your discard pile, this attack does 60 more damage.
- 1 identities: Unimplemented ability text: This Pokémon gets +30 HP for each {G} Energy attached to it.
- 1 identities: Unimplemented attack text: This attack does 50 more damage for each Special Condition affecting your opponent's Active Pokémon.
- 1 identities: Unimplemented attack text: Flip 3 coins. For each heads, produce a {R} Energy from your Energy Zone and attach it to this Pokémon.
- 1 identities: Unimplemented attack text: This attack does 50 more damage for each point your opponent got during their last turn.
- 1 identities: Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 70 damage to the Attacking Pokémon.
- 1 identities: Unimplemented attack text: This attack does 20 damage for each card in your hand.
- 1 identities: Unimplemented attack text: This attack does 10 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost.
- 1 identities: Unimplemented attack text: If your opponent's Active Pokémon is Poisoned, heal 60 damage from this Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may make your opponent's Active Pokémon Poisoned and Burned.
- 1 identities: Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 30 damage for each heads.
- 1 identities: Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost 2 {C} more, and its Retreat Cost is 2 {C} more.
- 1 identities: Unimplemented ability text: Once during your turn, when you flip any coins for an effect of your Trainer cards, you may ignore all results of those coin flips and begin flipping those coins again. You can't use more than 1 Luxury Coin Ability each turn.
- 1 identities: Invalid damage: 140-
- 1 identities: Unimplemented attack text: If this Pokémon has damage on it, this attack does −100 damage.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may move a random Energy from your opponent's Active Pokémon to this Pokémon.
- 1 identities: Unimplemented ability text: Once during your turn, you may look at a random card from your opponent's hand.
- 1 identities: Unimplemented trainer text: Put a random Item card, except any Team Rocket's Thieving Machine, from your opponent's discard pile into your hand.
- 1 identities: Unimplemented trainer text: Until the end of your opponent's next turn, your opponent's Active Pokémon's Retreat Cost is 1 more.
- 1 identities: Unimplemented trainer text: Flip a coin until you get tails. For each heads, put a random Pokémon that has “Team Rocket” in its name from your deck into your hand.
- 1 identities: Unimplemented trainer text: Your opponent's Active Pokémon is now Confused. Flip a coin. If tails, your Active Pokémon is now also Confused.
- 1 identities: Unimplemented trainer text: Look at your opponent's hand and put any number of Basic Pokémon you find there onto your opponent's Bench.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may flip 3 coins. If all of them are heads, that player draws cards until they have 7 cards in their hand.
- 1 identities: Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random. This attack also does 50 damage to it.
- 1 identities: Unimplemented attack text: Reveal all of the Sweet Honey in your hand, and this attack does 50 damage for each card you revealed in this way.
- 1 identities: Unimplemented attack text: Look at a random card from your opponent's hand and shuffle it into their deck.
- 1 identities: Unimplemented ability text: Once during your turn, you may use this Ability. Put a Sweet Honey rental card into your hand.
- 1 identities: Unimplemented ability text: Whenever you attach a {R} Energy from your Energy Zone to this Pokémon, do 30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in play, flip 3 more coins for the Rabbit Jumping attack used by your Pokémon.
- 1 identities: Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 70 more damage.
- 1 identities: Unimplemented attack text: Discard 2 {W} Energy from this Pokémon, and this attack does 60 damage to 2 of your opponent's Pokémon.
- 1 identities: Unimplemented attack text: If your opponent has a Stadium in play, discard it.
- 1 identities: Unimplemented ability text: Once during your turn, when you play this card from your hand to evolve 1 of your Pokémon, you may use this Ability. Put a random Frogadier from your deck onto your Bench.
- 1 identities: Unimplemented attack text: Your opponent's Active Pokémon is now Asleep. Your opponent flips 2 coins for this Special Condition, and if either of them is tails, that Pokémon is still Asleep.
- 1 identities: Unimplemented attack text: Flip 3 coins. Take an amount of {P} Energy from your Energy Zone equal to the number of heads and attach it to your Benched {P} Pokémon in any way you like.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Psycho Boost does −50 damage.
- 1 identities: Unimplemented attack text: Move all Energy from this Pokémon to your Benched Pokémon in any way you like.
- 1 identities: Unimplemented ability text: As long as this Pokémon is in play, all of your {M} Pokémon take −20 damage from attacks from your opponent's Pokémon. This effect doesn't stack.
- 1 identities: Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 250 damage to it.
- 1 identities: Unimplemented attack text: Put 1 random {C} Pokémon from your deck into your hand.
- 1 identities: Unimplemented attack text: Put a random card that evolves from Eevee from your deck into your hand.
- 1 identities: Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +50 damage.
- 1 identities: Unimplemented trainer text: Choose 1 of your Pokémon, and then flip a coin until you get tails. For each heads, heal 20 damage from that Pokémon.
- 1 identities: Unimplemented trainer text: Heal 40 damage from 1 of your Pokémon that has any Energy attached. If you healed any damage in this way, discard a random Energy from that Pokémon.
- 1 identities: Unimplemented trainer text: Switch out your opponent's Active Stage 2 Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.)
- 1 identities: Unimplemented trainer text: The Basic Pokémon this card is attached to takes −20 damage from attacks from your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: Attacks used by the Pikachu ex this card is attached to do +30 damage to your opponent's Active Pokémon.
- 1 identities: Unimplemented trainer text: During this turn, attacks used by your Dewgong, Cloyster, or Lapras do +30 damage to your opponent's Pokémon.
- 1 identities: Unimplemented trainer text: You can use this card only if you have Venusaur, Charizard, Blastoise, or Pidgeot in play.Switch in 1 of your opponent's Benched Pokémon to the Active Spot.
- 1 identities: Unimplemented trainer text: Look at the top 3 cards of your deck and put 1 of them into your hand. Shuffle back into your deck.
- 1 identities: Unimplemented trainer text: Produce 2 {F} Energy from your Energy Zone, and attach it to 1 of your Whiscash or Paldean Clodsire.
- 1 identities: Unimplemented trainer text: Put 2 random cards from among Super Potion, Max Repel, and Full Heal from your deck into your hand.
- 1 identities: Unimplemented trainer text: You can use this card only if you have 3 or more different Pokémon types in play.Switch your Active Pokémon with 1 of your Benched Pokémon.
- 1 identities: Unimplemented trainer text: Once during each player's turn, that player may use this effect. Flip a coin. If heads, draw a card.

## Remaining mechanic-family navigation

Groups can overlap; exact individual blockers remain authoritative.

| Family | Blocked identities |
| --- | ---: |
| Energy distribution/recovery | 140 |
| Timing/prevention/locks | 128 |
| Coin/random selection | 104 |
| Damage/state conditions | 97 |
| Copy/inspection/private-zone selection | 52 |
| Other exact printed clause | 43 |
| Evolution/rule boxes | 35 |
| Tool/Stadium interactions | 22 |

## Every non-FULL gameplay identity

| ID | Card | Status | Exact reason |
| --- | --- | --- | --- |
| A1-020 | Victreebel | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot, once during your turn, you may switch in 1 of your opponent's Benched Basic Pokémon to the Active Spot. |
| A1-047 | Moltres ex | PARTIAL | Unimplemented attack text: Flip 3 coins. Take an amount of {R} Energy from your Energy Zone equal to the number of heads and attach it to your Benched {R} Pokémon in any way you like. |
| A1-057 | Psyduck | PARTIAL | Unimplemented attack text: Your opponent can't use any Supporter cards from their hand during their next turn. |
| A1-069 | Kingler | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 80 more damage. |
| A1-122 | Gengar | PARTIAL | Unimplemented attack text: Your opponent can't use any Supporter cards from their hand during their next turn. |
| A1-123 | Gengar ex | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, your opponent can't use any Supporter cards from their hand. |
| A1-159 | Kabutops | PARTIAL | Unimplemented attack text: Heal from this Pokémon the same amount of damage you did to your opponent's Active Pokémon. |
| A1-163 | Grapploct | PARTIAL | Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| A1-166 | Nidoran♀ | PARTIAL | Unimplemented attack text: Put 1 random Nidoran♂ from your deck onto your Bench. |
| A1-185 | Dragonite | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 4 times. For each time a Pokémon was chosen, do 50 damage to it. |
| A1-188 | Pidgeot | PARTIAL | Unimplemented ability text: Once during your turn, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| A1-197 | Persian | PARTIAL | Unimplemented attack text: Flip a coin. If heads, discard a random card from your opponent's hand. |
| A1-205 | Ditto | PARTIAL | Unimplemented attack text: Choose 1 of your opponent's Pokémon's attacks and use it as this attack. If this Pokémon doesn't have the necessary Energy to use that attack, this attack does nothing. |
| A1-209 | Porygon | PARTIAL | Unimplemented ability text: Once during your turn, you may look at the top card of your deck. |
| A1-210 | Aerodactyl | PARTIAL | Unimplemented attack text: Flip a coin. If heads, your opponent shuffles their Active Pokémon into their deck. |
| A1-220 | Misty | PARTIAL | Unimplemented trainer text: Choose 1 of your {W} Pokémon, and flip a coin until you get tails. For each heads, take a {W} Energy from your Energy Zone and attach it to that Pokémon. |
| A1-221 | Blaine | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Ninetales, Rapidash, or Magmar do +30 damage to your opponent's Active Pokémon. |
| A1-222 | Koga | PARTIAL | Unimplemented trainer text: Put your Muk or Weezing in the Active Spot into your hand. |
| A1-224 | Brock | PARTIAL | Unimplemented trainer text: Take 1 {F} Energy from your Energy Zone and attach it to your Golem or Onix. |
| A1-225 | Sabrina | PARTIAL | Unimplemented trainer text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| A1-226 | Lt. Surge | PARTIAL | Unimplemented trainer text: Move all {L} Energy from your Benched Pokémon to your Raichu, Electrode, or Electabuzz in the Active Spot. |
| A1-283 | Mew | PARTIAL | Unimplemented attack text: Your opponent reveals their hand. |
| P-A-003 | Hand Scope | PARTIAL | Unimplemented trainer text: Your opponent reveals their hand. |
| P-A-004 | Pokédex | PARTIAL | Unimplemented trainer text: Look at the top 3 cards of your deck. |
| P-A-037 | Cresselia ex | PARTIAL | Unimplemented ability text: Whenever you attach a {P} Energy from your Energy Zone to this Pokémon, heal 20 damage from this Pokémon. |
| P-A-042 | Darkrai ex | PARTIAL | Unimplemented ability text: Whenever you attach a {D} Energy from your Energy Zone to this Pokémon, do 20 damage to your opponent's Active Pokémon. |
| P-A-048 | Manaphy | PARTIAL | Unimplemented attack text: Choose 2 of your Benched Pokémon. For each of those Pokémon, take a {W} Energy from your Energy Zone and attach it to that Pokémon. |
| P-A-051 | Cyclizar | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overacceleration attack does +20 damage. |
| P-A-064 | Rayquaza ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 4 times. For each time a Pokémon was chosen, do 40 damage to it. |
| P-A-066 | Mimikyu | PARTIAL | Unimplemented attack text: This attack also does 20 damage to 1 of your Pokémon. |
| P-A-074 | Zeraora | PARTIAL | Unimplemented ability text: At the end of your first turn, take a {L} Energy from your Energy Zone and attach it to this Pokémon. |
| P-A-085 | Vanillite | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage. |
| P-A-086 | Jolteon | PARTIAL | Unimplemented attack text: If this Pokémon evolved during this turn, this attack does 20 more damage. |
| P-A-087 | Alcremie | PARTIAL | Unimplemented attack text: This attack does 40 damage for each time your Pokémon used Sweets Relay during this game. |
| P-A-090 | Togedemaru | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 30 damage to the Attacking Pokémon. |
| P-A-096 | Houndoom | PARTIAL | Unimplemented attack text: Discard a random card from your opponent's hand. |
| A4a-022 | Milotic | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may heal 60 damage from 1 of your {W} Pokémon. |
| A4a-050 | Zoroark | PARTIAL | Unimplemented ability text: If your opponent's Pokémon is Knocked Out by damage from this Pokémon's attacks, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon. |
| A4a-062 | Miltank | PARTIAL | Unimplemented attack text: Until this Pokémon leaves the Active Spot, this Pokémon's Rolling Frenzy attack does +30 damage. This effect stacks. |
| A3b-056 | Eevee ex | PARTIAL | Unimplemented ability text: This Pokémon can evolve into any Pokémon that evolves from Eevee if you play it from your hand onto this Pokémon. (This Pokémon can't evolve during your first turn or the turn you play it.) |
| A3b-035 | Mimikyu | PARTIAL | Unimplemented attack text: Flip a coin. If heads, choose 1 of your opponent's Active Pokémon's attacks and use it as this attack. |
| A1a-003 | Celebi ex | PARTIAL | Unimplemented attack text: Flip a coin for each Energy attached to this Pokémon. This attack does 50 damage for each heads. |
| A1a-006 | Serperior | PARTIAL | Unimplemented ability text: Each {G} Energy attached to your {G} Pokémon provides 2 {G} Energy. This effect doesn't stack. |
| A1a-018 | Gyarados ex | PARTIAL | Unimplemented attack text: Discard a random Energy from among the Energy attached to all Pokémon (both yours and your opponent's). |
| A1a-019 | Vaporeon | PARTIAL | Unimplemented ability text: As often as you like during your turn, you may move a {W} Energy from 1 of your Benched {W} Pokémon to your Active {W} Pokémon. |
| A1a-032 | Mew ex | PARTIAL | Unimplemented attack text: Choose 1 of your opponent's Active Pokémon's attacks and use it as this attack. |
| A1a-046 | Aerodactyl ex | PARTIAL | Unimplemented ability text: Your opponent can't play any Pokémon from their hand to evolve their Active Pokémon. |
| A1a-047 | Marshadow | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage. |
| A1a-049 | Koffing | PARTIAL | Unimplemented attack text: Put 1 random Koffing from your deck onto your Bench. |
| A1a-050 | Weezing | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| A1a-062 | Chatot | PARTIAL | Unimplemented attack text: Shuffle your hand into your deck. Draw a card for each card in your opponent's hand. |
| A1a-064 | Pokémon Flute | PARTIAL | Unimplemented trainer text: Put a Basic Pokémon from your opponent's discard pile onto their Bench. |
| A1a-065 | Mythical Slab | PARTIAL | Unimplemented trainer text: Look at the top card of your deck. If that card is a {P} Pokémon, put it into your hand. If it is not a {P} Pokémon, put it on the bottom of your deck. |
| A1a-066 | Budding Expeditioner | PARTIAL | Unimplemented trainer text: Put your Mew ex in the Active Spot into your hand. |
| A2-017 | Combee | PARTIAL | Unimplemented attack text: Put 1 random Basic Pokémon from your deck onto your Bench. |
| A2-034 | Regice | PARTIAL | Unimplemented ability text: Prevent all effects of attacks used by your opponent's Pokémon done to this Pokémon. |
| A2-065 | Togekiss | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +60 damage. |
| A2-072 | Dusknoir | PARTIAL | Unimplemented ability text: As often as you like during your turn, you may choose 1 of your Pokémon that has damage on it, and move all of its damage to this Pokémon. |
| A2-075 | Uxie | PARTIAL | Unimplemented attack text: Take a {P} Energy from your Energy Zone and attach it to Mesprit or Azelf. |
| A2-076 | Mesprit | PARTIAL | Unimplemented attack text: You can use this attack only if you have Uxie and Azelf on your Bench. Discard all Energy from this Pokémon. |
| A2-078 | Giratina | PARTIAL | Unimplemented ability text: If this Pokémon has any Energy attached, it has no Retreat Cost. |
| A2-089 | Rampardos | PARTIAL | Unimplemented attack text: If your opponent's Pokémon is Knocked Out by damage from this attack, this Pokémon also does 50 damage to itself. |
| A2-104 | Spiritomb | PARTIAL | Unimplemented attack text: This attack does 10 damage to each of your opponent's Pokémon. |
| A2-106 | Drapion | PARTIAL | Unimplemented attack text: Flip 4 coins. This attack does 40 damage for each heads. If at least 2 of them are heads, your opponent's Active Pokémon is now Poisoned. |
| A2-107 | Croagunk | PARTIAL | Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 20 damage for each heads. |
| A2-108 | Toxicroak | PARTIAL | Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 40 damage for each heads. |
| A2-114 | Bastiodon | PARTIAL | Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, this Pokémon takes −100 damage from that attack. |
| A2-123 | Garchomp | PARTIAL | Unimplemented ability text: You must discard a card from your hand in order to use this Ability. Once during your turn, you may draw a card. |
| A2-129 | Porygon-Z | PARTIAL | Unimplemented attack text: Change the type of the next Energy that will be generated for your opponent to 1 of the following at random: {G}, {R}, {W}, {L}, {P}, {F}, {D}, or {M}. |
| A2-132 | Starly | PARTIAL | Unimplemented attack text: Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon. |
| A2-135 | Bidoof | PARTIAL | Unimplemented attack text: Halve your opponent's Active Pokémon's remaining HP, rounded down. |
| A2-140 | Purugly | PARTIAL | Unimplemented attack text: Your opponent reveals their hand. Choose a card you find there and shuffle it into your opponent's deck. |
| A2-142 | Fan Rotom | PARTIAL | Unimplemented attack text: Flip a coin. If heads, put your opponent's Active Pokémon into their hand. |
| A2-146 | Pokémon Communication | PARTIAL | Unimplemented trainer text: Choose a Pokémon in your hand and switch it with a random Pokémon in your deck. |
| A2-148 | Rocky Helmet | PARTIAL | Unimplemented trainer text: If the Pokémon this card is attached to is in the Active Spot and is damaged by an attack from your opponent's Pokémon, do 20 damage to the Attacking Pokémon. |
| A2-149 | Lum Berry | PARTIAL | Unimplemented trainer text: At the end of each turn, if the Pokémon this card is attached to is affected by any Special Conditions, it recovers from all of them, and discard this card. |
| A2-151 | Team Galactic Grunt | PARTIAL | Unimplemented trainer text: Put 1 random Glameow, Stunky, or Croagunk from your deck into your hand. |
| A2-153 | Volkner | PARTIAL | Unimplemented trainer text: Choose 1 of your Electivire or Luxray. Attach 2 {L} Energy from your discard pile to that Pokémon. |
| A2-155 | Mars | PARTIAL | Unimplemented trainer text: Your opponent shuffles their hand into their deck and draws a card for each of their remaining points needed to win. |
| A2a-001 | Heracross | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 70 more damage. |
| A2a-010 | Leafeon ex | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may take a {G} Energy from your Energy Zone and attach it to 1 of your {G} Pokémon. |
| A2a-013 | Heatran | PARTIAL | Unimplemented ability text: If you have Arceus or Arceus ex in play, this Pokémon has no Retreat Cost. |
| A2a-022 | Glaceon ex | PARTIAL | Unimplemented ability text: During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to your opponent's Active Pokémon. |
| A2a-028 | Manectric | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| A2a-031 | Gastly | PARTIAL | Unimplemented attack text: Flip a coin. If heads, your opponent reveals a random card from their hand and shuffles it into their deck. |
| A2a-034 | Unown | PARTIAL | Unimplemented ability text: Once during your turn, you may choose either player. Look at the top card of that player's deck. |
| A2a-035 | Rotom | PARTIAL | Unimplemented ability text: If you have Arceus or Arceus ex in play, this Pokémon has no Retreat Cost. |
| A2a-038 | Donphan | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Rolling Spin attack does +60 damage. |
| A2a-052 | Toxicroak | PARTIAL | Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. Do 20 damage to this Pokémon instead of the usual amount for this Special Condition. |
| A2a-065 | Noctowl | PARTIAL | Unimplemented attack text: Your opponent reveals their hand. |
| A2a-072 | Irida | PARTIAL | Unimplemented trainer text: Heal 40 damage from each of your Pokémon that has any {W} Energy attached. |
| A2a-074 | Barry | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Snorlax, Heracross, and Staraptor cost 2 less {C} Energy. |
| A2b-001 | Weedle | PARTIAL | Unimplemented attack text: Put 1 random Weedle from your deck onto your Bench. |
| A2b-012 | Magmortar | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| A2b-018 | Wiglett | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 30 damage to it. |
| A2b-019 | Wugtrio ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, do 50 damage to it. |
| A2b-021 | Tatsugiri | PARTIAL | Unimplemented ability text: Your Active Dondozo has no Retreat Cost. |
| A2b-031 | Alakazam | PARTIAL | Unimplemented attack text: This attack also does 20 damage to each of your opponent's Benched Pokémon that has any Energy attached. |
| A2b-035 | Giratina ex | PARTIAL | Unimplemented ability text: Once during your turn, you may take a {P} Energy from your Energy Zone and attach it to this Pokémon. If you use this Ability, your turn ends. |
| A2b-057 | Gholdengo | PARTIAL | Unimplemented attack text: Flip a coin for each {M} Energy attached to this Pokémon. This attack does 50 damage for each heads. |
| A2b-070 | Pokémon Center Lady | PARTIAL | Unimplemented trainer text: Heal 30 damage from 1 of your Pokémon, and it recovers from all Special Conditions. |
| A3-015 | Lurantis | PARTIAL | Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon. |
| A3-021 | Wimpod | PARTIAL | Unimplemented ability text: During your first turn, this Pokémon has no Retreat Cost. |
| A3-022 | Golisopod | PARTIAL | Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 60 more damage. |
| A3-027 | Alolan Marowak | PARTIAL | Unimplemented attack text: Flip 2 coins. This attack does 70 damage for each heads. If at least 1 of them is heads, your opponent's Active Pokémon is now Burned. |
| A3-039 | Alolan Sandslash | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 40 damage to the Attacking Pokémon. |
| A3-049 | Crabominable ex | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Insatiable Striking attack does +40 damage. |
| A3-050 | Wishiwashi | PARTIAL | Unimplemented attack text: Put 1 random Wishiwashi or Wishiwashi ex from your deck onto your Bench. |
| A3-054 | Pyukumuku | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 50 damage to the Attacking Pokémon. |
| A3-065 | Vikavolt | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Item cards from their hand. |
| A3-066 | Oricorio | PARTIAL | Unimplemented ability text: Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex. |
| A3-068 | Tapu Koko | PARTIAL | Unimplemented attack text: Switch this Pokémon with 1 of your Benched {L} Pokémon. |
| A3-075 | Banette | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't take any Energy from their Energy Zone to attach to their Active Pokémon. |
| A3-077 | Oricorio | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage. |
| A3-080 | Comfey | PARTIAL | Unimplemented ability text: Each of your Pokémon that has any {P} Energy attached recovers from all Special Conditions and can't be affected by any Special Conditions. |
| A3-084 | Tapu Lele | PARTIAL | Unimplemented attack text: This attack does 20 damage to 1 of your opponent's Pokémon for each Energy attached to that Pokémon. |
| A3-091 | Hariyama | PARTIAL | Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| A3-096 | Conkeldurr | PARTIAL | Unimplemented ability text: If this Pokémon would be Knocked Out by damage from an attack, flip a coin. If heads, this Pokémon is not Knocked Out, and its remaining HP becomes 10. |
| A3-098 | Rockruff | PARTIAL | Unimplemented attack text: Put a random card that evolves from Rockruff from your deck into your hand. |
| A3-101 | Lycanroc | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon has more remaining HP than this Pokémon, this attack does 50 more damage. |
| A3-104 | Passimian ex | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, move all {F} Energy from this Pokémon to 1 of your Benched Pokémon. |
| A3-107 | Alolan Raticate | PARTIAL | Unimplemented attack text: Discard a random Item card from your opponent's hand. |
| A3-111 | Alolan Muk ex | PARTIAL | Unimplemented attack text: 1 Special Condition from among Asleep, Burned, Confused, Paralyzed, and Poisoned is chosen at random, and your opponent's Active Pokémon is now affected by that Special Condition. Any Special Conditions already affecting that Pokémon will not be chosen. |
| A3-127 | Kommo-o | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon takes +30 damage from attacks. |
| A3-130 | Delcatty | PARTIAL | Unimplemented attack text: Take a {C} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon. |
| A3-140 | Oranguru | PARTIAL | Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost 1 {C} more, and its Retreat Cost is 1 {C} more. |
| A3-141 | Komala | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, whenever you attach an Energy from your Energy Zone to it, it is now Asleep. |
| A3-142 | Big Malasada | PARTIAL | Unimplemented trainer text: Heal 10 damage and remove a random Special Condition from your Active Pokémon. |
| A3-144 | Rare Candy | PARTIAL | Unimplemented trainer text: Choose 1 of your Basic Pokémon in play. If you have a Stage 2 card in your hand that evolves from that Pokémon, put that card onto the Basic Pokémon to evolve it, skipping the Stage 1. You can't use this card during your first turn or on a Basic Pokémon that was put into play this turn. |
| A3-145 | Rotom Dex | PARTIAL | Unimplemented trainer text: Look at the top card of your deck. Then, you may shuffle your deck. |
| A3-146 | Poison Barb | PARTIAL | Unimplemented trainer text: If the Pokémon this card is attached to is your Active Pokémon and is damaged by an attack from your opponent's Pokémon, the Attacking Pokémon is now Poisoned. |
| A3-148 | Acerola | PARTIAL | Unimplemented trainer text: Choose 1 of your Palossand or Mimikyu that has damage on it, and move 40 of its damage to your opponent's Active Pokémon. |
| A3-149 | Ilima | PARTIAL | Unimplemented trainer text: Put 1 of your {C} Pokémon that has damage on it into your hand. |
| A3-150 | Kiawe | PARTIAL | Unimplemented trainer text: Choose 1 of your Alolan Marowak or Turtonator. Take 2 {R} Energy from your Energy Zone and attach it to that Pokémon. Your turn ends. |
| A3-151 | Guzma | PARTIAL | Unimplemented trainer text: Discard all Pokémon Tool cards attached to each of your opponent's Pokémon. |
| A3-152 | Lana | PARTIAL | Unimplemented trainer text: You can use this card only if you have Araquanid in play. Switch in 1 of your opponent's Benched Pokémon to the Active Spot. |
| A3-153 | Sophocles | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Alolan Golem, Vikavolt, or Togedemaru do +30 damage to your opponent's Active Pokémon. |
| A3-154 | Mallow | PARTIAL | Unimplemented trainer text: Heal all damage from 1 of your Shiinotic or Tsareena. If you do, discard all Energy from that Pokémon. |
| A3a-015 | Luxray | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon do −20 damage. |
| A3a-031 | Claydol | PARTIAL | Unimplemented ability text: Pokémon (both yours and your opponent's) can't be healed. |
| A3a-037 | Alolan Meowth | PARTIAL | Unimplemented attack text: Discard a random Pokémon Tool card from your opponent's hand. |
| A3a-041 | Krookodile | PARTIAL | Unimplemented attack text: Flip 3 coins. For each heads, a card is chosen at random from your opponent's hand. Your opponent reveals that card and shuffles it into their deck. |
| A3a-042 | Nihilego | PARTIAL | Unimplemented ability text: Your opponent's Active Pokémon takes +10 damage from being Poisoned. |
| A3a-056 | Stoutland | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon cost 1 {C} more. |
| A3a-058 | Bewear | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, your opponent's Active Pokémon is Knocked Out. |
| A3a-062 | Celesteela | PARTIAL | Unimplemented ability text: Once during your turn, you may switch your Active Ultra Beast with 1 of your Benched Ultra Beasts. |
| A3a-063 | Beast Wall | PARTIAL | Unimplemented trainer text: You can use this card only if your opponent hasn't gotten any points. During your opponent's next turn, all of your Ultra Beasts take −20 damage from attacks from your opponent's Pokémon. |
| A3a-064 | Repel | PARTIAL | Unimplemented trainer text: Switch out your opponent's Active Basic Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| A3a-065 | Electrical Cord | PARTIAL | Unimplemented trainer text: If the {L} Pokémon this card is attached to is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, move 2 {L} Energy from that Pokémon and attach 1 Energy each to 2 of your Benched Pokémon. |
| A3a-066 | Beastite | PARTIAL | Unimplemented trainer text: Attacks used by the Ultra Beast this card is attached to do +10 damage to your opponent's Active Pokémon for each point you have gotten. |
| A3a-067 | Gladion | PARTIAL | Unimplemented trainer text: Put 1 random Type: Null or Silvally from your deck into your hand. |
| A3a-068 | Looker | PARTIAL | Unimplemented trainer text: Your opponent reveals all of the Supporter cards in their deck. |
| A3a-069 | Lusamine | PARTIAL | Unimplemented trainer text: You can use this card only if your opponent has gotten at least 1 point. Choose 1 of your Ultra Beasts. Attach 2 random Energy from your discard pile to that Pokémon. |
| A3b-005 | Tsareena | PARTIAL | Unimplemented attack text: Your opponent reveals a random card from their hand and shuffles it into their deck. |
| A3b-007 | Appletun | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 30 more damage. |
| A3b-009 | Flareon ex | PARTIAL | Unimplemented ability text: Once during your turn, you may attach a {R} Energy from your discard pile to this Pokémon. If you do, do 20 damage to this Pokémon. |
| A3b-019 | Vanillish | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage. |
| A3b-027 | Galvantula | PARTIAL | Unimplemented attack text: Discard all Energy attached to this Pokémon. Your opponent's Active Pokémon is now Paralyzed. |
| A3b-031 | Swirlix | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage. |
| A3b-032 | Slurpuff | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 60 more damage. |
| A3b-034 | Sylveon ex | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may draw 2 cards. |
| A3b-036 | Milcery | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage. |
| A3b-043 | Umbreon | PARTIAL | Unimplemented attack text: If the Defending Pokémon is a Basic Pokémon, it can't attack during your opponent's next turn. |
| A3b-045 | Purrloin | PARTIAL | Unimplemented attack text: Discard all Pokémon Tools from your opponent's Active Pokémon. |
| A3b-054 | Drampa | PARTIAL | Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, your opponent's Active Pokémon is now Paralyzed. |
| A3b-066 | Eevee Bag | PARTIAL | Unimplemented trainer text: Choose 1: During this turn, attacks used by your Pokémon that evolve from Eevee do +10 damage to your opponent's Active Pokémon. Heal 20 damage from each of your Pokémon that evolves from Eevee. |
| A3b-067 | Leftovers | PARTIAL | Unimplemented trainer text: At the end of your turn, if the Pokémon this card is attached to is in the Active Spot, heal 10 damage from that Pokémon. |
| A3b-068 | Hau | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Decidueye ex, Incineroar ex, or Primarina ex do +30 damage to your opponent's Active Pokémon. |
| A3b-069 | Penny | PARTIAL | Unimplemented trainer text: Look at a random Supporter card that's not Penny from your opponent's deck and shuffle it back into their deck. Use the effect of that card as the effect of this card. |
| A4-003 | Bellossom | PARTIAL | Unimplemented attack text: Flip 3 coins. This attack does 60 damage for each heads. This Pokémon is now Confused. |
| A4-005 | Tangrowth | PARTIAL | Unimplemented attack text: This attack does 40 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost. |
| A4-015 | Jumpluff | PARTIAL | Unimplemented ability text: Your Active Pokémon has no Retreat Cost. |
| A4-023 | Cherubi | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 20 more damage.; Unimplemented ability text: If this Pokémon has a Pokémon Tool attached, attacks used by this Pokémon cost 1 less {G} Energy. |
| A4-031 | Magcargo | PARTIAL | Unimplemented attack text: 1 other Pokémon (either yours or your opponent's) is chosen at random 3 times. For each time a Pokémon was chosen, do 50 damage to it. |
| A4-032 | Magby | PARTIAL | Unimplemented attack text: Take a {R} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon. |
| A4-034 | Ho-Oh ex | PARTIAL | Unimplemented attack text: Take a {R}, {W}, and {L} Energy from your Energy Zone and attach them to your Benched Basic Pokémon in any way you like. |
| A4-040 | Politoed | PARTIAL | Unimplemented ability text: As long as this Pokémon is on your Bench, attacks used by your Pokémon that evolve from Poliwhirl do +40 damage to your opponent's Active Pokémon. |
| A4-045 | Gyarados | PARTIAL | Unimplemented attack text: You may discard any number of your Benched {W} Pokémon. This attack does 40 more damage for each Benched Pokémon you discarded in this way. |
| A4-056 | Octillery | PARTIAL | Unimplemented attack text: If the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. This effect lasts until the Defending Pokémon leaves the Active Spot, and it doesn't stack. |
| A4-061 | Crawdaunt | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may discard a random Energy from your opponent's Active Pokémon. |
| A4-066 | Pichu | PARTIAL | Unimplemented attack text: Take a {L} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon. |
| A4-075 | Smoochum | PARTIAL | Unimplemented attack text: This attack does 20 damage for each Energy attached to your opponent's Active Pokémon. |
| A4-080 | Togekiss | PARTIAL | Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, prevent that damage. |
| A4-082 | Xatu | PARTIAL | Unimplemented attack text: Flip a coin. If heads, your opponent's Active Pokémon's remaining HP is now 10. |
| A4-084 | Unown | PARTIAL | Unimplemented ability text: This Ability works if you have any Unown in play with an Ability other than . All of your Pokémon take −10 damage from attacks from your opponent's Pokémon. |
| A4-085 | Unown | PARTIAL | Unimplemented ability text: This Ability works if you have any Unown in play with an Ability other than . Attacks used by your Pokémon do +10 damage to your opponent's Active Pokémon. |
| A4-086 | Wobbuffet | PARTIAL | Unimplemented attack text: If this Pokémon was damaged by an attack during your opponent's last turn while it was in the Active Spot, this attack does 50 more damage. |
| A4-113 | Murkrow | PARTIAL | Unimplemented attack text: Flip a coin. If heads, your opponent reveals a random card from their hand and shuffles it into their deck. |
| A4-119 | Tyranitar | PARTIAL | Unimplemented ability text: Once during your turn, you may move all {D} Energy from each of your Pokémon to this Pokémon. |
| A4-123 | Scizor | PARTIAL | Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 50 more damage. |
| A4-128 | Klinklang | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Gear Spinner attack does +70 damage. |
| A4-136 | Porygon2 | PARTIAL | Unimplemented ability text: Whenever you attach an Energy from your Energy Zone to this Pokémon, put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it. |
| A4-140 | Hoothoot | PARTIAL | Unimplemented ability text: This Pokémon can't be Asleep. |
| A4-141 | Noctowl | PARTIAL | Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon. |
| A4-142 | Aipom | PARTIAL | Unimplemented attack text: Draw cards until you have the same number of cards in your hand as your opponent. |
| A4-148 | Smeargle | PARTIAL | Unimplemented attack text: Change the type of a random Energy attached to your opponent's Active Pokémon to 1 of the following at random: {G}, {R}, {W}, {L}, {P}, {F}, {D}, or {M}. |
| A4-151 | Elemental Switch | PARTIAL | Unimplemented trainer text: Move a {R}, {W}, or {L} Energy from 1 of your Benched Pokémon to your Active Pokémon. |
| A4-153 | Steel Apron | PARTIAL | Unimplemented trainer text: The {M} Pokémon this card is attached to takes −10 damage from attacks from your opponent's Pokémon, recovers from all Special Conditions, and can't be affected by any Special Conditions. |
| A4-154 | Dark Pendant | PARTIAL | Unimplemented trainer text: If the {D} Pokémon this card is attached to is in the Active Spot and is damaged by an attack from your opponent's Pokémon, your opponent reveals a random card from their hand and shuffles it into their deck. |
| A4-155 | Rescue Scarf | PARTIAL | Unimplemented trainer text: If the Pokémon this card is attached to is Knocked Out by damage from an attack from your opponent's Pokémon, put it into your hand instead of the discard pile. |
| A4-156 | Will | PARTIAL | Unimplemented trainer text: The next time you flip any number of coins for the effect of an attack, Ability, or Trainer card after using this card on this turn, the first coin flip will definitely be heads. |
| A4-157 | Lyra | PARTIAL | Unimplemented trainer text: Switch your Active Pokémon that has damage on it with 1 of your Benched Pokémon. |
| A4-158 | Silver | PARTIAL | Unimplemented trainer text: Your opponent reveals their hand. Choose a Supporter card you find there and shuffle it into your opponent's deck. |
| A4-159 | Fisher | PARTIAL | Unimplemented trainer text: Flip 3 coins. For each heads, a {W} Pokémon is chosen at random from your discard pile and put into your hand. |
| A4-161 | Hiker | PARTIAL | Unimplemented trainer text: For each of your {F} Pokémon in play, look at that many cards from the top of your deck and put them back in any order. |
| A4a-003 | Jumpluff ex | PARTIAL | Unimplemented attack text: You may switch this Pokémon with 1 of your Benched Pokémon. |
| A4a-006 | Celebi | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon is an evolved Pokémon, devolve it by putting the highest Stage Evolution card on it into your opponent's hand. |
| A4a-013 | Poliwag | PARTIAL | Unimplemented attack text: Put 1 random Poliwag from your deck onto your Bench. |
| A4a-018 | Slowking | PARTIAL | Unimplemented attack text: Discard up to 2 Pokémon Tool cards from your hand. This attack does 50 damage for each card you discarded in this way. |
| A4a-023 | Mantyke | PARTIAL | Unimplemented attack text: Take a {W} Energy from your Energy Zone and attach it to 1 of your Benched Basic Pokémon. |
| A4a-031 | Boltund | PARTIAL | Unimplemented attack text: If this Pokémon has damage on it, this attack can be used for 1 {L} Energy. |
| A4a-032 | Misdreavus | PARTIAL | Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may have your opponent reveal their hand. |
| A4a-033 | Mismagius | PARTIAL | Unimplemented attack text: At the end of your opponent's next turn, do 90 damage to the Defending Pokémon. |
| A4a-035 | Galarian Cursola | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, flip a coin. If heads, the Attacking Pokémon is Knocked Out. |
| A4a-037 | Latios | PARTIAL | Unimplemented ability text: If you have Latias in play, this Pokémon has no Retreat Cost. |
| A4a-041 | Dugtrio | PARTIAL | Unimplemented attack text: Discard the top card of your deck. If that card is a {F} Pokémon, this attack does 60 more damage. |
| A4a-042 | Poliwrath ex | PARTIAL | Unimplemented attack text: If this Pokémon has any {W} Energy attached, this attack does 40 more damage. |
| A4a-048 | Seviper | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon is Zangoose, this attack does 40 more damage. |
| A4a-052 | Malamar | PARTIAL | Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon. |
| A4a-055 | Altaria | PARTIAL | Unimplemented attack text: If this Pokémon has 2 or more different types of Energy attached, this attack does 60 more damage. |
| A4a-068 | Memory Light | PARTIAL | Unimplemented trainer text: The Pokémon this card is attached to can use any attack from its previous Evolutions. (You still need the necessary Energy to use each attack.) |
| A4a-069 | Whitney | PARTIAL | Unimplemented trainer text: Heal 60 damage from 1 of your Miltank, and it recovers from being Asleep, Paralyzed, and Confused. |
| A4a-070 | Traveling Merchant | PARTIAL | Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Pokémon Tool cards you find there into your hand. Shuffle the other cards back into your deck. |
| A4a-071 | Morty | PARTIAL | Unimplemented trainer text: For each of your {P} Pokémon in play, look at that many cards from the top of your opponent's deck and put them back in any order. |
| B1-004 | Silcoon | PARTIAL | Unimplemented attack text: During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 40 or less. |
| B1-006 | Cascoon | PARTIAL | Unimplemented attack text: During your opponent's next turn, prevent all damage done to this Pokémon by attacks if that damage is 40 or less. |
| B1-007 | Dustox | PARTIAL | Unimplemented attack text: Choose either Poisoned or Confused. Your opponent's Active Pokémon is now affected by that Special Condition. |
| B1-010 | Shiftry | PARTIAL | Unimplemented attack text: Discard a random card from your opponent's hand. |
| B1-016 | Whimsicott ex | PARTIAL | Unimplemented attack text: This attack does 30 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost. |
| B1-036 | Mega Blaziken ex | PARTIAL | Unimplemented attack text: Discard Fire{R} Energy from this Pokémon. Your opponent's Active Pokémon is now Burned. |
| B1-047 | Turtonator | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 20 damage to the Attacking Pokémon. |
| B1-050 | Magikarp | PARTIAL | Unimplemented attack text: Put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it. |
| B1-055 | Ludicolo | PARTIAL | Unimplemented attack text: If you have exactly 1, 3, or 5 cards in your hand, this attack does 60 more damage. |
| B1-060 | Luvdisc | PARTIAL | Unimplemented attack text: If you have exactly 2, 4, or 6 cards in your hand, this attack does 30 more damage. |
| B1-067 | Carracosta | PARTIAL | Unimplemented attack text: Prevent all damage done to this Pokémon by attacks from Basic Pokémon during your opponent's next turn. |
| B1-069 | Jellicent | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, take a {W} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon. |
| B1-073 | Greninja ex | PARTIAL | Unimplemented ability text: Once during your turn, you may switch your Active {W} Pokémon with 1 of your Benched Pokémon. |
| B1-081 | Jolteon ex | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, whenever your opponent attaches an Energy from their Energy Zone to 1 of their Pokémon, do 20 damage to that Pokémon. |
| B1-084 | Ampharos | PARTIAL | Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random. This attack also does 20 damage to it. |
| B1-085 | Mega Ampharos ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, also do 20 damage to it. |
| B1-095 | Yamper | PARTIAL | Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B1-101 | Sableye | PARTIAL | Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing. |
| B1-105 | Dusknoir | PARTIAL | Unimplemented ability text: When this Pokémon is Knocked Out, flip a coin. If heads, your opponent can't get any points for it. |
| B1-109 | Chingling | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Item cards from their hand. |
| B1-111 | Cofagrigus | PARTIAL | Unimplemented attack text: Discard 2 cards from your hand. If you can't discard 2 cards, this attack does nothing. |
| B1-114 | Gothitelle | PARTIAL | Unimplemented attack text: During your opponent's next turn, if they attach Energy from their Energy Zone to the Defending Pokémon, that Pokémon will be Asleep. |
| B1-120 | Klefki | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may discard all Pokémon Tools from your opponent's Active Pokémon. If you do, discard this Pokémon. |
| B1-124 | Hitmonchan ex | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by Weakness. |
| B1-127 | Hariyama | PARTIAL | Unimplemented attack text: Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon. |
| B1-134 | Archeops | PARTIAL | Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon. During your next turn, this Pokémon's Wild Spin attack does +20 damage to each of your opponent's Pokémon. |
| B1-136 | Golurk | PARTIAL | Unimplemented attack text: Reveal the top 3 cards of your deck. This attack does 60 damage for each Pokémon with a Retreat Cost of 3 or more you find there. Shuffle the revealed cards back into your deck. |
| B1-140 | Crabominable | PARTIAL | Unimplemented attack text: If this Pokémon's remaining HP is 30 or less, this attack does 60 more damage. |
| B1-143 | Sandygast | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| B1-149 | Honchkrow | PARTIAL | Unimplemented attack text: This attack does 40 more damage for each of your opponent's Pokémon in play that has an Ability. |
| B1-150 | Absol | PARTIAL | Unimplemented attack text: Flip a coin. If heads, your opponent reveals their hand. Choose a Supporter card you find there and discard it. |
| B1-151 | Mega Absol ex | PARTIAL | Unimplemented attack text: Your opponent reveals their hand. Choose a Supporter card you find there and discard it. |
| B1-157 | Hydreigon | PARTIAL | Unimplemented ability text: Once during your turn, you may take 2 {D} Energy from your Energy Zone and attach it to this Pokémon. If you do, do 30 damage to this Pokémon. |
| B1-158 | Pangoro | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +30 damage. |
| B1-160 | Dragalge ex | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, the Attacking Pokémon is now Poisoned. |
| B1-164 | Morgrem | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by any effects on your opponent's Active Pokémon. |
| B1-176 | Druddigon | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are tails, this attack does nothing. |
| B1-177 | Goomy | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, attacks used by your opponent's Active Pokémon cost 1 {C} more. |
| B1-182 | Pidgeot | PARTIAL | Unimplemented attack text: Flip 2 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If both of them are tails, this attack does nothing. |
| B1-184 | Eevee | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, it can evolve during your first turn or the turn you play it. |
| B1-186 | Ambipom | PARTIAL | Unimplemented attack text: Flip 2 coins. This attack does 30 damage for each heads. If this Pokémon has Lucky Mittens attached, flip 4 coins instead. |
| B1-192 | Exploud | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Item cards from their hand. |
| B1-194 | Delcatty | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may put a Supporter card from your discard pile into your hand. |
| B1-213 | Prank Spinner | PARTIAL | Unimplemented trainer text: A card from among both player's hands is chosen at random, revealed to the other player, and shuffled into its owner's deck. |
| B1-215 | Hitting Hammer | PARTIAL | Unimplemented trainer text: Flip 2 coins. If both of them are heads, discard a random Energy from your opponent's Active Pokémon. |
| B1-217 | Flame Patch | PARTIAL | Unimplemented trainer text: Attach a {R} Energy from your discard pile to your Active {R} Pokémon. |
| B1-218 | Sitrus Berry | PARTIAL | Unimplemented trainer text: At the end of each turn, if the Pokémon this card is attached to has half of its maximum HP or less remaining, heal 30 damage from it. If you do, discard this card. |
| B1-219 | Heavy Helmet | PARTIAL | Unimplemented trainer text: If the Pokémon this card is attached to has a Retreat Cost of 3 or more, it takes −20 damage from attacks from your opponent's Pokémon. |
| B1-220 | Lucky Mittens | PARTIAL | Unimplemented trainer text: Whenever your opponent's Pokémon is Knocked Out by damage from an attack used by the Pokémon this card is attached to, draw a card. |
| B1-221 | Marlon | PARTIAL | Unimplemented trainer text: Heal 70 damage from 1 of your Carracosta or Jellicent. |
| B1-222 | Hala | PARTIAL | Unimplemented trainer text: During your opponent's next turn, if your Hariyama or Crabominable would be Knocked Out by damage from an attack, it is not Knocked Out and its remaining HP becomes 10. |
| B1-223 | May | PARTIAL | Unimplemented trainer text: Put 2 random Pokémon from your deck into your hand. For each Pokémon you put into your hand in this way, choose a Pokémon to shuffle from your hand into your deck. |
| B1-224 | Fantina | PARTIAL | Unimplemented trainer text: Take a {P} Energy from your Energy Zone and attach it to each of your Drifblim and Mismagius. |
| B1-225 | Copycat | PARTIAL | Unimplemented trainer text: Shuffle your hand into your deck. Draw a card for each card in your opponent's hand. |
| B1-226 | Lisia | PARTIAL | Unimplemented trainer text: Put 2 random Basic Pokémon with 50 HP or less from your deck into your hand. |
| P-B-006 | Mega Pidgeot ex | PARTIAL | Unimplemented attack text: Flip 3 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If all of them are tails, this attack does nothing. |
| B1a-055 | Ditto | PARTIAL | Unimplemented attack text: Choose 1 of your Benched Pokémon's attacks, except any Pokémon ex, and use it as this attack. If this Pokémon doesn't have the necessary Energy to use that attack, this attack does nothing. |
| P-B-014 | Magikarp | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 20 more damage. |
| B1a-012 | Charmeleon | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may take a {R} Energy from your Energy Zone and attach it to your Active {R} Pokémon. |
| P-B-029 | Mega Medicham ex | PARTIAL | Unimplemented attack text: If this Pokémon has any {P} Energy attached, this attack does 40 more damage. This attack's damage isn't affected by any effects on your opponent's Active Pokémon. |
| B2a-022 | Quaxly | PARTIAL | Unimplemented attack text: Flip a coin. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon. |
| B2a-033 | Tatsugiri | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage. |
| B2a-037 | Chien-Pao ex | PARTIAL | Unimplemented attack text: Discard all Water Energy from this Pokémon. This attack does 130 damage to 1 of your opponent's Pokémon. |
| P-B-049 | Victini | PARTIAL | Unimplemented ability text: Once during your turn, after you flip any coins for an attack of 1 of your {R} Pokémon, you may ignore all results of those coin flips and begin flipping those coins again. You can't use more than 1 Victory Star Ability each turn. |
| B2-070 | Meloetta | PARTIAL | Unimplemented ability text: At the beginning of your turn, if this Pokémon is in the Active Spot, put a random {P} Pokémon from your deck into your hand. |
| P-B-060 | Zarude | PARTIAL | Unimplemented attack text: If any of your {D} Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 80 more damage. |
| B2a-003 | Meowscarada ex | PARTIAL | Unimplemented attack text: Choose a spot from among your opponent's Active Spot and Bench. At the end of your opponent's next turn, do 70 damage to the Pokémon in the spot you chose. |
| P-B-066 | Ceruledge ex | PARTIAL | Unimplemented attack text: Discard a random Energy from among the Energy attached to all Pokémon (both yours and your opponent's). |
| P-B-067 | Pawniard | PARTIAL | Unimplemented attack text: Put 1 random Basic Pokémon from your deck onto your Bench. |
| P-B-068 | Dudunsparce | PARTIAL | Unimplemented attack text: If this Pokémon evolved from Dunsparce during this turn, discard 2 random Energy from your opponent's Active Pokémon. |
| P-B-070 | Sableye | PARTIAL | Unimplemented attack text: Take a random Energy from among {G}, {R}, {W}, {L}, {P}, {F}, {D}, and {M} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon. |
| P-B-073 | Froslass | PARTIAL | Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing. |
| P-B-077 | Growlithe | PARTIAL | Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way. |
| P-B-078 | Emolga | PARTIAL | Unimplemented attack text: This attack does 30 damage for each Pokémon Tool attached to all of your Pokémon. |
| P-B-079 | Celebi | PARTIAL | Unimplemented ability text: Each of your evolved Pokémon can use any attack from its previous Evolutions. (You still need the necessary Energy to use each attack.) |
| P-B-083 | Noivern | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random 3 times. For each time a Pokémon was chosen, do 60 damage to it. |
| P-B-085 | Pachirisu | PARTIAL | Unimplemented attack text: Discard the top card of your deck, and if that card is an Item, this attack does 20 more damage. |
| P-B-086 | Beldum | PARTIAL | Unimplemented ability text: If you have another Beldum in play, this Pokémon's Retreat Cost is 2 less. |
| P-B-089 | Team Rocket's Lapras | PARTIAL | Unimplemented attack text: If this Pokémon has more Energy attached than your opponent's Active Pokémon, this attack does 40 more damage. |
| P-B-091 | Team Rocket's Wobbuffet | PARTIAL | Unimplemented attack text: Reveal the top 6 cards of your deck. This attack does 30 damage for each Pokémon you find there that has “Team Rocket” in its name. Shuffle the revealed cards back into your deck. |
| P-B-092 | Marowak | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon has “Team Rocket” in its name, this attack does 70 more damage. |
| P-B-095 | Darkrai | PARTIAL | Unimplemented ability text: At the end of each turn, if your opponent's Active Pokémon is Asleep, do 20 damage to that Pokémon. |
| B2-092 | Falinks | PARTIAL | Unimplemented ability text: If you have another Falinks in play, this Pokémon's attacks do +20 damage to your opponent's Active Pokémon, and this Pokémon takes −20 damage from attacks from your opponent's Pokémon. |
| P-B-100 | Delcatty | PARTIAL | Unimplemented attack text: You may move any amount of Energy from your Pokémon in play to your other Pokémon in any way you like. |
| B1a-006 | Ariados | PARTIAL | Unimplemented ability text: Your opponent's Active Pokémon's Retreat Cost is 1 more. |
| B1a-008 | Sunflora | PARTIAL | Unimplemented attack text: If Quick-Grow Extract is in your discard pile, this attack does 30 more damage. |
| B1a-015 | Houndour | PARTIAL | Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B1a-018 | Wartortle | PARTIAL | Unimplemented ability text: As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks. |
| B1a-019 | Blastoise | PARTIAL | Unimplemented attack text: If this Pokémon has at least 2 extra {W} Energy attached, this attack also does 50 damage to 1 of your opponent's Benched Pokémon. |
| B1a-020 | Mega Blastoise ex | PARTIAL | Unimplemented attack text: If this Pokémon has at least 3 extra {W} Energy attached, this attack also does 50 damage to 2 of your opponent's Benched Pokémon. |
| B1a-021 | Basculin | PARTIAL | Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 40 more damage. |
| B1a-023 | Clawitzer | PARTIAL | Unimplemented attack text: This attack does 20 damage to each of your opponent's Pokémon. |
| B1a-026 | Magnezone | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| B1a-034 | Reuniclus | PARTIAL | Unimplemented ability text: This Pokémon gets +30 HP for each {P} Energy attached to it. |
| B1a-037 | Xerneas | PARTIAL | Unimplemented attack text: This attack's damage is reduced by the amount of damage this Pokémon has on it. |
| B1a-042 | Mega Lopunny ex | PARTIAL | Unimplemented attack text: Flip 2 coins. This attack does 90 damage for each heads. Your opponent's Active Pokémon is now Confused. |
| B1a-048 | Liepard | PARTIAL | Unimplemented attack text: Your opponent reveals a random card from their hand and shuffles it into their deck. Shuffle this Pokémon into your deck. |
| B1a-051 | Steelix | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon has no Weakness. |
| B1a-052 | Mega Steelix ex | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon takes damage from attacks and has no Weakness. |
| B1a-058 | Porygon-Z | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each Trainer card in your opponent's deck. |
| B1a-059 | Starly | PARTIAL | Unimplemented attack text: Put 1 random Starly from your deck onto your Bench. |
| B1a-064 | Bouffalant | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 40 more damage. |
| B1a-066 | Clemont's Backpack | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Magneton or Heliolisk do +20 damage to your opponent's Pokémon. |
| B1a-067 | Quick-Grow Extract | PARTIAL | Unimplemented trainer text: Choose 1 of your {G} Pokémon in play. Put a random {G} Pokémon from your deck that evolves from that Pokémon onto that Pokémon to evolve it. You can't use this card during your first turn or on a Pokémon that was put into play this turn. |
| B1a-068 | Clemont | PARTIAL | Unimplemented trainer text: Put 2 random cards from among Magneton, Heliolisk, and Clemont's Backpack from your deck into your hand. |
| B1a-069 | Serena | PARTIAL | Unimplemented trainer text: Put a random Mega Evolution Pokémon ex from your deck into your hand. |
| B2-002 | Ledian | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by Weakness or by any effects on your opponent's Active Pokémon. |
| B2-005 | Roserade | PARTIAL | Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. During your opponent's next turn, that Pokémon can't retreat. |
| B2-010 | Chesnaught | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 80 damage to the Attacking Pokémon. |
| B2-012 | Spewpa | PARTIAL | Unimplemented attack text: Put a random card that evolves from Spewpa from your deck into your hand. |
| B2-014 | Buzzwole | PARTIAL | Unimplemented attack text: If your opponent has gotten exactly 1 points, this attack does 40 more damage. |
| B2-016 | Eldegoss | PARTIAL | Unimplemented attack text: You may shuffle this Pokémon and all attached cards into your deck. |
| B2-017 | Teal Mask Ogerpon ex | PARTIAL | Unimplemented attack text: If the amount of Energy attached to both Active Pokémon is 5 or more, this attack does 60 more damage.; Unimplemented ability text: Each of your Pokémon that has any Energy attached recovers from all Special Conditions and can't be affected by any Special Conditions. |
| B2-022 | Oricorio | PARTIAL | Unimplemented attack text: During your next turn, attacks used by your Pokémon do +20 damage to your opponent's Active Pokémon. |
| B2-029 | Alolan Ninetales ex | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't take any Energy from their Energy Zone to attach to their Active Pokémon. |
| B2-032 | Delibird | PARTIAL | Unimplemented attack text: Flip a coin. If heads, this attack does 70 damage to your opponent's Active Pokémon. If tails, heal 30 damage from your opponent's Active Pokémon. |
| B2-035 | Swampert | PARTIAL | Unimplemented attack text: Discard a random Energy from among the Energy attached to all Pokémon (both yours and your opponent's). |
| B2-036 | Mega Swampert ex | PARTIAL | Unimplemented attack text: Discard 2 random Energy from among the Energy attached to all Pokémon (both yours and your opponent's). |
| B2-039 | Vanilluxe | PARTIAL | Unimplemented attack text: If 1 of your Pokémon used Sweets Relay during your last turn, this attack does 60 more damage. |
| B2-040 | Cryogonal | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Item cards from their hand. |
| B2-042 | Aurorus | PARTIAL | Unimplemented attack text: Discard Water2 {W} Energy from this Pokémon. Your opponent's Active Pokémon is now Paralyzed. |
| B2-050 | Alolan Raichu | PARTIAL | Unimplemented ability text: If a Stadium is in play, this Pokémon has no Retreat Cost. |
| B2-051 | Zapdos | PARTIAL | Unimplemented attack text: 1 other Pokémon (either yours or your opponent's) is chosen at random 1 time. Do 100 damage to the chosen Pokémon. |
| B2-059 | Galarian Rapidash | PARTIAL | Unimplemented attack text: If you have 5 or more {P} Energy in play, this attack does 60 more damage. |
| B2-066 | Mega Gardevoir ex | PARTIAL | Unimplemented attack text: Take 3 {P} Energy from your Energy Zone and attach it to your {P} Pokémon in any way you like. |
| B2-069 | Chandelure | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each Supporter card in your discard pile. |
| B2-072 | Gourgeist | PARTIAL | Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing. |
| B2-073 | Mimikyu ex | PARTIAL | Unimplemented ability text: When this Pokémon is first damaged by an attack after coming into play, prevent that damage. |
| B2-075 | Polteageist | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may have your opponent shuffle their hand into their deck. For each remaining point that your opponent needs to win, they draw a card. |
| B2-079 | Machop | PARTIAL | Unimplemented attack text: Discard a Stadium in play. |
| B2-084 | Medicham | PARTIAL | Unimplemented attack text: If this Pokémon has any {P} Energy attached, this attack does 50 more damage. |
| B2-090 | Tyrantrum | PARTIAL | Unimplemented attack text: If you have fewer Pokémon in play than your opponent, this attack does 80 more damage. |
| B2-097 | Alolan Muk | PARTIAL | Unimplemented ability text: Basic Pokémon in play (both yours and your opponent's) have no Abilities. |
| B2-102 | Skuntank | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| B2-103 | Spiritomb | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 10 damage to each of your opponent's Pokémon. |
| B2-104 | Purrloin | PARTIAL | Unimplemented attack text: Flip a coin. If heads, look at a random card from your opponent's hand and shuffle it into their deck. |
| B2-107 | Scrafty | PARTIAL | Unimplemented attack text: If this Pokémon has more Energy attached than your opponent's Active Pokémon, this attack does 50 more damage. |
| B2-109 | Guzzlord | PARTIAL | Unimplemented attack text: Flip a coin. If heads, discard your opponent's Active Pokémon. |
| B2-111 | Galarian Perrserker | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may put 2 random Pokémon Tool cards from your discard pile into your hand. |
| B2-113 | Mega Mawile ex | PARTIAL | Unimplemented attack text: Until this Pokémon leaves the Active Spot, this Pokémon's Heat-Up Crunch attack does +30 damage. This effect stacks. |
| B2-117 | Galarian Stunfisk | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is in the Active Spot when your opponent's Active Pokémon retreats, this attack does 40 damage to the new Active Pokémon. |
| B2-120 | Aegislash | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon takes −80 damage from attacks from your opponent's Pokémon ex. |
| B2-124 | Meowth | PARTIAL | Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, prevent that damage. |
| B2-127 | Mega Kangaskhan ex | PARTIAL | Unimplemented attack text: This attack is used twice in a row. The second attack does 40 damage. (If the first attack Knocks Out your opponent's Active Pokémon, the second attack is used after your opponent chooses a new Active Pokémon.) |
| B2-130 | Smeargle | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may look at a random Supporter card from your opponent's hand. Use the effect of that card as the effect of this Ability. |
| B2-133 | Swellow | PARTIAL | Unimplemented ability text: Once during your turn, you may switch out your opponent's Active Basic Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B2-136 | Slaking | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, whenever you attach an Energy from your Energy Zone to it, it is now Asleep. |
| B2-142 | Tandemaus | PARTIAL | Unimplemented attack text: Put 3 random cards from among Tandemaus and Maushold from your deck onto your Bench. |
| B2-143 | Maushold | PARTIAL | Unimplemented attack text: Flip a coin for each Tandemaus and Maushold you have in play. This attack does 60 damage for each heads. |
| B2-145 | Lucky Ice Pop | PARTIAL | Unimplemented trainer text: Heal 20 damage from your Active Pokémon. If you healed any damage in this way, flip a coin. If heads, put this Lucky Ice Pop into your hand instead of the discard pile. |
| B2-147 | Protective Poncho | PARTIAL | Unimplemented trainer text: As long as the Pokémon this card is attached to is on your Bench, prevent all damage done to that Pokémon by your opponent's attacks and Abilities. |
| B2-148 | Metal Core Barrier | PARTIAL | Unimplemented trainer text: If this card is attached to 1 of your Pokémon, discard it at the end of your opponent's turn. The {M} Pokémon this card is attached to takes −50 damage from attacks from your opponent's Pokémon. |
| B2-149 | Diantha | PARTIAL | Unimplemented trainer text: Heal 90 damage from 1 of your {P} Pokémon that has 2 or more {P} Energy attached. If you healed any damage in this way, discard 2 {P} Energy from that Pokémon. |
| B2-150 | Sightseer | PARTIAL | Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Stage 1 Pokémon you find there into your hand. Shuffle the other cards back into your deck. |
| B2-151 | Juggler | PARTIAL | Unimplemented trainer text: You can use this card only if your Pokémon in play have 3 or more different types of Energy attached. Move all Energy from each of your Benched Pokémon to your Active Pokémon. |
| B2-152 | Piers | PARTIAL | Unimplemented trainer text: You can use this card only if you have Galarian Obstagoon in play. Discard 2 random Energy from your opponent's Active Pokémon. |
| B2a-009 | Arboliva | PARTIAL | Unimplemented ability text: Once during your turn, you may heal 60 damage from 1 of your Pokémon ex that has any Energy attached. If you do, discard a random Energy from that Pokémon. |
| B2a-013 | Scovillain | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon is a Grass or Metal Pokémon, this attack does 40 more damage. |
| B2a-015 | Wo-Chien | PARTIAL | Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost {C}{C} more. |
| B2a-016 | Fuecoco | PARTIAL | Unimplemented attack text: Put 1 random Basic Pokémon from your deck onto your Bench. |
| B2a-018 | Skeledirge | PARTIAL | Unimplemented ability text: Once during your turn, you may discard 1 Fire Energy from this Pokémon in order to use this Ability. During this turn, attacks used by your Fire Pokémon do +50 damage to your opponent's Active Pokémon. |
| B2a-021 | Chi-Yu | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage. |
| B2a-024 | Quaquaval | PARTIAL | Unimplemented ability text: If this Pokémon's remaining HP is 50 or less, attacks used by this Pokémon do +60 damage to your opponent's Active Pokémon. |
| B2a-030 | Cetitan | PARTIAL | Unimplemented attack text: Flip a coin. If heads, the Defending Pokémon is now Paralyzed. |
| B2a-031 | Veluza | PARTIAL | Unimplemented attack text: If you have no cards in your deck, this attack can be used for 1 Water Energy. |
| B2a-040 | Pawmot | PARTIAL | Unimplemented attack text: Discard a Lightning Energy from this Pokémon. |
| B2a-042 | Bellibolt ex | PARTIAL | Unimplemented attack text: If you have 4 or more Lightning Energy in play, this attack does 70 more damage. |
| B2a-044 | Kilowattrel | PARTIAL | Missing or invalid retreat |
| B2a-052 | Greavard | PARTIAL | Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing. |
| B2a-053 | Houndstone | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each Psychic Pokémon in your discard pile. |
| B2a-062 | Ting-Lu | PARTIAL | Unimplemented attack text: If this Pokémon's remaining HP is 60 or less, this attack does nothing. |
| B2a-070 | Grafaiai | PARTIAL | Unimplemented attack text: If your Pokémon in play have 3 or more different types of Energy attached, this attack does 60 more damage. |
| B2a-071 | Bombirdier | PARTIAL | Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from and effects of attacks done to this Pokémon. |
| B2a-077 | Orthworm | PARTIAL | Unimplemented attack text: Take a Metal Energy from your Energy Zone and attach it to 1 of your Benched Pokémon. |
| B2a-078 | Gholdengo ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random for each Metal Energy attached to this Pokémon. For each time a Pokémon was chosen, do 40 damage to it. |
| B2a-081 | Tandemaus | PARTIAL | Missing or invalid retreat |
| B2a-082 | Maushold | PARTIAL | Unimplemented attack text: Flip 3 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. |
| B2a-087 | Big Air Balloon | PARTIAL | Unimplemented trainer text: The Stage 2 Pokémon this card is attached to has no Retreat Cost. |
| B2a-088 | Team Star Grunt | PARTIAL | Unimplemented trainer text: Discard a random Energy from among the Energy attached to all of your opponent's Pokémon that have an Ability. |
| B2a-093 | Mesagoza | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may flip a coin. If heads, that player puts a random Pokémon from their deck into their hand. You may play only 1 Stadium card during your turn. Put it next to the Active Spot, and discard it if another Stadium comes into play. A Stadium with the same name can't be played. |
| B2b-008 | Charmeleon | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may take a {R} Energy from your Energy Zone and attach it to your Active {R} Pokémon. |
| B2b-009 | Mega Charizard X ex | PARTIAL | Unimplemented attack text: If this Pokémon's remaining HP is 110 or less, this attack does 80 more damage. |
| B2b-011 | Rapidash | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +30 damage. |
| B2b-016 | Mega Slowbro ex | PARTIAL | Unimplemented attack text: Flip 3 coins. This attack also does 20 damage for each heads to each of your opponent's Benched Pokémon. |
| B2b-017 | Lapras | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, your opponent's Active Pokémon is now Paralyzed. |
| B2b-020 | Empoleon | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon has more remaining HP than this Pokémon, this attack does 60 more damage. |
| B2b-027 | Mega Manectric ex | PARTIAL | Unimplemented attack text: This attack does 30 more damage for each point you have gotten. |
| B2b-030 | Mew | PARTIAL | Unimplemented attack text: 1 attack from among the Pokémon in your opponent's hand and deck is chosen at random, and you use the chosen attack as this attack. |
| B2b-032 | Grumpig | PARTIAL | Unimplemented attack text: If your opponent has exactly 2, 4, or 6 cards in their hand, this attack does 40 more damage. |
| B2b-035 | Groudon | PARTIAL | Unimplemented attack text: Discard 2 random Energy from among the Energy attached to all of your Pokémon. |
| B2b-039 | Mega Gengar ex | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Trainer cards from their hand. |
| B2b-046 | Forretress | PARTIAL | Unimplemented attack text: This Pokémon also does 100 damage to itself and 50 damage to all Benched Pokémon (both yours and your opponent's). |
| B2b-047 | Mega Scizor ex | PARTIAL | Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 50 more damage. |
| B2b-050 | Revavroom | PARTIAL | Unimplemented ability text: Once during your turn, you may switch your Active {M} Pokémon with 1 of your Benched Pokémon. |
| B2b-052 | Dragonair | PARTIAL | Unimplemented attack text: Take a {W} and a {L} Energy from your Energy Zone and attach them to this Pokémon. |
| B2b-053 | Dragonite | PARTIAL | Unimplemented attack text: Discard a {W} and a {L} Energy from this Pokémon. |
| B2b-065 | Nasty Notice | PARTIAL | Unimplemented trainer text: Your opponent discards cards from their hand until they have 4 cards in their hand. |
| B2b-066 | Maintenance | PARTIAL | Unimplemented trainer text: Shuffle 2 cards from your hand into your deck. Draw a card. If you can't shuffle in 2 cards, you can't use this card. |
| B2b-067 | Iris | PARTIAL | Unimplemented trainer text: During this turn, if your opponent's Active Pokémon is Knocked Out by damage from an attack used by your Haxorus, you get 1 more point. |
| B2b-068 | Calem | PARTIAL | Unimplemented trainer text: Draw a card for each Mega Evolution Pokémon ex in play (both yours and your opponent's). |
| B2b-069 | Hiking Trail | PARTIAL | Unimplemented trainer text: At the end of each player's turn, that player draws cards until they have 3 cards in their hand. |
| B3-013 | Budew | PARTIAL | Unimplemented attack text: The Defending Pokémon loses all Abilities. This effect lasts until the Defending Pokémon leaves the Active Spot. |
| B3-022 | Camerupt | PARTIAL | Unimplemented attack text: Flip 3 coins. For each heads, discard a {R} Energy from this Pokémon. This attack does 30 more damage for each {R} Energy you discarded in this way. |
| B3-023 | Mega Camerupt ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 160 damage to it. |
| B3-028 | Emboar | PARTIAL | Unimplemented attack text: Flip a coin for each {R} Energy attached to this Pokémon. This attack does 30 more damage for each heads. |
| B3-035 | Politoed | PARTIAL | Unimplemented attack text: If this Pokémon evolved from Poliwhirl during this turn, this attack does 50 more damage. |
| B3-037 | Vaporeon ex | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is in the Active Spot, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B3-039 | Quagsire | PARTIAL | Unimplemented attack text: If this Pokémon has any {F} Energy attached, this attack does 60 more damage. |
| B3-045 | Regice | PARTIAL | Unimplemented attack text: Move 2 random Energy from this Pokémon to 1 of your Benched Pokémon. |
| B3-049 | Drizzile | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 20 damage to your opponent's Active Pokémon. |
| B3-050 | Inteleon | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may do 30 damage to your opponent's Active Pokémon. |
| B3-051 | Rapid Strike Urshifu | PARTIAL | Unimplemented attack text: Discard a {W} Energy from this Pokémon, and this attack also does 40 damage to 1 of your opponent's Benched Pokémon.; Unimplemented ability text: As long as this Pokémon is in play, it is {W} and {F} type. |
| B3-061 | Toxtricity | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 60 more damage, and your opponent's Active Pokémon is now Paralyzed. |
| B3-073 | Brambleghast | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may move 30 damage that your Active Pokémon has on it to this Pokémon. |
| B3-080 | Lucario | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon takes +20 damage from attacks. |
| B3-085 | Throh | PARTIAL | Unimplemented attack text: Switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B3-086 | Sawk | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by any effects on your opponent's Active Pokémon. |
| B3-089 | Meloetta | PARTIAL | Unimplemented attack text: During your next turn, attacks used by your {F} Pokémon do +30 damage to your opponent's Active Pokémon. |
| B3-094 | Coalossal | PARTIAL | Unimplemented attack text: Flip a coin until you get tails. For each heads, discard the top card of your opponent's deck. |
| B3-096 | Sandaconda | PARTIAL | Unimplemented attack text: During your opponent's next turn, if the Defending Pokémon tries to use an attack, your opponent flips a coin. If tails, that attack doesn't happen. |
| B3-097 | Kubfu | PARTIAL | Unimplemented attack text: Take a {C} Energy from your Energy Zone and attach it to this Pokémon. |
| B3-100 | Crobat | PARTIAL | Unimplemented attack text: If this Pokémon moved from your Bench to the Active Spot this turn, this attack does 60 more damage. |
| B3-105 | Zorua | PARTIAL | Unimplemented attack text: Put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it. |
| B3-112 | Malamar | PARTIAL | Unimplemented attack text: During your opponent's next turn, they can't play any Pokémon from their hand to evolve their Pokémon. |
| B3-113 | Single Strike Urshifu | PARTIAL | Unimplemented ability text: As long as this Pokémon is in play, it is {F} and {D} type. |
| B3-118 | Bronzong | PARTIAL | Unimplemented attack text: If your opponent has any {P} Pokémon in play, this attack does 50 more damage. |
| B3-123 | Melmetal | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +60 damage. |
| B3-125 | Vibrava | PARTIAL | Unimplemented attack text: This attack does 10 damage to each of your opponent's Pokémon. |
| B3-126 | Flygon ex | PARTIAL | Unimplemented ability text: During Pokémon Checkup, if this Pokémon is in the Active Spot, do 10 damage to each of your opponent's Pokémon. |
| B3-128 | Blissey | PARTIAL | Unimplemented ability text: Once during your turn, you may remove a random Special Condition from your Active Pokémon. |
| B3-130 | Dunsparce | PARTIAL | Unimplemented attack text: You may shuffle this Pokémon and all attached cards into your deck. |
| B3-134 | Regigigas | PARTIAL | Unimplemented attack text: Take a {C} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.; Unimplemented ability text: If you don't have Regirock, Regice, and Registeel on your Bench, this Pokémon can't attack. |
| B3-136 | Watchog | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Psych Up attack does +30 damage. |
| B3-137 | Lillipup | PARTIAL | Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way. |
| B3-145 | Rookidee | PARTIAL | Unimplemented attack text: Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon. |
| B3-146 | Corvisquire | PARTIAL | Unimplemented attack text: Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon. |
| B3-147 | Field Blower | PARTIAL | Unimplemented trainer text: Discard a Pokémon Tool card from a Pokémon (yours or your opponent's), or discard a Stadium card in play. |
| B3-148 | Lucky Egg | PARTIAL | Unimplemented trainer text: If the Pokémon this card is attached to is Knocked Out by damage from an attack from your opponent's Pokémon, draw cards until you have 5 cards in your hand. |
| B3-151 | Cheren | PARTIAL | Unimplemented trainer text: During your opponent's next turn, all of your Watchog and Stoutland take −100 damage from attacks from your opponent's Pokémon ex. |
| B3-152 | Parasol Lady | PARTIAL | Unimplemented trainer text: Put 1 of your {W} Pokémon in play, except any Pokémon ex, into your hand. |
| B3-153 | Fragrant Forest | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may put a random Basic {G} Pokémon from their deck into their hand. |
| B3-154 | Arena of Antiquity | PARTIAL | Unimplemented trainer text: Attacks used by each {F} Pokémon in play (both yours and your opponent's) do +20 damage to the opponent's Active Pokémon ex. |
| B3-155 | Bounded Field | PARTIAL | Unimplemented trainer text: When applying the opponent's Active Pokémon's Weakness to damage from attacks used by Pokémon in play (both yours and your opponent's) that aren't Mega Evolution Pokémon ex, apply Weakness as ×2. |
| B3a-005 | Iron Moth | PARTIAL | Unimplemented attack text: Flip 3 coins. If 1 of them is heads, this attack does 20 more damage. If 2 of them are heads, this attack does 50 more damage. If all of them are heads, this attack does 120 more damage. |
| B3a-013 | Iron Bundle ex | PARTIAL | Unimplemented attack text: If this is the first time this Pokémon has used an attack after coming into play, this attack does 20 more damage, and your opponent's Active Pokémon is now Paralyzed. |
| B3a-019 | Miraidon ex | PARTIAL | Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may switch it with your Active Pokémon. If you do, move all of your Energy in play to this Pokémon. |
| B3a-022 | Espathra | PARTIAL | Unimplemented attack text: During your next turn, the Defending Pokémon takes +50 damage from attacks. |
| B3a-025 | Scream Tail | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, discard your opponent's Active Pokémon. |
| B3a-026 | Flutter Mane ex | PARTIAL | Unimplemented attack text: If this is the first time this Pokémon has used an attack after coming into play, during your opponent's next turn, they can't use any Trainer cards from their hand. |
| B3a-027 | Iron Valiant | PARTIAL | Unimplemented ability text: Attacks used by your Future Pokémon cost 1 less {C} Energy. |
| B3a-028 | Iron Leaves | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 50 more damage. |
| B3a-033 | Garganacl | PARTIAL | Unimplemented ability text: During Pokémon Checkup, heal 10 damage from each of your Pokémon. |
| B3a-035 | Sandy Shocks | PARTIAL | Unimplemented attack text: Switch in 1 of your opponent's Benched Pokémon to the Active Spot. If you do, this attack does 50 damage to the new Active Pokémon. |
| B3a-036 | Koraidon ex | PARTIAL | Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may switch it with your Active Pokémon. If you do, move all of your Energy in play to this Pokémon. |
| B3a-039 | Weavile | PARTIAL | Unimplemented attack text: If this Pokémon evolved from Sneasel during this turn, this attack does 20 more damage. |
| B3a-043 | Kingambit | PARTIAL | Unimplemented attack text: This attack does 40 more damage for each time your Pokémon have been Knocked Out during this game. |
| B3a-045 | Glimmora | PARTIAL | Unimplemented ability text: When this Pokémon is Knocked Out, flip a coin. If heads, your opponent can't get any points for it. |
| B3a-047 | Roaring Moon | PARTIAL | Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may switch out your opponent's Active Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| B3a-052 | Altaria | PARTIAL | Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon. |
| B3a-053 | Walking Wake | PARTIAL | Unimplemented attack text: Discard an Energy from this Pokémon, and this attack also does 20 damage to each of your opponent's Benched Pokémon. |
| B3a-054 | Gouging Fire | PARTIAL | Unimplemented attack text: Discard 2 Energy from this Pokémon. During your opponent's next turn, this Pokémon takes −30 damage from attacks. |
| B3a-055 | Raging Bolt | PARTIAL | Unimplemented attack text: Discard all Energy from this Pokémon. Knock Out your opponent's Active Pokémon. |
| B3a-068 | Terapagos ex | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each type of Energy attached to this Pokémon. |
| B3a-069 | Ancient Booster Energy Capsule | PARTIAL | Unimplemented trainer text: The Ancient Pokémon this card is attached to gets +40 HP. |
| B3a-070 | Future Booster Energy Capsule | PARTIAL | Unimplemented trainer text: Attacks used by the Future Pokémon this card is attached to do +20 damage to your opponent's Active Pokémon. |
| B3a-072 | Professor Sada | PARTIAL | Unimplemented trainer text: Attach 3 different types of Energy from your discard pile to your Ancient Pokémon in any way you like. |
| B3a-073 | Professor Turo | PARTIAL | Unimplemented trainer text: Shuffle 1 of your Future Pokémon in play into your deck. |
| B3a-074 | Area Zero | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may shuffle a Basic Pokémon from their hand into their deck. If they do, they draw a card. |
| B3b-001 | Caterpie | PARTIAL | Unimplemented ability text: At the end of your opponent's turn, if this Pokémon is in the Active Spot, put a random card from your deck that evolves from this Pokémon onto this Pokémon to evolve it. |
| B3b-024 | Dedenne ex | PARTIAL | Unimplemented attack text: This attack does 40 damage for each Pokémon Tool attached to all of your Pokémon. |
| B3b-025 | Yamper | PARTIAL | Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way. |
| B3b-030 | Sylveon | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon has a Pokémon Tool attached, you may heal 30 damage from 1 of your Pokémon. |
| B3b-031 | Carbink | PARTIAL | Unimplemented attack text: Choose 2 of your Benched Pokémon. For each of those Pokémon, take a {P} Energy from your Energy Zone and attach it to that Pokémon. |
| B3b-032 | Mega Diancie ex | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each {P} Energy attached to all of your Pokémon. |
| B3b-033 | Enamorus | PARTIAL | Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have 1 or more of the same type of Energy attached, this attack does 60 more damage. |
| B3b-034 | Fidough | PARTIAL | Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way. |
| B3b-035 | Flutter Mane | PARTIAL | Unimplemented attack text: If this Pokémon didn't move from the Bench to the Active Spot this turn, this attack does nothing. |
| B3b-037 | Quagsire | PARTIAL | Unimplemented attack text: 1 of your opponent's Active Pokémon's attacks is chosen at random. During your opponent's next turn, that Pokémon can't use the chosen attack. |
| B3b-038 | Rockruff | PARTIAL | Unimplemented attack text: Reveal all of your Pokémon in play and in your hand that have the Puppy Pile attack, and this attack does 20 damage for each Pokémon you revealed in this way. |
| B3b-041 | Mega Sableye ex | PARTIAL | Unimplemented attack text: During your opponent's next turn, if this Pokémon is damaged by an attack, do 40 damage to the Attacking Pokémon. |
| B3b-047 | Toxapex | PARTIAL | Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned. Do 40 damage to this Pokémon instead of the usual amount for this Special Condition. |
| B3b-050 | Hisuian Goodra | PARTIAL | Unimplemented ability text: If any damage is done to this Pokémon by attacks, flip a coin. If heads, this Pokémon takes −80 damage from that attack. |
| B3b-055 | Snorlax | PARTIAL | Unimplemented ability text: As long as this Pokémon is in the Active Spot, your opponent can't play any Stadium cards from their hand. |
| B3b-058 | Ursaluna | PARTIAL | Unimplemented ability text: If this Pokémon would be Knocked Out by damage from an attack, flip a coin. If heads, this Pokémon is not Knocked Out, and its remaining HP becomes 10. |
| B3b-060 | Hisuian Zoroark ex | PARTIAL | Unimplemented attack text: This attack does 20 more damage for each Pokémon in your discard pile. |
| B3b-066 | Elesa | PARTIAL | Unimplemented trainer text: Return all Pokémon Tools attached to each Pokémon (both yours and your opponent's) to their owner's hand. |
| B3b-067 | Puppy-Loving Girl | PARTIAL | Unimplemented trainer text: Look at the top 4 cards of your deck. Put all Pokémon you find there that have the Puppy Pile attack into your hand. Shuffle the other cards back into your deck. |
| B3b-068 | Wallace | PARTIAL | Unimplemented trainer text: Choose 1 of your {W} Pokémon in play with a maximum HP of 50 or less. Put a random {W} Pokémon from your deck that evolves from that Pokémon onto that Pokémon to evolve it. |
| B3b-069 | Kid's Room | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may choose a card in their hand and switch it with a random Pokémon Tool card in their deck. |
| B4-002 | Silcoon | PARTIAL | Unimplemented attack text: Put 3 random cards from among Silcoon and Cascoon from your deck onto your Bench. |
| B4-004 | Cascoon | PARTIAL | Unimplemented attack text: Put 3 random cards from among Silcoon and Cascoon from your deck onto your Bench. |
| B4-005 | Dustox | PARTIAL | Unimplemented ability text: Once during your turn, you may use this Ability. 1 Special Condition from among Burned, Confused, and Poisoned is chosen at random, and your opponent's Active Pokémon is now affected by that Special Condition. Any Special Conditions already affecting that Pokémon will not be chosen. |
| B4-011 | Vespiquen ex | PARTIAL | Unimplemented attack text: You may discard 1 of your Benched Basic {G} Pokémon. If you do, this attack does 70 more damage. |
| B4-014 | Accelgor | PARTIAL | Unimplemented attack text: Your opponent's Active Pokémon is now Poisoned and Paralyzed. Shuffle this Pokémon and all attached cards into your deck. |
| B4-016 | Pheromosa | PARTIAL | Unimplemented attack text: If you haven't gotten any points, this attack does 60 more damage. |
| B4-017 | Poltchageist | PARTIAL | Unimplemented ability text: Once during your turn, when you put this Pokémon from your hand onto your Bench, you may heal 20 damage from your Active {G} Pokémon. |
| B4-019 | Teal Mask Ogerpon | PARTIAL | Unimplemented attack text: This attack does damage to your opponent's Active Pokémon equal to this Pokémon's remaining HP. |
| B4-022 | Flareon | PARTIAL | Unimplemented attack text: Discard Fire{R} Energy from this Pokémon. Your opponent's Active Pokémon is now Burned. |
| B4-032 | Staryu | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by Weakness or by any effects on your opponent's Active Pokémon. |
| B4-033 | Starmie | PARTIAL | Unimplemented attack text: This attack's damage isn't affected by Weakness or by any effects on your opponent's Active Pokémon. |
| B4-037 | Wailord ex | PARTIAL | Unimplemented attack text: This Pokémon recovers from all Special Conditions. |
| B4-040 | Walrein | PARTIAL | Unimplemented attack text: Your opponent can't use any Supporter cards from their hand during their next turn. |
| B4-041 | Kyogre | PARTIAL | Unimplemented attack text: Discard 3 {W} Energy from this Pokémon, and this attack does 50 damage to each of your opponent's Pokémon. |
| B4-044 | Samurott | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may prevent all damage from—and effects of—attacks from your opponent's Pokémon done to this Pokémon until the end of your opponent's next turn. |
| B4-050 | Raichu | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed. |
| B4-053 | Luxray | PARTIAL | Unimplemented attack text: This attack does 50 more damage for each point your opponent has gotten. |
| B4-055 | Rotom ex | PARTIAL | Unimplemented attack text: This attack does 10 more damage for each Item card in your discard pile. |
| B4-064 | Clefairy | PARTIAL | Unimplemented attack text: Flip a coin. If heads, choose 1 of your opponent's Active Pokémon's attacks and use it as this attack. |
| B4-068 | Mime Jr. | PARTIAL | Unimplemented attack text: Shuffle your hand into your deck. Draw a card for each card in your opponent's hand. |
| B4-069 | Mr. Mime | PARTIAL | Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have the same amount of Energy attached, this attack does 40 more damage. |
| B4-073 | Chimecho | PARTIAL | Unimplemented attack text: If you have the same number of cards in your hand as your opponent, this attack does 40 more damage. |
| B4-077 | Hoopa | PARTIAL | Unimplemented attack text: Before doing damage, shuffle all Pokémon Tools from each of your opponent's Pokémon into their deck. |
| B4-078 | Oricorio | PARTIAL | Unimplemented attack text: Discard a card from your hand. If you can't, this attack does nothing. |
| B4-080 | Hariyama | PARTIAL | Unimplemented attack text: During your opponent's next turn, this Pokémon takes +50 damage from attacks. |
| B4-082 | Armaldo | PARTIAL | Unimplemented attack text: Discard all Energy from this Pokémon. Choose a spot from among your opponent's Active Spot and Bench. At the end of your opponent's next turn, Knock Out the Pokémon in the spot you chose. |
| B4-089 | Conkeldurr | PARTIAL | Unimplemented attack text: Discard a Stadium in play. |
| B4-093 | Poochyena | PARTIAL | Unimplemented attack text: Draw a card for each Poochyena you have in play. |
| B4-099 | Swalot | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon has less remaining HP than this Pokémon, this attack does 80 more damage. |
| B4-115 | Revavroom | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overacceleration attack does +70 damage.; Unimplemented ability text: This Pokémon may have up to 2 Pokémon Tool cards attached to it. |
| B4-117 | Dragonair | PARTIAL | Unimplemented ability text: Once during your turn, if this Pokémon is on your Bench, you may attach an Energy from your discard pile to your Active [Dragon] Pokémon. |
| B4-120 | Mega Rayquaza ex | PARTIAL | Unimplemented attack text: Discard all {R} and {L} Energy from this Pokémon, and this attack does 50 damage for each Energy you discarded in this way. |
| B4-127 | Hydrapple | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 100 more damage. |
| B4-130 | Raticate | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may look at the top 4 cards of your deck and put all Item cards you find there into your hand. Shuffle the other cards back into your deck. |
| B4-136 | Kecleon | PARTIAL | Unimplemented attack text: If this Pokémon and your opponent's Active Pokémon have 1 or more of the same type of Energy attached, this attack does 30 more damage. |
| B4-139 | Unfezant | PARTIAL | Unimplemented attack text: Flip a coin. If tails, this attack does nothing. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon. |
| B4-142 | Furfrou | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 50 more damage. |
| B4-148 | Deceptive Needle | PARTIAL | Unimplemented trainer text: At the end of your turn, if the {D} Pokémon this card is attached to is in the Active Spot, do 10 damage to your opponent's Active Pokémon. |
| B4-149 | Clear Veil | PARTIAL | Unimplemented trainer text: Prevent all effects of attacks used by your opponent's Pokémon done to the Pokémon this card is attached to. (Existing effects are not removed.) |
| B4-150 | Psychic | PARTIAL | Unimplemented trainer text: You can use this card only if your Pokémon in the Active Spot has the Psychic attack. Choose 1 of your opponent's Benched Pokémon and move a random Energy from it to your opponent's Active Pokémon. |
| B4-151 | Drayden | PARTIAL | Unimplemented trainer text: During this turn, 1 of your opponent's Pokémon is chosen 1 more time for the Draco Meteor attack used by your Pokémon. |
| B4-152 | Skyla | PARTIAL | Unimplemented trainer text: Switch your Active Stage 1 Pokémon with 1 of your Benched Pokémon. |
| B4-153 | Wally | PARTIAL | Unimplemented trainer text: Take a {C} Energy from your Energy Zone and attach it to 1 of your Stage 2 Pokémon. |
| B4-154 | Soothing Shore | PARTIAL | Unimplemented trainer text: At the end of each player's turn, that player heals 20 damage from each of their Pokémon that has any {W} Energy attached. |
| B4-155 | Rainbow Cave | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may discard the Energy that has been generated in their Energy Zone. If they do, the next Energy is produced. |
| B4a-002 | Illumise | PARTIAL | Unimplemented attack text: If Volbeat is in your discard pile, this attack does 60 more damage. |
| B4a-005 | Serperior | PARTIAL | Unimplemented ability text: This Pokémon gets +30 HP for each {G} Energy attached to it. |
| B4a-006 | Team Rocket's Magmar | PARTIAL | Unimplemented attack text: This attack does 50 more damage for each Special Condition affecting your opponent's Active Pokémon. |
| B4a-007 | Team Rocket's Moltres ex | PARTIAL | Unimplemented attack text: Flip 3 coins. For each heads, produce a {R} Energy from your Energy Zone and attach it to this Pokémon. |
| B4a-018 | Hisuian Basculegion | PARTIAL | Unimplemented attack text: This attack does 50 more damage for each point your opponent got during their last turn. |
| B4a-020 | Team Rocket's Electrode | PARTIAL | Unimplemented ability text: If this Pokémon is in the Active Spot and is Knocked Out by damage from an attack from your opponent's Pokémon, do 70 damage to the Attacking Pokémon. |
| B4a-026 | Team Rocket's Slowking ex | PARTIAL | Unimplemented attack text: This attack does 20 damage for each card in your hand. |
| B4a-028 | Team Rocket's Hypno | PARTIAL | Unimplemented attack text: Switch in 1 of your opponent's Benched Pokémon to the Active Spot. If you do, this attack does 50 damage to the new Active Pokémon. |
| B4a-039 | Team Rocket's Arbok | PARTIAL | Unimplemented attack text: This attack does 10 more damage for each Energy in your opponent's Active Pokémon's Retreat Cost. |
| B4a-041 | Team Rocket's Muk | PARTIAL | Unimplemented attack text: If your opponent's Active Pokémon is Poisoned, heal 60 damage from this Pokémon. |
| B4a-043 | Team Rocket's Weezing ex | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may make your opponent's Active Pokémon Poisoned and Burned. |
| B4a-044 | Team Rocket's Sneasel | PARTIAL | Unimplemented attack text: Flip a coin for each Pokémon you have in play. This attack does 30 damage for each heads. |
| B4a-050 | Team Rocket's Tinkaton | PARTIAL | Unimplemented attack text: During your opponent's next turn, attacks used by the Defending Pokémon cost 2 {C} more, and its Retreat Cost is 2 {C} more. |
| B4a-051 | Gholdengo | PARTIAL | Unimplemented ability text: Once during your turn, when you flip any coins for an effect of your Trainer cards, you may ignore all results of those coin flips and begin flipping those coins again. You can't use more than 1 Luxury Coin Ability each turn. |
| B4a-054 | Garchomp | PARTIAL | Unimplemented ability text: If your opponent's Pokémon is Knocked Out by damage from this Pokémon's attacks, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon. |
| B4a-057 | Regidrago | PARTIAL | Invalid damage: 140-; Unimplemented attack text: If this Pokémon has damage on it, this attack does −100 damage. |
| B4a-059 | Team Rocket's Raticate ex | PARTIAL | Unimplemented ability text: Once during your turn, when you play this Pokémon from your hand to evolve 1 of your Pokémon, you may move a random Energy from your opponent's Active Pokémon to this Pokémon. |
| B4a-062 | Team Rocket's Kecleon | PARTIAL | Unimplemented ability text: Once during your turn, you may look at a random card from your opponent's hand. |
| B4a-063 | Happiny | PARTIAL | Unimplemented attack text: During your next turn, attacks used by your Pokémon do +20 damage to your opponent's Active Pokémon. |
| B4a-067 | Team Rocket's Thieving Machine | PARTIAL | Unimplemented trainer text: Put a random Item card, except any Team Rocket's Thieving Machine, from your opponent's discard pile into your hand. |
| B4a-068 | Team Rocket's Goo-zooka | PARTIAL | Unimplemented trainer text: Until the end of your opponent's next turn, your opponent's Active Pokémon's Retreat Cost is 1 more. |
| B4a-069 | Team Rocket's Researcher | PARTIAL | Unimplemented trainer text: Flip a coin until you get tails. For each heads, put a random Pokémon that has “Team Rocket” in its name from your deck into your hand. |
| B4a-070 | Team Rocket's Master Plan | PARTIAL | Unimplemented trainer text: Your opponent's Active Pokémon is now Confused. Flip a coin. If tails, your Active Pokémon is now also Confused. |
| B4a-071 | Team Rocket's Boss | PARTIAL | Unimplemented trainer text: Look at your opponent's hand and put any number of Basic Pokémon you find there onto your opponent's Bench. |
| B4a-072 | Arcade | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may flip 3 coins. If all of them are heads, that player draws cards until they have 7 cards in their hand. |
| C1-005 | Alolan Exeggutor ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Benched Pokémon is chosen at random. This attack also does 50 damage to it. |
| C1-008 | Vespiquen | PARTIAL | Unimplemented attack text: Reveal all of the Sweet Honey in your hand, and this attack does 50 damage for each card you revealed in this way. |
| C1-012 | Amoonguss | PARTIAL | Unimplemented attack text: Look at a random card from your opponent's hand and shuffle it into their deck. |
| C1-015 | Ribombee | PARTIAL | Unimplemented ability text: Once during your turn, you may use this Ability. Put a Sweet Honey rental card into your hand. |
| C1-018 | Charizard | PARTIAL | Unimplemented ability text: Whenever you attach a {R} Energy from your Energy Zone to this Pokémon, do 30 damage to your opponent's Active Pokémon. |
| C1-023 | Raboot | PARTIAL | Unimplemented ability text: As long as this Pokémon is in play, flip 3 more coins for the Rabbit Jumping attack used by your Pokémon. |
| C1-028 | Ceruledge | PARTIAL | Unimplemented attack text: If any of your Pokémon were Knocked Out by damage from an attack during your opponent's last turn, this attack does 70 more damage. |
| C1-033 | Dewgong | PARTIAL | Unimplemented attack text: Discard 2 {W} Energy from this Pokémon, and this attack does 60 damage to 2 of your opponent's Pokémon. |
| C1-038 | Palkia | PARTIAL | Unimplemented attack text: If your opponent has a Stadium in play, discard it. |
| C1-041 | Frogadier | PARTIAL | Unimplemented ability text: Once during your turn, when you play this card from your hand to evolve 1 of your Pokémon, you may use this Ability. Put a random Frogadier from your deck onto your Bench. |
| C1-051 | Jigglypuff | PARTIAL | Unimplemented attack text: Your opponent's Active Pokémon is now Asleep. Your opponent flips 2 coins for this Special Condition, and if either of them is tails, that Pokémon is still Asleep. |
| C1-057 | Mew ex | PARTIAL | Unimplemented attack text: Flip 3 coins. Take an amount of {P} Energy from your Energy Zone equal to the number of heads and attach it to your Benched {P} Pokémon in any way you like. |
| C1-062 | Deoxys | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Psycho Boost does −50 damage. |
| C1-066 | Lunala | PARTIAL | Unimplemented attack text: Move all Energy from this Pokémon to your Benched Pokémon in any way you like. |
| C1-088 | Zoroark | PARTIAL | Unimplemented attack text: Choose 1 of your opponent's Active Pokémon's attacks and use it as this attack. |
| C1-095 | Solgaleo | PARTIAL | Unimplemented attack text: This attack does 30 more damage for each point you have gotten. |
| C1-097 | Melmetal | PARTIAL | Unimplemented ability text: As long as this Pokémon is in play, all of your {M} Pokémon take −20 damage from attacks from your opponent's Pokémon. This effect doesn't stack. |
| C1-100 | Mega Dragonite ex | PARTIAL | Unimplemented attack text: 1 of your opponent's Pokémon is chosen at random. Do 250 damage to it. |
| C1-102 | Pidgey | PARTIAL | Unimplemented attack text: Put 1 random {C} Pokémon from your deck into your hand. |
| C1-107 | Eevee | PARTIAL | Unimplemented attack text: Put a random card that evolves from Eevee from your deck into your hand. |
| C1-110 | Porygon-Z | PARTIAL | Unimplemented attack text: During your next turn, this Pokémon's Overdrive Smash attack does +50 damage. |
| C1-118 | Bewear ex | PARTIAL | Unimplemented attack text: Flip 2 coins. If both of them are heads, this attack does 100 more damage. |
| C1-119 | Sweet Honey | PARTIAL | Unimplemented trainer text: Choose 1 of your Pokémon, and then flip a coin until you get tails. For each heads, heal 20 damage from that Pokémon. |
| C1-120 | Super Potion | PARTIAL | Unimplemented trainer text: Heal 40 damage from 1 of your Pokémon that has any Energy attached. If you healed any damage in this way, discard a random Energy from that Pokémon. |
| C1-121 | Max Repel | PARTIAL | Unimplemented trainer text: Switch out your opponent's Active Stage 2 Pokémon to the Bench. (Your opponent chooses the new Active Pokémon.) |
| C1-123 | Eviolite | PARTIAL | Unimplemented trainer text: The Basic Pokémon this card is attached to takes −20 damage from attacks from your opponent's Pokémon. |
| C1-124 | Light Ball | PARTIAL | Unimplemented trainer text: Attacks used by the Pikachu ex this card is attached to do +30 damage to your opponent's Active Pokémon. |
| C1-125 | Lorelei | PARTIAL | Unimplemented trainer text: During this turn, attacks used by your Dewgong, Cloyster, or Lapras do +30 damage to your opponent's Pokémon. |
| C1-126 | Blue's Provocation | PARTIAL | Unimplemented trainer text: You can use this card only if you have Venusaur, Charizard, Blastoise, or Pidgeot in play.Switch in 1 of your opponent's Benched Pokémon to the Active Spot. |
| C1-127 | Serena's Choice | PARTIAL | Unimplemented trainer text: Look at the top 3 cards of your deck and put 1 of them into your hand. Shuffle back into your deck. |
| C1-128 | Rika | PARTIAL | Unimplemented trainer text: Produce 2 {F} Energy from your Energy Zone, and attach it to 1 of your Whiscash or Paldean Clodsire. |
| C1-129 | Poké Mart Guy | PARTIAL | Unimplemented trainer text: Put 2 random cards from among Super Potion, Max Repel, and Full Heal from your deck into your hand. |
| C1-130 | Rising Star | PARTIAL | Unimplemented trainer text: You can use this card only if you have 3 or more different Pokémon types in play.Switch your Active Pokémon with 1 of your Benched Pokémon. |
| C1-131 | Abandoned Station | PARTIAL | Unimplemented trainer text: Once during each player's turn, that player may use this effect. Flip a coin. If heads, draw a card. |

See `TCGP_CARD_DATABASE.md` for source licences, update commands, validation and limitations. Machine-readable card/print lists are in `generated/tcgp-card-coverage.json`.
