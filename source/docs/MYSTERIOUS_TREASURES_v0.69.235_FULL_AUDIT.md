# LuckyDex v0.69.235 — Mysterious Treasures independent post-completion audit

Date: 13 November 2026

## Inspection and scope

Audited the **current supplied source** with the v0.69.234 completion patch applied; this is a source/Node-based pass, not APK/device validation. Followed `LUCKYDEX_MASTER_RULES.txt` regarding printed choices, physical-vs-Zone Energy, card effects, cross-era interactions, turn/Prize ordering, legal decks, and CPU behaviour. No unrelated Pocket rules, collection, saves, artwork, rewards, or ownership were changed.

### Whole set

- 124 of 124 numbered Mysterious Treasures prints registered, battle-enabled, and deck-eligible. Exactly 111 Pokémon, 10 Trainers, 3 Special Energy; 168 named attacks, 37 named Powers/Bodies.
- Each Pokémon attack has a defined effect object or intentional direct-damage resolution and is validated by the common effects validator. All Trainer effects validate. None has the old displayed text `Special effect`.
- 336 set attack executions (168 attacks × player and opponent); 20 Trainer executions (10 × both sides); effect choices processed to completion, tested in the Mysterious Treasures integration suite. Independent scenario tests additionally inspect outcomes such as fossils, Uxie/Mesprit/Azelf, Item/Equip/Throw Unown, Tyranitar/Magmortar, copied attacks, responsive Powers, Knockouts and Prizes, Fossil ancestry, status handling, turn locks and Energy routing.
- Complete evolution name-chain presence validated across the shared catalog (including Armor/Skull Fossil prerequisites). Checked physical hand-vs-Zone Energy definitions and all eight deck Energy archetypes; 24 set-only generated CPU decks (8 types × 3 seeds), valid 30-card lists.
- Simulated 8 set-only player/CPU matches, with legal choices validated on both sides. Six reached a finished state within the 180-action simulation cap and the other two progressed beyond two Prize claims; no invalid actions or exceptions. The cap is a simulation limit, **not** a gameplay turn limit.

## Screenshot-specific findings and fixes

1. **EX Dragon Frontiers Altaria ex δ (ex15-90): Extra Boost.** The depicted Stage 2 Charizard ex can receive the attachment, but the hand contains **Rainbow Energy and Double Colorless Energy**: both are Special Energy, neither is a physical Basic Energy card. The Power is correctly not offered, by design. The player-facing Altaria action sheet now says which eligibility requirement is missing. Both sides are tested with a physical Basic hand card and with Special-only hands. Altaria attaches to the selected Stage 2 Pokémon-ex, consumes that exact hand card, and remains once per turn.
2. **Neo Destiny Unown [T] (neo4-88): Tell.** Printed outcome: after HEADS, look at the opponent's **hand** and show your own hand. This does **not** inspect the opponent's deck. Previously a hidden internal record existed but not a usable graphical reveal. The successful coin flip now logs a one-shot `revealHand` event and shows real opponent hand **card art and names** in a dismissible mobile panel, after the action's coin presentation. Tails reveals nothing. It still works when Unown is Asleep, Confused or Paralyzed as printed. Tested in the engine and output HTML; needs on-phone layout verification.
3. **Reactive shared effect:** hand-sourced Basic Energy attached by Altaria **Extra Boost** or Latias ex δ **Fellow Boost** now carries the correct `fromHand` event. Mysterious Treasures Electivire LV.X **Shocking Tail** accordingly applies two damage counters to the recipient. Classic Basic Energy Zone attachments remain `fromZone` and do not trigger that Power. Tested player and opponent directions, and the Zone negative control.
4. **Release:** Android `versionName` is v0.69.235 and `versionCode` advanced to 7224 to permit normal upgrade installation.

## Automated results

| Suite | Result |
|---|---:|
| Earlier EX/Neo/Delta/DP shared regressions + Unown hand text (`v0720*`, `v0721*`, `v069140`) | 318 / 318 passed |
| Additional DP1, UI/Prize and shared engine regressions (`v0722*`, `v07230`) | 200 / 200 passed |
| Mysterious Treasures implementation/completion/full audit (`v07231`–`v07235`) | 84 / 84 passed |
| **Total distinct checks in three completed runs** | **602 / 602 passed** |

The earlier single massive run reached 511 passing tests before an execution timeout; it was not used as a release pass. The above smaller completed runs supersede it.

## Remaining limitations / next phone checks

- The audit is **source and simulated-outcome evidence**, not a direct comparison of all 124 card scans or exhaustive testing of every random branch in every possible matchup. Some choice paths rely on prior focused tests rather than fresh exhaustive enumeration.
- Neither the Android APK nor actual phone touch interactions/animation timing was built or run in this pass. In particular test **Altaria’s action-sheet eligibility message**, **Unown Tell heads/tails reveal and dismissal**, and **Electivire LV.X Shocking Tail reacting to Extra Boost** on an installed APK.
- Existing unrelated older-era limitations documented in the master rules remain outside this changed-files patch. The two long simulation battles still underway at the 180-action cap are not characterized as wins/losses.

## 124-card set ledger

The entries below are all enabled; each named move/Power is registered and validated. The ledger reports structural and integration checks, not a guarantee that every possible outcome has been manually verified.

| # | Card | Classification | Attacks | Powers/Bodies | Status |
|---:|---|---|---|---|---|
| 1 | Aggron | Stage 2 / Metal | Heap Up, Hard Metal | — | ENABLED |
| 2 | Alakazam | Stage 2 / Psychic | Psychic Guard | Power Cancel | ENABLED |
| 3 | Ambipom | Stage 1 / Colorless | Tail Influence, Charity Tail | — | ENABLED |
| 4 | Azelf | Basic / Psychic | Bind Pulse | Downer Material | ENABLED |
| 5 | Blissey | Stage 1 / Colorless | Happy Chance | Kind Egg | ENABLED |
| 6 | Bronzong | Stage 1 / Metal | Shady Stamp | Miracle Oracle | ENABLED |
| 7 | Celebi | Basic / Grass | Sprouting, Leaf Tornado | — | ENABLED |
| 8 | Feraligatr | Stage 2 / Water | Energy Cyclone, Breaking Tail | — | ENABLED |
| 9 | Garchomp | Stage 2 / Colorless | Dragon Fang | Rainbow Scale | ENABLED |
| 10 | Honchkrow | Stage 1 / Darkness | Dark Wing Flaps | Dark Genes | ENABLED |
| 11 | Lumineon | Stage 1 / Water | Reverse Stream | Lure Ring | ENABLED |
| 12 | Magmortar | Stage 1 / Fire | Smoke Bomb, Flame Drum | — | ENABLED |
| 13 | Meganium | Stage 2 / Grass | Ultra Powder, Fire Counterattack | — | ENABLED |
| 14 | Mesprit | Basic / Psychic | Teleportation Burst | Upper Material | ENABLED |
| 15 | Raichu | Stage 1 / Lightning | Electromagnetic Induction, Explosive Thunder | — | ENABLED |
| 16 | Typhlosion | Stage 2 / Fire | Evaporating Heat | Firestarter | ENABLED |
| 17 | Tyranitar | Stage 2 / Darkness | Payback, Ground Burn | — | ENABLED |
| 18 | Uxie | Basic / Psychic | Mind Off | Memory Out | ENABLED |
| 19 | Abomasnow | Stage 1 / Grass | Heavy Blizzard | Glacier Snow | ENABLED |
| 20 | Ariados | Stage 1 / Grass | Offensive Needle | Sticky | ENABLED |
| 21 | Bastiodon | Stage 2 / Metal | Anger Revenge | Protective Wall | ENABLED |
| 22 | Chimecho | Basic / Psychic | Call In, Strange Bell | — | ENABLED |
| 23 | Crobat | Stage 2 / Psychic | Strike and Fade | Evolutionary Toxic | ENABLED |
| 24 | Exeggutor | Stage 1 / Grass | String Bomb, Nutritional Support | — | ENABLED |
| 25 | Glalie | Stage 1 / Water | Intimidation Pebble | Craggy Face | ENABLED |
| 26 | Gyarados | Stage 1 / Water | Enrage | Dragon DNA | ENABLED |
| 27 | Kricketune | Stage 1 / Grass | Sore Performance, Concerto | — | ENABLED |
| 28 | Manectric | Stage 1 / Lightning | Lightning Twister, Chain Lightning | — | ENABLED |
| 29 | Mantine | Basic / Water | Giant Wave | Jumbo Fin | ENABLED |
| 30 | Mr. Mime | Basic / Psychic | Trick Play | Airy Wall | ENABLED |
| 31 | Nidoqueen | Stage 2 / Psychic | Give Aid | Mother Pheromone | ENABLED |
| 32 | Ninetales | Stage 1 / Fire | Fire Blast | Color Shift | ENABLED |
| 33 | Rampardos | Stage 2 / Fighting | Assurance, Hasty Headbutt | — | ENABLED |
| 34 | Slaking | Stage 2 / Colorless | Lazy Blow | Energetic Impulse | ENABLED |
| 35 | Sudowoodo | Basic / Fighting | Sidestep, Persuade | — | ENABLED |
| 36 | Toxicroak | Stage 1 / Psychic | Knuckle Claws | Poison Sacs | ENABLED |
| 37 | Unown [I] | Basic / Psychic | Hidden Power | ITEM | ENABLED |
| 38 | Ursaring | Stage 1 / Colorless | Bad Temper, Defensive Claw | — | ENABLED |
| 39 | Walrein | Stage 2 / Water | Ice Bind | Freeze-up | ENABLED |
| 40 | Whiscash | Stage 1 / Water | Fury, Magnitude | — | ENABLED |
| 41 | Bayleef | Stage 1 / Grass | Evolution Impulse, Leaf Boomerang | — | ENABLED |
| 42 | Chingling | Basic / Psychic | Inviting Bell | Baby Evolution | ENABLED |
| 43 | Cranidos | Stage 1 / Fighting | Headbutt, Steamroll | — | ENABLED |
| 44 | Croconaw | Stage 1 / Water | Hover Over | Evolutionary Vitality | ENABLED |
| 45 | Dewgong | Stage 1 / Water | Collapse | Cold Fat | ENABLED |
| 46 | Dodrio | Stage 1 / Colorless | Fury Attack, Triple Pick | — | ENABLED |
| 47 | Dunsparce | Basic / Colorless | Snake Hook, Bite and Run | — | ENABLED |
| 48 | Gabite | Stage 1 / Colorless | Gather Up, Marvelous Shine | — | ENABLED |
| 49 | Girafarig | Basic / Colorless | Crane Neck, Psybeam | — | ENABLED |
| 50 | Golbat | Stage 1 / Psychic | Pulse Search | — | ENABLED |
| 51 | Graveler | Stage 1 / Fighting | Rock Cannon, Rock Slide | — | ENABLED |
| 52 | Happiny | Basic / Colorless | Lively | Baby Evolution | ENABLED |
| 53 | Lairon | Stage 1 / Metal | Mend, Confront | — | ENABLED |
| 54 | Magmar | Basic / Fire | Flare, Flamethrower | — | ENABLED |
| 55 | Masquerain | Stage 1 / Grass | Centrifugal Force, Swirling Ripple | — | ENABLED |
| 56 | Nidorina | Stage 1 / Psychic | Rescue, Scratch | — | ENABLED |
| 57 | Octillery | Stage 1 / Water | Crash Bomber, Aqua Liner | — | ENABLED |
| 58 | Parasect | Stage 1 / Grass | Wild Spores, Extend Fungus | — | ENABLED |
| 59 | Pupitar | Stage 1 / Fighting | Pressurized Gas, Rocket Tackle | — | ENABLED |
| 60 | Quilava | Stage 1 / Fire | Fireworks | — | ENABLED |
| 61 | Sandslash | Stage 1 / Fighting | Spike Armor, Poison Spike | — | ENABLED |
| 62 | Sealeo | Stage 1 / Water | Ice Rider | — | ENABLED |
| 63 | Shieldon | Stage 1 / Metal | Hard Face, Shield Attack | — | ENABLED |
| 64 | Tropius | Basic / Grass | Bonus Leaf, Whirlwind | — | ENABLED |
| 65 | Unown [E] | Basic / Psychic | Hidden Power | EQUIP | ENABLED |
| 66 | Unown [M] | Basic / Psychic | Hidden Power | MAGNET | ENABLED |
| 67 | Unown [T] | Basic / Psychic | Hidden Power | THROW | ENABLED |
| 68 | Vigoroth | Stage 1 / Colorless | Wake-up Punch, Fury Swipes | — | ENABLED |
| 69 | Abra | Basic / Psychic | Play Search, Ultra Evolution | — | ENABLED |
| 70 | Aipom | Basic / Colorless | Tail Whap, Throw Off | — | ENABLED |
| 71 | Aron | Basic / Metal | Steel Tackle | — | ENABLED |
| 72 | Barboach | Basic / Water | Mud Spit | — | ENABLED |
| 73 | Bidoof | Basic / Colorless | Tackle | — | ENABLED |
| 74 | Bronzor | Basic / Metal | Dull Light | — | ENABLED |
| 75 | Buizel | Basic / Water | Quick Attack | — | ENABLED |
| 76 | Chansey | Basic / Colorless | Scrunch, Double-edge | — | ENABLED |
| 77 | Chikorita | Basic / Grass | Sleep Scent, Jump On | — | ENABLED |
| 78 | Croagunk | Basic / Psychic | Ghastly Sound, Finger Poke | — | ENABLED |
| 79 | Cyndaquil | Basic / Fire | Tackle, Live Coal | — | ENABLED |
| 80 | Doduo | Basic / Colorless | Double Stab, Accelerating Stab | — | ENABLED |
| 81 | Electrike | Basic / Lightning | Electromagnetic Jam | — | ENABLED |
| 82 | Exeggcute | Basic / Grass | Direct-hit Bomb | — | ENABLED |
| 83 | Finneon | Basic / Water | Elegant Swim, Tackle | — | ENABLED |
| 84 | Geodude | Basic / Fighting | Stone Throw | — | ENABLED |
| 85 | Gible | Basic / Colorless | Push Down | — | ENABLED |
| 86 | Kricketot | Basic / Grass | Call for Family, Sling | — | ENABLED |
| 87 | Larvitar | Basic / Fighting | Mountain Bite, Hammer In | — | ENABLED |
| 88 | Magby | Basic / Fire | Scorch | Baby Evolution | ENABLED |
| 89 | Magikarp | Basic / Water | Flail, Dragon Rage | — | ENABLED |
| 90 | Murkrow | Basic / Darkness | Swarm, Hide Crowd | — | ENABLED |
| 91 | Nidoran ♀ | Basic / Psychic | Call for Family, Poison Sting | — | ENABLED |
| 92 | Paras | Basic / Grass | Scratch, Mushroom Tackle | — | ENABLED |
| 93 | Pichu | Basic / Lightning | Chupi | Baby Evolution | ENABLED |
| 94 | Pikachu | Basic / Lightning | BikaBika | Electro Recycle | ENABLED |
| 95 | Remoraid | Basic / Water | Sharpshooting, Numbing Water | — | ENABLED |
| 96 | Sandshrew | Basic / Fighting | Sand Attack, Ram | — | ENABLED |
| 97 | Seel | Basic / Water | Freezing Headbutt | — | ENABLED |
| 98 | Shinx | Basic / Lightning | Plasma | — | ENABLED |
| 99 | Slakoth | Basic / Colorless | Drowsy | — | ENABLED |
| 100 | Snorunt | Basic / Water | Collect, Snowball | — | ENABLED |
| 101 | Snover | Basic / Grass | Curiosity, Snowball Fight | — | ENABLED |
| 102 | Spheal | Basic / Water | Rollout, Willpower | — | ENABLED |
| 103 | Spinarak | Basic / Grass | Impound, Double Scratch | — | ENABLED |
| 104 | Surskit | Basic / Grass | Sleep Inducer | — | ENABLED |
| 105 | Teddiursa | Basic / Colorless | Rest, Sweet Palm | — | ENABLED |
| 106 | Totodile | Basic / Water | Bite, Shining Fang | — | ENABLED |
| 107 | Vulpix | Basic / Fire | Fire Soul | — | ENABLED |
| 108 | Zubat | Basic / Psychic | Supersonic, Bite | — | ENABLED |
| 109 | Bebe's Search | Supporter | — | — | ENABLED |
| 110 | Dusk Ball | Item | — | — | ENABLED |
| 111 | Fossil Excavator | Supporter | — | — | ENABLED |
| 112 | Lake Boundary | Stadium | — | — | ENABLED |
| 113 | Night Maintenance | Item | — | — | ENABLED |
| 114 | Quick Ball | Item | — | — | ENABLED |
| 115 | Team Galactic's Wager | Supporter | — | — | ENABLED |
| 116 | Armor Fossil | Item | — | — | ENABLED |
| 117 | Skull Fossil | Item | — | — | ENABLED |
| 118 | Multi Energy | energy | — | — | ENABLED |
| 119 | Darkness Energy | energy | — | — | ENABLED |
| 120 | Metal Energy | energy | — | — | ENABLED |
| 121 | Electivire LV.X | Level-Up / Lightning | Pulse Barrier | Shocking Tail | ENABLED |
| 122 | Lucario LV.X | Level-Up / Fighting | Close Combat | Stance | ENABLED |
| 123 | Magmortar LV.X | Level-Up / Fire | Flame Bluster | Torrid Wave | ENABLED |
| 124 | Time-Space Distortion | Item | — | — | ENABLED |
