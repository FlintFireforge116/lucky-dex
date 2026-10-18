# Adventure 3.0 balance — v0.40.0

The persistent campaign replaces generated branch selection with authored locations. Each Gym chapter contains four or five named sections and three required battles: one local wild encounter, a two-Pokémon route trainer and the Gym leader's existing team. Victory Road adds a wild encounter and a two-Pokémon Ace, followed by a Center and the five League battles. That is 31 required battles per region, with local rare sightings and Wild Hunt available as optional play. Main travel is 45–46 sections, including rest stops and events; it is not 45–46 battles.

## Values retained

Owned EXP remains `80 + 30 × level`, capped at 50. Journey battle members start at `min(owned level, 8)`, with a chapter cap of `min(50, 8 + chapterIndex × 4)`. Owned levels remain permanent and are displayed separately. Syncing a new chapter allows the current owned level up to its cap; selected journey moves, PP and injuries remain meaningful. The first chapter has cap 8; Gym chapters advance through cap 36, Victory Road uses cap 40 and League cap 44.

Opponent level remains the starting party anchor (5–8) plus twice the source stage index, with +1 rare, +2 Gym, +3 Elite Four and +4 Champion. The source teams, encounter pools and move-power budgets remain unchanged. Regional incoming damage still uses the shared reducer's fixed 0.60 factor. Type coverage, learned moves, remaining PP, speed and priority all use the shared battle implementation.

Battle reward amounts remain the earlier economy: local encounters give `20 + final foe level × 2` coins; bosses give `100 + stage × 20`. Defeated-team EXP sums `40 + foe level × 8` per opponent; capture EXP is `35 + foe level × 6`. Optional local caches retain `40 + stage × 5` coins, one Potion and two Poké Balls. Gym clears give one Potion and a typed TM, Victory Road gives three Potions, and each Elite Four battle gives two. Kanto/Johto/Hoenn Champion bonuses remain 1,200/1,300/1,400 coins. Every one-time grant has a persistent claim.

The Poké Mart retains three Potions for 180 coins. A travelling merchant retains two for 100 coins. Field Potions restore 62% HP to living injured partners; battle Potions use the shared reducer. Reward/cost inflation was unnecessary.

## Recovery changes

Authored Pokémon Centers fully heal HP, PP and status. This replaces choosing a 75% camp node and supplies a predictable place to prepare. Gym recovery remains 70%, Victory Road full recovery and Elite Four 50%. Defeat heals at the most recent permanent safe checkpoint and restarts only that chapter's traversal. League defeat returns to its Center and restarts the League. Claimed rewards do not replenish, and owned Pokémon progression remains permanent. Revisiting towns or replaying completed campaigns cannot repeat rewards.

## Actual simulations

`node scripts/regional-balance-sim.cjs` emits versioned evidence. Twelve simulations use prepared Venusaur, Charizard and Blastoise, the real shared battle reducer, normal optional cache detours, compatible earned TMs, and actual shared Mart transactions before chapters/League. Nine start with collection level 5 (three seeds in each region); three start with collection level 50 and verify all initial battle members sync to 8. Each begins with 1,000 coins and five Potions. The simulator does not inject victories, recovery, EXP, TMs or free supplies.

All twelve reached eight badges, four Elite Four wins and Champion completion. They used 228–450 combat actions, including 104–208 in the League; the single defeat repeated three League battles, producing 34 battles rather than 31. Potion use was 21–54, with 1–7 Mart bundles purchased for 180–1,260 coins. Final coin balances were 5,068–6,248; earned coin ledgers were 5,328–5,636. Each journey earned eight Gym TMs. Collection-level-5 parties finished at journey level 29–30. High-level collections still needed meaningful League preparation and did not bypass the first chapter cap.

The earlier simulator spent only its initial supplies and earned caches; it could repeatedly lose at the Kanto League after exhausting Potions. The new simulator models the available Poké Mart preparation step, resolving that loop without changing combat or reward coefficients. This evidence describes prepared parties with good type coverage; it does not claim that an untouched single starter wins every campaign. No grinding or optional rare encounters are needed in this preparation model.

