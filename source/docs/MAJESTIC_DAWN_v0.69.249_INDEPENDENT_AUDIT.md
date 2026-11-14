# LuckyDex v0.69.249 — Majestic Dawn independent card-by-card audit

**Expansion:** Diamond & Pearl: Majestic Dawn (dp5), 100 numbered prints.
**Basis:** printed-card data from Pokémon TCG card catalog (dp5, referenced in the source catalog), the full v0.69.248 implemented engine and the LuckyDex master development rules. The existing 65 tests and the 11 new independent-audit tests were run against the patched code.

## What this audit can and cannot confirm

- All 100 identities, Pokémon stages/HP/types, printed attack names/costs, ability names, card-art references and runtime effect registrations were inspected; there are no gated prints.
- The set auditor completed **312/312 synthetic attack and Trainer execution paths** and built **16/16 legal CPU decks**. Static catalog/effect schema inspection found **zero errors or warnings**, with **seven nonblocking review items**. Synthetic completion is **not** proof of every printed secondary effect.
- Targeted outcome tests now cover Power-triggered Special Energy and Eevee LV.X lineages, which were missing from the earlier test suite.
- Android rendering, long CPU matches, all real-game RNG combinations and all niche cross-set interactions still need device/scenario verification. Tests mentioning an ID are not comprehensive evidence of its every effect.

## Confirmed problems corrected

1. **Health Energy (#94) and Recover Energy (#96)**: hand attachment through **Leafeon LV.X's Energy Forcing (#99)** previously failed to heal or remove Special Conditions. A shared physical-card attachment event now processes these effects both on regular hand attachments and on Energy Forcing, once each. The Dawn Stadium (#79) and Manaphy's Aqua Skin (#8) interactions are independently checked.
2. **Espeon (#18) / Umbreon (#32)**: continuous Eevee-evolution benefits weren't applied to a correctly levelled-up **Glaceon LV.X (#98)** because only the current LV.X print's immediate parent field was checked. The engine now checks the real previous-level stack; no invented Eevee lineage is granted to a bare LV.X.
3. **Cross-set Lucario LV.X Stance (Mysterious Treasures)**: an optional protection Power could apply before the player accepted the offer. A separate earlier-set regression caught it and the timing is corrected in the shared effect engine.

## Individual card ledger

The engine path column distinguishes generic damage/effect handling from a dedicated rule or hardcoded continuous/triggered handler. A listed card-level test reference means it appears in dedicated tests, **not** that every interaction has been proved. Every card also passed the synthetic execution/schema audit.

| # | Printed card | Kind | Printed attacks | Power / Body | Handler audit | Test ID reference |
|---:|---|---|---|---|---|---|
| 1 | Articuno | pokemon | Blizzard | Freezing Screech | Dedicated rule | Referenced |
| 2 | Cresselia | pokemon | Future Sight; Healing Light | — | Dedicated rule | Referenced |
| 3 | Darkrai | pokemon | Dark Slumber; Dark Resolve | Darkness Shade | Dedicated rule | Referenced |
| 4 | Dialga | pokemon | Time Shift; Diamond Blast | — | Shared rule | Referenced |
| 5 | Glaceon | pokemon | Snow Cloak; Speed Slide | — | Shared rule | Referenced |
| 6 | Kabutops | pokemon | Chop Up | Primal Shell | Shared/passive or plain damage | Referenced |
| 7 | Leafeon | pokemon | Bind Down; Leaf Guard | — | Shared rule | Referenced |
| 8 | Manaphy | pokemon | Chase Up; Fountain | Aqua Skin | Dedicated rule | Referenced |
| 9 | Mewtwo | pokemon | Energy Absorption; Recover; Psyburn | — | Dedicated rule (plain damage) | Referenced |
| 10 | Moltres | pokemon | Scorching Wing | Flame Charge | Dedicated rule | Referenced |
| 11 | Palkia | pokemon | Zone Shift; Pearl Blast | — | Dedicated rule | Referenced |
| 12 | Phione | pokemon | Evolution Wish; Water Pulse | — | Dedicated rule | Referenced |
| 13 | Rotom | pokemon | Dual Trans; Reflect Energy | — | Dedicated rule | Referenced |
| 14 | Zapdos | pokemon | Raging Thunder | Sheet Lightning | Dedicated rule | Referenced |
| 15 | Aerodactyl | pokemon | Supersonic | Primal Claw | Dedicated rule | Referenced |
| 16 | Bronzong | pokemon | Pain Amplifier; Coating | Cursed Alloy | Dedicated rule | Referenced |
| 17 | Empoleon | pokemon | Dual Splash; Surf Together | — | Dedicated rule | Referenced |
| 18 | Espeon | pokemon | Morning Sun | Sunlight Veil | Dedicated rule | Referenced |
| 19 | Flareon | pokemon | Fire Fang; Kindle | — | Dedicated rule | Referenced |
| 20 | Glaceon | pokemon | Ice Shot; Icy Wind | — | Shared rule | Referenced |
| 21 | Hippowdon | pokemon | Vacuum Sand; Sand Impact | — | Shared rule | Referenced |
| 22 | Infernape | pokemon | Mach Punch; Mega Bravo | — | Shared rule | Referenced |
| 23 | Jolteon | pokemon | Thunder Fang; Lightning Strike | — | Dedicated rule | Referenced |
| 24 | Leafeon | pokemon | Sprial Drain; Leaf Blade | — | Shared rule | Not separately ID-referenced |
| 25 | Minun | pokemon | Pound; (+) Spark | — | Shared/passive or plain damage (plain damage) | Not separately ID-referenced |
| 26 | Omastar | pokemon | Send Back | Primal Swirl | Dedicated rule | Referenced |
| 27 | Phione | pokemon | Charm; Whirlpool | — | Shared rule | Not separately ID-referenced |
| 28 | Plusle | pokemon | Call for Family; – Boost | — | Shared rule | Not separately ID-referenced |
| 29 | Scizor | pokemon | Special Blow; X-Scissor | — | Shared rule | Referenced |
| 30 | Torterra | pokemon | Earthquake; Frenzy Plant | — | Shared rule | Referenced |
| 31 | Toxicroak | pokemon | Paralyze Poison; Slash | — | Shared/passive or plain damage (plain damage) | Not separately ID-referenced |
| 32 | Umbreon | pokemon | Confuse Ray | Moonlight Veil | Shared/passive or plain damage | Referenced |
| 33 | Unown [P] | pokemon | Hidden Power | PUT | Dedicated rule | Referenced |
| 34 | Vaporeon | pokemon | Cleanse Away; Hyper Whirlpool | — | Dedicated rule | Referenced |
| 35 | Ambipom | pokemon | Astonish; Hang High | — | Dedicated rule | Not separately ID-referenced |
| 36 | Fearow | pokemon | Fury Attack; Drill Peck | — | Shared/passive or plain damage (plain damage) | Referenced |
| 37 | Grotle | pokemon | Planting; Body Slam | — | Shared rule | Referenced |
| 38 | Kangaskhan | pokemon | Bite; Comet Punch | — | Shared/passive or plain damage (plain damage) | Referenced |
| 39 | Lickitung | pokemon | Lap Up; Slam | — | Shared rule | Referenced |
| 40 | Manectric | pokemon | Thunder Wave; Volt Crush | — | Dedicated rule | Referenced |
| 41 | Monferno | pokemon | Fire Fang; Mid-air Strike | — | Shared rule | Referenced |
| 42 | Mothim | pokemon | Get Help; Quick Touch | Disturbance Scales | Dedicated rule | Referenced |
| 43 | Pachirisu | pokemon | Trans Tail; Thundershock | — | Dedicated rule | Referenced |
| 44 | Prinplup | pokemon | Ice Blade; Wash Over | — | Shared rule | Referenced |
| 45 | Raichu | pokemon | Agility; Thunderbolt | — | Shared rule | Referenced |
| 46 | Scyther | pokemon | Slash; Fury Cutter | — | Shared/passive or plain damage (plain damage) | Referenced |
| 47 | Staravia | pokemon | Quick Attack; Drill Peck | — | Shared/passive or plain damage (plain damage) | Referenced |
| 48 | Sudowoodo | pokemon | Flail; Wood Hammer | — | Shared rule | Not separately ID-referenced |
| 49 | Unown [Q] | pokemon | Hidden Power | QUICK | Dedicated rule (plain damage) | Referenced |
| 50 | Aipom | pokemon | Collect; Hand Trick | — | Dedicated rule | Referenced |
| 51 | Aipom | pokemon | Scratch; Last Resort | — | Shared/passive or plain damage (plain damage) | Not separately ID-referenced |
| 52 | Bronzor | pokemon | Hypnosis; Confuse Ray | — | Shared rule | Referenced |
| 53 | Buneary | pokemon | Drawup Power; Extend Ears | — | Shared rule | Referenced |
| 54 | Burmy Sandy Cloak | pokemon | Iron Defense; Tackle | — | Shared/passive or plain damage (plain damage) | Not separately ID-referenced |
| 55 | Chatot | pokemon | Mimic; Chatter | — | Shared rule | Referenced |
| 56 | Chimchar | pokemon | Flare; Lunge | — | Shared/passive or plain damage (plain damage) | Not separately ID-referenced |
| 57 | Chimchar | pokemon | Fury Swipes | — | Shared rule | Not separately ID-referenced |
| 58 | Chingling | pokemon | Uproar | Baby Evolution | Dedicated rule | Referenced |
| 59 | Combee | pokemon | Honey Scent; Flitter | — | Shared rule | Referenced |
| 60 | Croagunk | pokemon | Light Punch; Poison Sting | — | Shared/passive or plain damage (plain damage) | Referenced |
| 61 | Drifloon | pokemon | Delivery; Reaction | — | Shared rule | Referenced |
| 62 | Eevee | pokemon | Call for Family; Lunge | — | Shared rule | Not separately ID-referenced |
| 63 | Eevee | pokemon | Gnaw; Sand Attack | — | Shared/passive or plain damage (plain damage) | Referenced |
| 64 | Electrike | pokemon | Random Spark; Tackle | — | Shared/passive or plain damage (plain damage) | Referenced |
| 65 | Glameow | pokemon | Call for Family; Rip Claw | — | Shared rule | Referenced |
| 66 | Hippopotas | pokemon | Grainy Sand; Double-edge | — | Shared rule | Not separately ID-referenced |
| 67 | Kabuto | pokemon | Shell Attack | Ancient Guidance | Dedicated rule (plain damage) | Referenced |
| 68 | Munchlax | pokemon | Lick | Baby Evolution | Dedicated rule | Referenced |
| 69 | Omanyte | pokemon | Wash Over | Call Up | Dedicated rule | Referenced |
| 70 | Pikachu | pokemon | Quick Attack; Volt Tackle | — | Shared rule | Referenced |
| 71 | Piplup | pokemon | Water Splash; Headbutt | — | Shared/passive or plain damage (plain damage) | Referenced |
| 72 | Piplup | pokemon | Splatter | — | Shared rule | Referenced |
| 73 | Shellos East Sea | pokemon | Surf; Muddy Water | — | Shared/passive or plain damage (plain damage) | Referenced |
| 74 | Spearow | pokemon | Wing Attack; Claw | — | Shared/passive or plain damage (plain damage) | Referenced |
| 75 | Starly | pokemon | Whirlwind; Flap | — | Shared/passive or plain damage (plain damage) | Referenced |
| 76 | Stunky | pokemon | Poison Gas; Slash | — | Shared/passive or plain damage (plain damage) | Referenced |
| 77 | Turtwig | pokemon | Rollout; Razor Leaf | — | Shared/passive or plain damage (plain damage) | Referenced |
| 78 | Turtwig | pokemon | Bite | — | Shared/passive or plain damage (plain damage) | Referenced |
| 79 | Dawn Stadium | trainer | — | — | Shared/passive or plain damage | Referenced |
| 80 | Dusk Ball | trainer | — | — | Dedicated rule | Referenced |
| 81 | Energy Restore | trainer | — | — | Dedicated rule | Not separately ID-referenced |
| 82 | Fossil Excavator | trainer | — | — | Dedicated rule | Not separately ID-referenced |
| 83 | Mom's Kindness | trainer | — | — | Shared rule | Referenced |
| 84 | Old Amber | trainer | — | Hard Amber | Shared/passive or plain damage | Referenced |
| 85 | Poké Ball | trainer | — | — | Shared rule | Not separately ID-referenced |
| 86 | Quick Ball | trainer | — | — | Dedicated rule | Not separately ID-referenced |
| 87 | Super Scoop Up | trainer | — | — | Shared rule | Not separately ID-referenced |
| 88 | Warp Point | trainer | — | — | Shared rule | Not separately ID-referenced |
| 89 | Dome Fossil | trainer | — | Rock Reaction | Dedicated rule | Referenced |
| 90 | Energy Search | trainer | — | — | Dedicated rule | Not separately ID-referenced |
| 91 | Helix Fossil | trainer | — | Aqua Reaction | Dedicated rule | Referenced |
| 92 | Call Energy | energy | — | — | Shared rule | Referenced |
| 93 | Darkness Energy | energy | — | — | Shared rule | Referenced |
| 94 | Health Energy | energy | — | — | Shared rule | Referenced |
| 95 | Metal Energy | energy | — | — | Shared rule | Referenced |
| 96 | Recover Energy | energy | — | — | Shared rule | Referenced |
| 97 | Garchomp LV.X | pokemon | Restore | Dragon Pulse | Dedicated rule | Referenced |
| 98 | Glaceon LV.X | pokemon | Avalanche | Chilly Breath | Shared/passive or plain damage | Referenced |
| 99 | Leafeon LV.X | pokemon | Verdant Dance | Energy Forcing | Dedicated rule | Referenced |
| 100 | Porygon-Z LV.X | pokemon | — | Mode Crash; Decode | Dedicated rule | Referenced |

## Aggregate coverage and limitations

- **100/100 playable**, 82 Pokémon, 13 Trainer/Fossil/Stadium cards and 5 Special Energy cards.
- **143 printed attacks and 26 named abilities**, including Fossil Bodies; dedicated handlers are not necessarily independently proven by the synthetic smoke runner.
- **76/76 Majestic Dawn tests passed** (65 implementation tests plus 11 independent outcome/metadata tests). **221/221 selected older-set tests passed** across the earlier Great Encounters/Baby, Secret Wonders and Mysterious Treasures/auditor groups, for **297/297** total selected checks.
- The Great Encounters long smoke command was interrupted during its run and must not be represented as a pass in this release. Mysterious Treasures and Secret Wonders reached 356/356 and 408/408 smoke paths, respectively, during the cross-set checks.
- Seven auditor *review* entries remain (mostly continuous abilities and the reused Energy Search handler). They are not seven known defects. See the attached generated audit JSON and Markdown for individual risk tags.

## Next device checks

Try Leafeon LV.X Energy Forcing with both Health and Recover Energy; Glaceon LV.X with Espeon or Umbreon in play; optional decline of Lucario LV.X Stance; Fossil evolution and extra card-art choices. Confirm each printed choice is visibly resolved before the next attack/Prize overlay.
