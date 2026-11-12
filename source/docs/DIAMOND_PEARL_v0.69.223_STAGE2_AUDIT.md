# LuckyDex v0.69.223 — Diamond & Pearl Stage 2, verified effects and focus-deck audit

**Prerequisite:** Apply only after v0.69.222. This ZIP changes paths relative to `~/lucky-dex/source/`.
**Master rule contract:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.16.
**Printed-card source:** English DP1 catalogue (PokemonTCG/pokemon-tcg-data `cards/en/dp1.json`), compared for the 19 newly enabled prints. All 130 catalogue identities retained.

## Status and scope

- **48/130 source battle-enabled:** 35 Pokémon / 65 attacks, five Trainers, eight Basic Energy prints. **82/130 still gated.** The 19 newly enabled Pokémon are listed below. No new Trainers, LV.X or Powers were enabled in this batch.
- Complete Wurmple→Silcoon→Beautifly and Wurmple→Cascoon→Dustox branches are included. Stage 1 Pokémon whose final evolution is still gated (for example Staravia) are usable as cards but a Staravia-*focused* deck may be rejected by the complete-evolution policy. This is intentional; no phantom Stage 2.
- The card art and collector identities are preserved. Every newly playable Pokémon attack has a printed effect description and a non-placeholder handler, and the 35 new attacks were smoke-tested from both acting sides plus targeted outcome cases. **This is source testing, not verified touchscreen UI.**
- A shared engine addition handles Buizel's attached-Energy count exactly; ordinary generic effects handle the remaining new attacks and optional forced switches/target picks.

## Newly enabled printed cards

| # | Card | Verified interaction / note |
|---:|---|---|
| 19 | Beautifly | Opponent-selected Whirlwind; Giga Drain heals by damage actually dealt |
| 25 | Dustox | Paralysis chance, Toxic Dust 20-per-checkpoint Poison |
| 44 | Cascoon | Harden threshold; Gooey Thread retreat lock |
| 45 | Cherrim | Worry Seed Confusion; Magical Leaf heads bonus/heal |
| 52 | Luxio | Fasten Claws conditional damage; Thunder Fang Paralysis |
| 56 | Monferno | Flame Dance discarded Fire recovery; 3-coin Fury Swipes |
| 59 | Rapidash | Targeted Overrun; Blaze Up tails discards Fire and hits whole opposing Bench |
| 62 | Seaking | Flail uses damage counters in HP units; Horn Drill |
| 63 | Silcoon | Harden threshold; Entangling String attack lock |
| 64 | Staravia | Opponent-controlled Whirlwind; Clutch retreat lock; Staraptor still gated |
| 72 | Buizel | Splash About +10 only with strictly fewer Energy |
| 73 | Buneary | Splash and selected single-target Jump Kick Bench hit |
| 75 | Cherubi | Sleep Powder; Leech Seed only heals when damage lands |
| 82 | Gastly | Pain Payback moves one real damage counter to chosen opposing Pokémon |
| 83 | Glameow | Charm reduces the defender's next attack 20; Pose tails cancels |
| 87 | Magnemite | Metal Sound Confusion; Resonance +20 only vs Confused opponent |
| 89 | Meditite | Detect protection coin; Meditate scales off opposing damage counters |
| 97 | Seedot | Bide coin protects KO leaving 10 HP; Rollout |
| 98 | Shinx | Spark hits selected opponent Bench as well as Active |

## Verification evidence

- `tests/v07223-diamond-pearl-batch2.test.cjs`: 15 tests (card/effect/print gates; set-only complete evolution branches; Energy type locks; selected targets; coin, status and healing; whole enabled-attack two-side sweep).
- `tests/v07223-dp1-outcome-verification.test.cjs`: five real outcome cases (Harden below/above threshold, Charm damage reduction in the actual next attack, Dustox checkpoint Poison, Beautifly actual healing and Seedot KO guard).
- Previous v0.69.222 tests updated for the expanded card count and run again.
- **395/395 tests passed** using `node --test tests/v072*.test.cjs` (includes neighbouring EX/Power Keepers, Classic builder/choice regressions and DP1 tests). Focused attack smoke is NOT proof of every card pairing, CPU strategic strength or Android touch correctness.
- Specific validated traps: Shinx's Active Spark damage includes the defender's printed additive Lightning Weakness; Meditite can KO low-HP targets, so damage assertions must use sufficient HP; both Wurmple Stage 2 branches actually build with Wurmple.

## Remaining gates / next batch

- 82 gated prints remain. Pokémon LV.X 120–122, evolution-triggered Powers/Bodies, the new era's first-turn restrictions, Speed Stadium, Rival and Professor Rowan remain unimplemented. These have not been silently enabled.
- Some enabled Stage 1 cards do not yet yield a set-only focused deck because their Stage 2 remains gated (Luxio→Luxray; Monferno→Infernape; Staravia→Staraptor). Explicit, correct builder failures are preferable to broken families. Finish final evolutions before calling those focus decks usable.
- Further targeted tests needed for multiple Bench choice positions, CPU attack and flip heuristics, opposing Stadium suppression, mixed-set interactions, all coin branches and actual phone UI.
- No APK built or phone-specific touch testing performed. No GitHub push was performed.

## Termux handoff

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.223_DP1_STAGE2.zip -d source
git add source
git commit -m "LuckyDex v0.69.223 Diamond Pearl Stage 2 effects and rules"
git push origin main
```

## Card-by-card implementation ledger

| # | ID | Print | Stage | Attacks | Battle status | Deck eligibility |
|---:|---|---|---|---|---|---|
| 1 | `dp1-1` | Dialga | Basic | Time Bellow, Flash Cannon | GATED: unique printed mechanic not yet fully tested | Excluded |
| 2 | `dp1-2` | Dusknoir | Stage 2 | Hard Feelings | GATED: unique printed mechanic not yet fully tested | Excluded |
| 3 | `dp1-3` | Electivire | Stage 1 | Giga Impact | GATED: unique printed mechanic not yet fully tested | Excluded |
| 4 | `dp1-4` | Empoleon | Stage 2 | Ice Blade, Aqua Jet | GATED: unique printed mechanic not yet fully tested | Excluded |
| 5 | `dp1-5` | Infernape | Stage 2 | Meteor Punch, Flare Blitz | GATED: unique printed mechanic not yet fully tested | Excluded |
| 6 | `dp1-6` | Lucario | Stage 1 | Feint, Aura Sphere | GATED: unique printed mechanic not yet fully tested | Excluded |
| 7 | `dp1-7` | Luxray | Stage 2 | Lightning Star | GATED: unique printed mechanic not yet fully tested | Excluded |
| 8 | `dp1-8` | Magnezone | Stage 2 | Metal Blast | GATED: unique printed mechanic not yet fully tested | Excluded |
| 9 | `dp1-9` | Manaphy | Basic | Call for Family, Aqua Ring | GATED: unique printed mechanic not yet fully tested | Excluded |
| 10 | `dp1-10` | Mismagius | Stage 1 | Avenge, Psywave | GATED: unique printed mechanic not yet fully tested | Excluded |
| 11 | `dp1-11` | Palkia | Basic | Spacial Rend, Transback | GATED: unique printed mechanic not yet fully tested | Excluded |
| 12 | `dp1-12` | Rhyperior | Stage 2 | Rock Wrecker | GATED: unique printed mechanic not yet fully tested | Excluded |
| 13 | `dp1-13` | Roserade | Stage 1 | Poison Sting, Spike Whip | GATED: unique printed mechanic not yet fully tested | Excluded |
| 14 | `dp1-14` | Shiftry | Stage 2 | Spirit Dance | GATED: unique printed mechanic not yet fully tested | Excluded |
| 15 | `dp1-15` | Skuntank | Stage 1 | Frustration, Toxic Cloud | GATED: unique printed mechanic not yet fully tested | Excluded |
| 16 | `dp1-16` | Staraptor | Stage 2 | Accelerative Dive, Brave Heart | GATED: unique printed mechanic not yet fully tested | Excluded |
| 17 | `dp1-17` | Torterra | Stage 2 | Body Slam, Leaf Storm | GATED: unique printed mechanic not yet fully tested | Excluded |
| 18 | `dp1-18` | Azumarill | Stage 1 | Defense Curl, Bubble Pump | GATED: unique printed mechanic not yet fully tested | Excluded |
| 19 | `dp1-19` | Beautifly | Stage 2 | Whirlwind, Giga Drain | ENABLED: stage-2 effect/outcome verified | Eligible |
| 20 | `dp1-20` | Bibarel | Stage 1 | Rest, Take Down | GATED: unique printed mechanic not yet fully tested | Excluded |
| 21 | `dp1-21` | Carnivine | Basic | Swallow Up, Wring Out | GATED: unique printed mechanic not yet fully tested | Excluded |
| 22 | `dp1-22` | Clefable | Stage 1 | Double Slap, Metronome | GATED: unique printed mechanic not yet fully tested | Excluded |
| 23 | `dp1-23` | Drapion | Stage 1 | Stomp, Poison Claws | ENABLED: stage-1 baseline tested | Eligible |
| 24 | `dp1-24` | Drifblim | Stage 1 | Wind Wave, Explosive Smoke | GATED: unique printed mechanic not yet fully tested | Excluded |
| 25 | `dp1-25` | Dustox | Stage 2 | Stun Spore, Toxic Dust | ENABLED: stage-2 effect/outcome verified | Eligible |
| 26 | `dp1-26` | Floatzel | Stage 1 | Screw Tail, Water Gun | GATED: unique printed mechanic not yet fully tested | Excluded |
| 27 | `dp1-27` | Gengar | Stage 2 | Life Drain, Shadow Dance | GATED: unique printed mechanic not yet fully tested | Excluded |
| 28 | `dp1-28` | Heracross | Basic | Pitch, Horn Slash | ENABLED: stage-1 baseline tested | Eligible |
| 29 | `dp1-29` | Hippowdon | Stage 1 | Vacuum Up, Sand Eject | GATED: unique printed mechanic not yet fully tested | Excluded |
| 30 | `dp1-30` | Lopunny | Stage 1 | Healing Wish, Flop | GATED: unique printed mechanic not yet fully tested | Excluded |
| 31 | `dp1-31` | Machamp | Stage 2 | Revenge, Dynamic Punch | GATED: unique printed mechanic not yet fully tested | Excluded |
| 32 | `dp1-32` | Medicham | Stage 1 | Force Palm, Spinning Kick | GATED: unique printed mechanic not yet fully tested | Excluded |
| 33 | `dp1-33` | Munchlax | Basic | Heave | GATED: unique printed mechanic not yet fully tested | Excluded |
| 34 | `dp1-34` | Noctowl | Stage 1 | See Beyond, Extrasensory | GATED: unique printed mechanic not yet fully tested | Excluded |
| 35 | `dp1-35` | Pachirisu | Basic | Minor Errand-Running, Thunder Jolt | GATED: unique printed mechanic not yet fully tested | Excluded |
| 36 | `dp1-36` | Purugly | Stage 1 | High Hat, Body Slam | GATED: unique printed mechanic not yet fully tested | Excluded |
| 37 | `dp1-37` | Snorlax | Basic | Block, Ease Up | GATED: unique printed mechanic not yet fully tested | Excluded |
| 38 | `dp1-38` | Steelix | Stage 1 | Slam, Metal Slash | GATED: unique printed mechanic not yet fully tested | Excluded |
| 39 | `dp1-39` | Vespiquen | Stage 1 | Leaf Honey, Attack Order | GATED: unique printed mechanic not yet fully tested | Excluded |
| 40 | `dp1-40` | Weavile | Stage 1 | Nasty Plot, Dark Pulse | GATED: unique printed mechanic not yet fully tested | Excluded |
| 41 | `dp1-41` | Wobbuffet | Basic | Countercharge | GATED: unique printed mechanic not yet fully tested | Excluded |
| 42 | `dp1-42` | Wynaut | Basic | Astonish | GATED: unique printed mechanic not yet fully tested | Excluded |
| 43 | `dp1-43` | Budew | Basic | Errand-Running | GATED: unique printed mechanic not yet fully tested | Excluded |
| 44 | `dp1-44` | Cascoon | Stage 1 | Harden, Gooey Thread | ENABLED: stage-2 effect/outcome verified | Eligible |
| 45 | `dp1-45` | Cherrim | Stage 1 | Worry Seed, Magical Leaf | ENABLED: stage-2 effect/outcome verified | Eligible |
| 46 | `dp1-46` | Drifloon | Basic | Blowing Wind, Ominous Wind | GATED: unique printed mechanic not yet fully tested | Excluded |
| 47 | `dp1-47` | Dusclops | Stage 1 | Roam, Gravity Wave | GATED: unique printed mechanic not yet fully tested | Excluded |
| 48 | `dp1-48` | Elekid | Basic | Outlet | GATED: unique printed mechanic not yet fully tested | Excluded |
| 49 | `dp1-49` | Grotle | Stage 1 | Synthesis, Cut | GATED: unique printed mechanic not yet fully tested | Excluded |
| 50 | `dp1-50` | Haunter | Stage 1 | Hypnosis, Dream Eater | GATED: unique printed mechanic not yet fully tested | Excluded |
| 51 | `dp1-51` | Hippopotas | Basic | Yawn, Sand Attack | GATED: unique printed mechanic not yet fully tested | Excluded |
| 52 | `dp1-52` | Luxio | Stage 1 | Fasten Claws, Thunder Fang | ENABLED: stage-2 effect/outcome verified | Eligible |
| 53 | `dp1-53` | Machoke | Stage 1 | Karate Chop, Seismic Toss | GATED: unique printed mechanic not yet fully tested | Excluded |
| 54 | `dp1-54` | Magneton | Stage 1 | Tri Attack, Magnetic Ray | GATED: unique printed mechanic not yet fully tested | Excluded |
| 55 | `dp1-55` | Mantyke | Basic | Call for Friends | GATED: unique printed mechanic not yet fully tested | Excluded |
| 56 | `dp1-56` | Monferno | Stage 1 | Flame Dance, Fury Swipes | ENABLED: stage-2 effect/outcome verified | Eligible |
| 57 | `dp1-57` | Nuzleaf | Stage 1 | Dirty Trick, Razor Wind | GATED: unique printed mechanic not yet fully tested | Excluded |
| 58 | `dp1-58` | Prinplup | Stage 1 | Aqua Shower, Brine | GATED: unique printed mechanic not yet fully tested | Excluded |
| 59 | `dp1-59` | Rapidash | Stage 1 | Overrun, Blaze Up | ENABLED: stage-2 effect/outcome verified | Eligible |
| 60 | `dp1-60` | Rhydon | Stage 1 | Storm Up, Crash Impact | GATED: unique printed mechanic not yet fully tested | Excluded |
| 61 | `dp1-61` | Riolu | Basic | Wild Kick | ENABLED: stage-1 baseline tested | Eligible |
| 62 | `dp1-62` | Seaking | Stage 1 | Flail, Horn Drill | ENABLED: stage-2 effect/outcome verified | Eligible |
| 63 | `dp1-63` | Silcoon | Stage 1 | Harden, Entangling String | ENABLED: stage-2 effect/outcome verified | Eligible |
| 64 | `dp1-64` | Staravia | Stage 1 | Whirlwind, Clutch | ENABLED: stage-2 effect/outcome verified | Eligible |
| 65 | `dp1-65` | Unown [A] | Basic | Hidden Power | GATED: unique printed mechanic not yet fully tested | Excluded |
| 66 | `dp1-66` | Unown [B] | Basic | Hidden Power | GATED: unique printed mechanic not yet fully tested | Excluded |
| 67 | `dp1-67` | Unown [C] | Basic | Hidden Power | GATED: unique printed mechanic not yet fully tested | Excluded |
| 68 | `dp1-68` | Unown [D] | Basic | Hidden Power | GATED: unique printed mechanic not yet fully tested | Excluded |
| 69 | `dp1-69` | Azurill | Basic | Delivery | GATED: unique printed mechanic not yet fully tested | Excluded |
| 70 | `dp1-70` | Bidoof | Basic | Amnesia, Scavenge | GATED: unique printed mechanic not yet fully tested | Excluded |
| 71 | `dp1-71` | Bonsly | Basic | Fake Tears | GATED: unique printed mechanic not yet fully tested | Excluded |
| 72 | `dp1-72` | Buizel | Basic | Splash About | ENABLED: stage-2 effect/outcome verified | Eligible |
| 73 | `dp1-73` | Buneary | Basic | Splash, Jump Kick | ENABLED: stage-2 effect/outcome verified | Eligible |
| 74 | `dp1-74` | Chatot | Basic | Me First, Tone-Deaf | ENABLED: stage-1 baseline tested | Eligible |
| 75 | `dp1-75` | Cherubi | Basic | Sleep Powder, Leech Seed | ENABLED: stage-2 effect/outcome verified | Eligible |
| 76 | `dp1-76` | Chimchar | Basic | Scratch, Ember | ENABLED: stage-1 baseline tested | Eligible |
| 77 | `dp1-77` | Clefairy | Basic | Sing, Moon Impact | GATED: unique printed mechanic not yet fully tested | Excluded |
| 78 | `dp1-78` | Cleffa | Basic | Eeek | GATED: unique printed mechanic not yet fully tested | Excluded |
| 79 | `dp1-79` | Combee | Basic | Soliciting Nectar, Gust | GATED: unique printed mechanic not yet fully tested | Excluded |
| 80 | `dp1-80` | Duskull | Basic | Disable, Night Shade | GATED: unique printed mechanic not yet fully tested | Excluded |
| 81 | `dp1-81` | Electabuzz | Basic | Thunderpunch, Shock Wave | GATED: unique printed mechanic not yet fully tested | Excluded |
| 82 | `dp1-82` | Gastly | Basic | Pain Payback | ENABLED: stage-2 effect/outcome verified | Eligible |
| 83 | `dp1-83` | Glameow | Basic | Charm, Pose | ENABLED: stage-2 effect/outcome verified | Eligible |
| 84 | `dp1-84` | Goldeen | Basic | Horn Attack, Take Down | ENABLED: stage-1 baseline tested | Eligible |
| 85 | `dp1-85` | Hoothoot | Basic | Hypnosis, Kick Shot | ENABLED: stage-1 baseline tested | Eligible |
| 86 | `dp1-86` | Machop | Basic | Low Kick | ENABLED: stage-1 baseline tested | Eligible |
| 87 | `dp1-87` | Magnemite | Basic | Metal Sound, Resonance | ENABLED: stage-2 effect/outcome verified | Eligible |
| 88 | `dp1-88` | Marill | Basic | Rollout, Splashing Turn | GATED: unique printed mechanic not yet fully tested | Excluded |
| 89 | `dp1-89` | Meditite | Basic | Detect, Meditate | ENABLED: stage-2 effect/outcome verified | Eligible |
| 90 | `dp1-90` | Mime Jr. | Basic | Mime | GATED: unique printed mechanic not yet fully tested | Excluded |
| 91 | `dp1-91` | Misdreavus | Basic | Astonish, Confuse Ray | GATED: unique printed mechanic not yet fully tested | Excluded |
| 92 | `dp1-92` | Onix | Basic | Tunneling, Headbutt | GATED: unique printed mechanic not yet fully tested | Excluded |
| 93 | `dp1-93` | Piplup | Basic | Peck, Water Splash | ENABLED: stage-1 baseline tested | Eligible |
| 94 | `dp1-94` | Ponyta | Basic | Tackle, Flame Tail | ENABLED: stage-1 baseline tested | Eligible |
| 95 | `dp1-95` | Rhyhorn | Basic | Horn Attack, Take Down | ENABLED: stage-1 baseline tested | Eligible |
| 96 | `dp1-96` | Roselia | Basic | Toxic Spikes, Sweet Spike | GATED: unique printed mechanic not yet fully tested | Excluded |
| 97 | `dp1-97` | Seedot | Basic | Bide, Rollout | ENABLED: stage-2 effect/outcome verified | Eligible |
| 98 | `dp1-98` | Shinx | Basic | Spark | ENABLED: stage-2 effect/outcome verified | Eligible |
| 99 | `dp1-99` | Skorupi | Basic | Poison Sting, Pin Missile | ENABLED: stage-1 baseline tested | Eligible |
| 100 | `dp1-100` | Sneasel | Basic | Double Slap, Feint Attack | GATED: unique printed mechanic not yet fully tested | Excluded |
| 101 | `dp1-101` | Starly | Basic | Gust, Quick Attack | ENABLED: stage-1 baseline tested | Eligible |
| 102 | `dp1-102` | Stunky | Basic | Scratch, Severe Gas | ENABLED: stage-1 baseline tested | Eligible |
| 103 | `dp1-103` | Turtwig | Basic | Tackle, Razor Leaf | ENABLED: stage-1 baseline tested | Eligible |
| 104 | `dp1-104` | Wurmple | Basic | Needling Sting, String Shot | ENABLED: stage-1 baseline tested | Eligible |
| 105 | `dp1-105` | Double Full Heal | trainer | — | ENABLED: stage-1 baseline tested | Eligible |
| 106 | `dp1-106` | Energy Restore | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 107 | `dp1-107` | Energy Switch | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 108 | `dp1-108` | Night Pokémon Center | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 109 | `dp1-109` | PlusPower | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 110 | `dp1-110` | Poké Ball | trainer | — | ENABLED: stage-1 baseline tested | Eligible |
| 111 | `dp1-111` | Pokédex HANDY910is | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 112 | `dp1-112` | Professor Rowan | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 113 | `dp1-113` | Rival | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 114 | `dp1-114` | Speed Stadium | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 115 | `dp1-115` | Super Scoop Up | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 116 | `dp1-116` | Warp Point | trainer | — | GATED: unique printed mechanic not yet fully tested | Excluded |
| 117 | `dp1-117` | Energy Search | trainer | — | ENABLED: stage-1 baseline tested | Eligible |
| 118 | `dp1-118` | Potion | trainer | — | ENABLED: stage-1 baseline tested | Eligible |
| 119 | `dp1-119` | Switch | trainer | — | ENABLED: stage-1 baseline tested | Eligible |
| 120 | `dp1-120` | Empoleon LV.X | Level-Up | Hydro Impact | GATED: LV.X active level-up and inherited effects not implemented | Excluded |
| 121 | `dp1-121` | Infernape LV.X | Level-Up | Flare Up | GATED: LV.X active level-up and inherited effects not implemented | Excluded |
| 122 | `dp1-122` | Torterra LV.X | Level-Up | Vigorous Dash | GATED: LV.X active level-up and inherited effects not implemented | Excluded |
| 123 | `dp1-123` | Grass Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 124 | `dp1-124` | Fire Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 125 | `dp1-125` | Water Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 126 | `dp1-126` | Lightning Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 127 | `dp1-127` | Psychic Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 128 | `dp1-128` | Fighting Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 129 | `dp1-129` | Darkness Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
| 130 | `dp1-130` | Metal Energy | energy | — | BASIC ENERGY: existing ordered supply model | Energy Zone |
