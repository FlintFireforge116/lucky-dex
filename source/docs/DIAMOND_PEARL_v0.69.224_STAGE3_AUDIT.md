# LuckyDex v0.69.224 — Diamond & Pearl Stage 3 implementation and test ledger

**Prerequisite:** v0.69.223. ZIP files are relative to `~/lucky-dex/source/` and must be applied over that version.
**Master rules:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.17, updated with C-RELEASE-GATE-009 and C-RELEASE-GATE-010.
**Source for printed cards:** English DP1 `PokemonTCG/pokemon-tcg-data/cards/en/dp1.json`; original 130 card identities retained.

## Scope

- **67/130 battle-enabled in source** (54 Pokémon, 5 Trainers, 8 basic Energy), vs **48/130** in v0.69.223: this patch adds 19 Pokémon, all with their printed attack descriptions, executable effects and validation. **63 cards remain battle-gated** including all 3 Pokémon LV.X, evolution-triggered Powers/Bodies, unimplemented Trainers and other complicated attacks.
- Four main final evolutions are now represented in fully enabled evolution families: Empoleon (Piplup→Prinplup→Empoleon), Infernape (Chimchar→Monferno→Infernape), Staraptor (Starly→Staravia→Staraptor), Torterra (Turtwig→Grotle→Torterra).
- Also enables Steelix with a Metal-only energy plan (Onix has an adequate Colorless attack); Babylike/Stage 1 branches are supported without pretending gated evolutions are usable.
- Printed additive Weakness is still isolated to the DP era. The actual effects include physical-versus-Energy-Zone search, attached Energy discard, targeted Bench, between-turn conditions, recoil, Stadium disposal and optional target decline.

## Newly enabled cards

| Number | Card | New executable interactions / targeted audit |
|---:|---|---|
| 4 | Empoleon | Selected 40 to Active/Bench; conditional extra 20 to chosen Bench |
| 5 | Infernape | Until-tails Meteor Punch; Flare Blitz discards all attached Fire only |
| 9 | Manaphy | Call for Family actual Basic deck-to-Bench; Aqua Ring switch |
| 16 | Staraptor | Accelerative Dive coin/protection; Brave Heart tails self-KO |
| 17 | Torterra | Body Slam Paralysis; Leaf Storm heals every own Grass Pokémon |
| 20 | Bibarel | Rest removes conditions/heals/sleeps; Take Down recoil |
| 35 | Pachirisu | Basic Energy search; Thunder Jolt self-damage coin |
| 38 | Steelix | Slam two flips; Metal Slash next-own-turn lock; mono-Metal Steelix/Onix pairing |
| 49 | Grotle | Synthesis selects physical Grass card from deck OR ordered Energy Zone, then target |
| 50 | Haunter | Hypnosis Sleep; Dream Eater legal when awake but deals zero |
| 51 | Hippopotas | Yawn Sleep; Sand Attack next-turn attack-coin gate |
| 53 | Machoke | Karate Chop subtracts own damage counters; Seismic Toss |
| 55 | Mantyke | Search actual Water Basic Pokémon into hand |
| 58 | Prinplup | Aqua Shower all opponent Pokémon; Brine requires damaged selected Pokémon |
| 60 | Rhydon | Storm Up Stadium bonus/discard; Crash Impact recoil and opponent forced switch |
| 70 | Bidoof | Amnesia selected attack lock; Scavenge selected Trainer from discard |
| 77 | Clefairy | Sing Sleep; Moon Impact Cleffa-stacked bonus |
| 79 | Combee | Soliciting Nectar forced switch and Sleep; Gust |
| 92 | Onix | Tunneling up-to-two distinct optional Bench hits plus next-turn lock; Headbutt |

## Test evidence and known limitations

- `tests/v07224-diamond-pearl-batch3.test.cjs`: 16 focused cases, covering all 19 new cards' effect syntax, actual evolution family legality, mono-type Energy, **all newly enabled printed attacks from player and CPU**, plus targeted assertions for Flare Blitz Fire discard, Staraptor self-KO log, Torterra Grass-only heal, Empoleon targeting, Haunter Dream Eater asleep versus awake, Machoke damage math, Rhydon Stadium discard, Grotle Energy search from *physical deck* and *ordered Energy Zone*, Manaphy actual deck-to-Bench, and Onix selected/declined optional Bench damage.
- Earlier v07222 and v07223 tests were updated to the new enabled-card count and to set up Brine's damaged-target precondition. A **genuine shared-dispatcher regression** was caught and fixed: Buizel's `dp1:72:splashAbout` now executes again even when a broader `dp1:*` attack handler is registered.
- The final combined automated regression count must be taken from the actual packaging run of `node --test tests/v072*.test.cjs` (see notes below); this covers legacy EX sets, Power Keepers and older DP1 slices but is **not** a formal exhaustive card-pair interaction proof or Android device test.
- `dp1-120/121/122` Pokémon LV.X, timed Powers/Bodies, some remaining attack/Trainer effects, and the DP opening-turn adaptation are **not implemented** in this stage. They remain gated. Gengar and Machamp Stage 2 are not enabled yet, so Haunter/Machoke may not build as standalone fully completed focus families. Focused Steelix/Onix Metal-only deck is legal; the *random* DP1-only Metal CPU deck generator currently still returns no valid candidate and remains an explicit follow-up.
- No APK built, no handset touch testing, no GitHub push performed.

## Install

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.224_DP1_STAGE3.zip -d source
git add source
git commit -m "LuckyDex v0.69.224 Diamond Pearl Stage 3 effects and rules"
git push origin main
```

## 130-card audit register

“Enabled” means registered and allowed in battle source with runnable effect definitions, **not** that every edge case has been manually verified. Gated cards are excluded from legal player and CPU decks. All entries are derived from the actual v0.69.224 catalogue export.

| # | Card ID | Print | Kind / Stage | Attack / Power names | Source gate | Deck eligibility |
|---:|---|---|---|---|---|---|
| 1 | `dp1-1` | Dialga | Basic | Time Bellow, Flash Cannon | Gated | No |
| 2 | `dp1-2` | Dusknoir | Stage 2 | Hard Feelings, Dark Palm | Gated | No |
| 3 | `dp1-3` | Electivire | Stage 1 | Giga Impact, Intense Voltage | Gated | No |
| 4 | `dp1-4` | Empoleon | Stage 2 | Ice Blade, Aqua Jet | Enabled | Yes |
| 5 | `dp1-5` | Infernape | Stage 2 | Meteor Punch, Flare Blitz | Enabled | Yes |
| 6 | `dp1-6` | Lucario | Stage 1 | Feint, Aura Sphere | Gated | No |
| 7 | `dp1-7` | Luxray | Stage 2 | Lightning Star, Gleam Eyes | Gated | No |
| 8 | `dp1-8` | Magnezone | Stage 2 | Metal Blast, Magnetize | Gated | No |
| 9 | `dp1-9` | Manaphy | Basic | Call for Family, Aqua Ring | Enabled | Yes |
| 10 | `dp1-10` | Mismagius | Stage 1 | Avenge, Psywave | Gated | No |
| 11 | `dp1-11` | Palkia | Basic | Spacial Rend, Transback | Gated | No |
| 12 | `dp1-12` | Rhyperior | Stage 2 | Rock Wrecker, Earth Fissure | Gated | No |
| 13 | `dp1-13` | Roserade | Stage 1 | Poison Sting, Spike Whip | Gated | No |
| 14 | `dp1-14` | Shiftry | Stage 2 | Spirit Dance, Darkness Fan | Gated | No |
| 15 | `dp1-15` | Skuntank | Stage 1 | Frustration, Toxic Cloud | Gated | No |
| 16 | `dp1-16` | Staraptor | Stage 2 | Accelerative Dive, Brave Heart | Enabled | Yes |
| 17 | `dp1-17` | Torterra | Stage 2 | Body Slam, Leaf Storm | Enabled | Yes |
| 18 | `dp1-18` | Azumarill | Stage 1 | Defense Curl, Bubble Pump | Gated | No |
| 19 | `dp1-19` | Beautifly | Stage 2 | Whirlwind, Giga Drain | Enabled | Yes |
| 20 | `dp1-20` | Bibarel | Stage 1 | Rest, Take Down | Enabled | Yes |
| 21 | `dp1-21` | Carnivine | Basic | Swallow Up, Wring Out | Gated | No |
| 22 | `dp1-22` | Clefable | Stage 1 | Double Slap, Metronome | Gated | No |
| 23 | `dp1-23` | Drapion | Stage 1 | Stomp, Poison Claws | Enabled | Yes |
| 24 | `dp1-24` | Drifblim | Stage 1 | Wind Wave, Explosive Smoke | Gated | No |
| 25 | `dp1-25` | Dustox | Stage 2 | Stun Spore, Toxic Dust | Enabled | Yes |
| 26 | `dp1-26` | Floatzel | Stage 1 | Screw Tail, Water Gun | Gated | No |
| 27 | `dp1-27` | Gengar | Stage 2 | Life Drain, Shadow Dance | Gated | No |
| 28 | `dp1-28` | Heracross | Basic | Pitch, Horn Slash | Enabled | Yes |
| 29 | `dp1-29` | Hippowdon | Stage 1 | Vacuum Up, Sand Eject | Gated | No |
| 30 | `dp1-30` | Lopunny | Stage 1 | Healing Wish, Flop | Gated | No |
| 31 | `dp1-31` | Machamp | Stage 2 | Revenge, Dynamic Punch | Gated | No |
| 32 | `dp1-32` | Medicham | Stage 1 | Force Palm, Spinning Kick | Gated | No |
| 33 | `dp1-33` | Munchlax | Basic | Heave, Baby Evolution | Gated | No |
| 34 | `dp1-34` | Noctowl | Stage 1 | See Beyond, Extrasensory | Gated | No |
| 35 | `dp1-35` | Pachirisu | Basic | Minor Errand-Running, Thunder Jolt | Enabled | Yes |
| 36 | `dp1-36` | Purugly | Stage 1 | High Hat, Body Slam | Gated | No |
| 37 | `dp1-37` | Snorlax | Basic | Block, Ease Up | Gated | No |
| 38 | `dp1-38` | Steelix | Stage 1 | Slam, Metal Slash | Enabled | Yes |
| 39 | `dp1-39` | Vespiquen | Stage 1 | Leaf Honey, Attack Order | Gated | No |
| 40 | `dp1-40` | Weavile | Stage 1 | Nasty Plot, Dark Pulse | Gated | No |
| 41 | `dp1-41` | Wobbuffet | Basic | Countercharge | Gated | No |
| 42 | `dp1-42` | Wynaut | Basic | Astonish, Baby Evolution | Gated | No |
| 43 | `dp1-43` | Budew | Basic | Errand-Running, Baby Evolution | Gated | No |
| 44 | `dp1-44` | Cascoon | Stage 1 | Harden, Gooey Thread | Enabled | Yes |
| 45 | `dp1-45` | Cherrim | Stage 1 | Worry Seed, Magical Leaf | Enabled | Yes |
| 46 | `dp1-46` | Drifloon | Basic | Blowing Wind, Ominous Wind | Gated | No |
| 47 | `dp1-47` | Dusclops | Stage 1 | Roam, Gravity Wave | Gated | No |
| 48 | `dp1-48` | Elekid | Basic | Outlet, Baby Evolution | Gated | No |
| 49 | `dp1-49` | Grotle | Stage 1 | Synthesis, Cut | Enabled | Yes |
| 50 | `dp1-50` | Haunter | Stage 1 | Hypnosis, Dream Eater | Enabled | Yes |
| 51 | `dp1-51` | Hippopotas | Basic | Yawn, Sand Attack | Enabled | Yes |
| 52 | `dp1-52` | Luxio | Stage 1 | Fasten Claws, Thunder Fang | Enabled | Yes |
| 53 | `dp1-53` | Machoke | Stage 1 | Karate Chop, Seismic Toss | Enabled | Yes |
| 54 | `dp1-54` | Magneton | Stage 1 | Tri Attack, Magnetic Ray | Gated | No |
| 55 | `dp1-55` | Mantyke | Basic | Call for Friends, Baby Evolution | Enabled | Yes |
| 56 | `dp1-56` | Monferno | Stage 1 | Flame Dance, Fury Swipes | Enabled | Yes |
| 57 | `dp1-57` | Nuzleaf | Stage 1 | Dirty Trick, Razor Wind | Gated | No |
| 58 | `dp1-58` | Prinplup | Stage 1 | Aqua Shower, Brine | Enabled | Yes |
| 59 | `dp1-59` | Rapidash | Stage 1 | Overrun, Blaze Up | Enabled | Yes |
| 60 | `dp1-60` | Rhydon | Stage 1 | Storm Up, Crash Impact | Enabled | Yes |
| 61 | `dp1-61` | Riolu | Basic | Wild Kick | Enabled | Yes |
| 62 | `dp1-62` | Seaking | Stage 1 | Flail, Horn Drill | Enabled | Yes |
| 63 | `dp1-63` | Silcoon | Stage 1 | Harden, Entangling String | Enabled | Yes |
| 64 | `dp1-64` | Staravia | Stage 1 | Whirlwind, Clutch | Enabled | Yes |
| 65 | `dp1-65` | Unown [A] | Basic | Hidden Power, ANALYZE | Gated | No |
| 66 | `dp1-66` | Unown [B] | Basic | Hidden Power, BOUNCE | Gated | No |
| 67 | `dp1-67` | Unown [C] | Basic | Hidden Power, CALL | Gated | No |
| 68 | `dp1-68` | Unown [D] | Basic | Hidden Power, DRAW | Gated | No |
| 69 | `dp1-69` | Azurill | Basic | Delivery, Baby Evolution | Gated | No |
| 70 | `dp1-70` | Bidoof | Basic | Amnesia, Scavenge | Enabled | Yes |
| 71 | `dp1-71` | Bonsly | Basic | Fake Tears, Baby Evolution | Gated | No |
| 72 | `dp1-72` | Buizel | Basic | Splash About | Enabled | Yes |
| 73 | `dp1-73` | Buneary | Basic | Splash, Jump Kick | Enabled | Yes |
| 74 | `dp1-74` | Chatot | Basic | Me First, Tone-Deaf | Enabled | Yes |
| 75 | `dp1-75` | Cherubi | Basic | Sleep Powder, Leech Seed | Enabled | Yes |
| 76 | `dp1-76` | Chimchar | Basic | Scratch, Ember | Enabled | Yes |
| 77 | `dp1-77` | Clefairy | Basic | Sing, Moon Impact | Enabled | Yes |
| 78 | `dp1-78` | Cleffa | Basic | Eeek, Baby Evolution | Gated | No |
| 79 | `dp1-79` | Combee | Basic | Soliciting Nectar, Gust | Enabled | Yes |
| 80 | `dp1-80` | Duskull | Basic | Disable, Night Shade | Gated | No |
| 81 | `dp1-81` | Electabuzz | Basic | Thunderpunch, Shock Wave | Gated | No |
| 82 | `dp1-82` | Gastly | Basic | Pain Payback | Enabled | Yes |
| 83 | `dp1-83` | Glameow | Basic | Charm, Pose | Enabled | Yes |
| 84 | `dp1-84` | Goldeen | Basic | Horn Attack, Take Down | Enabled | Yes |
| 85 | `dp1-85` | Hoothoot | Basic | Hypnosis, Kick Shot | Enabled | Yes |
| 86 | `dp1-86` | Machop | Basic | Low Kick | Enabled | Yes |
| 87 | `dp1-87` | Magnemite | Basic | Metal Sound, Resonance | Enabled | Yes |
| 88 | `dp1-88` | Marill | Basic | Rollout, Splashing Turn | Gated | No |
| 89 | `dp1-89` | Meditite | Basic | Detect, Meditate | Enabled | Yes |
| 90 | `dp1-90` | Mime Jr. | Basic | Mime, Baby Evolution | Gated | No |
| 91 | `dp1-91` | Misdreavus | Basic | Astonish, Confuse Ray | Gated | No |
| 92 | `dp1-92` | Onix | Basic | Tunneling, Headbutt | Enabled | Yes |
| 93 | `dp1-93` | Piplup | Basic | Peck, Water Splash | Enabled | Yes |
| 94 | `dp1-94` | Ponyta | Basic | Tackle, Flame Tail | Enabled | Yes |
| 95 | `dp1-95` | Rhyhorn | Basic | Horn Attack, Take Down | Enabled | Yes |
| 96 | `dp1-96` | Roselia | Basic | Toxic Spikes, Sweet Spike | Gated | No |
| 97 | `dp1-97` | Seedot | Basic | Bide, Rollout | Enabled | Yes |
| 98 | `dp1-98` | Shinx | Basic | Spark | Enabled | Yes |
| 99 | `dp1-99` | Skorupi | Basic | Poison Sting, Pin Missile | Enabled | Yes |
| 100 | `dp1-100` | Sneasel | Basic | Double Slap, Feint Attack | Gated | No |
| 101 | `dp1-101` | Starly | Basic | Gust, Quick Attack | Enabled | Yes |
| 102 | `dp1-102` | Stunky | Basic | Scratch, Severe Gas | Enabled | Yes |
| 103 | `dp1-103` | Turtwig | Basic | Tackle, Razor Leaf | Enabled | Yes |
| 104 | `dp1-104` | Wurmple | Basic | Needling Sting, String Shot | Enabled | Yes |
| 105 | `dp1-105` | Double Full Heal | trainer |  | Enabled | Yes |
| 106 | `dp1-106` | Energy Restore | trainer |  | Gated | No |
| 107 | `dp1-107` | Energy Switch | trainer |  | Gated | No |
| 108 | `dp1-108` | Night Pokémon Center | trainer |  | Gated | No |
| 109 | `dp1-109` | PlusPower | trainer |  | Gated | No |
| 110 | `dp1-110` | Poké Ball | trainer |  | Enabled | Yes |
| 111 | `dp1-111` | Pokédex HANDY910is | trainer |  | Gated | No |
| 112 | `dp1-112` | Professor Rowan | trainer |  | Gated | No |
| 113 | `dp1-113` | Rival | trainer |  | Gated | No |
| 114 | `dp1-114` | Speed Stadium | trainer |  | Gated | No |
| 115 | `dp1-115` | Super Scoop Up | trainer |  | Gated | No |
| 116 | `dp1-116` | Warp Point | trainer |  | Gated | No |
| 117 | `dp1-117` | Energy Search | trainer |  | Enabled | Yes |
| 118 | `dp1-118` | Potion | trainer |  | Enabled | Yes |
| 119 | `dp1-119` | Switch | trainer |  | Enabled | Yes |
| 120 | `dp1-120` | Empoleon LV.X | Level-Up | Hydro Impact, Supreme Command | Gated | No |
| 121 | `dp1-121` | Infernape LV.X | Level-Up | Flare Up, Burning Head | Gated | No |
| 122 | `dp1-122` | Torterra LV.X | Level-Up | Vigorous Dash, Forest Murmurs | Gated | No |
| 123 | `dp1-123` | Grass Energy | energy |  | Enabled | No |
| 124 | `dp1-124` | Fire Energy | energy |  | Enabled | No |
| 125 | `dp1-125` | Water Energy | energy |  | Enabled | No |
| 126 | `dp1-126` | Lightning Energy | energy |  | Enabled | No |
| 127 | `dp1-127` | Psychic Energy | energy |  | Enabled | No |
| 128 | `dp1-128` | Fighting Energy | energy |  | Enabled | No |
| 129 | `dp1-129` | Darkness Energy | energy |  | Enabled | No |
| 130 | `dp1-130` | Metal Energy | energy |  | Enabled | No |

**Automated run result:** 411/411 selected `tests/v072*.test.cjs` checks passing as of the source packaging run (pending final independent verification).
