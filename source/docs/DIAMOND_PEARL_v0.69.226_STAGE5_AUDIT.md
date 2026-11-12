# LuckyDex v0.69.226 — Diamond & Pearl Stage 5 verified source audit

**Apply after:** v0.69.225. Extract the patch directly into `~/lucky-dex/source/`.
**Master rules:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.19. **Printed source:** `PokemonTCG/pokemon-tcg-data/cards/en/dp1.json`.

## Release status and boundaries

- All **130 original numbered DP1 English cards** remain registered, comprising 107 Pokémon, 15 Trainers, and 8 Basic Energy printings.
- **96/130 battle-enabled** (78 Pokémon, 10 Trainers, 8 Basic Energy); 34 gated with explicit PARTIAL status. This is a **stage release, not DP1 completion**. All three Pokémon LV.X (#120–122) remain battle-gated.
- **13 newly enabled prints** listed below; cross-set sources, card catalogue, player and CPU card pools, and set filters retained. No migration of saved collection data claimed.
- Stage 5 focused tests: `tests/v07226-diamond-pearl-batch5.test.cjs` — 14 tests checking card effects against actual state; enabled attacks smokes executed on both sides, stronger Poison, optional pre-damage switching, Baby Evolution, hidden-hand selections, selected card destinations and CPU legality.
- **Full selected Node regression:** 442/442 passed with `node --test tests/v072*.test.cjs` after source and test changes. Earlier stage tests updated to assert 96/34 and the resolved mono-Metal CPU issue.
- **CPU DP1-only single-type sweep:** three seeds (7, 11, 19) for each of 8 Basic Energy types = **24/24** legal 30-card decks, no off-filter Basic Energy zone and at least one payable attack per Pokémon. The previous mono-Metal CPU failure is resolved, using a payable-move check for Onix/Steelix rather than requiring Fighting for Onix's optional attack.
- **Not verified on an Android device; no APK built; no GitHub push performed.** This deterministic audit is not an exhaustive all-opponent/card-state proof.

## 13 newly enabled numbered prints

| # | Card | Verified implementation highlights |
|---:|---|---|
| 15 | Skuntank | Frustration selects undamaged opposing Pokémon only; Toxic Cloud heads applies 20 Poison between turns |
| 36 | Purugly | High Hat chooses a facedown opposing hand position for discard; coin-based Paralysis |
| 37 | Snorlax | Block retreat lock; Ease Up conditional 30 bonus with Munchlax beneath, then Sleep |
| 42 | Wynaut | Wynaut Astonish hidden hand-to-deck choice; voluntary Wynaut→Wobbuffet Baby Evolution with healed damage |
| 48 | Elekid | Elekid Outlet retrieves chosen Basic Lightning Energy; voluntary Elekid→Electabuzz Baby Evolution |
| 54 | Magneton | Tri Attack three coins; Magnetic Ray optional energy-qualified Bench switch BEFORE 40 damage, decline path |
| 78 | Cleffa | Cleffa Eeek draws; voluntary Cleffa→Clefairy Baby Evolution and stack support metadata |
| 80 | Duskull | Duskull Disable on-heads attack-choice lock; Night Shade chosen Bench damage |
| 81 | Electabuzz | Electabuzz Thunderpunch self-risk; Shock Wave Paralysis and chosen Bench damage if Elekid beneath |
| 91 | Misdreavus | Misdreavus Astonish facedown hidden hand-to-deck choice and Confuse Ray |
| 106 | Energy Restore | Energy Restore three coin flips, selected Basic Energy from actual discard or typed Energy ledger |
| 108 | Night Pokémon Center | Night Pokémon Center user-selected target; two heads heal all; two tails discard all Energy |
| 111 | Pokédex HANDY910is | Pokédex HANDY910is choose one of top two cards, put other on bottom retaining remaining deck order |

## Rule and deckbuilding changes

- DP1 Skuntank's Toxic Cloud uses Poison `{amount:20}` on a successful coin rather than default 10, with both coin outcomes tested.
- DP1 Magneton's Magnetic Ray lets the attacker decline or select an opposing Benched Pokémon **with attached Energy** and makes the new Active Pokémon take damage; an unpowered bench is not a valid target.
- DP1 hidden-card choices show facedown positions; tests exercise selecting a specific position and moving the correct card, leaving the other in place. Both normal hand cards and typed Energy ledger transfers use real source/destination checks.
- Three new `Baby Evolution` Poké-Powers are optional from hand, require the matching Pokémon, clear Baby damage, and preserve the evolution stack. A focused Electabuzz build now includes Elekid, and a focused Clefairy build includes Cleffa, for their printed conditional benefits.
- The DP1-only CPU generator no longer rejects **Steelix/Onix** Metal Energy builds simply because Onix has an *additional* Fighting-cost attack it does not need to use. This is intentionally scoped to the DP1-only set pool until mixed-era validation is performed.
- A `Colorless`-focused deck uses an actual available Basic Energy type; the DP1 set has no printed Basic Colorless Energy. This differs from selecting an off-type attack requirement.

## Remaining gates / risks

- Three LV.X Pokémon (`dp1-120`, `dp1-121`, `dp1-122`) remain non-playable pending Active-only Level-Up rules, inherited earlier-level attacks and Poké-Powers, and complete timing, CPU and KO tests.
- Remaining gated cards include other complicated evolution Poké-Powers, attacks and Trainers requiring explicit choices or shared-engine behaviour. The 34 cards below remain PARTIAL and cannot be built into active battle decks.
- Current hand-cap and Energy Zone adaptations remain those of LuckyDex; only listed effects and rules are changed by this release.
- Manual Android touchscreen selection, long CPU matches, special-case interactions, and saved-game upgrade remain outstanding QA areas.

## Complete 130-card enablement ledger

| # | Card | Kind | Stage | Status | Attacks / Power |
|---:|---|---|---|---|---|
| 1 | Dialga | Pokémon | Basic | GATED | Time Bellow, Flash Cannon |
| 2 | Dusknoir | Pokémon | Stage 2 | GATED | Hard Feelings, Dark Palm |
| 3 | Electivire | Pokémon | Stage 1 | GATED | Giga Impact, Intense Voltage |
| 4 | Empoleon | Pokémon | Stage 2 | ENABLED | Ice Blade, Aqua Jet |
| 5 | Infernape | Pokémon | Stage 2 | ENABLED | Meteor Punch, Flare Blitz |
| 6 | Lucario | Pokémon | Stage 1 | ENABLED | Feint, Aura Sphere |
| 7 | Luxray | Pokémon | Stage 2 | GATED | Lightning Star, Gleam Eyes |
| 8 | Magnezone | Pokémon | Stage 2 | GATED | Metal Blast, Magnetize |
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
| 24 | Drifblim | Pokémon | Stage 1 | GATED | Wind Wave, Explosive Smoke |
| 25 | Dustox | Pokémon | Stage 2 | ENABLED | Stun Spore, Toxic Dust |
| 26 | Floatzel | Pokémon | Stage 1 | ENABLED | Screw Tail, Water Gun |
| 27 | Gengar | Pokémon | Stage 2 | GATED | Life Drain, Shadow Dance |
| 28 | Heracross | Pokémon | Basic | ENABLED | Pitch, Horn Slash |
| 29 | Hippowdon | Pokémon | Stage 1 | GATED | Vacuum Up, Sand Eject |
| 30 | Lopunny | Pokémon | Stage 1 | GATED | Healing Wish, Flop |
| 31 | Machamp | Pokémon | Stage 2 | GATED | Revenge, Dynamic Punch |
| 32 | Medicham | Pokémon | Stage 1 | GATED | Force Palm, Spinning Kick |
| 33 | Munchlax | Pokémon | Basic | GATED | Heave, Baby Evolution |
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
| 46 | Drifloon | Pokémon | Basic | GATED | Blowing Wind, Ominous Wind |
| 47 | Dusclops | Pokémon | Stage 1 | GATED | Roam, Gravity Wave |
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
| 65 | Unown [A] | Pokémon | Basic | GATED | Hidden Power, ANALYZE |
| 66 | Unown [B] | Pokémon | Basic | GATED | Hidden Power, BOUNCE |
| 67 | Unown [C] | Pokémon | Basic | GATED | Hidden Power, CALL |
| 68 | Unown [D] | Pokémon | Basic | GATED | Hidden Power, DRAW |
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
| 90 | Mime Jr. | Pokémon | Basic | GATED | Mime, Baby Evolution |
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
| 116 | Warp Point | Trainer | — | GATED | — |
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

## Termux installation

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.226_DP1_STAGE5.zip -d source
git add source
git commit -m "LuckyDex v0.69.226 Diamond Pearl Stage 5 and CPU Energy fixes"
git push origin main
```

Review this full ledger before un-gating the remaining 34 cards. The next work should implement LV.X properly rather than attaching its cards to ordinary Stage 2 evolution logic.
