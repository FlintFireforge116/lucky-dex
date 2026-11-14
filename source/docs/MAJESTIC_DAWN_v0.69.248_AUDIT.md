# LuckyDex Classic audit — dp5 / Majestic Dawn

**Status:** No definite catalog/schema failures; 0 warnings; 7 follow-up flags.

**Coverage:** 100/100 enabled, 0 gated. 143 attacks, 23 named abilities; 80/100 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 17 |
| privacy | 1 |
| timing | 13 |
| energyMovement | 24 |
| status | 5 |
| deckSearch | 11 |
| coin | 51 |

## Generated CPU decks

16/16 legal 30-card decks across eight Energy types (two seeds each).

## Synthetic battle action checks

312/312 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 84 cards flagged.

- **dp5-1 Articuno** — coin
- **dp5-3 Darkrai** — choice, timing, status
- **dp5-4 Dialga** — coin
- **dp5-5 Glaceon** — timing, coin
- **dp5-6 Kabutops** — source review; ability Primal Shell: no-op effect; verify separately implemented passive/continuous rule.
- **dp5-7 Leafeon** — timing
- **dp5-8 Manaphy** — choice, energyMovement, coin
- **dp5-9 Mewtwo** — choice, energyMovement
- **dp5-10 Moltres** — choice, energyMovement, coin
- **dp5-11 Palkia** — energyMovement
- **dp5-12 Phione** — status, deckSearch
- **dp5-13 Rotom** — choice, energyMovement
- **dp5-14 Zapdos** — coin
- **dp5-15 Aerodactyl** — status, coin
- **dp5-16 Bronzong** — timing
- **dp5-17 Empoleon** — coin
- **dp5-18 Espeon** — energyMovement; ability Sunlight Veil: no-op effect; verify separately implemented passive/continuous rule.
- **dp5-19 Flareon** — energyMovement, coin
- **dp5-20 Glaceon** — status, coin
- **dp5-21 Hippowdon** — energyMovement, coin
- **dp5-22 Infernape** — energyMovement
- **dp5-23 Jolteon** — energyMovement, coin
- **dp5-24 Leafeon** — coin
- **dp5-26 Omastar** — choice, timing
- **dp5-27 Phione** — timing, energyMovement, coin
- **dp5-29 Scizor** — energyMovement, coin
- **dp5-30 Torterra** — timing
- **dp5-31 Toxicroak** — coin
- **dp5-32 Umbreon** — source review; ability Moonlight Veil: no-op effect; verify separately implemented passive/continuous rule.
- **dp5-34 Vaporeon** — energyMovement, coin
- **dp5-35 Ambipom** — choice, deckSearch
- **dp5-36 Fearow** — coin
- **dp5-37 Grotle** — energyMovement, coin
- **dp5-38 Kangaskhan** — coin
- **dp5-39 Lickitung** — coin
- **dp5-40 Manectric** — coin
- **dp5-41 Monferno** — coin
- **dp5-42 Mothim** — energyMovement; ability Disturbance Scales: no-op effect; verify separately implemented passive/continuous rule.
- **dp5-43 Pachirisu** — coin
- **dp5-44 Prinplup** — choice
- **dp5-45 Raichu** — timing, energyMovement, coin
- **dp5-46 Scyther** — coin
- **dp5-47 Staravia** — coin
- **dp5-51 Aipom** — coin
- **dp5-52 Bronzor** — status, coin
- **dp5-54 Burmy Sandy Cloak** — coin
- **dp5-55 Chatot** — timing, deckSearch
- **dp5-56 Chimchar** — coin
- **dp5-57 Chimchar** — coin
- **dp5-58 Chingling** — choice, coin
- **dp5-59 Combee** — choice
- **dp5-60 Croagunk** — coin
- **dp5-61 Drifloon** — coin
- **dp5-62 Eevee** — deckSearch, coin
- **dp5-63 Eevee** — timing, coin
- **dp5-64 Electrike** — choice
- **dp5-65 Glameow** — energyMovement, coin
- **dp5-66 Hippopotas** — coin
- **dp5-67 Kabuto** — deckSearch, coin
- **dp5-68 Munchlax** — choice, coin
- **dp5-69 Omanyte** — coin
- **dp5-70 Pikachu** — coin
- **dp5-71 Piplup** — coin
- **dp5-72 Piplup** — choice
- **dp5-74 Spearow** — coin
- **dp5-76 Stunky** — coin
- **dp5-79 Dawn Stadium** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **dp5-80 Dusk Ball** — choice
- **dp5-81 Energy Restore** — energyMovement, coin
- **dp5-82 Fossil Excavator** — deckSearch
- **dp5-85 Poké Ball** — deckSearch, coin
- **dp5-86 Quick Ball** — privacy
- **dp5-87 Super Scoop Up** — coin
- **dp5-89 Dome Fossil** — energyMovement, deckSearch
- **dp5-90 Energy Search** — energyMovement, deckSearch; card effect: custom rule ex1:basicSearch1 has no obvious source literal; inspect dispatcher.
- **dp5-91 Helix Fossil** — energyMovement, deckSearch
- **dp5-92 Call Energy** — choice
- **dp5-93 Darkness Energy** — timing
- **dp5-94 Health Energy** — timing
- **dp5-96 Recover Energy** — timing
- **dp5-97 Garchomp LV.X** — choice, energyMovement, coin
- **dp5-98 Glaceon LV.X** — coin; ability Chilly Breath: no-op effect; verify separately implemented passive/continuous rule.
- **dp5-99 Leafeon LV.X** — energyMovement
- **dp5-100 Porygon-Z LV.X** — choice, energyMovement, deckSearch

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| dp5-1 Articuno | enabled | 1 | 1 | coin | 1 |
| dp5-2 Cresselia | enabled | 2 | 0 |  | 1 |
| dp5-3 Darkrai | enabled | 2 | 1 | choice, timing, status | 1 |
| dp5-4 Dialga | enabled | 2 | 0 | coin | 1 |
| dp5-5 Glaceon | enabled | 2 | 0 | timing, coin | 1 |
| dp5-6 Kabutops | enabled | 1 | 1 |  | 1 |
| dp5-7 Leafeon | enabled | 2 | 0 | timing | 2 |
| dp5-8 Manaphy | enabled | 2 | 1 | choice, energyMovement, coin | 1 |
| dp5-9 Mewtwo | enabled | 3 | 0 | choice, energyMovement | 1 |
| dp5-10 Moltres | enabled | 1 | 1 | choice, energyMovement, coin | 1 |
| dp5-11 Palkia | enabled | 2 | 0 | energyMovement | 1 |
| dp5-12 Phione | enabled | 2 | 0 | status, deckSearch | 1 |
| dp5-13 Rotom | enabled | 2 | 0 | choice, energyMovement | 1 |
| dp5-14 Zapdos | enabled | 1 | 1 | coin | 1 |
| dp5-15 Aerodactyl | enabled | 1 | 1 | status, coin | 1 |
| dp5-16 Bronzong | enabled | 2 | 1 | timing | 1 |
| dp5-17 Empoleon | enabled | 2 | 0 | coin | 1 |
| dp5-18 Espeon | enabled | 1 | 1 | energyMovement | 1 |
| dp5-19 Flareon | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-20 Glaceon | enabled | 2 | 0 | status, coin | 1 |
| dp5-21 Hippowdon | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-22 Infernape | enabled | 2 | 0 | energyMovement | 1 |
| dp5-23 Jolteon | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-24 Leafeon | enabled | 2 | 0 | coin | 0 |
| dp5-25 Minun | enabled | 2 | 0 |  | 0 |
| dp5-26 Omastar | enabled | 1 | 1 | choice, timing | 1 |
| dp5-27 Phione | enabled | 2 | 0 | timing, energyMovement, coin | 0 |
| dp5-28 Plusle | enabled | 2 | 0 |  | 0 |
| dp5-29 Scizor | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-30 Torterra | enabled | 2 | 0 | timing | 2 |
| dp5-31 Toxicroak | enabled | 2 | 0 | coin | 0 |
| dp5-32 Umbreon | enabled | 1 | 1 |  | 1 |
| dp5-33 Unown [P] | enabled | 1 | 1 |  | 1 |
| dp5-34 Vaporeon | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-35 Ambipom | enabled | 2 | 0 | choice, deckSearch | 0 |
| dp5-36 Fearow | enabled | 2 | 0 | coin | 1 |
| dp5-37 Grotle | enabled | 2 | 0 | energyMovement, coin | 2 |
| dp5-38 Kangaskhan | enabled | 2 | 0 | coin | 2 |
| dp5-39 Lickitung | enabled | 2 | 0 | coin | 1 |
| dp5-40 Manectric | enabled | 2 | 0 | coin | 1 |
| dp5-41 Monferno | enabled | 2 | 0 | coin | 1 |
| dp5-42 Mothim | enabled | 2 | 1 | energyMovement | 1 |
| dp5-43 Pachirisu | enabled | 2 | 0 | coin | 1 |
| dp5-44 Prinplup | enabled | 2 | 0 | choice | 1 |
| dp5-45 Raichu | enabled | 2 | 0 | timing, energyMovement, coin | 2 |
| dp5-46 Scyther | enabled | 2 | 0 | coin | 1 |
| dp5-47 Staravia | enabled | 2 | 0 | coin | 1 |
| dp5-48 Sudowoodo | enabled | 2 | 0 |  | 0 |
| dp5-49 Unown [Q] | enabled | 1 | 1 |  | 1 |
| dp5-50 Aipom | enabled | 2 | 0 |  | 1 |
| dp5-51 Aipom | enabled | 2 | 0 | coin | 0 |
| dp5-52 Bronzor | enabled | 2 | 0 | status, coin | 1 |
| dp5-53 Buneary | enabled | 2 | 0 |  | 1 |
| dp5-54 Burmy Sandy Cloak | enabled | 2 | 0 | coin | 0 |
| dp5-55 Chatot | enabled | 2 | 0 | timing, deckSearch | 1 |
| dp5-56 Chimchar | enabled | 2 | 0 | coin | 0 |
| dp5-57 Chimchar | enabled | 1 | 0 | coin | 0 |
| dp5-58 Chingling | enabled | 1 | 1 | choice, coin | 1 |
| dp5-59 Combee | enabled | 2 | 0 | choice | 1 |
| dp5-60 Croagunk | enabled | 2 | 0 | coin | 1 |
| dp5-61 Drifloon | enabled | 2 | 0 | coin | 1 |
| dp5-62 Eevee | enabled | 2 | 0 | deckSearch, coin | 0 |
| dp5-63 Eevee | enabled | 2 | 0 | timing, coin | 1 |
| dp5-64 Electrike | enabled | 2 | 0 | choice | 1 |
| dp5-65 Glameow | enabled | 2 | 0 | energyMovement, coin | 1 |
| dp5-66 Hippopotas | enabled | 2 | 0 | coin | 0 |
| dp5-67 Kabuto | enabled | 1 | 1 | deckSearch, coin | 1 |
| dp5-68 Munchlax | enabled | 1 | 1 | choice, coin | 1 |
| dp5-69 Omanyte | enabled | 1 | 1 | coin | 1 |
| dp5-70 Pikachu | enabled | 2 | 0 | coin | 2 |
| dp5-71 Piplup | enabled | 2 | 0 | coin | 1 |
| dp5-72 Piplup | enabled | 1 | 0 | choice | 1 |
| dp5-73 Shellos East Sea | enabled | 2 | 0 |  | 1 |
| dp5-74 Spearow | enabled | 2 | 0 | coin | 1 |
| dp5-75 Starly | enabled | 2 | 0 |  | 1 |
| dp5-76 Stunky | enabled | 2 | 0 | coin | 1 |
| dp5-77 Turtwig | enabled | 2 | 0 |  | 2 |
| dp5-78 Turtwig | enabled | 1 | 0 |  | 2 |
| dp5-79 Dawn Stadium | enabled | 0 | 0 |  | 1 |
| dp5-80 Dusk Ball | enabled | 0 | 0 | choice | 2 |
| dp5-81 Energy Restore | enabled | 0 | 0 | energyMovement, coin | 0 |
| dp5-82 Fossil Excavator | enabled | 0 | 0 | deckSearch | 0 |
| dp5-83 Mom's Kindness | enabled | 0 | 0 |  | 2 |
| dp5-84 Old Amber | enabled | 0 | 1 |  | 1 |
| dp5-85 Poké Ball | enabled | 0 | 0 | deckSearch, coin | 0 |
| dp5-86 Quick Ball | enabled | 0 | 0 | privacy | 0 |
| dp5-87 Super Scoop Up | enabled | 0 | 0 | coin | 0 |
| dp5-88 Warp Point | enabled | 0 | 0 |  | 0 |
| dp5-89 Dome Fossil | enabled | 0 | 1 | energyMovement, deckSearch | 1 |
| dp5-90 Energy Search | enabled | 0 | 0 | energyMovement, deckSearch | 0 |
| dp5-91 Helix Fossil | enabled | 0 | 1 | energyMovement, deckSearch | 1 |
| dp5-92 Call Energy | enabled | 0 | 0 | choice | 1 |
| dp5-93 Darkness Energy | enabled | 0 | 0 | timing | 2 |
| dp5-94 Health Energy | enabled | 0 | 0 | timing | 1 |
| dp5-95 Metal Energy | enabled | 0 | 0 |  | 1 |
| dp5-96 Recover Energy | enabled | 0 | 0 | timing | 1 |
| dp5-97 Garchomp LV.X | enabled | 1 | 1 | choice, energyMovement, coin | 1 |
| dp5-98 Glaceon LV.X | enabled | 1 | 1 | coin | 1 |
| dp5-99 Leafeon LV.X | enabled | 1 | 1 | energyMovement | 1 |
| dp5-100 Porygon-Z LV.X | enabled | 0 | 2 | choice, energyMovement, deckSearch | 1 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

