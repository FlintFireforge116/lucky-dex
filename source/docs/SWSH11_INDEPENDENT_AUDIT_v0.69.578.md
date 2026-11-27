# LuckyDex Classic audit — swsh11 / Lost Origin

**Status:** No definite catalog/schema failures; 0 warnings; 21 follow-up flags.

**Coverage:** 217/217 enabled, 0 gated. 278 attacks, 42 named abilities; 109/217 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 78 |
| privacy | 22 |
| timing | 26 |
| energyMovement | 34 |
| status | 30 |
| deckSearch | 43 |
| coin | 24 |

## Generated CPU decks

16/16 legal 30-card decks; 0 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

634/634 actions executed; 0 skipped (not necessarily defects); 0 scenario exceptions/unresolved choices.

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 163 cards flagged.

- **swsh11-3 Vileplume** — timing, coin
- **swsh11-5 Parasect** — choice, status, coin
- **swsh11-6 Wurmple** — privacy, deckSearch
- **swsh11-7 Silcoon** — timing, coin
- **swsh11-8 Beautifly** — choice
- **swsh11-9 Cascoon** — timing
- **swsh11-10 Dustox** — status
- **swsh11-12 Nuzleaf** — choice
- **swsh11-13 Shiftry** — choice
- **swsh11-14 Roselia** — status
- **swsh11-15 Roserade** — status
- **swsh11-17 Trevenant** — timing; ability Elder Tree Barrier: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-19 Dottler** — timing
- **swsh11-20 Orbeetle** — choice, energyMovement
- **swsh11-21 Slugma** — energyMovement
- **swsh11-23 Torkoal** — energyMovement
- **swsh11-25 Lampent** — energyMovement, coin
- **swsh11-26 Chandelure** — choice, deckSearch
- **swsh11-27 Delphox V** — status
- **swsh11-28 Litleo** — status
- **swsh11-29 Pyroar** — status, coin; ability Scorching Aura: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-30 Poliwag** — timing, coin
- **swsh11-31 Poliwhirl** — coin
- **swsh11-34 Dewgong** — timing, deckSearch, coin
- **swsh11-36 Seadra** — timing, coin
- **swsh11-37 Kingdra** — choice, deckSearch
- **swsh11-38 Luvdisc** — deckSearch
- **swsh11-40 Finneon** — choice, energyMovement
- **swsh11-41 Lumineon** — timing, coin
- **swsh11-44 Hisuian Basculin** — coin
- **swsh11-45 Hisuian Basculegion** — energyMovement, deckSearch
- **swsh11-47 Swanna** — energyMovement, status
- **swsh11-48 Kyurem V** — energyMovement
- **swsh11-49 Kyurem VMAX** — choice, energyMovement
- **swsh11-51 Glastrier** — timing
- **swsh11-52 Pikachu** — coin
- **swsh11-53 Raichu** — status, coin
- **swsh11-54 Electrike** — status, coin
- **swsh11-57 Magnezone VSTAR** — choice, privacy, deckSearch
- **swsh11-58 Rotom V** — choice
- **swsh11-59 Tynamo** — privacy, deckSearch
- **swsh11-60 Eelektrik** — choice, status, coin
- **swsh11-61 Eelektross** — timing, energyMovement
- **swsh11-62 Clefairy** — choice, energyMovement, deckSearch
- **swsh11-66 Gengar** — choice; ability Netherworld Gate: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-67 Mr. Mime** — timing
- **swsh11-68 Jynx** — status
- **swsh11-71 Mawile** — timing
- **swsh11-73 Banette** — choice
- **swsh11-76 Hisuian Zoroark** — timing
- **swsh11-77 Inkay** — coin
- **swsh11-78 Malamar** — privacy
- **swsh11-79 Comfey** — choice, privacy, deckSearch
- **swsh11-80 Mimikyu** — status
- **swsh11-81 Spectrier** — choice, timing
- **swsh11-82 Enamorus V** — choice, energyMovement; ability Guardian of Love: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-83 Hisuian Growlithe** — status
- **swsh11-85 Poliwrath** — status
- **swsh11-88 Machamp** — choice, timing; ability Crisis Muscles: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-91 Rhyperior** — energyMovement
- **swsh11-92 Aerodactyl V** — energyMovement
- **swsh11-93 Aerodactyl VSTAR** — deckSearch
- **swsh11-94 Sudowoodo** — timing
- **swsh11-95 Gligar** — coin
- **swsh11-96 Gliscor** — status, coin
- **swsh11-97 Makuhita** — status, coin
- **swsh11-98 Hariyama** — status, coin
- **swsh11-99 Meditite** — coin
- **swsh11-100 Medicham** — choice, deckSearch
- **swsh11-101 Relicanth** — choice, energyMovement
- **swsh11-102 Gastrodon** — energyMovement
- **swsh11-104 Mienshao** — coin
- **swsh11-105 Landorus** — energyMovement
- **swsh11-107 Barbaracle** — source review; ability Lost Block: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-108 Carbink** — choice, privacy, deckSearch
- **swsh11-111 Stonjourner** — choice, energyMovement
- **swsh11-112 Spinarak** — status
- **swsh11-113 Ariados** — status
- **swsh11-115 Honchkrow** — energyMovement
- **swsh11-117 Spiritomb** — deckSearch; ability Cursed Message: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-118 Drapion V** — source review; ability Wild Style: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-119 Drapion VSTAR** — choice, status
- **swsh11-120 Darkrai** — timing, status
- **swsh11-121 Inkay** — choice, deckSearch
- **swsh11-122 Hoopa** — deckSearch
- **swsh11-123 Radiant Hisuian Sneasler** — status; ability Poison Peak: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-124 Radiant Steelix** — choice, energyMovement
- **swsh11-127 Galarian Stunfisk** — energyMovement
- **swsh11-128 Magearna** — status
- **swsh11-130 Giratina V** — privacy, deckSearch
- **swsh11-133 Hisuian Sliggoo** — timing
- **swsh11-134 Hisuian Goodra** — source review; ability Metal Lodging: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-135 Hisuian Goodra V** — timing
- **swsh11-136 Hisuian Goodra VSTAR** — choice, timing
- **swsh11-137 Pidgeot V** — choice, deckSearch
- **swsh11-140 Porygon** — deckSearch
- **swsh11-142 Porygon-Z** — deckSearch
- **swsh11-143 Snorlax** — status, coin; ability Unfazed Fat: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-144 Aipom** — choice, deckSearch
- **swsh11-145 Ambipom** — choice, deckSearch, coin
- **swsh11-146 Hisuian Zoroark V** — choice, energyMovement
- **swsh11-147 Hisuian Zoroark VSTAR** — choice
- **swsh11-149 Komala** — status; ability All Just a Dream: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-152 Arc Phone** — choice, privacy, deckSearch
- **swsh11-153 Arezu** — choice, privacy, deckSearch
- **swsh11-154 Box of Disaster** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-155 Colress's Experiment** — choice, privacy, deckSearch
- **swsh11-156 Damage Pump** — choice
- **swsh11-157 Fantina** — choice, timing
- **swsh11-158 Iscan** — choice
- **swsh11-159 Lady** — choice, privacy, energyMovement, deckSearch
- **swsh11-160 Lake Acuity** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-161 Lost City** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-162 Lost Vacuum** — choice
- **swsh11-163 Mirage Gate** — choice, energyMovement, deckSearch
- **swsh11-164 Miss Fortune Sisters** — choice, deckSearch
- **swsh11-165 Panic Mask** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-166 Riley** — choice, privacy, deckSearch
- **swsh11-167 Thorton** — choice
- **swsh11-168 Tool Box** — choice, privacy, deckSearch
- **swsh11-169 Volo** — choice
- **swsh11-170 Windup Arm** — choice, status; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-171 Gift Energy** — energyMovement
- **swsh11-172 Hisuian Electrode V** — energyMovement, status
- **swsh11-173 Delphox V** — status
- **swsh11-174 Kyurem V** — energyMovement
- **swsh11-176 Rotom V** — choice
- **swsh11-177 Rotom V** — choice
- **swsh11-178 Enamorus V** — choice, energyMovement; ability Guardian of Love: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-179 Aerodactyl V** — energyMovement
- **swsh11-180 Aerodactyl V** — energyMovement
- **swsh11-182 Drapion V** — source review; ability Wild Style: no-op effect; verify separately implemented passive/continuous rule.
- **swsh11-185 Giratina V** — privacy, deckSearch
- **swsh11-186 Giratina V** — privacy, deckSearch
- **swsh11-187 Hisuian Goodra V** — timing
- **swsh11-188 Pidgeot V** — choice, deckSearch
- **swsh11-189 Arezu** — choice, privacy, deckSearch
- **swsh11-190 Colress's Experiment** — choice, privacy, deckSearch
- **swsh11-191 Fantina** — choice, timing
- **swsh11-192 Iscan** — choice
- **swsh11-193 Lady** — choice, privacy, energyMovement, deckSearch
- **swsh11-194 Miss Fortune Sisters** — choice, deckSearch
- **swsh11-195 Thorton** — choice
- **swsh11-196 Volo** — choice
- **swsh11-197 Kyurem VMAX** — choice, energyMovement
- **swsh11-198 Magnezone VSTAR** — choice, privacy, deckSearch
- **swsh11-199 Aerodactyl VSTAR** — deckSearch
- **swsh11-200 Drapion VSTAR** — choice, status
- **swsh11-202 Hisuian Goodra VSTAR** — choice, timing
- **swsh11-203 Hisuian Zoroark VSTAR** — choice
- **swsh11-204 Arezu** — choice, privacy, deckSearch
- **swsh11-205 Colress's Experiment** — choice, privacy, deckSearch
- **swsh11-206 Fantina** — choice, timing
- **swsh11-207 Iscan** — choice
- **swsh11-208 Lady** — choice, privacy, energyMovement, deckSearch
- **swsh11-209 Miss Fortune Sisters** — choice, deckSearch
- **swsh11-210 Thorton** — choice
- **swsh11-211 Volo** — choice
- **swsh11-213 Hisuian Zoroark VSTAR** — choice
- **swsh11-214 Box of Disaster** — choice; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-215 Collapsed Stadium** — source review; card effect: no-op Trainer/Stadium effect; verify shared continuous rule.
- **swsh11-216 Dark Patch** — choice, energyMovement
- **swsh11-217 Lost Vacuum** — choice

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| swsh11-1 Oddish | enabled | 1 | 0 |  | 1 |
| swsh11-2 Gloom | enabled | 1 | 0 |  | 1 |
| swsh11-3 Vileplume | enabled | 2 | 0 | timing, coin | 1 |
| swsh11-4 Paras | enabled | 1 | 0 |  | 1 |
| swsh11-5 Parasect | enabled | 1 | 1 | choice, status, coin | 0 |
| swsh11-6 Wurmple | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh11-7 Silcoon | enabled | 2 | 0 | timing, coin | 0 |
| swsh11-8 Beautifly | enabled | 1 | 1 | choice | 1 |
| swsh11-9 Cascoon | enabled | 2 | 0 | timing | 0 |
| swsh11-10 Dustox | enabled | 2 | 0 | status | 0 |
| swsh11-11 Seedot | enabled | 1 | 0 |  | 1 |
| swsh11-12 Nuzleaf | enabled | 1 | 0 | choice | 1 |
| swsh11-13 Shiftry | enabled | 2 | 0 | choice | 1 |
| swsh11-14 Roselia | enabled | 1 | 0 | status | 0 |
| swsh11-15 Roserade | enabled | 2 | 0 | status | 1 |
| swsh11-16 Phantump | enabled | 1 | 0 |  | 0 |
| swsh11-17 Trevenant | enabled | 1 | 1 | timing | 0 |
| swsh11-18 Blipbug | enabled | 1 | 0 |  | 1 |
| swsh11-19 Dottler | enabled | 1 | 0 | timing | 1 |
| swsh11-20 Orbeetle | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-21 Slugma | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-22 Magcargo | enabled | 2 | 0 |  | 0 |
| swsh11-23 Torkoal | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-24 Litwick | enabled | 1 | 0 |  | 0 |
| swsh11-25 Lampent | enabled | 1 | 0 | energyMovement, coin | 0 |
| swsh11-26 Chandelure | enabled | 1 | 1 | choice, deckSearch | 0 |
| swsh11-27 Delphox V | enabled | 2 | 0 | status | 1 |
| swsh11-28 Litleo | enabled | 1 | 0 | status | 0 |
| swsh11-29 Pyroar | enabled | 1 | 1 | status, coin | 0 |
| swsh11-30 Poliwag | enabled | 1 | 0 | timing, coin | 0 |
| swsh11-31 Poliwhirl | enabled | 2 | 0 | coin | 0 |
| swsh11-32 Politoed | enabled | 2 | 0 |  | 0 |
| swsh11-33 Seel | enabled | 2 | 0 |  | 1 |
| swsh11-34 Dewgong | enabled | 2 | 0 | timing, deckSearch, coin | 1 |
| swsh11-35 Horsea | enabled | 1 | 0 |  | 0 |
| swsh11-36 Seadra | enabled | 2 | 0 | timing, coin | 1 |
| swsh11-37 Kingdra | enabled | 1 | 1 | choice, deckSearch | 1 |
| swsh11-38 Luvdisc | enabled | 2 | 0 | deckSearch | 0 |
| swsh11-39 Shellos | enabled | 2 | 0 |  | 0 |
| swsh11-40 Finneon | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-41 Lumineon | enabled | 2 | 0 | timing, coin | 1 |
| swsh11-42 Snover | enabled | 2 | 0 |  | 0 |
| swsh11-43 Abomasnow | enabled | 2 | 0 |  | 0 |
| swsh11-44 Hisuian Basculin | enabled | 1 | 0 | coin | 0 |
| swsh11-45 Hisuian Basculegion | enabled | 2 | 0 | energyMovement, deckSearch | 1 |
| swsh11-46 Ducklett | enabled | 1 | 0 |  | 0 |
| swsh11-47 Swanna | enabled | 2 | 0 | energyMovement, status | 0 |
| swsh11-48 Kyurem V | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-49 Kyurem VMAX | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-50 Cramorant | enabled | 1 | 1 |  | 1 |
| swsh11-51 Glastrier | enabled | 2 | 0 | timing | 0 |
| swsh11-52 Pikachu | enabled | 1 | 1 | coin | 1 |
| swsh11-53 Raichu | enabled | 2 | 0 | status, coin | 1 |
| swsh11-54 Electrike | enabled | 2 | 0 | status, coin | 0 |
| swsh11-55 Manectric | enabled | 2 | 0 |  | 0 |
| swsh11-56 Magnezone V | enabled | 2 | 0 |  | 1 |
| swsh11-57 Magnezone VSTAR | enabled | 2 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-58 Rotom V | enabled | 1 | 1 | choice | 1 |
| swsh11-59 Tynamo | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh11-60 Eelektrik | enabled | 1 | 1 | choice, status, coin | 0 |
| swsh11-61 Eelektross | enabled | 2 | 0 | timing, energyMovement | 1 |
| swsh11-62 Clefairy | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh11-63 Clefable | enabled | 1 | 1 |  | 1 |
| swsh11-64 Gastly | enabled | 1 | 0 |  | 0 |
| swsh11-65 Haunter | enabled | 1 | 0 |  | 1 |
| swsh11-66 Gengar | enabled | 1 | 1 | choice | 1 |
| swsh11-67 Mr. Mime | enabled | 2 | 0 | timing | 1 |
| swsh11-68 Jynx | enabled | 2 | 0 | status | 1 |
| swsh11-69 Radiant Gardevoir | enabled | 1 | 1 |  | 1 |
| swsh11-70 Sableye | enabled | 2 | 0 |  | 1 |
| swsh11-71 Mawile | enabled | 2 | 0 | timing | 1 |
| swsh11-72 Shuppet | enabled | 1 | 0 |  | 1 |
| swsh11-73 Banette | enabled | 1 | 1 | choice | 1 |
| swsh11-74 Cresselia | enabled | 2 | 0 |  | 1 |
| swsh11-75 Hisuian Zorua | enabled | 2 | 0 |  | 0 |
| swsh11-76 Hisuian Zoroark | enabled | 2 | 0 | timing | 1 |
| swsh11-77 Inkay | enabled | 1 | 0 | coin | 0 |
| swsh11-78 Malamar | enabled | 2 | 0 | privacy | 1 |
| swsh11-79 Comfey | enabled | 1 | 1 | choice, privacy, deckSearch | 1 |
| swsh11-80 Mimikyu | enabled | 2 | 0 | status | 1 |
| swsh11-81 Spectrier | enabled | 2 | 0 | choice, timing | 1 |
| swsh11-82 Enamorus V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-83 Hisuian Growlithe | enabled | 1 | 0 | status | 0 |
| swsh11-84 Hisuian Arcanine | enabled | 2 | 0 |  | 1 |
| swsh11-85 Poliwrath | enabled | 2 | 0 | status | 1 |
| swsh11-86 Machop | enabled | 1 | 0 |  | 1 |
| swsh11-87 Machoke | enabled | 2 | 0 |  | 0 |
| swsh11-88 Machamp | enabled | 1 | 1 | choice, timing | 1 |
| swsh11-89 Rhyhorn | enabled | 1 | 0 |  | 0 |
| swsh11-90 Rhydon | enabled | 2 | 0 |  | 0 |
| swsh11-91 Rhyperior | enabled | 2 | 0 | energyMovement | 1 |
| swsh11-92 Aerodactyl V | enabled | 2 | 0 | energyMovement | 1 |
| swsh11-93 Aerodactyl VSTAR | enabled | 2 | 0 | deckSearch | 1 |
| swsh11-94 Sudowoodo | enabled | 2 | 0 | timing | 0 |
| swsh11-95 Gligar | enabled | 1 | 0 | coin | 0 |
| swsh11-96 Gliscor | enabled | 1 | 0 | status, coin | 1 |
| swsh11-97 Makuhita | enabled | 1 | 0 | status, coin | 0 |
| swsh11-98 Hariyama | enabled | 2 | 0 | status, coin | 0 |
| swsh11-99 Meditite | enabled | 1 | 0 | coin | 0 |
| swsh11-100 Medicham | enabled | 1 | 0 | choice, deckSearch | 1 |
| swsh11-101 Relicanth | enabled | 2 | 0 | choice, energyMovement | 1 |
| swsh11-102 Gastrodon | enabled | 2 | 0 | energyMovement | 1 |
| swsh11-103 Mienfoo | enabled | 2 | 0 |  | 0 |
| swsh11-104 Mienshao | enabled | 2 | 0 | coin | 0 |
| swsh11-105 Landorus | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-106 Binacle | enabled | 2 | 0 |  | 0 |
| swsh11-107 Barbaracle | enabled | 1 | 1 |  | 1 |
| swsh11-108 Carbink | enabled | 2 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-109 Rockruff | enabled | 2 | 0 |  | 0 |
| swsh11-110 Falinks | enabled | 2 | 0 |  | 1 |
| swsh11-111 Stonjourner | enabled | 2 | 0 | choice, energyMovement | 1 |
| swsh11-112 Spinarak | enabled | 1 | 0 | status | 1 |
| swsh11-113 Ariados | enabled | 2 | 0 | status | 0 |
| swsh11-114 Murkrow | enabled | 2 | 0 |  | 1 |
| swsh11-115 Honchkrow | enabled | 2 | 0 | energyMovement | 1 |
| swsh11-116 Seviper | enabled | 1 | 0 |  | 1 |
| swsh11-117 Spiritomb | enabled | 1 | 1 | deckSearch | 1 |
| swsh11-118 Drapion V | enabled | 1 | 1 |  | 1 |
| swsh11-119 Drapion VSTAR | enabled | 1 | 1 | choice, status | 1 |
| swsh11-120 Darkrai | enabled | 2 | 0 | timing, status | 0 |
| swsh11-121 Inkay | enabled | 2 | 0 | choice, deckSearch | 0 |
| swsh11-122 Hoopa | enabled | 2 | 0 | deckSearch | 0 |
| swsh11-123 Radiant Hisuian Sneasler | enabled | 1 | 1 | status | 0 |
| swsh11-124 Radiant Steelix | enabled | 2 | 0 | choice, energyMovement | 1 |
| swsh11-125 Bronzor | enabled | 1 | 0 |  | 0 |
| swsh11-126 Bronzong | enabled | 2 | 0 |  | 0 |
| swsh11-127 Galarian Stunfisk | enabled | 2 | 0 | energyMovement | 1 |
| swsh11-128 Magearna | enabled | 2 | 0 | status | 1 |
| swsh11-129 Galarian Perrserker V | enabled | 2 | 0 |  | 1 |
| swsh11-130 Giratina V | enabled | 2 | 0 | privacy, deckSearch | 1 |
| swsh11-131 Giratina VSTAR | enabled | 2 | 0 |  | 1 |
| swsh11-132 Goomy | enabled | 2 | 0 |  | 0 |
| swsh11-133 Hisuian Sliggoo | enabled | 2 | 0 | timing | 0 |
| swsh11-134 Hisuian Goodra | enabled | 1 | 1 |  | 1 |
| swsh11-135 Hisuian Goodra V | enabled | 2 | 0 | timing | 0 |
| swsh11-136 Hisuian Goodra VSTAR | enabled | 1 | 1 | choice, timing | 1 |
| swsh11-137 Pidgeot V | enabled | 1 | 1 | choice, deckSearch | 1 |
| swsh11-138 Lickitung | enabled | 1 | 0 |  | 0 |
| swsh11-139 Lickilicky | enabled | 2 | 0 |  | 0 |
| swsh11-140 Porygon | enabled | 2 | 0 | deckSearch | 1 |
| swsh11-141 Porygon2 | enabled | 1 | 0 |  | 1 |
| swsh11-142 Porygon-Z | enabled | 2 | 0 | deckSearch | 1 |
| swsh11-143 Snorlax | enabled | 1 | 1 | status, coin | 1 |
| swsh11-144 Aipom | enabled | 2 | 0 | choice, deckSearch | 1 |
| swsh11-145 Ambipom | enabled | 2 | 0 | choice, deckSearch, coin | 1 |
| swsh11-146 Hisuian Zoroark V | enabled | 2 | 0 | choice, energyMovement | 0 |
| swsh11-147 Hisuian Zoroark VSTAR | enabled | 1 | 1 | choice | 1 |
| swsh11-148 Bouffalant | enabled | 2 | 0 |  | 0 |
| swsh11-149 Komala | enabled | 1 | 1 | status | 0 |
| swsh11-150 Skwovet | enabled | 1 | 0 |  | 0 |
| swsh11-151 Greedent | enabled | 2 | 0 |  | 1 |
| swsh11-152 Arc Phone | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh11-153 Arezu | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-154 Box of Disaster | enabled | 0 | 0 | choice | 0 |
| swsh11-155 Colress's Experiment | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh11-156 Damage Pump | enabled | 0 | 0 | choice | 1 |
| swsh11-157 Fantina | enabled | 0 | 0 | choice, timing | 1 |
| swsh11-158 Iscan | enabled | 0 | 0 | choice | 0 |
| swsh11-159 Lady | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh11-160 Lake Acuity | enabled | 0 | 0 |  | 1 |
| swsh11-161 Lost City | enabled | 0 | 0 |  | 1 |
| swsh11-162 Lost Vacuum | enabled | 0 | 0 | choice | 1 |
| swsh11-163 Mirage Gate | enabled | 0 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh11-164 Miss Fortune Sisters | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh11-165 Panic Mask | enabled | 0 | 0 | choice | 1 |
| swsh11-166 Riley | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh11-167 Thorton | enabled | 0 | 0 | choice | 1 |
| swsh11-168 Tool Box | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh11-169 Volo | enabled | 0 | 0 | choice | 1 |
| swsh11-170 Windup Arm | enabled | 0 | 0 | choice, status | 1 |
| swsh11-171 Gift Energy | enabled | 0 | 0 | energyMovement | 1 |
| swsh11-172 Hisuian Electrode V | enabled | 2 | 0 | energyMovement, status | 1 |
| swsh11-173 Delphox V | enabled | 2 | 0 | status | 0 |
| swsh11-174 Kyurem V | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-175 Magnezone V | enabled | 2 | 0 |  | 0 |
| swsh11-176 Rotom V | enabled | 1 | 1 | choice | 0 |
| swsh11-177 Rotom V | enabled | 1 | 1 | choice | 0 |
| swsh11-178 Enamorus V | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-179 Aerodactyl V | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-180 Aerodactyl V | enabled | 2 | 0 | energyMovement | 0 |
| swsh11-181 Gallade V | enabled | 2 | 0 |  | 0 |
| swsh11-182 Drapion V | enabled | 1 | 1 |  | 0 |
| swsh11-183 Galarian Perrserker V | enabled | 2 | 0 |  | 0 |
| swsh11-184 Galarian Perrserker V | enabled | 2 | 0 |  | 0 |
| swsh11-185 Giratina V | enabled | 2 | 0 | privacy, deckSearch | 1 |
| swsh11-186 Giratina V | enabled | 2 | 0 | privacy, deckSearch | 0 |
| swsh11-187 Hisuian Goodra V | enabled | 2 | 0 | timing | 0 |
| swsh11-188 Pidgeot V | enabled | 1 | 1 | choice, deckSearch | 1 |
| swsh11-189 Arezu | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-190 Colress's Experiment | enabled | 0 | 0 | choice, privacy, deckSearch | 1 |
| swsh11-191 Fantina | enabled | 0 | 0 | choice, timing | 0 |
| swsh11-192 Iscan | enabled | 0 | 0 | choice | 0 |
| swsh11-193 Lady | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh11-194 Miss Fortune Sisters | enabled | 0 | 0 | choice, deckSearch | 1 |
| swsh11-195 Thorton | enabled | 0 | 0 | choice | 1 |
| swsh11-196 Volo | enabled | 0 | 0 | choice | 0 |
| swsh11-197 Kyurem VMAX | enabled | 1 | 1 | choice, energyMovement | 1 |
| swsh11-198 Magnezone VSTAR | enabled | 2 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-199 Aerodactyl VSTAR | enabled | 2 | 0 | deckSearch | 1 |
| swsh11-200 Drapion VSTAR | enabled | 1 | 1 | choice, status | 0 |
| swsh11-201 Giratina VSTAR | enabled | 2 | 0 |  | 0 |
| swsh11-202 Hisuian Goodra VSTAR | enabled | 1 | 1 | choice, timing | 0 |
| swsh11-203 Hisuian Zoroark VSTAR | enabled | 1 | 1 | choice | 0 |
| swsh11-204 Arezu | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-205 Colress's Experiment | enabled | 0 | 0 | choice, privacy, deckSearch | 0 |
| swsh11-206 Fantina | enabled | 0 | 0 | choice, timing | 0 |
| swsh11-207 Iscan | enabled | 0 | 0 | choice | 0 |
| swsh11-208 Lady | enabled | 0 | 0 | choice, privacy, energyMovement, deckSearch | 0 |
| swsh11-209 Miss Fortune Sisters | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh11-210 Thorton | enabled | 0 | 0 | choice | 0 |
| swsh11-211 Volo | enabled | 0 | 0 | choice | 0 |
| swsh11-212 Giratina VSTAR | enabled | 2 | 0 |  | 0 |
| swsh11-213 Hisuian Zoroark VSTAR | enabled | 1 | 1 | choice | 0 |
| swsh11-214 Box of Disaster | enabled | 0 | 0 | choice | 0 |
| swsh11-215 Collapsed Stadium | enabled | 0 | 0 |  | 1 |
| swsh11-216 Dark Patch | enabled | 0 | 0 | choice, energyMovement | 1 |
| swsh11-217 Lost Vacuum | enabled | 0 | 0 | choice | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

