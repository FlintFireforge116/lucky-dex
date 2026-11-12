# LuckyDex v0.69.227 — Diamond & Pearl Stage 6 source audit

**Apply after:** v0.69.226. Extract directly into `~/lucky-dex/source/`.
**Master checklist:** `docs/LUCKYDEX_MASTER_RULES.txt` **v2.20**.
**Printed catalogue reference:** `PokemonTCG/pokemon-tcg-data/cards/en/dp1.json`.

## Release status

- Original English Diamond & Pearl Base Set has **130 numbered cards**: 107 Pokémon, 15 Trainers, 8 Basic Energy.
- **110/130 battle-enabled** in this source: 91 Pokémon, 11 Trainers and 8 Basic Energy; **20 remain gated**. All three LV.X are still gated, not silently treated as ordinary evolved Pokémon.
- **14 new prints** from v0.69.226; changed-file-only source ZIP. No saved-data migration, APK build or GitHub push claimed.
- Stage 6 focused suite `tests/v07227-diamond-pearl-batch6.test.cjs` validates core effects, player/CPU execution, selections and destinations; full selected EX-era/DP1 regression run reported separately. Automated tests do not replace Android tap or long-match verification.

## New numbered prints and their tested outcomes

| # | Card | Verified outcome |
|---:|---|---|
| 8 | Magnezone | Magnetize gives allied Active zero retreat only with Metal Energy; suppressible Body |
| 24 | Drifblim | Wind Wave selects up to five eligible discarded Pokémon/Supporters; Explosive Smoke damages both Benches |
| 30 | Lopunny | Healing Wish coin-until-tails healing; Flop damages chosen Bench and offers voluntary switch |
| 31 | Machamp | Revenge checks opponent-turn KO event; Dynamic Punch adds 30 and Confusion only on Heads |
| 32 | Medicham | Force Palm places chosen damage counters, ignoring Weakness; Spinning Kick self-damage |
| 33 | Munchlax | Heave chooses exactly two hand cards to discard; optional Baby Evolution into Snorlax |
| 46 | Drifloon | Blowing Wind returns chosen whole Benched Pokémon and attachments to deck; Ominous Wind status and retreat lock |
| 47 | Dusclops | Roam uses 20 placed counters on Heads to opponents or Tails on chosen own Pokémon; Gravity Wave targets zero-retreat Bench |
| 65 | Unown [A] | Bench-only ANALYZE orders two deck cards with explicit order choice |
| 66 | Unown [B] | Bench-only BOUNCE coin flip, chosen Unown and attachments; Active bounce prompts promotion |
| 67 | Unown [C] | Bench-only CALL on Heads searches one Unown from deck into a vacant Bench slot |
| 68 | Unown [D] | Bench-only DRAW on Heads gives each player independent optional draw |
| 90 | Mime Jr. | Mime redraws to opposing hand count; Baby Evolution to Mr. Mime works if an eligible card is in hand |
| 116 | Warp Point | Warp Point requires opposing player switch then owner switch, retaining separate choices |

## Rules and known limitations

- Unown Powers are Bench-only and tested for optional and opposing-side decisions. An Unown B bounce of an Active Pokémon enters the normal **promote** phase; it does not silently choose a replacement.
- Actual cards and Energy go to the printed destination. Drifloon's Blowing Wind reconstructs this set's Basic Energy prints when moving attached Basic Energy back into the deck. Drifblim's Wind Wave can stop early and still shuffles.
- Magnezone's Poké-Body depends on attached Metal Energy on the actual Active and respects suppression; it is not merely metadata.
- The printed Munchlax Heave two-card hand discard is selectable and paid, and it does nothing with fewer than two cards. The current effect resolution rolls the attack coins before displaying the hand-discard selection; the chosen discard is completed before KO/Prize resolution. The printed player-visible sequencing should be verified on Android before calling this a perfect visual reproduction.
- All three LV.X, the remaining evolution-triggered Powers, complex Prize effects and certain Trainers are still gated. The set is **not finished** until they pass complete engine/CPU/Android checks.
- 30-card LuckyDex house rules and the separate Basic Energy Zone remain in use. No assumption of official 60-card deck mechanics is made.

## Current remaining 20 gated cards

| # | Card | Outstanding gate |
|---:|---|---|
| 1 | Dialga | Printed effect, power or Trainer choice needs integration/outcome tests |
| 2 | Dusknoir | Printed effect, power or Trainer choice needs integration/outcome tests |
| 3 | Electivire | Printed effect, power or Trainer choice needs integration/outcome tests |
| 7 | Luxray | Printed effect, power or Trainer choice needs integration/outcome tests |
| 11 | Palkia | Printed effect, power or Trainer choice needs integration/outcome tests |
| 12 | Rhyperior | Printed effect, power or Trainer choice needs integration/outcome tests |
| 14 | Shiftry | Printed effect, power or Trainer choice needs integration/outcome tests |
| 22 | Clefable | Printed effect, power or Trainer choice needs integration/outcome tests |
| 27 | Gengar | Printed effect, power or Trainer choice needs integration/outcome tests |
| 29 | Hippowdon | Printed effect, power or Trainer choice needs integration/outcome tests |
| 34 | Noctowl | Printed effect, power or Trainer choice needs integration/outcome tests |
| 71 | Bonsly | Printed effect, power or Trainer choice needs integration/outcome tests |
| 100 | Sneasel | Printed effect, power or Trainer choice needs integration/outcome tests |
| 109 | PlusPower | Printed effect, power or Trainer choice needs integration/outcome tests |
| 112 | Professor Rowan | Printed effect, power or Trainer choice needs integration/outcome tests |
| 113 | Rival | Printed effect, power or Trainer choice needs integration/outcome tests |
| 114 | Speed Stadium | Printed effect, power or Trainer choice needs integration/outcome tests |
| 120 | Empoleon LV.X | LV.X level-up/inheritance/timing |
| 121 | Infernape LV.X | LV.X level-up/inheritance/timing |
| 122 | Torterra LV.X | LV.X level-up/inheritance/timing |

## Full 130-card enablement ledger

| # | Card | Kind | Stage | Status | Attack / Ability |
|---:|---|---|---|---|---|
| 1 | Dialga | Pokémon | Basic | GATED | Time Bellow, Flash Cannon |
| 2 | Dusknoir | Pokémon | Stage 2 | GATED | Hard Feelings, Dark Palm |
| 3 | Electivire | Pokémon | Stage 1 | GATED | Giga Impact, Intense Voltage |
| 4 | Empoleon | Pokémon | Stage 2 | ENABLED | Ice Blade, Aqua Jet |
| 5 | Infernape | Pokémon | Stage 2 | ENABLED | Meteor Punch, Flare Blitz |
| 6 | Lucario | Pokémon | Stage 1 | ENABLED | Feint, Aura Sphere |
| 7 | Luxray | Pokémon | Stage 2 | GATED | Lightning Star, Gleam Eyes |
| 8 | Magnezone | Pokémon | Stage 2 | ENABLED | Metal Blast, Magnetize |
| 9 | Manaphy | Pokémon | Basic | ENABLED | Call for Family, Aqua Ring |
| 10 | Mismagius | Pokémon | Stage 1 | ENABLED | Avenge, Psywave |
| 11 | Palkia | Pokémon | Basic | GATED | Spacial Rend, Transback |
| 12 | Rhyperior | Pokémon | Stage 2 | GATED | Rock Wrecker, Earth Fissure |
| 13 | Roserade | Pokémon | Stage 1 | ENABLED | Poison Sting, Spike Whip |
| 14 | Shiftry | Pokémon | Stage 2 | GATED | Spirit Dance, Darkness Fan |
| 15 | Skuntank | Pokémon | Stage 1 | ENABLED | Frustration, Toxic Cloud |
| 16 | Staraptor | Pokémon | Stage 2 | ENABLED | Accelerative Dive, Brave Heart |
| 17 | Torterra | Pokémon | Stage 2 | ENABLED | Body Slam, Leaf Storm |
| 18 | Azumarill | Pokémon | Stage 1 | ENABLED | Defense Curl, Bubble Pump |
| 19 | Beautifly | Pokémon | Stage 2 | ENABLED | Whirlwind, Giga Drain |
| 20 | Bibarel | Pokémon | Stage 1 | ENABLED | Rest, Take Down |
| 21 | Carnivine | Pokémon | Basic | ENABLED | Swallow Up, Wring Out |
| 22 | Clefable | Pokémon | Stage 1 | GATED | Double Slap, Metronome |
| 23 | Drapion | Pokémon | Stage 1 | ENABLED | Stomp, Poison Claws |
| 24 | Drifblim | Pokémon | Stage 1 | ENABLED | Wind Wave, Explosive Smoke |
| 25 | Dustox | Pokémon | Stage 2 | ENABLED | Stun Spore, Toxic Dust |
| 26 | Floatzel | Pokémon | Stage 1 | ENABLED | Screw Tail, Water Gun |
| 27 | Gengar | Pokémon | Stage 2 | GATED | Life Drain, Shadow Dance |
| 28 | Heracross | Pokémon | Basic | ENABLED | Pitch, Horn Slash |
| 29 | Hippowdon | Pokémon | Stage 1 | GATED | Vacuum Up, Sand Eject |
| 30 | Lopunny | Pokémon | Stage 1 | ENABLED | Healing Wish, Flop |
| 31 | Machamp | Pokémon | Stage 2 | ENABLED | Revenge, Dynamic Punch |
| 32 | Medicham | Pokémon | Stage 1 | ENABLED | Force Palm, Spinning Kick |
| 33 | Munchlax | Pokémon | Basic | ENABLED | Heave, Baby Evolution |
| 34 | Noctowl | Pokémon | Stage 1 | GATED | See Beyond, Extrasensory |
| 35 | Pachirisu | Pokémon | Basic | ENABLED | Minor Errand-Running, Thunder Jolt |
| 36 | Purugly | Pokémon | Stage 1 | ENABLED | High Hat, Body Slam |
| 37 | Snorlax | Pokémon | Basic | ENABLED | Block, Ease Up |
| 38 | Steelix | Pokémon | Stage 1 | ENABLED | Slam, Metal Slash |
| 39 | Vespiquen | Pokémon | Stage 1 | ENABLED | Leaf Honey, Attack Order |
| 40 | Weavile | Pokémon | Stage 1 | ENABLED | Nasty Plot, Dark Pulse |
| 41 | Wobbuffet | Pokémon | Basic | ENABLED | Countercharge |
| 42 | Wynaut | Pokémon | Basic | ENABLED | Astonish, Baby Evolution |
| 43 | Budew | Pokémon | Basic | ENABLED | Errand-Running, Baby Evolution |
| 44 | Cascoon | Pokémon | Stage 1 | ENABLED | Harden, Gooey Thread |
| 45 | Cherrim | Pokémon | Stage 1 | ENABLED | Worry Seed, Magical Leaf |
| 46 | Drifloon | Pokémon | Basic | ENABLED | Blowing Wind, Ominous Wind |
| 47 | Dusclops | Pokémon | Stage 1 | ENABLED | Roam, Gravity Wave |
| 48 | Elekid | Pokémon | Basic | ENABLED | Outlet, Baby Evolution |
| 49 | Grotle | Pokémon | Stage 1 | ENABLED | Synthesis, Cut |
| 50 | Haunter | Pokémon | Stage 1 | ENABLED | Hypnosis, Dream Eater |
| 51 | Hippopotas | Pokémon | Basic | ENABLED | Yawn, Sand Attack |
| 52 | Luxio | Pokémon | Stage 1 | ENABLED | Fasten Claws, Thunder Fang |
| 53 | Machoke | Pokémon | Stage 1 | ENABLED | Karate Chop, Seismic Toss |
| 54 | Magneton | Pokémon | Stage 1 | ENABLED | Tri Attack, Magnetic Ray |
| 55 | Mantyke | Pokémon | Basic | ENABLED | Call for Friends, Baby Evolution |
| 56 | Monferno | Pokémon | Stage 1 | ENABLED | Flame Dance, Fury Swipes |
| 57 | Nuzleaf | Pokémon | Stage 1 | ENABLED | Dirty Trick, Razor Wind |
| 58 | Prinplup | Pokémon | Stage 1 | ENABLED | Aqua Shower, Brine |
| 59 | Rapidash | Pokémon | Stage 1 | ENABLED | Overrun, Blaze Up |
| 60 | Rhydon | Pokémon | Stage 1 | ENABLED | Storm Up, Crash Impact |
| 61 | Riolu | Pokémon | Basic | ENABLED | Wild Kick |
| 62 | Seaking | Pokémon | Stage 1 | ENABLED | Flail, Horn Drill |
| 63 | Silcoon | Pokémon | Stage 1 | ENABLED | Harden, Entangling String |
| 64 | Staravia | Pokémon | Stage 1 | ENABLED | Whirlwind, Clutch |
| 65 | Unown [A] | Pokémon | Basic | ENABLED | Hidden Power, ANALYZE |
| 66 | Unown [B] | Pokémon | Basic | ENABLED | Hidden Power, BOUNCE |
| 67 | Unown [C] | Pokémon | Basic | ENABLED | Hidden Power, CALL |
| 68 | Unown [D] | Pokémon | Basic | ENABLED | Hidden Power, DRAW |
| 69 | Azurill | Pokémon | Basic | ENABLED | Delivery, Baby Evolution |
| 70 | Bidoof | Pokémon | Basic | ENABLED | Amnesia, Scavenge |
| 71 | Bonsly | Pokémon | Basic | GATED | Fake Tears, Baby Evolution |
| 72 | Buizel | Pokémon | Basic | ENABLED | Splash About |
| 73 | Buneary | Pokémon | Basic | ENABLED | Splash, Jump Kick |
| 74 | Chatot | Pokémon | Basic | ENABLED | Me First, Tone-Deaf |
| 75 | Cherubi | Pokémon | Basic | ENABLED | Sleep Powder, Leech Seed |
| 76 | Chimchar | Pokémon | Basic | ENABLED | Scratch, Ember |
| 77 | Clefairy | Pokémon | Basic | ENABLED | Sing, Moon Impact |
| 78 | Cleffa | Pokémon | Basic | ENABLED | Eeek, Baby Evolution |
| 79 | Combee | Pokémon | Basic | ENABLED | Soliciting Nectar, Gust |
| 80 | Duskull | Pokémon | Basic | ENABLED | Disable, Night Shade |
| 81 | Electabuzz | Pokémon | Basic | ENABLED | Thunderpunch, Shock Wave |
| 82 | Gastly | Pokémon | Basic | ENABLED | Pain Payback |
| 83 | Glameow | Pokémon | Basic | ENABLED | Charm, Pose |
| 84 | Goldeen | Pokémon | Basic | ENABLED | Horn Attack, Take Down |
| 85 | Hoothoot | Pokémon | Basic | ENABLED | Hypnosis, Kick Shot |
| 86 | Machop | Pokémon | Basic | ENABLED | Low Kick |
| 87 | Magnemite | Pokémon | Basic | ENABLED | Metal Sound, Resonance |
| 88 | Marill | Pokémon | Basic | ENABLED | Rollout, Splashing Turn |
| 89 | Meditite | Pokémon | Basic | ENABLED | Detect, Meditate |
| 90 | Mime Jr. | Pokémon | Basic | ENABLED | Mime, Baby Evolution |
| 91 | Misdreavus | Pokémon | Basic | ENABLED | Astonish, Confuse Ray |
| 92 | Onix | Pokémon | Basic | ENABLED | Tunneling, Headbutt |
| 93 | Piplup | Pokémon | Basic | ENABLED | Peck, Water Splash |
| 94 | Ponyta | Pokémon | Basic | ENABLED | Tackle, Flame Tail |
| 95 | Rhyhorn | Pokémon | Basic | ENABLED | Horn Attack, Take Down |
| 96 | Roselia | Pokémon | Basic | ENABLED | Toxic Spikes, Sweet Spike |
| 97 | Seedot | Pokémon | Basic | ENABLED | Bide, Rollout |
| 98 | Shinx | Pokémon | Basic | ENABLED | Spark |
| 99 | Skorupi | Pokémon | Basic | ENABLED | Poison Sting, Pin Missile |
| 100 | Sneasel | Pokémon | Basic | GATED | Double Slap, Feint Attack |
| 101 | Starly | Pokémon | Basic | ENABLED | Gust, Quick Attack |
| 102 | Stunky | Pokémon | Basic | ENABLED | Scratch, Severe Gas |
| 103 | Turtwig | Pokémon | Basic | ENABLED | Tackle, Razor Leaf |
| 104 | Wurmple | Pokémon | Basic | ENABLED | Needling Sting, String Shot |
| 105 | Double Full Heal | Trainer | — | ENABLED | — |
| 106 | Energy Restore | Trainer | — | ENABLED | — |
| 107 | Energy Switch | Trainer | — | ENABLED | — |
| 108 | Night Pokémon Center | Trainer | — | ENABLED | — |
| 109 | PlusPower | Trainer | — | GATED | — |
| 110 | Poké Ball | Trainer | — | ENABLED | — |
| 111 | Pokédex HANDY910is | Trainer | — | ENABLED | — |
| 112 | Professor Rowan | Trainer | — | GATED | — |
| 113 | Rival | Trainer | — | GATED | — |
| 114 | Speed Stadium | Trainer | — | GATED | — |
| 115 | Super Scoop Up | Trainer | — | ENABLED | — |
| 116 | Warp Point | Trainer | — | ENABLED | — |
| 117 | Energy Search | Trainer | — | ENABLED | — |
| 118 | Potion | Trainer | — | ENABLED | — |
| 119 | Switch | Trainer | — | ENABLED | — |
| 120 | Empoleon LV.X | Pokémon | Level-Up | GATED | Hydro Impact, Supreme Command |
| 121 | Infernape LV.X | Pokémon | Level-Up | GATED | Flare Up, Burning Head |
| 122 | Torterra LV.X | Pokémon | Level-Up | GATED | Vigorous Dash, Forest Murmurs |
| 123 | Grass Energy | Energy | — | ENABLED | — |
| 124 | Fire Energy | Energy | — | ENABLED | — |
| 125 | Water Energy | Energy | — | ENABLED | — |
| 126 | Lightning Energy | Energy | — | ENABLED | — |
| 127 | Psychic Energy | Energy | — | ENABLED | — |
| 128 | Fighting Energy | Energy | — | ENABLED | — |
| 129 | Darkness Energy | Energy | — | ENABLED | — |
| 130 | Metal Energy | Energy | — | ENABLED | — |

## Installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.227_DP1_STAGE6.zip -d source
git add source
git commit -m "LuckyDex v0.69.227 Diamond Pearl Stage 6 Unown and abilities"
git push origin main
```
