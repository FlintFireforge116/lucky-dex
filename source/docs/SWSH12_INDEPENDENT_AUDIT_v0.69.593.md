# LuckyDex Classic audit — swsh12 / Silver Tempest

**Status:** No definite catalog/schema failures; 0 warnings; 9 follow-up flags.

**Coverage:** 215/215 enabled, 0 gated. 280 attacks, 37 named abilities; 128/215 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 85 |
| privacy | 13 |
| timing | 25 |
| energyMovement | 39 |
| status | 24 |
| deckSearch | 43 |
| coin | 24 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

628/628 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 156 cards flagged.

- **swsh12-2 Venomoth** — choice, status, coin
- **swsh12-6 Sunflora** — choice, energyMovement
- **swsh12-8 Serperior VSTAR** — choice, energyMovement
- **swsh12-10 Hisuian Lilligant** — choice, deckSearch
- **swsh12-12 Amoonguss** — timing, status
- **swsh12-13 Durant** — choice, privacy, energyMovement, deckSearch
- **swsh12-16 Radiant Tsareena** — choice
- **swsh12-17 Vulpix** — coin
- **swsh12-18 Ninetales** — timing, status
- **swsh12-20 Arcanine** — energyMovement
- **swsh12-22 Rapidash** — choice, energyMovement
- **swsh12-23 Victini** — choice, energyMovement
- **swsh12-24 Reshiram V** — choice, timing, energyMovement, deckSearch, coin
- **swsh12-25 Fennekin** — privacy, deckSearch
- **swsh12-27 Delphox** — energyMovement
- **swsh12-31 Torracat** — timing
- **swsh12-32 Incineroar** — choice, energyMovement
- **swsh12-34 Alolan Vulpix VSTAR** — timing
- **swsh12-35 Omastar V** — choice, timing, deckSearch
- **swsh12-36 Articuno** — status
- **swsh12-38 Wailord** — energyMovement
- **swsh12-39 Feebas** — deckSearch
- **swsh12-40 Milotic** — status
- **swsh12-43 Froslass** — status
- **swsh12-44 Relicanth** — choice, status, deckSearch
- **swsh12-45 Phione** — choice, deckSearch
- **swsh12-48 Araquanid** — energyMovement, status, coin
- **swsh12-52 Lanturn** — energyMovement
- **swsh12-53 Rotom** — deckSearch
- **swsh12-54 Emolga** — privacy, deckSearch
- **swsh12-57 Regieleki V** — timing
- **swsh12-58 Regieleki VMAX** — timing
- **swsh12-59 Radiant Alakazam** — choice
- **swsh12-60 Drowzee** — status
- **swsh12-61 Hypno** — choice, deckSearch
- **swsh12-63 Misdreavus** — status, coin
- **swsh12-65 Unown V** — status
- **swsh12-66 Unown VSTAR** — coin
- **swsh12-67 Ralts** — choice, timing
- **swsh12-68 Kirlia** — choice
- **swsh12-69 Gardevoir** — choice
- **swsh12-70 Mawile V** — energyMovement, coin
- **swsh12-71 Mawile VSTAR** — choice
- **swsh12-74 Chimecho** — timing, status
- **swsh12-75 Sigilyph** — choice, deckSearch
- **swsh12-78 Reuniclus** — choice
- **swsh12-82 Meowstic** — choice, privacy, deckSearch
- **swsh12-85 Dedenne** — status
- **swsh12-86 Indeedee** — deckSearch
- **swsh12-89 Dragapult** — choice
- **swsh12-90 Hisuian Arcanine V** — choice, energyMovement
- **swsh12-91 Phanpy** — coin
- **swsh12-93 Baltoy** — privacy, deckSearch
- **swsh12-94 Claydol** — choice, energyMovement
- **swsh12-95 Anorith** — choice
- **swsh12-97 Terrakion** — timing
- **swsh12-98 Hawlucha** — coin
- **swsh12-99 Sandygast** — timing
- **swsh12-105 Crobat** — status
- **swsh12-106 Murkrow** — choice, deckSearch
- **swsh12-107 Honchkrow** — choice
- **swsh12-108 Skuntank V** — timing, status
- **swsh12-110 Toxicroak** — timing
- **swsh12-112 Krokorok** — energyMovement, coin
- **swsh12-113 Krookodile** — choice
- **swsh12-114 Mareanie** — status
- **swsh12-115 Toxapex** — status
- **swsh12-117 Beldum** — deckSearch
- **swsh12-118 Metang** — coin
- **swsh12-119 Metagross** — choice, timing
- **swsh12-120 Radiant Jirachi** — choice, deckSearch, coin
- **swsh12-123 Klink** — privacy, deckSearch
- **swsh12-124 Klang** — coin
- **swsh12-125 Klinklang** — choice, energyMovement, deckSearch
- **swsh12-126 Cobalion** — choice, energyMovement, deckSearch
- **swsh12-127 Togedemaru** — timing, coin
- **swsh12-128 Magearna V** — energyMovement
- **swsh12-129 Dratini** — coin
- **swsh12-130 Dragonair** — status, coin
- **swsh12-131 Dragonite** — choice, energyMovement, deckSearch
- **swsh12-134 Zygarde** — energyMovement
- **swsh12-135 Regidrago V** — energyMovement, deckSearch; attack Celestial Roar: custom rule bw6:celestialRoar has no obvious source literal; inspect dispatcher.
- **swsh12-136 Regidrago VSTAR** — choice, deckSearch
- **swsh12-137 Smeargle** — choice, energyMovement, deckSearch
- **swsh12-138 Lugia V** — choice
- **swsh12-139 Lugia VSTAR** — choice
- **swsh12-140 Ho-Oh V** — choice, energyMovement
- **swsh12-141 Spinda** — status
- **swsh12-142 Swablu** — coin
- **swsh12-144 Buneary** — coin
- **swsh12-145 Lopunny** — coin
- **swsh12-147 Archeops** — choice, energyMovement, deckSearch
- **swsh12-148 Rufflet** — coin
- **swsh12-149 Hisuian Braviary** — status
- **swsh12-151 Brandon** — choice
- **swsh12-152 Candice** — choice, privacy, deckSearch
- **swsh12-153 Capturing Aroma** — choice, privacy, deckSearch, coin
- **swsh12-154 Earthen Seal Stone** — choice, energyMovement; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-155 Emergency Jelly** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-156 Forest Seal Stone** — choice, deckSearch; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-157 Furisode Girl** — choice, deckSearch
- **swsh12-158 Gym Trainer** — choice, timing
- **swsh12-159 Lance** — choice, privacy, deckSearch
- **swsh12-160 Leafy Camo Poncho** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-161 Primordial Altar** — deckSearch
- **swsh12-162 Professor Laventon** — choice
- **swsh12-163 Quad Stone** — choice
- **swsh12-164 Serena** — choice
- **swsh12-165 Unidentified Fossil** — choice
- **swsh12-166 Wallace** — choice
- **swsh12-167 Worker** — choice
- **swsh12-168 Regenerative Energy** — energyMovement
- **swsh12-169 V Guard Energy** — energyMovement
- **swsh12-172 Reshiram V** — choice, timing, energyMovement, deckSearch, coin
- **swsh12-174 Omastar V** — choice, timing, deckSearch
- **swsh12-175 Regieleki V** — timing
- **swsh12-176 Unown V** — status
- **swsh12-177 Unown V** — status
- **swsh12-178 Mawile V** — energyMovement, coin
- **swsh12-179 Hisuian Arcanine V** — choice, energyMovement
- **swsh12-180 Skuntank V** — timing, status
- **swsh12-181 Skuntank V** — timing, status
- **swsh12-182 Magearna V** — energyMovement
- **swsh12-183 Regidrago V** — energyMovement, deckSearch; attack Celestial Roar: custom rule bw6:celestialRoar has no obvious source literal; inspect dispatcher.
- **swsh12-184 Regidrago V** — energyMovement, deckSearch; attack Celestial Roar: custom rule bw6:celestialRoar has no obvious source literal; inspect dispatcher.
- **swsh12-185 Lugia V** — choice
- **swsh12-186 Lugia V** — choice
- **swsh12-187 Ho-Oh V** — choice, energyMovement
- **swsh12-188 Brandon** — choice
- **swsh12-189 Candice** — choice, privacy, deckSearch
- **swsh12-190 Furisode Girl** — choice, deckSearch
- **swsh12-191 Gym Trainer** — choice, timing
- **swsh12-192 Lance** — choice, privacy, deckSearch
- **swsh12-193 Serena** — choice
- **swsh12-194 Wallace** — choice
- **swsh12-195 Worker** — choice
- **swsh12-196 Serperior VSTAR** — choice, energyMovement
- **swsh12-197 Alolan Vulpix VSTAR** — timing
- **swsh12-198 Regieleki VMAX** — timing
- **swsh12-199 Unown VSTAR** — coin
- **swsh12-200 Mawile VSTAR** — choice
- **swsh12-201 Regidrago VSTAR** — choice, deckSearch
- **swsh12-202 Lugia VSTAR** — choice
- **swsh12-203 Brandon** — choice
- **swsh12-204 Candice** — choice, privacy, deckSearch
- **swsh12-205 Furisode Girl** — choice, deckSearch
- **swsh12-206 Lance** — choice, privacy, deckSearch
- **swsh12-207 Serena** — choice
- **swsh12-208 Wallace** — choice
- **swsh12-209 Worker** — choice
- **swsh12-210 Serperior VSTAR** — choice, energyMovement
- **swsh12-211 Lugia VSTAR** — choice
- **swsh12-212 Energy Switch** — choice, energyMovement
- **swsh12-213 Gapejaw Bog** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-214 Leafy Camo Poncho** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh12-215 V Guard Energy** — energyMovement

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| swsh12-1 Venonat | enabled | 1 | 0 |  | 1 |
| swsh12-2 Venomoth | enabled | 2 | 0 | choice, status, coin | 0 |
| swsh12-3 Spinarak | enabled | 1 | 0 |  | 0 |
| swsh12-4 Ariados | enabled | 1 | 1 |  | 1 |
| swsh12-5 Sunkern | enabled | 1 | 0 |  | 0 |
| swsh12-6 Sunflora | enabled | 1 | 0 | choice, energyMovement | 1 |
| swsh12-7 Serperior V | enabled | 2 | 0 |  | 1 |
| swsh12-8 Serperior VSTAR | enabled | 2 | 0 | choice, energyMovement | 1 |
| swsh12-9 Petilil | enabled | 2 | 0 |  | 0 |
| swsh12-10 Hisuian Lilligant | enabled | 2 | 0 | choice, deckSearch | 0 |
| swsh12-11 Foongus | enabled | 1 | 0 |  | 0 |
| swsh12-12 Amoonguss | enabled | 1 | 1 | timing, status | 1 |
| swsh12-13 Durant | enabled | 2 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh12-14 Virizion | enabled | 2 | 0 |  | 1 |
| swsh12-15 Chesnaught V | enabled | 1 | 1 |  | 1 |
| swsh12-16 Radiant Tsareena | enabled | 1 | 1 | choice | 1 |
| swsh12-17 Vulpix | enabled | 1 | 0 | coin | 1 |
| swsh12-18 Ninetales | enabled | 2 | 0 | timing, status | 0 |
| swsh12-19 Growlithe | enabled | 2 | 0 |  | 0 |
| swsh12-20 Arcanine | enabled | 2 | 0 | energyMovement | 0 |
| swsh12-21 Ponyta | enabled | 1 | 0 |  | 0 |
| swsh12-22 Rapidash | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-23 Victini | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh12-24 Reshiram V | enabled | 2 | 0 | choice, timing, energyMovement, deckSearch, coin | 0 |
| swsh12-25 Fennekin | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh12-26 Braixen | enabled | 2 | 0 |  | 1 |
| swsh12-27 Delphox | enabled | 2 | 0 | energyMovement | 0 |
| swsh12-28 Fletchinder | enabled | 1 | 0 |  | 0 |
| swsh12-29 Talonflame | enabled | 2 | 0 |  | 0 |
| swsh12-30 Litten | enabled | 2 | 0 |  | 1 |
| swsh12-31 Torracat | enabled | 2 | 0 | timing | 1 |
| swsh12-32 Incineroar | enabled | 2 | 0 | choice, energyMovement | 1 |
| swsh12-33 Alolan Vulpix V | enabled | 2 | 0 |  | 0 |
| swsh12-34 Alolan Vulpix VSTAR | enabled | 2 | 0 | timing | 1 |
| swsh12-35 Omastar V | enabled | 2 | 0 | choice, timing, deckSearch | 0 |
| swsh12-36 Articuno | enabled | 2 | 0 | status | 0 |
| swsh12-37 Wailmer | enabled | 2 | 0 |  | 1 |
| swsh12-38 Wailord | enabled | 1 | 1 | energyMovement | 1 |
| swsh12-39 Feebas | enabled | 2 | 0 | deckSearch | 0 |
| swsh12-40 Milotic | enabled | 2 | 0 | status | 1 |
| swsh12-41 Snorunt | enabled | 2 | 0 |  | 0 |
| swsh12-42 Glalie | enabled | 2 | 0 |  | 1 |
| swsh12-43 Froslass | enabled | 2 | 0 | status | 1 |
| swsh12-44 Relicanth | enabled | 2 | 0 | choice, status, deckSearch | 0 |
| swsh12-45 Phione | enabled | 2 | 0 | choice, deckSearch | 0 |
| swsh12-46 Keldeo | enabled | 2 | 0 |  | 1 |
| swsh12-47 Dewpider | enabled | 1 | 0 |  | 0 |
| swsh12-48 Araquanid | enabled | 2 | 0 | energyMovement, status, coin | 0 |
| swsh12-49 Pikachu | enabled | 1 | 0 |  | 1 |
| swsh12-50 Raichu | enabled | 2 | 0 |  | 1 |
| swsh12-51 Chinchou | enabled | 2 | 0 |  | 0 |
| swsh12-52 Lanturn | enabled | 2 | 0 | energyMovement | 0 |
| swsh12-53 Rotom | enabled | 2 | 0 | deckSearch | 0 |
| swsh12-54 Emolga | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh12-55 Stunfisk | enabled | 2 | 0 |  | 1 |
| swsh12-56 Zeraora | enabled | 2 | 0 |  | 1 |
| swsh12-57 Regieleki V | enabled | 2 | 0 | timing | 1 |
| swsh12-58 Regieleki VMAX | enabled | 1 | 1 | timing | 1 |
| swsh12-59 Radiant Alakazam | enabled | 1 | 1 | choice | 1 |
| swsh12-60 Drowzee | enabled | 2 | 0 | status | 1 |
| swsh12-61 Hypno | enabled | 2 | 0 | choice, deckSearch | 1 |
| swsh12-62 Jynx | enabled | 1 | 1 |  | 1 |
| swsh12-63 Misdreavus | enabled | 1 | 0 | status, coin | 0 |
| swsh12-64 Mismagius | enabled | 1 | 1 |  | 1 |
| swsh12-65 Unown V | enabled | 2 | 0 | status | 1 |
| swsh12-66 Unown VSTAR | enabled | 2 | 0 | coin | 1 |
| swsh12-67 Ralts | enabled | 1 | 0 | choice, timing | 0 |
| swsh12-68 Kirlia | enabled | 1 | 1 | choice | 1 |
| swsh12-69 Gardevoir | enabled | 1 | 1 | choice | 1 |
| swsh12-70 Mawile V | enabled | 2 | 0 | energyMovement, coin | 1 |
| swsh12-71 Mawile VSTAR | enabled | 1 | 1 | choice | 1 |
| swsh12-72 Meditite | enabled | 1 | 1 |  | 1 |
| swsh12-73 Medicham | enabled | 1 | 1 |  | 1 |
| swsh12-74 Chimecho | enabled | 2 | 0 | timing, status | 1 |
| swsh12-75 Sigilyph | enabled | 2 | 0 | choice, deckSearch | 1 |
| swsh12-76 Solosis | enabled | 1 | 0 |  | 1 |
| swsh12-77 Duosion | enabled | 1 | 0 |  | 1 |
| swsh12-78 Reuniclus | enabled | 1 | 1 | choice | 1 |
| swsh12-79 Elgyem | enabled | 1 | 0 |  | 0 |
| swsh12-80 Beheeyem | enabled | 2 | 0 |  | 0 |
| swsh12-81 Espurr | enabled | 2 | 0 |  | 0 |
| swsh12-82 Meowstic | enabled | 1 | 1 | choice, privacy, deckSearch | 0 |
| swsh12-83 Swirlix | enabled | 2 | 0 |  | 0 |
| swsh12-84 Slurpuff | enabled | 2 | 0 |  | 0 |
| swsh12-85 Dedenne | enabled | 2 | 0 | status | 1 |
| swsh12-86 Indeedee | enabled | 2 | 0 | deckSearch | 1 |
| swsh12-87 Dreepy | enabled | 1 | 0 |  | 1 |
| swsh12-88 Drakloak | enabled | 1 | 0 |  | 1 |
| swsh12-89 Dragapult | enabled | 2 | 0 | choice | 1 |
| swsh12-90 Hisuian Arcanine V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-91 Phanpy | enabled | 1 | 0 | coin | 0 |
| swsh12-92 Donphan | enabled | 2 | 0 |  | 1 |
| swsh12-93 Baltoy | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh12-94 Claydol | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-95 Anorith | enabled | 1 | 0 | choice | 1 |
| swsh12-96 Armaldo | enabled | 2 | 0 |  | 1 |
| swsh12-97 Terrakion | enabled | 1 | 0 | timing | 1 |
| swsh12-98 Hawlucha | enabled | 2 | 0 | coin | 0 |
| swsh12-99 Sandygast | enabled | 1 | 0 | timing | 0 |
| swsh12-100 Palossand | enabled | 2 | 0 |  | 1 |
| swsh12-101 Stonjourner | enabled | 2 | 0 |  | 1 |
| swsh12-102 Ursaluna V | enabled | 1 | 1 |  | 1 |
| swsh12-103 Zubat | enabled | 1 | 0 |  | 1 |
| swsh12-104 Golbat | enabled | 1 | 0 |  | 0 |
| swsh12-105 Crobat | enabled | 2 | 0 | status | 1 |
| swsh12-106 Murkrow | enabled | 2 | 0 | choice, deckSearch | 1 |
| swsh12-107 Honchkrow | enabled | 2 | 0 | choice | 1 |
| swsh12-108 Skuntank V | enabled | 2 | 0 | timing, status | 1 |
| swsh12-109 Croagunk | enabled | 1 | 0 |  | 0 |
| swsh12-110 Toxicroak | enabled | 2 | 0 | timing | 1 |
| swsh12-111 Sandile | enabled | 1 | 0 |  | 0 |
| swsh12-112 Krokorok | enabled | 1 | 0 | energyMovement, coin | 1 |
| swsh12-113 Krookodile | enabled | 1 | 1 | choice | 1 |
| swsh12-114 Mareanie | enabled | 1 | 0 | status | 0 |
| swsh12-115 Toxapex | enabled | 2 | 0 | status | 1 |
| swsh12-116 Morpeko | enabled | 1 | 0 |  | 1 |
| swsh12-117 Beldum | enabled | 2 | 0 | deckSearch | 1 |
| swsh12-118 Metang | enabled | 1 | 0 | coin | 0 |
| swsh12-119 Metagross | enabled | 1 | 1 | choice, timing | 1 |
| swsh12-120 Radiant Jirachi | enabled | 1 | 1 | choice, deckSearch, coin | 1 |
| swsh12-121 Ferroseed | enabled | 2 | 0 |  | 0 |
| swsh12-122 Ferrothorn | enabled | 2 | 0 |  | 0 |
| swsh12-123 Klink | enabled | 1 | 0 | privacy, deckSearch | 0 |
| swsh12-124 Klang | enabled | 1 | 0 | coin | 1 |
| swsh12-125 Klinklang | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh12-126 Cobalion | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh12-127 Togedemaru | enabled | 1 | 0 | timing, coin | 1 |
| swsh12-128 Magearna V | enabled | 2 | 0 | energyMovement | 0 |
| swsh12-129 Dratini | enabled | 1 | 0 | coin | 0 |
| swsh12-130 Dragonair | enabled | 2 | 0 | status, coin | 0 |
| swsh12-131 Dragonite | enabled | 2 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh12-132 Noibat | enabled | 2 | 0 |  | 1 |
| swsh12-133 Noivern | enabled | 2 | 0 |  | 1 |
| swsh12-134 Zygarde | enabled | 2 | 0 | energyMovement | 1 |
| swsh12-135 Regidrago V | enabled | 2 | 0 | energyMovement, deckSearch | 1 |
| swsh12-136 Regidrago VSTAR | enabled | 1 | 1 | choice, deckSearch | 1 |
| swsh12-137 Smeargle | enabled | 2 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh12-138 Lugia V | enabled | 2 | 0 | choice | 1 |
| swsh12-139 Lugia VSTAR | enabled | 1 | 1 | choice | 1 |
| swsh12-140 Ho-Oh V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-141 Spinda | enabled | 1 | 0 | status | 0 |
| swsh12-142 Swablu | enabled | 1 | 0 | coin | 0 |
| swsh12-143 Altaria | enabled | 2 | 0 |  | 1 |
| swsh12-144 Buneary | enabled | 1 | 0 | coin | 0 |
| swsh12-145 Lopunny | enabled | 2 | 0 | coin | 0 |
| swsh12-146 Archen | enabled | 2 | 0 |  | 1 |
| swsh12-147 Archeops | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh12-148 Rufflet | enabled | 1 | 0 | coin | 0 |
| swsh12-149 Hisuian Braviary | enabled | 2 | 0 | status | 1 |
| swsh12-150 Fletchling | enabled | 1 | 0 |  | 1 |
| swsh12-151 Brandon | enabled | 0 | 0 | choice | 1 |
| swsh12-152 Candice | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh12-153 Capturing Aroma | enabled | 0 | 0 | choice, privacy, deckSearch, coin | 1 |
| swsh12-154 Earthen Seal Stone | enabled | 1 | 0 | choice, energyMovement | 1 |
| swsh12-155 Emergency Jelly | enabled | 0 | 0 | choice | 1 |
| swsh12-156 Forest Seal Stone | enabled | 0 | 1 | choice, deckSearch | 1 |
| swsh12-157 Furisode Girl | enabled | 0 | 0 | choice, deckSearch | 1 |
| swsh12-158 Gym Trainer | enabled | 0 | 0 | choice, timing | 1 |
| swsh12-159 Lance | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh12-160 Leafy Camo Poncho | enabled | 0 | 0 | choice | 1 |
| swsh12-161 Primordial Altar | enabled | 0 | 0 | deckSearch | 1 |
| swsh12-162 Professor Laventon | enabled | 0 | 0 | choice | 0 |
| swsh12-163 Quad Stone | enabled | 0 | 0 | choice | 1 |
| swsh12-164 Serena | enabled | 0 | 0 | choice | 1 |
| swsh12-165 Unidentified Fossil | enabled | 0 | 0 | choice | 1 |
| swsh12-166 Wallace | enabled | 0 | 0 | choice | 1 |
| swsh12-167 Worker | enabled | 0 | 0 | choice | 1 |
| swsh12-168 Regenerative Energy | enabled | 0 | 0 | energyMovement | 1 |
| swsh12-169 V Guard Energy | enabled | 0 | 0 | energyMovement | 1 |
| swsh12-170 Serperior V | enabled | 2 | 0 |  | 0 |
| swsh12-171 Chesnaught V | enabled | 1 | 1 |  | 0 |
| swsh12-172 Reshiram V | enabled | 2 | 0 | choice, timing, energyMovement, deckSearch, coin | 0 |
| swsh12-173 Alolan Vulpix V | enabled | 2 | 0 |  | 0 |
| swsh12-174 Omastar V | enabled | 2 | 0 | choice, timing, deckSearch | 1 |
| swsh12-175 Regieleki V | enabled | 2 | 0 | timing | 0 |
| swsh12-176 Unown V | enabled | 2 | 0 | status | 1 |
| swsh12-177 Unown V | enabled | 2 | 0 | status | 1 |
| swsh12-178 Mawile V | enabled | 2 | 0 | energyMovement, coin | 0 |
| swsh12-179 Hisuian Arcanine V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-180 Skuntank V | enabled | 2 | 0 | timing, status | 1 |
| swsh12-181 Skuntank V | enabled | 2 | 0 | timing, status | 1 |
| swsh12-182 Magearna V | enabled | 2 | 0 | energyMovement | 0 |
| swsh12-183 Regidrago V | enabled | 2 | 0 | energyMovement, deckSearch | 1 |
| swsh12-184 Regidrago V | enabled | 2 | 0 | energyMovement, deckSearch | 1 |
| swsh12-185 Lugia V | enabled | 2 | 0 | choice | 0 |
| swsh12-186 Lugia V | enabled | 2 | 0 | choice | 0 |
| swsh12-187 Ho-Oh V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh12-188 Brandon | enabled | 0 | 0 | choice | 0 |
| swsh12-189 Candice | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh12-190 Furisode Girl | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh12-191 Gym Trainer | enabled | 0 | 0 | choice, timing | 0 |
| swsh12-192 Lance | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh12-193 Serena | enabled | 0 | 0 | choice | 1 |
| swsh12-194 Wallace | enabled | 0 | 0 | choice | 1 |
| swsh12-195 Worker | enabled | 0 | 0 | choice | 0 |
| swsh12-196 Serperior VSTAR | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh12-197 Alolan Vulpix VSTAR | enabled | 2 | 0 | timing | 0 |
| swsh12-198 Regieleki VMAX | enabled | 1 | 1 | timing | 0 |
| swsh12-199 Unown VSTAR | enabled | 2 | 0 | coin | 1 |
| swsh12-200 Mawile VSTAR | enabled | 1 | 1 | choice | 1 |
| swsh12-201 Regidrago VSTAR | enabled | 1 | 1 | choice, deckSearch | 1 |
| swsh12-202 Lugia VSTAR | enabled | 1 | 1 | choice | 0 |
| swsh12-203 Brandon | enabled | 0 | 0 | choice | 0 |
| swsh12-204 Candice | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh12-205 Furisode Girl | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh12-206 Lance | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh12-207 Serena | enabled | 0 | 0 | choice | 0 |
| swsh12-208 Wallace | enabled | 0 | 0 | choice | 1 |
| swsh12-209 Worker | enabled | 0 | 0 | choice | 0 |
| swsh12-210 Serperior VSTAR | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh12-211 Lugia VSTAR | enabled | 1 | 1 | choice | 0 |
| swsh12-212 Energy Switch | enabled | 0 | 0 | choice, energyMovement | 1 |
| swsh12-213 Gapejaw Bog | enabled | 0 | 0 |  | 1 |
| swsh12-214 Leafy Camo Poncho | enabled | 0 | 0 | choice | 1 |
| swsh12-215 V Guard Energy | enabled | 0 | 0 | energyMovement | 1 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

