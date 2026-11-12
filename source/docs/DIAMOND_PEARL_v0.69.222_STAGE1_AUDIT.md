# LuckyDex v0.69.222 — Diamond & Pearl Base Set, Stage 1 audit

**Baseline:** v0.69.221 Power Keepers source, after its full postrelease audit.
**Target:** v0.69.222, incremental `source/` patch.
**Master rules:** `docs/LUCKYDEX_MASTER_RULES.txt` **v2.15**, strengthened from Power Keepers lessons.
**Set:** `dp1` / Diamond & Pearl Base Set, English 130 numbered prints (May 2007). Print authority: `PokemonTCG/pokemon-tcg-data/cards/en/dp1.json`; set metadata/era rules corroborated by official Pokémon TCG coverage.

## Honest implementation status

- **130 / 130** authentic collector identities, numbering, card kind, stage, HP, types, evolution names, attack names/costs/printed base damage, Weakness magnitude, Resistance, retreat, rarity, and art references registered.
- **29 / 130** source battle-enabled in the stage: 16 Pokémon (30 attacks), five Trainers and eight Basic Energy prints. Only these have dedicated tested effects or registered safe Basic Energy semantics. **101 prints remain gated** so no fake attack or ability can enter legal battle decks.
- The gated Pokémon have card-scan art and basic attack/Power identifiers, but **the complete printed descriptive text has NOT yet been transcribed** into executable catalogue effects. Their on-card art retains the official text. Do not advertise this as full printed-card implementation.
- The three Pokémon LV.X (#120–122) are identifiable but **not yet playable**. Active-only level-up, previous-level move/Power/Body inheritance, and new era first-turn restrictions require separate shared-engine work.
- Current stage supports an additive printed Weakness (+10/+20/+30) while preserving the EX-era ×2 multiplier. Basic Darkness and Metal artworks and supply types are recognised through the established Classic Energy Zone.
- Set is selectable in Classic collection mapping, player deckbuilder, opponent set pool and set-picker. Set-only CPU builds will not necessarily succeed for all eight types while the playable subset is sparse; failing explicitly is preferable to inventing cards.

## Changes this batch

1. `tcg-classic-diamond-pearl.js`: identity catalogue, print metadata and availability gate, 30 tested attacks, five live Trainers, eight Basic Energy identities. Gated cards have explicit PARTIAL status rather than deceptive working attack buttons.
2. `tcg-classic-battle-data.js`, `tcg-classic-set-picker.js`, `tcg-classic-opponents.js`, `tcg-classic-deck-builder.js`, `index.html`: end-to-end set registration.
3. `tcgp-battle-effects.js`: Weakness value parsing supports additive `+N` without altering printed legacy `×N`.
4. `tcg-classic-deck-builder.js`: a *gated future* D&P Stage 2 cannot invalidate a legitimate Power Keepers-only Stage 1 focus. Pre-existing EX-era completed-family behaviour is preserved.
5. Version `v0.69.222`, Android `versionCode` increment, updated tests; master project rules updated to v2.15.

## What was actually tested

- New focused `tests/v07222-diamond-pearl-stage.test.cjs` contains **18** state-based tests; it executes **all 30 enabled Pokémon attacks from both player and CPU-side states (60 deterministic executions)**, verifies card coverage, effect registration, gated card exclusion and set-only deck legality.
- Specific damage outcome tests: Fire 10 + D&P Heracross Weakness +20 = 30; Water 10 + D&P Ponyta Weakness +10 = 20; older EX Machop Fighting 20 × 2 against Pichu = 40. These explicitly detect the original additive-vs-multiplier integration bug.
- Hit/condition/timing tests: Goldeen Take Down recoil; Stunky Poison 10 attack + 10 between-turn tick; Hoothoot Sleep applied before the between-turn wake flip; Drapion Poison and Stomp coin; Riolu coin-gated attack; Chimchar optional Fire discard on tails.
- Live Trainer checks: Double Full Heal removes only the applicable Active Special Conditions, Potion heals exactly two counters, Switch truly promotes a Bench Pokémon, and Poké Ball searches actual physical deck cards when its coin permits.
- Set-only player focused builds for Grass/Water/Fire/Fighting/Psychic/Darkness, real 30-card legality and no unwanted Energy type. Seeded Grass CPU build and an explicit unavailable Metal-only CPU plan.
- Cross-set regression includes Power Keepers and neighbouring EX sets. **Automated tests do NOT prove touchscreen choice placement, every coin branch, all historical matchups, artwork load in Android or sustained CPU battles.**

## Critical release gates remaining for Stage 2/3

1. Implement all 101 gated prints, starting with verified attacks and named Powers/Bodies on Dusknoir, Electivire, Luxray, Magnezone, Rhyperior and Shiftry and both player/CPU choices. No default no-op Powers.
2. Implement **three Level-Up (LV.X)** cards with exact ACTIVE-only conditions, previous-level attacks and Power/Body inheritance, level-up timing, and discard/KO stack handling. They are **not** Stage 2 evolutions.
3. DP-specific opening turn: verify LuckyDex's 30-card Classic conversion, then scope first-player draw/Trainer restrictions to this era without rewriting older EX battles. Implement +/− Weakness/Resistance protection timing and stress interactions.
4. Trainer and Stadium mechanics: Professor Rowan 'keep 1, shuffle rest, draw 4'; Rival opponent chooses three of top five; Speed Stadium repeated coin flips until tails; PlusPower attachment and timing; Energy Restore three-coin selected Basics; Night Pokémon Center 2-coins and downside. Those are **currently gated**, even though their printed text appears in metadata.
5. Extend the card-by-card correctness ledger below to include outcome tests for every unique attack, Ability and Trainer, plus interactions (Stadium–Power/Body, Level-Up–evolution, Baby–ancestry, Energy–cost, protected Bench, copy attacks).
6. Restore single-set CPU build coverage to eight types, all nine CPU archetypes, complete Stage 1/2 evolution families, correct type/energy plans and available Trainers. Test Android Test Lab choice popups and strategic opponents after source tests pass.

## Test-ledger interpretation

`FULL (stage)` means **this print is enabled in the current deliberately narrow slice**, its executable handlers have been tested through real battle-state smoke and selected outcome tests, and it may appear in player/CPU decks. It does **not** mean every possible card pairing has been proved. `GATED` means **not playable** until printed effect and era interactions are implemented and verified. The absence of an ability today is not a judgement about the printed card.

| # | ID | Card | Kind / stage | Attacks | Effect/Ability status | Deck status |
|---:|---|---|---|---|---|---|
| 1 | `dp1-1` | Dialga | pokemon / Basic | Time Bellow, Flash Cannon | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 2 | `dp1-2` | Dusknoir | pokemon / Stage 2 | Hard Feelings | GATED: Dark Palm; ability rules unimplemented | EXCLUDED |
| 3 | `dp1-3` | Electivire | pokemon / Stage 1 | Giga Impact | GATED: Intense Voltage; ability rules unimplemented | EXCLUDED |
| 4 | `dp1-4` | Empoleon | pokemon / Stage 2 | Ice Blade, Aqua Jet | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 5 | `dp1-5` | Infernape | pokemon / Stage 2 | Meteor Punch, Flare Blitz | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 6 | `dp1-6` | Lucario | pokemon / Stage 1 | Feint, Aura Sphere | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 7 | `dp1-7` | Luxray | pokemon / Stage 2 | Lightning Star | GATED: Gleam Eyes; ability rules unimplemented | EXCLUDED |
| 8 | `dp1-8` | Magnezone | pokemon / Stage 2 | Metal Blast | GATED: Magnetize; ability rules unimplemented | EXCLUDED |
| 9 | `dp1-9` | Manaphy | pokemon / Basic | Call for Family, Aqua Ring | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 10 | `dp1-10` | Mismagius | pokemon / Stage 1 | Avenge, Psywave | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 11 | `dp1-11` | Palkia | pokemon / Basic | Spacial Rend, Transback | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 12 | `dp1-12` | Rhyperior | pokemon / Stage 2 | Rock Wrecker | GATED: Earth Fissure; ability rules unimplemented | EXCLUDED |
| 13 | `dp1-13` | Roserade | pokemon / Stage 1 | Poison Sting, Spike Whip | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 14 | `dp1-14` | Shiftry | pokemon / Stage 2 | Spirit Dance | GATED: Darkness Fan; ability rules unimplemented | EXCLUDED |
| 15 | `dp1-15` | Skuntank | pokemon / Stage 1 | Frustration, Toxic Cloud | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 16 | `dp1-16` | Staraptor | pokemon / Stage 2 | Accelerative Dive, Brave Heart | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 17 | `dp1-17` | Torterra | pokemon / Stage 2 | Body Slam, Leaf Storm | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 18 | `dp1-18` | Azumarill | pokemon / Stage 1 | Defense Curl, Bubble Pump | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 19 | `dp1-19` | Beautifly | pokemon / Stage 2 | Whirlwind, Giga Drain | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 20 | `dp1-20` | Bibarel | pokemon / Stage 1 | Rest, Take Down | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 21 | `dp1-21` | Carnivine | pokemon / Basic | Swallow Up, Wring Out | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 22 | `dp1-22` | Clefable | pokemon / Stage 1 | Double Slap, Metronome | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 23 | `dp1-23` | Drapion | pokemon / Stage 1 | Stomp, Poison Claws | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 24 | `dp1-24` | Drifblim | pokemon / Stage 1 | Wind Wave, Explosive Smoke | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 25 | `dp1-25` | Dustox | pokemon / Stage 2 | Stun Spore, Toxic Dust | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 26 | `dp1-26` | Floatzel | pokemon / Stage 1 | Screw Tail, Water Gun | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 27 | `dp1-27` | Gengar | pokemon / Stage 2 | Life Drain, Shadow Dance | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 28 | `dp1-28` | Heracross | pokemon / Basic | Pitch, Horn Slash | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 29 | `dp1-29` | Hippowdon | pokemon / Stage 1 | Vacuum Up, Sand Eject | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 30 | `dp1-30` | Lopunny | pokemon / Stage 1 | Healing Wish, Flop | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 31 | `dp1-31` | Machamp | pokemon / Stage 2 | Revenge, Dynamic Punch | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 32 | `dp1-32` | Medicham | pokemon / Stage 1 | Force Palm, Spinning Kick | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 33 | `dp1-33` | Munchlax | pokemon / Basic | Heave | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 34 | `dp1-34` | Noctowl | pokemon / Stage 1 | See Beyond, Extrasensory | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 35 | `dp1-35` | Pachirisu | pokemon / Basic | Minor Errand-Running, Thunder Jolt | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 36 | `dp1-36` | Purugly | pokemon / Stage 1 | High Hat, Body Slam | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 37 | `dp1-37` | Snorlax | pokemon / Basic | Block, Ease Up | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 38 | `dp1-38` | Steelix | pokemon / Stage 1 | Slam, Metal Slash | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 39 | `dp1-39` | Vespiquen | pokemon / Stage 1 | Leaf Honey, Attack Order | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 40 | `dp1-40` | Weavile | pokemon / Stage 1 | Nasty Plot, Dark Pulse | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 41 | `dp1-41` | Wobbuffet | pokemon / Basic | Countercharge | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 42 | `dp1-42` | Wynaut | pokemon / Basic | Astonish | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 43 | `dp1-43` | Budew | pokemon / Basic | Errand-Running | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 44 | `dp1-44` | Cascoon | pokemon / Stage 1 | Harden, Gooey Thread | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 45 | `dp1-45` | Cherrim | pokemon / Stage 1 | Worry Seed, Magical Leaf | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 46 | `dp1-46` | Drifloon | pokemon / Basic | Blowing Wind, Ominous Wind | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 47 | `dp1-47` | Dusclops | pokemon / Stage 1 | Roam, Gravity Wave | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 48 | `dp1-48` | Elekid | pokemon / Basic | Outlet | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 49 | `dp1-49` | Grotle | pokemon / Stage 1 | Synthesis, Cut | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 50 | `dp1-50` | Haunter | pokemon / Stage 1 | Hypnosis, Dream Eater | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 51 | `dp1-51` | Hippopotas | pokemon / Basic | Yawn, Sand Attack | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 52 | `dp1-52` | Luxio | pokemon / Stage 1 | Fasten Claws, Thunder Fang | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 53 | `dp1-53` | Machoke | pokemon / Stage 1 | Karate Chop, Seismic Toss | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 54 | `dp1-54` | Magneton | pokemon / Stage 1 | Tri Attack, Magnetic Ray | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 55 | `dp1-55` | Mantyke | pokemon / Basic | Call for Friends | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 56 | `dp1-56` | Monferno | pokemon / Stage 1 | Flame Dance, Fury Swipes | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 57 | `dp1-57` | Nuzleaf | pokemon / Stage 1 | Dirty Trick, Razor Wind | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 58 | `dp1-58` | Prinplup | pokemon / Stage 1 | Aqua Shower, Brine | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 59 | `dp1-59` | Rapidash | pokemon / Stage 1 | Overrun, Blaze Up | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 60 | `dp1-60` | Rhydon | pokemon / Stage 1 | Storm Up, Crash Impact | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 61 | `dp1-61` | Riolu | pokemon / Basic | Wild Kick | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 62 | `dp1-62` | Seaking | pokemon / Stage 1 | Flail, Horn Drill | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 63 | `dp1-63` | Silcoon | pokemon / Stage 1 | Harden, Entangling String | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 64 | `dp1-64` | Staravia | pokemon / Stage 1 | Whirlwind, Clutch | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 65 | `dp1-65` | Unown [A] | pokemon / Basic | Hidden Power | GATED: ANALYZE; ability rules unimplemented | EXCLUDED |
| 66 | `dp1-66` | Unown [B] | pokemon / Basic | Hidden Power | GATED: BOUNCE; ability rules unimplemented | EXCLUDED |
| 67 | `dp1-67` | Unown [C] | pokemon / Basic | Hidden Power | GATED: CALL; ability rules unimplemented | EXCLUDED |
| 68 | `dp1-68` | Unown [D] | pokemon / Basic | Hidden Power | GATED: DRAW; ability rules unimplemented | EXCLUDED |
| 69 | `dp1-69` | Azurill | pokemon / Basic | Delivery | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 70 | `dp1-70` | Bidoof | pokemon / Basic | Amnesia, Scavenge | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 71 | `dp1-71` | Bonsly | pokemon / Basic | Fake Tears | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 72 | `dp1-72` | Buizel | pokemon / Basic | Splash About | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 73 | `dp1-73` | Buneary | pokemon / Basic | Splash, Jump Kick | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 74 | `dp1-74` | Chatot | pokemon / Basic | Me First, Tone-Deaf | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 75 | `dp1-75` | Cherubi | pokemon / Basic | Sleep Powder, Leech Seed | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 76 | `dp1-76` | Chimchar | pokemon / Basic | Scratch, Ember | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 77 | `dp1-77` | Clefairy | pokemon / Basic | Sing, Moon Impact | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 78 | `dp1-78` | Cleffa | pokemon / Basic | Eeek | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 79 | `dp1-79` | Combee | pokemon / Basic | Soliciting Nectar, Gust | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 80 | `dp1-80` | Duskull | pokemon / Basic | Disable, Night Shade | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 81 | `dp1-81` | Electabuzz | pokemon / Basic | Thunderpunch, Shock Wave | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 82 | `dp1-82` | Gastly | pokemon / Basic | Pain Payback | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 83 | `dp1-83` | Glameow | pokemon / Basic | Charm, Pose | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 84 | `dp1-84` | Goldeen | pokemon / Basic | Horn Attack, Take Down | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 85 | `dp1-85` | Hoothoot | pokemon / Basic | Hypnosis, Kick Shot | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 86 | `dp1-86` | Machop | pokemon / Basic | Low Kick | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 87 | `dp1-87` | Magnemite | pokemon / Basic | Metal Sound, Resonance | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 88 | `dp1-88` | Marill | pokemon / Basic | Rollout, Splashing Turn | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 89 | `dp1-89` | Meditite | pokemon / Basic | Detect, Meditate | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 90 | `dp1-90` | Mime Jr. | pokemon / Basic | Mime | GATED: Baby Evolution; ability rules unimplemented | EXCLUDED |
| 91 | `dp1-91` | Misdreavus | pokemon / Basic | Astonish, Confuse Ray | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 92 | `dp1-92` | Onix | pokemon / Basic | Tunneling, Headbutt | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 93 | `dp1-93` | Piplup | pokemon / Basic | Peck, Water Splash | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 94 | `dp1-94` | Ponyta | pokemon / Basic | Tackle, Flame Tail | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 95 | `dp1-95` | Rhyhorn | pokemon / Basic | Horn Attack, Take Down | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 96 | `dp1-96` | Roselia | pokemon / Basic | Toxic Spikes, Sweet Spike | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 97 | `dp1-97` | Seedot | pokemon / Basic | Bide, Rollout | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 98 | `dp1-98` | Shinx | pokemon / Basic | Spark | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 99 | `dp1-99` | Skorupi | pokemon / Basic | Poison Sting, Pin Missile | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 100 | `dp1-100` | Sneasel | pokemon / Basic | Double Slap, Feint Attack | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 101 | `dp1-101` | Starly | pokemon / Basic | Gust, Quick Attack | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 102 | `dp1-102` | Stunky | pokemon / Basic | Scratch, Severe Gas | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 103 | `dp1-103` | Turtwig | pokemon / Basic | Tackle, Razor Leaf | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 104 | `dp1-104` | Wurmple | pokemon / Basic | Needling Sting, String Shot | FULL (stage): executable + 60-run combined attack sweep; targeted tests | ENABLED |
| 105 | `dp1-105` | Double Full Heal | trainer / — | — | FULL (stage): selected Trainer state tests | ENABLED |
| 106 | `dp1-106` | Energy Restore | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 107 | `dp1-107` | Energy Switch | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 108 | `dp1-108` | Night Pokémon Center | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 109 | `dp1-109` | PlusPower | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 110 | `dp1-110` | Poké Ball | trainer / — | — | FULL (stage): selected Trainer state tests | ENABLED |
| 111 | `dp1-111` | Pokédex HANDY910is | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 112 | `dp1-112` | Professor Rowan | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 113 | `dp1-113` | Rival | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 114 | `dp1-114` | Speed Stadium | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 115 | `dp1-115` | Super Scoop Up | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 116 | `dp1-116` | Warp Point | trainer / — | — | GATED: full attack/Trainer effect not yet verified | EXCLUDED |
| 117 | `dp1-117` | Energy Search | trainer / — | — | FULL (stage): selected Trainer state tests | ENABLED |
| 118 | `dp1-118` | Potion | trainer / — | — | FULL (stage): selected Trainer state tests | ENABLED |
| 119 | `dp1-119` | Switch | trainer / — | — | FULL (stage): selected Trainer state tests | ENABLED |
| 120 | `dp1-120` | Empoleon LV.X | pokemon / Level-Up | Hydro Impact | GATED: LV.X mechanic and previous-level inheritance missing | EXCLUDED |
| 121 | `dp1-121` | Infernape LV.X | pokemon / Level-Up | Flare Up | GATED: LV.X mechanic and previous-level inheritance missing | EXCLUDED |
| 122 | `dp1-122` | Torterra LV.X | pokemon / Level-Up | Vigorous Dash | GATED: LV.X mechanic and previous-level inheritance missing | EXCLUDED |
| 123 | `dp1-123` | Grass Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 124 | `dp1-124` | Fire Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 125 | `dp1-125` | Water Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 126 | `dp1-126` | Lightning Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 127 | `dp1-127` | Psychic Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 128 | `dp1-128` | Fighting Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 129 | `dp1-129` | Darkness Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |
| 130 | `dp1-130` | Metal Energy | energy / — | — | Basic Energy: source print/Zone identity | ENERGY ZONE (not deck slot) |

## Installation / reversibility

Prerequisite: source **v0.69.221** and its prior patches installed in order.

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.222_DP1_STAGE1.zip -d source
git add source
git commit -m "LuckyDex v0.69.222 Diamond Pearl staged set and master rules v2.15"
git push origin main
```

No APK has been built or tested on a phone. If the test-only DP1 set doesn't produce a particular type's CPU opponent yet, that is expected at this **stage**, not permission to enable unimplemented cards.
