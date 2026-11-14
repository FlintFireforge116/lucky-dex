# LuckyDex v0.69.248 — Majestic Dawn complete implementation

## Implementation status

- **100/100** Majestic Dawn collector prints registered and battle-enabled, including all 82 Pokémon, 13 Trainer/Fossil/Stadium, and five Special Energy prints.
- **143 printed attacks**, 23 Pokémon abilities plus three Fossil abilities represented in the full printed catalog.
- **65/65** dedicated Majestic Dawn implementation/outcome tests passed (the original 26 and 39 continuation tests).
- **185/185** selected earlier-expansion regression tests passed (Great Encounters, Secret Wonders, Mysterious Treasures and Baby Evolution): 93 total Majestic Dawn/selected GE tests, 100 Secret Wonders/Baby tests and 57 earlier Mysterious Treasures/GE tests, minus 65 Majestic Dawn tests = 185.
- **312/312** Majestic Dawn synthetic attack/Trainer paths completed with no skipped actions or errors.
- **16/16** Majestic Dawn-only CPU deck builds legal across eight Energy types (two seeds each).
- **0** catalog errors, **0** warnings; **7** follow-up review flags in auditor, all nonblocking; see `MAJESTIC_DAWN_v0.69.248_AUDIT.md`.

## Newly completed mechanics

- **Four LV.X cards:** Garchomp (Restore and Dragon Pulse), Glaceon (Chilly Breath and Avalanche), Leafeon (Energy Forcing and Verdant Dance), Porygon-Z (Mode Crash and Decode).
- **Fossils:** Old Amber, Dome Fossil and Helix Fossil treated as actual 50 HP Basic Pokémon in play, with Fossil evolution and voluntary discard rules.
- **Eevee decks:** Espeon Sunlight Veil HP increase and Umbreon Moonlight Veil effects for Eevee evolutions.
- **Reactions:** Manaphy Aqua Skin, Articuno Freezing Screech, Moltres Flame Charge, Kabutops Primal Shell, Aerodactyl Primal Claw, Omastar Primal Swirl and Mothim Disturbance Scales.
- **Physical card movement:** Mewtwo Energy Absorption, Rotom Dual Trans, Flareon Kindle, Palkia Pearl Blast, Vaporeon Hyper Whirlpool, Aipom Hand Trick and real-card search / discard / hand interactions.
- **Timing:** Dawn Stadium, Health Energy and Recover Energy hand-attachment triggers; Call Energy benches real Pokémon then ends the turn.
- **Autobuilder:** Corrected the missing `dp5` allowlist entry. Previously, selecting only Majestic Dawn could silently fall back to the entire older card pool. Tests now require all generated card prints to belong to `dp5`.

## Audit boundaries

- The complete implementation pass is **not** an independent visual/printed-card audit; targeted testing and the synthetic auditor do not verify every possible combination or on-device display.
- Seven auditor review flags remain to validate on real board states: continuous/passive effects on Kabutops, Espeon, Umbreon, Mothim, Dawn Stadium and Glaceon LV.X, plus the reused Energy Search handler. These are not confirmed errors.
- Majestic Dawn full-set CPU decks were generated and validated, but every possible opponent strategy and random seed was not tested.
- All effects requiring physical card choices should show actual card images where IDs are known, preserve concealed opponent information and complete resolution before the Prize overlay. Confirm Android presentation separately.

## Full 100-card ready ledger

| # | Card | Category | Attacks | Powers / Bodies | Implemented | Risk indicators |
|---:|---|---|---|---|---|---|
| 1 | Articuno | pokemon | 1 | 1 | Yes | coin |
| 2 | Cresselia | pokemon | 2 | 0 | Yes | — |
| 3 | Darkrai | pokemon | 2 | 1 | Yes | choice, timing, status |
| 4 | Dialga | pokemon | 2 | 0 | Yes | coin |
| 5 | Glaceon | pokemon | 2 | 0 | Yes | timing, coin |
| 6 | Kabutops | pokemon | 1 | 1 | Yes | — |
| 7 | Leafeon | pokemon | 2 | 0 | Yes | timing |
| 8 | Manaphy | pokemon | 2 | 1 | Yes | choice, energyMovement, coin |
| 9 | Mewtwo | pokemon | 3 | 0 | Yes | choice, energyMovement |
| 10 | Moltres | pokemon | 1 | 1 | Yes | choice, energyMovement, coin |
| 11 | Palkia | pokemon | 2 | 0 | Yes | energyMovement |
| 12 | Phione | pokemon | 2 | 0 | Yes | status, deckSearch |
| 13 | Rotom | pokemon | 2 | 0 | Yes | choice, energyMovement |
| 14 | Zapdos | pokemon | 1 | 1 | Yes | coin |
| 15 | Aerodactyl | pokemon | 1 | 1 | Yes | status, coin |
| 16 | Bronzong | pokemon | 2 | 1 | Yes | timing |
| 17 | Empoleon | pokemon | 2 | 0 | Yes | coin |
| 18 | Espeon | pokemon | 1 | 1 | Yes | energyMovement |
| 19 | Flareon | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 20 | Glaceon | pokemon | 2 | 0 | Yes | status, coin |
| 21 | Hippowdon | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 22 | Infernape | pokemon | 2 | 0 | Yes | energyMovement |
| 23 | Jolteon | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 24 | Leafeon | pokemon | 2 | 0 | Yes | coin |
| 25 | Minun | pokemon | 2 | 0 | Yes | — |
| 26 | Omastar | pokemon | 1 | 1 | Yes | choice, timing |
| 27 | Phione | pokemon | 2 | 0 | Yes | timing, energyMovement, coin |
| 28 | Plusle | pokemon | 2 | 0 | Yes | — |
| 29 | Scizor | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 30 | Torterra | pokemon | 2 | 0 | Yes | timing |
| 31 | Toxicroak | pokemon | 2 | 0 | Yes | coin |
| 32 | Umbreon | pokemon | 1 | 1 | Yes | — |
| 33 | Unown [P] | pokemon | 1 | 1 | Yes | — |
| 34 | Vaporeon | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 35 | Ambipom | pokemon | 2 | 0 | Yes | choice, deckSearch |
| 36 | Fearow | pokemon | 2 | 0 | Yes | coin |
| 37 | Grotle | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 38 | Kangaskhan | pokemon | 2 | 0 | Yes | coin |
| 39 | Lickitung | pokemon | 2 | 0 | Yes | coin |
| 40 | Manectric | pokemon | 2 | 0 | Yes | coin |
| 41 | Monferno | pokemon | 2 | 0 | Yes | coin |
| 42 | Mothim | pokemon | 2 | 1 | Yes | energyMovement |
| 43 | Pachirisu | pokemon | 2 | 0 | Yes | coin |
| 44 | Prinplup | pokemon | 2 | 0 | Yes | choice |
| 45 | Raichu | pokemon | 2 | 0 | Yes | timing, energyMovement, coin |
| 46 | Scyther | pokemon | 2 | 0 | Yes | coin |
| 47 | Staravia | pokemon | 2 | 0 | Yes | coin |
| 48 | Sudowoodo | pokemon | 2 | 0 | Yes | — |
| 49 | Unown [Q] | pokemon | 1 | 1 | Yes | — |
| 50 | Aipom | pokemon | 2 | 0 | Yes | — |
| 51 | Aipom | pokemon | 2 | 0 | Yes | coin |
| 52 | Bronzor | pokemon | 2 | 0 | Yes | status, coin |
| 53 | Buneary | pokemon | 2 | 0 | Yes | — |
| 54 | Burmy Sandy Cloak | pokemon | 2 | 0 | Yes | coin |
| 55 | Chatot | pokemon | 2 | 0 | Yes | timing, deckSearch |
| 56 | Chimchar | pokemon | 2 | 0 | Yes | coin |
| 57 | Chimchar | pokemon | 1 | 0 | Yes | coin |
| 58 | Chingling | pokemon | 1 | 1 | Yes | choice, coin |
| 59 | Combee | pokemon | 2 | 0 | Yes | choice |
| 60 | Croagunk | pokemon | 2 | 0 | Yes | coin |
| 61 | Drifloon | pokemon | 2 | 0 | Yes | coin |
| 62 | Eevee | pokemon | 2 | 0 | Yes | deckSearch, coin |
| 63 | Eevee | pokemon | 2 | 0 | Yes | timing, coin |
| 64 | Electrike | pokemon | 2 | 0 | Yes | choice |
| 65 | Glameow | pokemon | 2 | 0 | Yes | energyMovement, coin |
| 66 | Hippopotas | pokemon | 2 | 0 | Yes | coin |
| 67 | Kabuto | pokemon | 1 | 1 | Yes | deckSearch, coin |
| 68 | Munchlax | pokemon | 1 | 1 | Yes | choice, coin |
| 69 | Omanyte | pokemon | 1 | 1 | Yes | coin |
| 70 | Pikachu | pokemon | 2 | 0 | Yes | coin |
| 71 | Piplup | pokemon | 2 | 0 | Yes | coin |
| 72 | Piplup | pokemon | 1 | 0 | Yes | choice |
| 73 | Shellos East Sea | pokemon | 2 | 0 | Yes | — |
| 74 | Spearow | pokemon | 2 | 0 | Yes | coin |
| 75 | Starly | pokemon | 2 | 0 | Yes | — |
| 76 | Stunky | pokemon | 2 | 0 | Yes | coin |
| 77 | Turtwig | pokemon | 2 | 0 | Yes | — |
| 78 | Turtwig | pokemon | 1 | 0 | Yes | — |
| 79 | Dawn Stadium | trainer | 0 | 0 | Yes | — |
| 80 | Dusk Ball | trainer | 0 | 0 | Yes | choice |
| 81 | Energy Restore | trainer | 0 | 0 | Yes | energyMovement, coin |
| 82 | Fossil Excavator | trainer | 0 | 0 | Yes | deckSearch |
| 83 | Mom's Kindness | trainer | 0 | 0 | Yes | — |
| 84 | Old Amber | trainer | 0 | 1 | Yes | — |
| 85 | Poké Ball | trainer | 0 | 0 | Yes | deckSearch, coin |
| 86 | Quick Ball | trainer | 0 | 0 | Yes | privacy |
| 87 | Super Scoop Up | trainer | 0 | 0 | Yes | coin |
| 88 | Warp Point | trainer | 0 | 0 | Yes | — |
| 89 | Dome Fossil | trainer | 0 | 1 | Yes | energyMovement, deckSearch |
| 90 | Energy Search | trainer | 0 | 0 | Yes | energyMovement, deckSearch |
| 91 | Helix Fossil | trainer | 0 | 1 | Yes | energyMovement, deckSearch |
| 92 | Call Energy | energy | 0 | 0 | Yes | choice |
| 93 | Darkness Energy | energy | 0 | 0 | Yes | timing |
| 94 | Health Energy | energy | 0 | 0 | Yes | timing |
| 95 | Metal Energy | energy | 0 | 0 | Yes | — |
| 96 | Recover Energy | energy | 0 | 0 | Yes | timing |
| 97 | Garchomp LV.X | pokemon | 1 | 1 | Yes | choice, energyMovement, coin |
| 98 | Glaceon LV.X | pokemon | 1 | 1 | Yes | coin |
| 99 | Leafeon LV.X | pokemon | 1 | 1 | Yes | energyMovement |
| 100 | Porygon-Z LV.X | pokemon | 0 | 2 | Yes | choice, energyMovement, deckSearch |

## Release checks

Run `node --test source/tests/v07247-majestic-dawn-stage1.test.cjs source/tests/v07248-majestic-dawn-continuation.test.cjs` and `node source/scripts/audit-classic-set.cjs --set dp5 --smoke --no-write`.
GitHub preflight runs both before the APK build. Build versionName `0.69.248`, incremented versionCode, runtime build label `0.69.248`.
