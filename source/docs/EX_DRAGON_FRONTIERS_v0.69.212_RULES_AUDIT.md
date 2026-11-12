# EX Dragon Frontiers (ex15) — per-card printed-rule, combat, metadata and CPU audit

**LuckyDex source:** v0.69.212 (based on v0.69.211)  
**Date:** 12 November 2026  
**Printed reference:** PokémonTCG/pokemon-tcg-data `cards/en/ex15.json` (101 English numbered cards)  
**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt` document v2.6  
**Status:** **101 catalogued / 82 battle-enabled / 19 PARTIAL**. This is a staged release, not a claim that all printed cards are fully executable.

## What was checked

- Card identity, exact collector number, species, official-style image mapping, evolution chain, attack costs, named Powers/Bodies, type, weakness, resistance, stage, HP and retreat metadata.
- Card registration in collection, Test Lab, Classic set picker, player auto-builder and CPU opponent builder. Correct 30-card plus separate Basic Energy Zone rules.
- Actual Energy attached/provider behaviour for ex15 Holon Energy reprints, δ Rainbow, Boost and Scramble, including ex14 Crystal Beach and Prize/Stage conditions.
- Tool attachment, optional Powers and support Trainers with real discard/hand/deck choices. Between-turn and multi-target damage and visual logs have targeted outcome tests.
- Evolution chains, type-aware and dependency-aware deck building, ownership, card limits and CPU seed variation.
- **Do not interpret 82 battle-enabled as an exhaustive proof of every possible card/turn combination.** Complex printed exceptions below remain gated.

## Outstanding PARTIAL cards (not allowed into automatic/live decks)

- **Ampharos δ (`ex15-1`):** Holon Veil changes δ identity of cards in every zone; global identity propagation not yet fully verified.
- **Feraligatr δ (`ex15-2`):** Drag Off must switch the Defending Pokémon before damage, not after it; Battle Aura is tested but the attack timing is still gated.
- **Milotic δ (`ex15-5`):** Sharing copies an opponent Supporter without removing it: interactive opponent-hand choice pending.
- **Ninetales δ (`ex15-8`):** Volunteer must devolve/re-evolve Ninetales and heal exactly four counters.
- **Snorlax δ (`ex15-10`):** Bedhead and Dozing need asleep-between-turns/choice support.
- **Togetic δ (`ex15-11`):** Delta Copy requires choosing an opposing δ attack and paying copied costs.
- **Typhlosion δ (`ex15-12`):** Shady Move chooses source and destination damage counters for either player.
- **Smoochum δ (`ex15-64`):** Baby Evolution and simultaneous Basic/Energy Zone search pending.
- **Holon Legacy (`ex15-74`):** Holon Legacy must suppress δ Powers/Weakness for both players.
- **Island Hermit (`ex15-76`):** Island Hermit turns chosen Prize cards face up for remainder of game.
- **Dragonite ex δ (`ex15-91`):** Dragon Roar overflow assigns damage counters across opponent Bench.
- **Gardevoir ex δ (`ex15-93`):** Gardevoir ex Imprison counters and Fire transfer need verification.
- **Kingdra ex δ (`ex15-94`):** Kingdra ex Extra Smoke and Energy Link discard attachment pending.
- **Latias ex δ (`ex15-95`):** Latias ex Fellow Boost attaches from hand and ends turn.
- **Rayquaza ex δ (`ex15-97`):** Rayquaza ex Rage Aura changes attack costs by Prize state.
- **Salamence ex δ (`ex15-98`):** Salamence ex Type Shift and optional split attack targeting.
- **Tyranitar ex δ (`ex15-99`):** Tyranitar ex Shock-wave markers and knockout targeting.
- **Charizard ★ δ (`ex15-100`):** Charizard Star conditional swap/discard and deck mill.
- **Mew ★ δ (`ex15-101`):** Mew Star copied attack cost/selection and typed multi-target damage.

## All 101 cards — individual ledger

| No. | Card | Type/role | Status | Attacks; Powers/Body |
|---:|---|---|---|---|
| 1 | Ampharos δ | Colorless | **PARTIAL** | Delta Circle; Holon Veil |
| 2 | Feraligatr δ | Lightning | **PARTIAL** | Drag Off, Sharp Fang; Battle Aura |
| 3 | Heracross δ | Fire | ENABLED | Dig Deep, Extra Claws; Shining Horn |
| 4 | Meganium δ | Fighting | ENABLED | Delta Reduction, Mega Impact; Evolutionary Call |
| 5 | Milotic δ | Fire | **PARTIAL** | Flare; Sharing |
| 6 | Nidoking δ | Darkness | ENABLED | Linear Attack, Dark Horn |
| 7 | Nidoqueen δ | Metal | ENABLED | Vengeance; Invitation |
| 8 | Ninetales δ | Psychic | **PARTIAL** | Trick Tail; Volunteer |
| 9 | Pinsir δ | Fighting | ENABLED | Delta Call, Guillotine; Armor |
| 10 | Snorlax δ | Grass | **PARTIAL** | Bedhead, Dozing |
| 11 | Togetic δ | Water | **PARTIAL** | Delta Copy, Wave Splash |
| 12 | Typhlosion δ | Psychic | **PARTIAL** | Burning Ball; Shady Move |
| 13 | Arbok δ | Fire | ENABLED | Burning Venom, Strangle |
| 14 | Cloyster δ | Fighting | ENABLED | Grind; Solid Shell |
| 15 | Dewgong δ | Colorless | ENABLED | Ice Beam, Surge; Delta Protection |
| 16 | Gligar δ | Lightning | ENABLED | Sting Turn, Tail Sting |
| 17 | Jynx δ | Fire | ENABLED | Fire Punch; Stages of Evolution |
| 18 | Ledian δ | Metal | ENABLED | Metal Star; Prowl |
| 19 | Lickitung δ | Psychic | ENABLED | Lap Up, Delta Mind |
| 20 | Mantine δ | Lightning | ENABLED | Spiral Drain; Power Circulation |
| 21 | Quagsire δ | Grass | ENABLED | Pump Out; Dig Up |
| 22 | Seadra δ | Fighting | ENABLED | Smokescreen, Razor Wing |
| 23 | Tropius δ | Metal | ENABLED | Grind; Tropical Heal |
| 24 | Vibrava δ | Psychic | ENABLED | Quick Blow; Psychic Wing |
| 25 | Xatu δ | Darkness | ENABLED | Confuse Ray; Extra Feather |
| 26 | Bayleef δ | Fighting | ENABLED | Poisonpowder |
| 27 | Croconaw δ | Lightning | ENABLED | Scary Face, Slash |
| 28 | Dragonair δ | Grass | ENABLED | Wrap, Horn Attack |
| 29 | Electabuzz δ | Fighting | ENABLED | Swift; Power of Evolution |
| 30 | Flaaffy δ | Colorless | ENABLED | Thundershock |
| 31 | Horsea δ | Fighting | ENABLED | Tackle, Reverse Thrust |
| 32 | Kirlia | Psychic | ENABLED | Psyshock, Link Blast |
| 33 | Kirlia δ | Fire | ENABLED | Flickering Flames, Smack |
| 34 | Nidorina δ | Metal | ENABLED | Poison Sting, Rear Kick |
| 35 | Nidorino δ | Darkness | ENABLED | Rage, Horn Drill |
| 36 | Quilava δ | Psychic | ENABLED | Smash Kick, Quick Attack |
| 37 | Seadra δ | Fighting | ENABLED | Ram, Extra Ball |
| 38 | Shelgon δ | Water | ENABLED | Headbutt, Double-edge |
| 39 | Smeargle δ | Psychic | ENABLED | Collect, Flickering Tail |
| 40 | Swellow δ | Fire | ENABLED | Agility; Extra Wing |
| 41 | Togepi δ | Water | ENABLED | Charm |
| 42 | Vibrava δ | Psychic | ENABLED | Bite, Sonic Noise |
| 43 | Bagon δ | Water | ENABLED | Granite Head |
| 44 | Chikorita δ | Fighting | ENABLED | Sleep Powder, Tackle |
| 45 | Cyndaquil δ | Psychic | ENABLED | Swift |
| 46 | Dratini δ | Grass | ENABLED | Ram |
| 47 | Ekans δ | Fire | ENABLED | Bite, Tail Snap |
| 48 | Elekid δ | Fighting | ENABLED | Thunder Spear; Baby Evolution |
| 49 | Feebas δ | Fire | ENABLED | Flail |
| 50 | Horsea δ | Fighting | ENABLED | Sleepy Ball |
| 51 | Larvitar | Fighting | ENABLED | Bite, Mud Slap |
| 52 | Larvitar δ | Lightning | ENABLED | Paralyzing Gaze, Horn Attack |
| 53 | Ledyba δ | Metal | ENABLED | Tackle, Supersonic |
| 54 | Mareep δ | Colorless | ENABLED | Tail Whap |
| 55 | Natu δ | Darkness | ENABLED | Flop |
| 56 | Nidoran ♀ δ | Metal | ENABLED | Tail Whip, Scratch |
| 57 | Nidoran ♂ δ | Darkness | ENABLED | Peck, Poison Horn |
| 58 | Pupitar | Fighting | ENABLED | Headbutt |
| 59 | Pupitar δ | Lightning | ENABLED | Hyper Beam |
| 60 | Ralts | Psychic | ENABLED | Hypnosis, Psychic Boom |
| 61 | Ralts δ | Fire | ENABLED | Calm Mind, Will-o'-the-wisp |
| 62 | Seel δ | Colorless | ENABLED | Pound, Aurora Beam |
| 63 | Shellder δ | Fighting | ENABLED | Shell Grab |
| 64 | Smoochum δ | Fire | **PARTIAL** | Alluring Kiss; Baby Evolution |
| 65 | Swablu δ | Water | ENABLED | Splash About |
| 66 | Taillow δ | Fire | ENABLED | Quick Attack |
| 67 | Totodile δ | Lightning | ENABLED | Scratch, Rage |
| 68 | Trapinch δ | Psychic | ENABLED | Gnaw, Dig |
| 69 | Trapinch δ | Psychic | ENABLED | Quick Bind |
| 70 | Vulpix δ | Psychic | ENABLED | Hypnotic Gaze, Will-o'-the-wisp |
| 71 | Wooper δ | Grass | ENABLED | Amnesia, Tail Slap |
| 72 | Buffer Piece | Other | ENABLED | — |
| 73 | Copycat | Other | ENABLED | — |
| 74 | Holon Legacy | Other | **PARTIAL** | — |
| 75 | Holon Mentor | Other | ENABLED | — |
| 76 | Island Hermit | Other | **PARTIAL** | — |
| 77 | Mr. Stone's Project | Other | ENABLED | — |
| 78 | Old Rod | Other | ENABLED | — |
| 79 | Professor Elm's Training Method | Other | ENABLED | — |
| 80 | Professor Oak's Research | Other | ENABLED | — |
| 81 | Strength Charm | Other | ENABLED | — |
| 82 | TV Reporter | Other | ENABLED | — |
| 83 | Switch | Other | ENABLED | — |
| 84 | Holon Energy FF | Colorless | ENABLED | — |
| 85 | Holon Energy GL | Colorless | ENABLED | — |
| 86 | Holon Energy WP | Colorless | ENABLED | — |
| 87 | Boost Energy | Colorless | ENABLED | — |
| 88 | δ Rainbow Energy | Colorless | ENABLED | — |
| 89 | Scramble Energy | Colorless | ENABLED | — |
| 90 | Altaria ex δ | Water | ENABLED | Healing Light; Extra Boost |
| 91 | Dragonite ex δ | Grass | **PARTIAL** | Deafen, Dragon Roar |
| 92 | Flygon ex δ | Psychic | ENABLED | Psychic Pulse; Sand Damage |
| 93 | Gardevoir ex δ | Fire | **PARTIAL** | Flame Ball; Imprison |
| 94 | Kingdra ex δ | Fighting | **PARTIAL** | Energy Link, Protective Swirl; Extra Smoke |
| 95 | Latias ex δ | Fire | **PARTIAL** | Power Crush; Fellow Boost |
| 96 | Latios ex δ | Water | ENABLED | Ice Barrier, Hydro Splash; Link Wing |
| 97 | Rayquaza ex δ | Lightning | **PARTIAL** | Special Circuit, Sky-high Claws; Rage Aura |
| 98 | Salamence ex δ | Water | **PARTIAL** | Claw Swipe, Dual Stream; Type Shift |
| 99 | Tyranitar ex δ | Lightning | **PARTIAL** | Electromark, Hyper Claws, Shock-wave |
| 100 | Charizard ★ δ | Darkness | **PARTIAL** | Rotating Claws, Dark Swirl |
| 101 | Mew ★ δ | Water | **PARTIAL** | Mimicry, Rainbow Wave |

## Verification and caveats

- `tests/v07212-ex-dragon-frontiers.test.cjs`: 38 focused state tests passing. **Combined adjacent EX and deck-builder regression suites: 143/143 passing**. Includes 101 card IDs, every gated card, damage, protection, 3-Bench rules, Energy, hand/deck/discard movement, three-class Tool usage and CPU deck checks.
- CPU builder legality was exercised across nine type archetypes and seven seeded configurations (63 candidate decks) before final release packaging.
- Cross-set adjacent Crystal Guardians, Holon Phantoms, Delta Species, optional Charizard Power, and recent deck-builder tests are rerun for this release.
- Printed special mechanics still PARTIAL are not forced through generic fallback behavior. The four gated ex14 cards have not been completed by this release.
- Manual Android testing, real on-device artwork resolution and long-match CPU behaviour remain outstanding.
