# LuckyDex v0.69.230 — Diamond & Pearl 130-card action audit and Steelix/Staraptor timing fix

**Base:** v0.69.229; incremental overlay into `~/lucky-dex/source/`.
**New version:** `0.69.230` / Android `versionCode 7219`. **Master rules:** v2.23.

## User-reported defect

- Steelix #38 Metal Slash was defined as `lock('attack','self')`, whose default duration was `opponentTurn`. The printed text forbids attacking during **your own next turn**, so Steelix was illegally permitted to attack at turn N+2. The effect now explicitly uses `nextOwnTurn`. Both Slam and Metal Slash are unavailable on N+2 and return on N+4. Player and CPU paths are checked with actual turn advancement. Switching Steelix out clears this temporary attack effect.

## Additional genuine defect uncovered in the full-set audit

- Staraptor #16 Accelerative Dive shields from attacks **until the end of its own next turn** on heads, not only the opponent turn. Its guard now has an explicit validated `nextOwnTurn` duration and expires on the correct turn. This also blocks Brave Heart self-attack damage when the guard is still in force; the previous generic selfDamage handler incorrectly dealt damage/knocked out Staraptor despite the guard. The underlying Brave Heart coin outcome is still rolled and logged.

## Cross-set UI regression corrected

- The earlier v0.69.229 choice-label clarity fix displayed an unnecessary `BASIC ENERGY` subtitle under plain Energy artwork. The generic choice renderer now suppresses exact/redundant “Find Fire Energy”/card-name labels when art is sufficient, while preserving descriptive differences for copied attacks and meaningful outcome choices. The artwork retains an accessible label.

## Coverage methodology and limitations

- Read the executable 130-card catalogue and recursively validate **every Pokémon attack** and **all 15 Trainer effects**, rejecting missing/placeholder text and gated entries.
- Construct high-Energy, supported-bench, deck, hand, discard and valid-LV.X-stack battle states, and invoke **every one of 186 printed Pokémon attacks from both human and opponent seats**: **372/372 selected attacks**, with pending choices resolved and no runtime errors. This is an executable action-path smoke, not proof that every conditional print outcome has been exhaustively simulated.
- Execute play actions for all **15 Trainers** from both seats (**30/30 actions**), with any offered effect choices resolved; every card can be played in a prepared legal state.
- Explicit turn-transition tests cover Steelix locking both moves on the next owner turn, recovery after that turn, switching clearing attack locks, and Staraptor guarding its own next-turn Brave Heart recoil. Static rule assertions cover Onix, Rhyperior and Empoleon LV.X nextOwnTurn locks.
- Existing D&P detailed tests cover many printed damage, Energy, trainer, LV.X and hidden-choice consequences; source-level action smoke does not replace device play, long CPU matches or outcome verification of every random branch. **No APK built, no Android UI test performed, no GitHub push.**

## 130-card audit ledger

| Print | Card | Kind | Registered attacks or Powers | Action check |
|---|---|---|---|---|
| dp1-1 | Dialga | pokemon | Time Bellow, Flash Cannon | 4 selectable executions (2 seats) |
| dp1-2 | Dusknoir | pokemon | Hard Feelings, Power/Body: Dark Palm | 2 selectable executions (2 seats) |
| dp1-3 | Electivire | pokemon | Giga Impact, Power/Body: Intense Voltage | 2 selectable executions (2 seats) |
| dp1-4 | Empoleon | pokemon | Ice Blade, Aqua Jet | 4 selectable executions (2 seats) |
| dp1-5 | Infernape | pokemon | Meteor Punch, Flare Blitz | 4 selectable executions (2 seats) |
| dp1-6 | Lucario | pokemon | Feint, Aura Sphere | 4 selectable executions (2 seats) |
| dp1-7 | Luxray | pokemon | Lightning Star, Power/Body: Gleam Eyes | 2 selectable executions (2 seats) |
| dp1-8 | Magnezone | pokemon | Metal Blast, Power/Body: Magnetize | 2 selectable executions (2 seats) |
| dp1-9 | Manaphy | pokemon | Call for Family, Aqua Ring | 4 selectable executions (2 seats) |
| dp1-10 | Mismagius | pokemon | Avenge, Psywave | 4 selectable executions (2 seats) |
| dp1-11 | Palkia | pokemon | Spacial Rend, Transback | 4 selectable executions (2 seats) |
| dp1-12 | Rhyperior | pokemon | Rock Wrecker, Power/Body: Earth Fissure | 2 selectable executions (2 seats) |
| dp1-13 | Roserade | pokemon | Poison Sting, Spike Whip | 4 selectable executions (2 seats) |
| dp1-14 | Shiftry | pokemon | Spirit Dance, Power/Body: Darkness Fan | 2 selectable executions (2 seats) |
| dp1-15 | Skuntank | pokemon | Frustration, Toxic Cloud | 4 selectable executions (2 seats) |
| dp1-16 | Staraptor | pokemon | Accelerative Dive, Brave Heart | 4 selectable executions (2 seats) |
| dp1-17 | Torterra | pokemon | Body Slam, Leaf Storm | 4 selectable executions (2 seats) |
| dp1-18 | Azumarill | pokemon | Defense Curl, Bubble Pump | 4 selectable executions (2 seats) |
| dp1-19 | Beautifly | pokemon | Whirlwind, Giga Drain | 4 selectable executions (2 seats) |
| dp1-20 | Bibarel | pokemon | Rest, Take Down | 4 selectable executions (2 seats) |
| dp1-21 | Carnivine | pokemon | Swallow Up, Wring Out | 4 selectable executions (2 seats) |
| dp1-22 | Clefable | pokemon | Double Slap, Metronome | 4 selectable executions (2 seats) |
| dp1-23 | Drapion | pokemon | Stomp, Poison Claws | 4 selectable executions (2 seats) |
| dp1-24 | Drifblim | pokemon | Wind Wave, Explosive Smoke | 4 selectable executions (2 seats) |
| dp1-25 | Dustox | pokemon | Stun Spore, Toxic Dust | 4 selectable executions (2 seats) |
| dp1-26 | Floatzel | pokemon | Screw Tail, Water Gun | 4 selectable executions (2 seats) |
| dp1-27 | Gengar | pokemon | Life Drain, Shadow Dance | 4 selectable executions (2 seats) |
| dp1-28 | Heracross | pokemon | Pitch, Horn Slash | 4 selectable executions (2 seats) |
| dp1-29 | Hippowdon | pokemon | Vacuum Up, Sand Eject | 4 selectable executions (2 seats) |
| dp1-30 | Lopunny | pokemon | Healing Wish, Flop | 4 selectable executions (2 seats) |
| dp1-31 | Machamp | pokemon | Revenge, Dynamic Punch | 4 selectable executions (2 seats) |
| dp1-32 | Medicham | pokemon | Force Palm, Spinning Kick | 4 selectable executions (2 seats) |
| dp1-33 | Munchlax | pokemon | Heave, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-34 | Noctowl | pokemon | See Beyond, Extrasensory | 4 selectable executions (2 seats) |
| dp1-35 | Pachirisu | pokemon | Minor Errand-Running, Thunder Jolt | 4 selectable executions (2 seats) |
| dp1-36 | Purugly | pokemon | High Hat, Body Slam | 4 selectable executions (2 seats) |
| dp1-37 | Snorlax | pokemon | Block, Ease Up | 4 selectable executions (2 seats) |
| dp1-38 | Steelix | pokemon | Slam, Metal Slash | 4 selectable executions (2 seats) |
| dp1-39 | Vespiquen | pokemon | Leaf Honey, Attack Order | 4 selectable executions (2 seats) |
| dp1-40 | Weavile | pokemon | Nasty Plot, Dark Pulse | 4 selectable executions (2 seats) |
| dp1-41 | Wobbuffet | pokemon | Countercharge | 2 selectable executions (2 seats) |
| dp1-42 | Wynaut | pokemon | Astonish, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-43 | Budew | pokemon | Errand-Running, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-44 | Cascoon | pokemon | Harden, Gooey Thread | 4 selectable executions (2 seats) |
| dp1-45 | Cherrim | pokemon | Worry Seed, Magical Leaf | 4 selectable executions (2 seats) |
| dp1-46 | Drifloon | pokemon | Blowing Wind, Ominous Wind | 4 selectable executions (2 seats) |
| dp1-47 | Dusclops | pokemon | Roam, Gravity Wave | 4 selectable executions (2 seats) |
| dp1-48 | Elekid | pokemon | Outlet, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-49 | Grotle | pokemon | Synthesis, Cut | 4 selectable executions (2 seats) |
| dp1-50 | Haunter | pokemon | Hypnosis, Dream Eater | 4 selectable executions (2 seats) |
| dp1-51 | Hippopotas | pokemon | Yawn, Sand Attack | 4 selectable executions (2 seats) |
| dp1-52 | Luxio | pokemon | Fasten Claws, Thunder Fang | 4 selectable executions (2 seats) |
| dp1-53 | Machoke | pokemon | Karate Chop, Seismic Toss | 4 selectable executions (2 seats) |
| dp1-54 | Magneton | pokemon | Tri Attack, Magnetic Ray | 4 selectable executions (2 seats) |
| dp1-55 | Mantyke | pokemon | Call for Friends, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-56 | Monferno | pokemon | Flame Dance, Fury Swipes | 4 selectable executions (2 seats) |
| dp1-57 | Nuzleaf | pokemon | Dirty Trick, Razor Wind | 4 selectable executions (2 seats) |
| dp1-58 | Prinplup | pokemon | Aqua Shower, Brine | 4 selectable executions (2 seats) |
| dp1-59 | Rapidash | pokemon | Overrun, Blaze Up | 4 selectable executions (2 seats) |
| dp1-60 | Rhydon | pokemon | Storm Up, Crash Impact | 4 selectable executions (2 seats) |
| dp1-61 | Riolu | pokemon | Wild Kick | 2 selectable executions (2 seats) |
| dp1-62 | Seaking | pokemon | Flail, Horn Drill | 4 selectable executions (2 seats) |
| dp1-63 | Silcoon | pokemon | Harden, Entangling String | 4 selectable executions (2 seats) |
| dp1-64 | Staravia | pokemon | Whirlwind, Clutch | 4 selectable executions (2 seats) |
| dp1-65 | Unown [A] | pokemon | Hidden Power, Power/Body: ANALYZE | 2 selectable executions (2 seats) |
| dp1-66 | Unown [B] | pokemon | Hidden Power, Power/Body: BOUNCE | 2 selectable executions (2 seats) |
| dp1-67 | Unown [C] | pokemon | Hidden Power, Power/Body: CALL | 2 selectable executions (2 seats) |
| dp1-68 | Unown [D] | pokemon | Hidden Power, Power/Body: DRAW | 2 selectable executions (2 seats) |
| dp1-69 | Azurill | pokemon | Delivery, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-70 | Bidoof | pokemon | Amnesia, Scavenge | 4 selectable executions (2 seats) |
| dp1-71 | Bonsly | pokemon | Fake Tears, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-72 | Buizel | pokemon | Splash About | 2 selectable executions (2 seats) |
| dp1-73 | Buneary | pokemon | Splash, Jump Kick | 4 selectable executions (2 seats) |
| dp1-74 | Chatot | pokemon | Me First, Tone-Deaf | 4 selectable executions (2 seats) |
| dp1-75 | Cherubi | pokemon | Sleep Powder, Leech Seed | 4 selectable executions (2 seats) |
| dp1-76 | Chimchar | pokemon | Scratch, Ember | 4 selectable executions (2 seats) |
| dp1-77 | Clefairy | pokemon | Sing, Moon Impact | 4 selectable executions (2 seats) |
| dp1-78 | Cleffa | pokemon | Eeek, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-79 | Combee | pokemon | Soliciting Nectar, Gust | 4 selectable executions (2 seats) |
| dp1-80 | Duskull | pokemon | Disable, Night Shade | 4 selectable executions (2 seats) |
| dp1-81 | Electabuzz | pokemon | Thunderpunch, Shock Wave | 4 selectable executions (2 seats) |
| dp1-82 | Gastly | pokemon | Pain Payback | 2 selectable executions (2 seats) |
| dp1-83 | Glameow | pokemon | Charm, Pose | 4 selectable executions (2 seats) |
| dp1-84 | Goldeen | pokemon | Horn Attack, Take Down | 4 selectable executions (2 seats) |
| dp1-85 | Hoothoot | pokemon | Hypnosis, Kick Shot | 4 selectable executions (2 seats) |
| dp1-86 | Machop | pokemon | Low Kick | 2 selectable executions (2 seats) |
| dp1-87 | Magnemite | pokemon | Metal Sound, Resonance | 4 selectable executions (2 seats) |
| dp1-88 | Marill | pokemon | Rollout, Splashing Turn | 4 selectable executions (2 seats) |
| dp1-89 | Meditite | pokemon | Detect, Meditate | 4 selectable executions (2 seats) |
| dp1-90 | Mime Jr. | pokemon | Mime, Power/Body: Baby Evolution | 2 selectable executions (2 seats) |
| dp1-91 | Misdreavus | pokemon | Astonish, Confuse Ray | 4 selectable executions (2 seats) |
| dp1-92 | Onix | pokemon | Tunneling, Headbutt | 4 selectable executions (2 seats) |
| dp1-93 | Piplup | pokemon | Peck, Water Splash | 4 selectable executions (2 seats) |
| dp1-94 | Ponyta | pokemon | Tackle, Flame Tail | 4 selectable executions (2 seats) |
| dp1-95 | Rhyhorn | pokemon | Horn Attack, Take Down | 4 selectable executions (2 seats) |
| dp1-96 | Roselia | pokemon | Toxic Spikes, Sweet Spike | 4 selectable executions (2 seats) |
| dp1-97 | Seedot | pokemon | Bide, Rollout | 4 selectable executions (2 seats) |
| dp1-98 | Shinx | pokemon | Spark | 2 selectable executions (2 seats) |
| dp1-99 | Skorupi | pokemon | Poison Sting, Pin Missile | 4 selectable executions (2 seats) |
| dp1-100 | Sneasel | pokemon | Double Slap, Feint Attack | 4 selectable executions (2 seats) |
| dp1-101 | Starly | pokemon | Gust, Quick Attack | 4 selectable executions (2 seats) |
| dp1-102 | Stunky | pokemon | Scratch, Severe Gas | 4 selectable executions (2 seats) |
| dp1-103 | Turtwig | pokemon | Tackle, Razor Leaf | 4 selectable executions (2 seats) |
| dp1-104 | Wurmple | pokemon | Needling Sting, String Shot | 4 selectable executions (2 seats) |
| dp1-105 | Double Full Heal | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-106 | Energy Restore | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-107 | Energy Switch | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-108 | Night Pokémon Center | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-109 | PlusPower | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-110 | Poké Ball | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-111 | Pokédex HANDY910is | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-112 | Professor Rowan | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-113 | Rival | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-114 | Speed Stadium | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-115 | Super Scoop Up | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-116 | Warp Point | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-117 | Energy Search | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-118 | Potion | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-119 | Switch | trainer | Printed Trainer action | 2 play actions (2 seats) |
| dp1-120 | Empoleon LV.X | pokemon | Hydro Impact, Power/Body: Supreme Command | 2 selectable executions (2 seats) |
| dp1-121 | Infernape LV.X | pokemon | Flare Up, Power/Body: Burning Head | 2 selectable executions (2 seats) |
| dp1-122 | Torterra LV.X | pokemon | Vigorous Dash, Power/Body: Forest Murmurs | 2 selectable executions (2 seats) |
| dp1-123 | Grass Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-124 | Fire Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-125 | Water Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-126 | Lightning Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-127 | Psychic Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-128 | Fighting Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-129 | Darkness Energy | energy | Basic Energy Zone print | Catalogue registration verified |
| dp1-130 | Metal Energy | energy | Basic Energy Zone print | Catalogue registration verified |

## Results

- New comprehensive test: `tests/v07230-dp1-full-action-audit.test.cjs`, with full action scan, data/placeholder validation, 4 named no-attack cases, and Staraptor self-damage protection.
- UI checks: `tests/v07214-classic-prizes-and-synergy.test.cjs`, `tests/v07229-choice-prize-presentation.test.cjs`, `tests/v07229-dp1-choice-label-audit.test.cjs`.
- **Full selected v072xx regression: 509/509 passed**, zero failures, zero skips (`node --test --test-concurrency=2 tests/v072*.test.cjs`; complete recorded output `/mnt/data/dp1_230_v072_regression_FINAL.log`). This is source-level Node verification, not an APK or Android device test.

## Changed source and tests

- `app/build.gradle`
- `app/src/main/assets/index.html`
- `app/src/main/assets/app-v0167.js`
- `app/src/main/assets/tcg-classic-diamond-pearl.js`
- `app/src/main/assets/tcgp-battle-effects.js`
- `app/src/main/assets/tcgp-battle-ui.js`
- `docs/LUCKYDEX_MASTER_RULES.txt`
- `docs/DIAMOND_PEARL_v0.69.230_FULL_ACTION_AUDIT.md`
- `tests/v07230-dp1-full-action-audit.test.cjs`.
