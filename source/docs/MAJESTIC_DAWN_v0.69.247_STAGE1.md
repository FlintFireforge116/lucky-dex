# LuckyDex v0.69.247 — Diamond & Pearl: Majestic Dawn (Stage 1)

## Implementation status

- **100/100** collector-number prints registered, with unique IDs and artwork references (dp5-1 through dp5-100).
- **60/100** battle-enabled; **40** intentionally gated until their printed effects and any player/CPU choices can be verified.
- **26/26** new deterministic outcome tests passed.
- **131/131** selected older-set regression checks passed across Classic auditor, Secret Wonders, Baby Evolution, and Great Encounters.
- **208/208** staged-set synthetic action paths executed with zero skipped paths, errors or catalog warnings. The smoke runner uses a completed-set loaner deck for incomplete expansions.
- Set selection, ownership projection, deck-builder registration, CPU set recognition and current GitHub pre-build checks integrated.
- New Special Darkness and Metal Energy card IDs are accounted for in shared damage calculation.

## Important limits

- Registration is not battle implementation. Gated cards deliberately have no verified timing or choice resolution yet.
- Only the 60 enabled cards were smoke-tested; these checks do not independently prove every printed effect or Android rendering.
- Complete Majestic Dawn-only CPU deck legality was not certified at this staged point. Shared CPU autobuilder recognizes eligible cards.
- Gated cards still expose their printed attack names/costs and artwork for collection purposes; they must not enter automated playable builds.
- Future passes must implement remaining triggered Poké-Powers/Bodies, Fossils, Stadium/Tool timing, Special Energy effects and four LV.X cards and run an independent printed audit.

## Notable checked effects

- Cresselia Healing Light; Glaceon Speed Slide; Grotle Planting (physical Grass Energy from hand); Raichu Thunderbolt; Scyther Fury Cutter; Chatot Mimic; Combee Honey Scent.
- Hippowdon Vacuum Sand and Sand Impact; Infernape Mega Bravo and Mach Punch; Scizor Special Blow; Prinplup Ice Blade and Wash Over.
- Buneary Extend Ears heals every Benched Pokémon. Special Darkness and Metal reprint behaviour tested against older cards.

## Complete 100-print implementation ledger

| # | Card | Kind | Battle ready | Registered attacks | Named abilities |
|---:|---|---|---|---|---|
| 1 | Articuno | pokemon | GATED | Blizzard | Freezing Screech |
| 2 | Cresselia | pokemon | Yes | Future Sight, Healing Light |  |
| 3 | Darkrai | pokemon | GATED | Dark Slumber, Dark Resolve | Darkness Shade |
| 4 | Dialga | pokemon | Yes | Time Shift, Diamond Blast |  |
| 5 | Glaceon | pokemon | Yes | Snow Cloak, Speed Slide |  |
| 6 | Kabutops | pokemon | GATED | Chop Up | Primal Shell |
| 7 | Leafeon | pokemon | Yes | Bind Down, Leaf Guard |  |
| 8 | Manaphy | pokemon | GATED | Chase Up, Fountain | Aqua Skin |
| 9 | Mewtwo | pokemon | GATED | Energy Absorption, Recover, Psyburn |  |
| 10 | Moltres | pokemon | GATED | Scorching Wing | Flame Charge |
| 11 | Palkia | pokemon | GATED | Zone Shift, Pearl Blast |  |
| 12 | Phione | pokemon | GATED | Evolution Wish, Water Pulse |  |
| 13 | Rotom | pokemon | GATED | Dual Trans, Reflect Energy |  |
| 14 | Zapdos | pokemon | GATED | Raging Thunder | Sheet Lightning |
| 15 | Aerodactyl | pokemon | GATED | Supersonic | Primal Claw |
| 16 | Bronzong | pokemon | GATED | Pain Amplifier, Coating | Cursed Alloy |
| 17 | Empoleon | pokemon | GATED | Dual Splash, Surf Together |  |
| 18 | Espeon | pokemon | GATED | Morning Sun | Sunlight Veil |
| 19 | Flareon | pokemon | GATED | Fire Fang, Kindle |  |
| 20 | Glaceon | pokemon | Yes | Ice Shot, Icy Wind |  |
| 21 | Hippowdon | pokemon | Yes | Vacuum Sand, Sand Impact |  |
| 22 | Infernape | pokemon | Yes | Mach Punch, Mega Bravo |  |
| 23 | Jolteon | pokemon | GATED | Thunder Fang, Lightning Strike |  |
| 24 | Leafeon | pokemon | Yes | Sprial Drain, Leaf Blade |  |
| 25 | Minun | pokemon | Yes | Pound, (+) Spark |  |
| 26 | Omastar | pokemon | GATED | Send Back | Primal Swirl |
| 27 | Phione | pokemon | Yes | Charm, Whirlpool |  |
| 28 | Plusle | pokemon | Yes | Call for Family, – Boost |  |
| 29 | Scizor | pokemon | Yes | Special Blow, X-Scissor |  |
| 30 | Torterra | pokemon | Yes | Earthquake, Frenzy Plant |  |
| 31 | Toxicroak | pokemon | Yes | Paralyze Poison, Slash |  |
| 32 | Umbreon | pokemon | GATED | Confuse Ray | Moonlight Veil |
| 33 | Unown [P] | pokemon | GATED | Hidden Power | PUT |
| 34 | Vaporeon | pokemon | GATED | Cleanse Away, Hyper Whirlpool |  |
| 35 | Ambipom | pokemon | Yes | Astonish, Hang High |  |
| 36 | Fearow | pokemon | Yes | Fury Attack, Drill Peck |  |
| 37 | Grotle | pokemon | Yes | Planting, Body Slam |  |
| 38 | Kangaskhan | pokemon | Yes | Bite, Comet Punch |  |
| 39 | Lickitung | pokemon | Yes | Lap Up, Slam |  |
| 40 | Manectric | pokemon | GATED | Thunder Wave, Volt Crush |  |
| 41 | Monferno | pokemon | Yes | Fire Fang, Mid-air Strike |  |
| 42 | Mothim | pokemon | GATED | Get Help, Quick Touch | Disturbance Scales |
| 43 | Pachirisu | pokemon | GATED | Trans Tail, Thundershock |  |
| 44 | Prinplup | pokemon | Yes | Ice Blade, Wash Over |  |
| 45 | Raichu | pokemon | Yes | Agility, Thunderbolt |  |
| 46 | Scyther | pokemon | Yes | Slash, Fury Cutter |  |
| 47 | Staravia | pokemon | Yes | Quick Attack, Drill Peck |  |
| 48 | Sudowoodo | pokemon | Yes | Flail, Wood Hammer |  |
| 49 | Unown [Q] | pokemon | GATED | Hidden Power | QUICK |
| 50 | Aipom | pokemon | GATED | Collect, Hand Trick |  |
| 51 | Aipom | pokemon | Yes | Scratch, Last Resort |  |
| 52 | Bronzor | pokemon | Yes | Hypnosis, Confuse Ray |  |
| 53 | Buneary | pokemon | Yes | Drawup Power, Extend Ears |  |
| 54 | Burmy Sandy Cloak | pokemon | Yes | Iron Defense, Tackle |  |
| 55 | Chatot | pokemon | Yes | Mimic, Chatter |  |
| 56 | Chimchar | pokemon | Yes | Flare, Lunge |  |
| 57 | Chimchar | pokemon | Yes | Fury Swipes |  |
| 58 | Chingling | pokemon | GATED | Uproar | Baby Evolution |
| 59 | Combee | pokemon | Yes | Honey Scent, Flitter |  |
| 60 | Croagunk | pokemon | Yes | Light Punch, Poison Sting |  |
| 61 | Drifloon | pokemon | Yes | Delivery, Reaction |  |
| 62 | Eevee | pokemon | Yes | Call for Family, Lunge |  |
| 63 | Eevee | pokemon | Yes | Gnaw, Sand Attack |  |
| 64 | Electrike | pokemon | Yes | Random Spark, Tackle |  |
| 65 | Glameow | pokemon | Yes | Call for Family, Rip Claw |  |
| 66 | Hippopotas | pokemon | Yes | Grainy Sand, Double-edge |  |
| 67 | Kabuto | pokemon | GATED | Shell Attack | Ancient Guidance |
| 68 | Munchlax | pokemon | GATED | Lick | Baby Evolution |
| 69 | Omanyte | pokemon | GATED | Wash Over | Call Up |
| 70 | Pikachu | pokemon | Yes | Quick Attack, Volt Tackle |  |
| 71 | Piplup | pokemon | Yes | Water Splash, Headbutt |  |
| 72 | Piplup | pokemon | Yes | Splatter |  |
| 73 | Shellos East Sea | pokemon | Yes | Surf, Muddy Water |  |
| 74 | Spearow | pokemon | Yes | Wing Attack, Claw |  |
| 75 | Starly | pokemon | Yes | Whirlwind, Flap |  |
| 76 | Stunky | pokemon | Yes | Poison Gas, Slash |  |
| 77 | Turtwig | pokemon | Yes | Rollout, Razor Leaf |  |
| 78 | Turtwig | pokemon | Yes | Bite |  |
| 79 | Dawn Stadium | trainer | GATED |  |  |
| 80 | Dusk Ball | trainer | Yes |  |  |
| 81 | Energy Restore | trainer | Yes |  |  |
| 82 | Fossil Excavator | trainer | Yes |  |  |
| 83 | Mom's Kindness | trainer | Yes |  |  |
| 84 | Old Amber | trainer | GATED |  |  |
| 85 | Poké Ball | trainer | Yes |  |  |
| 86 | Quick Ball | trainer | Yes |  |  |
| 87 | Super Scoop Up | trainer | Yes |  |  |
| 88 | Warp Point | trainer | Yes |  |  |
| 89 | Dome Fossil | trainer | GATED |  |  |
| 90 | Energy Search | trainer | Yes |  |  |
| 91 | Helix Fossil | trainer | GATED |  |  |
| 92 | Call Energy | energy | GATED |  |  |
| 93 | Darkness Energy | energy | Yes |  |  |
| 94 | Health Energy | energy | GATED |  |  |
| 95 | Metal Energy | energy | Yes |  |  |
| 96 | Recover Energy | energy | GATED |  |  |
| 97 | Garchomp LV.X | pokemon | GATED | Restore | Dragon Pulse |
| 98 | Glaceon LV.X | pokemon | GATED | Avalanche | Chilly Breath |
| 99 | Leafeon LV.X | pokemon | GATED | Verdant Dance | Energy Forcing |
| 100 | Porygon-Z LV.X | pokemon | GATED |  | Mode Crash, Decode |

## Release instructions

Install as a changed-files-only ZIP at the repository root; **do not** unzip into `source/` again. Then stage `source` and `.github/workflows/build-apk.yml` for GitHub.

## Reviewer notes

The source of printed collector identities, attacks, types and Energy costs was the Pokémon TCG historical data for `dp5`; game behaviour is tested against the local LuckyDex engine. This ledger is a staged implementation checklist, not independent 100-card correctness certification.

