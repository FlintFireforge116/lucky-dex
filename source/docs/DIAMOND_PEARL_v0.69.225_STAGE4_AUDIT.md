# LuckyDex v0.69.225 — Diamond & Pearl Stage 4 source audit

**Prerequisite:** v0.69.224; apply ZIP contents into `~/lucky-dex/source/`.
**Master project rules:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.18. **Printed catalogue:** `PokemonTCG/pokemon-tcg-data/cards/en/dp1.json`.

## Scope and release gates

- 130 original DP1 numbered cards retained; **83/130 battle-enabled** now (68 Pokémon, 7 Trainers, 8 Basic Energy); 47 deliberately still battle-gated, including the three LV.X and still-unimplemented Poké-Powers.
- **16 newly enabled prints**, alongside real optional Baby Evolution Powers for Budew / Azurill and dependent Roserade / Azumarill printed attacks. This is a staged release; not the completed set.
- Normal printed effects, raw damage/Weakness interaction, actual Bench targeting, discard/attached Energy sources, temporary statuses, evolution stacks, and actual chosen Trainer card outcomes were checked in deterministic live battle states for this batch.
- Stage 4 `tests/v07225-diamond-pearl-batch4.test.cjs`: 17 targeted tests with attacks run on both player and CPU, plus Baby Evolution, builder and Trainer effect cases.
- **Selected cross-era Node suite:** 428/428 `node --test tests/v072*.test.cjs` passed before final packaging (rerun after last tiny synthetic Basic Energy-art mapping change). One prior v07222 card-count assertion was updated to 83/47.
- **CPU single-type sweep (three seeds/type):** Grass, Fire, Water, Lightning, Psychic, Fighting and Darkness all generated legal 30-card candidates (3/3 each); Metal generated 0/3 legal candidates. No unrequested Basic Energy subtype was observed among the successful builds. Random DP1-only mono-Metal deck generation remains a known blocker.
- **Not tested on Android**, no APK built and no repository push performed. The 17 targeted tests do not prove every possible conditional matchup.

## Newly enabled cards / execution evidence

| # | Card | Core printed interactions / checks |
|---:|---|---|
| 6 | Lucario | Feint ignores Resistance; Aura Sphere selected Bench 20 |
| 10 | Mismagius | Avenge counter count; Psywave opponent Energy scaling |
| 13 | Roserade | Poison Sting; Spike Whip selected Bench only if Budew underneath |
| 18 | Azumarill | 3+ Energy Bubble Pump boost and Azurill-dependent coin effect |
| 21 | Carnivine | Remaining-HP Swallow Up; Wring Out conditional discard/status |
| 26 | Floatzel | Screw Tail Energy removal; Water Gun surplus Water cap |
| 39 | Vespiquen | Leaf Honey discarded Energy and chosen heal; Attack Order two-side Grass count |
| 40 | Weavile | Nasty Plot any card search; Dark Pulse Darkness attached across team |
| 41 | Wobbuffet | Countercharge coin and damage counter movement |
| 43 | Budew | Trainer search and voluntary from-hand Budew -> Roselia Power, healing |
| 57 | Nuzleaf | Razor Wind coin gate; Energy discard choices |
| 69 | Azurill | Discard recovery and voluntary from-hand Azurill -> Marill Power, healing |
| 88 | Marill | Azurill-dependent Rollout plus switched attack |
| 96 | Roselia | Budew-dependent Toxic Spikes and Sleep/heal |
| 107 | Energy Switch | Physical attached Basic Energy source and selected destination |
| 115 | Super Scoop Up | Heads full evolution stack, Energy, Tool return; tails does nothing |

## Outstanding gates

- `dp1-120/121/122` Pokémon LV.X (level-up from Active, inherited attacks and Powers, level-up timing) are not implemented; remain battle-gated.
- Other nonimplemented Pokémon, complex effects, Trainer cards and Power triggers remain gated. Neither the printed text catalogue nor an engine-recognised effect-name alone is grounds for battle eligibility.
- DP era opening-turn differences and prolonged touchscreen CPU and player matches require separate validation.
- Existing 8-card application hand cap may prevent a successful multi-card Super Scoop Up retrieval when there is insufficient room; this stage does not change the hand-cap policy.

## Installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.225_DP1_STAGE4.zip -d source
git add source
git commit -m "LuckyDex v0.69.225 Diamond Pearl Baby evolution and attacks"
git push origin main
```

## All 130 numbered cards — implementation ledger

“Enabled” reports source battle eligibility with executable effects, not a claim of every possible interaction manually tested. All rows are read from the actual catalogue export after patching.

| # | Card ID | Card | Kind / Stage | Printed attack / Power names | Source gate | Deck eligibility |
|---:|---|---|---|---|---|---|
| 1 | `dp1-1` | Dialga | Basic | Time Bellow, Flash Cannon | Gated | No |
| 2 | `dp1-2` | Dusknoir | Stage 2 | Hard Feelings, Dark Palm | Gated | No |
| 3 | `dp1-3` | Electivire | Stage 1 | Giga Impact, Intense Voltage | Gated | No |
| 4 | `dp1-4` | Empoleon | Stage 2 | Ice Blade, Aqua Jet | Enabled | Yes |
| 5 | `dp1-5` | Infernape | Stage 2 | Meteor Punch, Flare Blitz | Enabled | Yes |
| 6 | `dp1-6` | Lucario | Stage 1 | Feint, Aura Sphere | Enabled | Yes |
| 7 | `dp1-7` | Luxray | Stage 2 | Lightning Star, Gleam Eyes | Gated | No |
| 8 | `dp1-8` | Magnezone | Stage 2 | Metal Blast, Magnetize | Gated | No |
| 9 | `dp1-9` | Manaphy | Basic | Call for Family, Aqua Ring | Enabled | Yes |
| 10 | `dp1-10` | Mismagius | Stage 1 | Avenge, Psywave | Enabled | Yes |
| 11 | `dp1-11` | Palkia | Basic | Spacial Rend, Transback | Gated | No |
| 12 | `dp1-12` | Rhyperior | Stage 2 | Rock Wrecker, Earth Fissure | Gated | No |
| 13 | `dp1-13` | Roserade | Stage 1 | Poison Sting, Spike Whip | Enabled | Yes |
| 14 | `dp1-14` | Shiftry | Stage 2 | Spirit Dance, Darkness Fan | Gated | No |
| 15 | `dp1-15` | Skuntank | Stage 1 | Frustration, Toxic Cloud | Gated | No |
| 16 | `dp1-16` | Staraptor | Stage 2 | Accelerative Dive, Brave Heart | Enabled | Yes |
| 17 | `dp1-17` | Torterra | Stage 2 | Body Slam, Leaf Storm | Enabled | Yes |
| 18 | `dp1-18` | Azumarill | Stage 1 | Defense Curl, Bubble Pump | Enabled | Yes |
| 19 | `dp1-19` | Beautifly | Stage 2 | Whirlwind, Giga Drain | Enabled | Yes |
| 20 | `dp1-20` | Bibarel | Stage 1 | Rest, Take Down | Enabled | Yes |
| 21 | `dp1-21` | Carnivine | Basic | Swallow Up, Wring Out | Enabled | Yes |
| 22 | `dp1-22` | Clefable | Stage 1 | Double Slap, Metronome | Gated | No |
| 23 | `dp1-23` | Drapion | Stage 1 | Stomp, Poison Claws | Enabled | Yes |
| 24 | `dp1-24` | Drifblim | Stage 1 | Wind Wave, Explosive Smoke | Gated | No |
| 25 | `dp1-25` | Dustox | Stage 2 | Stun Spore, Toxic Dust | Enabled | Yes |
| 26 | `dp1-26` | Floatzel | Stage 1 | Screw Tail, Water Gun | Enabled | Yes |
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
| 39 | `dp1-39` | Vespiquen | Stage 1 | Leaf Honey, Attack Order | Enabled | Yes |
| 40 | `dp1-40` | Weavile | Stage 1 | Nasty Plot, Dark Pulse | Enabled | Yes |
| 41 | `dp1-41` | Wobbuffet | Basic | Countercharge | Enabled | Yes |
| 42 | `dp1-42` | Wynaut | Basic | Astonish, Baby Evolution | Gated | No |
| 43 | `dp1-43` | Budew | Basic | Errand-Running, Baby Evolution | Enabled | Yes |
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
| 57 | `dp1-57` | Nuzleaf | Stage 1 | Dirty Trick, Razor Wind | Enabled | Yes |
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
| 69 | `dp1-69` | Azurill | Basic | Delivery, Baby Evolution | Enabled | Yes |
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
| 88 | `dp1-88` | Marill | Basic | Rollout, Splashing Turn | Enabled | Yes |
| 89 | `dp1-89` | Meditite | Basic | Detect, Meditate | Enabled | Yes |
| 90 | `dp1-90` | Mime Jr. | Basic | Mime, Baby Evolution | Gated | No |
| 91 | `dp1-91` | Misdreavus | Basic | Astonish, Confuse Ray | Gated | No |
| 92 | `dp1-92` | Onix | Basic | Tunneling, Headbutt | Enabled | Yes |
| 93 | `dp1-93` | Piplup | Basic | Peck, Water Splash | Enabled | Yes |
| 94 | `dp1-94` | Ponyta | Basic | Tackle, Flame Tail | Enabled | Yes |
| 95 | `dp1-95` | Rhyhorn | Basic | Horn Attack, Take Down | Enabled | Yes |
| 96 | `dp1-96` | Roselia | Basic | Toxic Spikes, Sweet Spike | Enabled | Yes |
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
| 107 | `dp1-107` | Energy Switch | trainer |  | Enabled | Yes |
| 108 | `dp1-108` | Night Pokémon Center | trainer |  | Gated | No |
| 109 | `dp1-109` | PlusPower | trainer |  | Gated | No |
| 110 | `dp1-110` | Poké Ball | trainer |  | Enabled | Yes |
| 111 | `dp1-111` | Pokédex HANDY910is | trainer |  | Gated | No |
| 112 | `dp1-112` | Professor Rowan | trainer |  | Gated | No |
| 113 | `dp1-113` | Rival | trainer |  | Gated | No |
| 114 | `dp1-114` | Speed Stadium | trainer |  | Gated | No |
| 115 | `dp1-115` | Super Scoop Up | trainer |  | Enabled | Yes |
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
