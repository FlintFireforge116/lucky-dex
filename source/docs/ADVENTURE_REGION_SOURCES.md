# Adventure regional content

`app/src/main/assets/adventure/adventure-regions.js` registers all nine regions. Kanto, Johto and Hoenn have populated campaigns; Sinnoh, Unova, Kalos, Alola, Galar and Paldea are explicitly unavailable with their content deferred. The latter have no copied encounter tables or fabricated leaders.

The populated campaigns contain 27 location stages and 39 boss encounters: 24 Gyms, 12 Elite Four members and three Champions. All Pokémon references use National Pokédex IDs that exist in the existing local `adventure-species.js` bundle. The runtime determines levels, rewards and combat moves; region definitions provide content and trainer strategy roles.

## Primary team sources

Reviewed 9 October 2026. The pret projects reconstruct the actual games' data. Their source identifiers allow the selected parties to be checked without a wiki intermediary.

| Campaign | Primary source | Selected records |
| --- | --- | --- |
| Kanto, Red / Blue | [pret/pokered trainer parties](https://github.com/pret/pokered/blob/master/data/trainers/parties.asm) | `BrockData`, `MistyData`, `LtSurgeData`, `ErikaData`, `KogaData`, `SabrinaData`, `BlaineData`; the Viridian Gym entry in `GiovanniData`; `LoreleiData`, `BrunoData`, `AgathaData`, `LanceData`; first entry of `Rival3Data`. |
| Johto, Gold / Silver | [pret/pokegold trainer parties](https://github.com/pret/pokegold/blob/master/data/trainers/parties.asm) | `FalknerGroup`, `BugsyGroup`, `WhitneyGroup`, `MortyGroup`, `ChuckGroup`, `JasmineGroup`, `PryceGroup`, `ClairGroup`, `WillGroup`, `KogaGroup`, `BrunoGroup`, `KarenGroup`, `ChampionGroup`. |
| Hoenn, Emerald | [pret/pokeemerald trainer parties](https://github.com/pret/pokeemerald/blob/master/src/data/trainer_parties.h) | First-battle arrays `sParty_Roxanne1`, `sParty_Brawly1`, `sParty_Wattson1`, `sParty_Flannery1`, `sParty_Norman1`, `sParty_Winona1`, `sParty_TateAndLiza1`, `sParty_Juan1`; `sParty_Sidney`, `sParty_Phoebe`, `sParty_Glacia`, `sParty_Drake`, `sParty_Wallace`. |

Teams retain their canonical species order, party sizes and repeated species. Specialties are trainer themes; off-type canonical members remain intact (for example Sabrina's Venomoth). Emerald uses Juan for Sootopolis and Wallace as Champion. No rematch teams are substituted.

## Location and encounter sources

Encounter pools are curated subsets of the associated locations, combined into compressed journey stages. They are not exact encounter-rate reproductions. Land, surfing, fishing, special encounters and edition exclusives can share a stage pool.

- Kanto: [wild map index](https://github.com/pret/pokered/blob/master/data/wild/grass_water.asm) and the [individual map tables](https://github.com/pret/pokered/tree/master/data/wild/maps). The journey groups Viridian Forest; Mt. Moon; Nugget Bridge/Routes 5–6; Rock Tunnel; Cycling Road/Safari Zone; Pokémon Tower/Routes 7–8; Seafoam Islands/Pokémon Mansion; Routes 21–22; and Victory Road. Examples checked include Forest Pikachu, Mt. Moon Clefairy, Safari Zone rarities and the late-game cave pools.
- Johto: [Gold/Silver Johto grass tables](https://github.com/pret/pokegold/blob/master/data/wild/johto_grass.asm), [Johto water tables](https://github.com/pret/pokegold/blob/master/data/wild/johto_water.asm), [fishing tables](https://github.com/pret/pokegold/blob/master/data/wild/fish.asm), and [Kanto grass tables for Victory Road](https://github.com/pret/pokegold/blob/master/data/wild/kanto_grass.asm). Time-of-day and Gold/Silver exclusives are combined. Ice Path includes Delibird from Silver and deliberately excludes Crystal's Ice Path Sneasel. Route 45 combines Gold's Teddiursa/Gligar and Silver's Phanpy/Skarmory. Sudowoodo and the Mt. Mortar Tyrogue gift become rare encounter opportunities.
- Hoenn: [Emerald wild encounter data](https://github.com/pret/pokeemerald/blob/master/src/data/wild_encounters.json). Pools follow the early forests, Granite Cave, Route 110, Fiery Path/desert, Rusturf Tunnel, Routes 119–120, Mt. Pyre, Routes 124–126 and Victory Road. Granite Cave uses Emerald's Sableye; underwater encounters include Clamperl, Chinchou and Relicanth. The [Feebas encounter implementation](https://github.com/pret/pokeemerald/blob/master/src/wild_encounter.c) supplies the Route 119 special fish, represented as a rare encounter without tile selection.

## Deliberate roguelike adaptations

- Each campaign has eight Gyms, one compressed stage before each Gym and one Victory Road stage, followed by four Elite Four battles and a Champion. Town names identify checkpoints; encounter pools describe the surrounding journey, rather than suggesting grass exists inside every town or building.
- Kanto fixes the badge sequence at Brock, Misty, Surge, Erika, Koga, Sabrina, Blaine, Giovanni. Johto fixes Chuck before Jasmine before Pryce. The original games allow flexibility at these points; this ordering creates a readable campaign path.
- Blue always uses the documented Red/Blue Blastoise Champion variant. LuckyDex permits a collection-based starting party, so the original starter-dependent variant choice is not reproduced.
- Tate & Liza's complete Emerald team is fought sequentially in LuckyDex's single-active-Pokémon battle system. This is an explicit adaptation of their original double battle, not a claim to implement double battles.
- Canonical fixed game levels, held items, AI flags, exact move sets and field mechanics are not encoded here. LuckyDex applies its shared level scaling and move system, with `pressure`, `guard`, `status` and `heal` roles. These roles are authored gameplay choices.
- Environmental event prose and safe/risky choice labels are original LuckyDex writing inspired by the named locations. They are replayable roguelike events, not copied original-game scripts. Some traversal restrictions, side trips and HM requirements are compressed away.
- Final coin rewards (1,200 / 1,300 / 1,400) are LuckyDex balance values, not original-game prize amounts. The runtime controls when the reward is granted.

`node tests/adventure-regions.test.cjs` verifies the nine-entry registry, exactly three available campaigns, all 39 selected source-based party sequences, 27 distinct location pools/events, local species validity, era limits and browser/CommonJS loading. Later regions should remain unavailable until their own researched content is supplied.
