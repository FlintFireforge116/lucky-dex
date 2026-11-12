# LuckyDex v0.69.221 — EX Power Keepers full post-completion card audit

**Date:** 12 November 2026  
**Apply on top of:** LuckyDex v0.69.220 (not a replacement for earlier staged patches).  
**Master checklist:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.14, including C-EX16-PRINT-009, C-EX16-OPTIONAL-010 and C-EX16-BUILDER-011.  
**Output:** source-relative patch to extract into `~/lucky-dex/source/`.

## Scope and audit results

- All **108 numbered EX Power Keepers** cards remain enabled and registered: **81 Pokémon, 16 Trainers/Fossils, 11 Energy prints**, including six collectible Basic Energy art prints. All have source identity, names, cost/attack text and artwork URL templates. Identity coverage is not a visual verification of remote images.
- **128 Pokémon attacks** exercised via actual `core.legalActions` / `core.applyAction` in seeded battle states, resolving offered effect choices (zero exceptions or unresolved prompts in this deterministic exercise).
- **34 abilities** represented in the catalogue; the targeted effect tests verify a subset of their triggering and timing outcomes, including Fossils and Special Energy interactions. Treat the attack sweep as a **runtime smoke**, not proof of exact semantics for all coin, status, hand and multi-turn combinations.
- **80 of 81** EX16 Pokémon produce valid 30-card EX16-only focused automatic decks with the full four-copy test inventory. **EX16 #16 Magneton is intentionally excluded** because Magnezone is a known later evolution not present in the selected Power Keepers-only pool. This is a restriction, not a tested successful deck.
- **64 seeded EX16-only builds** (eight single Energy types × eight seeds) produced legal mono-type Energy profiles. Nine CPU autobuilder archetypes were also checked by the existing completion suite.
- **357/357 selected EX-era regression tests passed** in `node --test tests/v072*.test.cjs` following the fixes, including 10 new detailed printed-interaction cases and full catalogue/attack/strict-filter sweeps.

## Confirmed issues corrected

| Area | What failed in v0.69.220 | Correction in v0.69.221 | Verified by |
|---|---|---|---|
| Cradily #7 Poison Ring | Used Scary Face, which prevented attacking **and** retreating | Add retreat-only lock while retaining Poison | Opponent next turn has an attack but no retreat |
| Armaldo #3 Rock Blast | Direct 20-damage hits bypassed some prevention and reduction | Respect attack prevention, ordinary reduction and Drake's Stadium for the selected target; still ignore Weakness/Resistance as printed | Protected Bench / reduced Colorless Active tests |
| Altaria #2 Surprise | Removed a random hand card without offering a facedown selection | Display only numbered facedown positions and shuffle the actually selected card into the draw deck | Hidden-position legal action test |
| Absol ex #92 / Walrein ex #99 / Pokémon ★ #100–102 | Optional Bench/evolution effects triggered even when a player might decline | Explicit Use / Do not use prompt; declined choice leaves board unchanged | Five opt-out outcome cases plus existing positive effect tests |
| CPU Star Powers | Generic first-option behaviour could burn or injure the CPU's own Active for no tactical benefit | Public-board utility checks for Flareon/Jolteon/Vaporeon; no opponent private-hand inspection | Positive and negative CPU-choice tests |
| Shiftry ex #97 Skill Hack | Copied attacks could waive non-Energy use costs | Copy removes only printed Energy cost, preserving physical-card discard and other requirements | Copy Salamence ex's Volcanic Flame and discard 5 cards |
| Sableye #22 Down Draw | Could draw beyond the Classic eight-card hand limit | Cap deck-bottom draw to available hand capacity | 7→8 hand example |
| Deckbuilder: Power Keepers-only mono type | Grass could add a Grass/Lightning Flygon ex or Fire could add Fire/Water Salamence ex | A single-type EX16-only selection rejects incompatible mixed-cost families; cross-set legacy evolution conversion remains unchanged | 64 seeded mono Energy builds |
| Strategy metadata | Cacturne Poison Structure and Kirlia Dream Eater payoff were missed by attack-only regex | Power-origin Poison tag and Sleep-payoff tag added explicitly | Metadata regression test |

### Print/context conversions still in force

The battle mode remains LuckyDex Classic **30-card decks**, with its agreed Basic Energy Zone, separate physical discard/Basic Energy discard and eight-card hand cap. Do not confuse these with sanctioned 60-card tabletop rules. Player choices must be hidden-information safe, including CPU actions. The previous v0.69.220 Fossil no-Prize knockout handling and real discarded Energy ledger remain unchanged.

**Remaining validation limitations:** no Android APK compilation or touchscreen session, no 108-card image-by-image comparison with remote art, no complete all-pairs effect/state explosion test, and no multi-hour CPU match. The EX16 strict single-type rule is **scoped to Power Keepers-only selection**; earlier mixed-type evolution conventions remain untouched, and a future cross-set builder harmonisation should be audited separately. The single-set Magneton focused-build restriction is documented above.

## Card-by-card ledger (all 108 numbered prints)

Status definition: **Registered & enabled** means the print is in the battle catalogue; **attack smoke** for Pokémon means each attack was actually used in a controlled state; more complex interactions are covered by the targeted tests described above, not necessarily one dedicated assertion for every card. For Trainers and Energy, the existing integration suites cover representative choices and modifiers. No item below is being called individually *exhaustively certified*.

| # | Card | Class / evolution | Printed combat entries / metadata audit | Verified scope |
|---:|---|---|---|---|
| 1 | Aggron | Stage 2 / Metal | Metal Claw, Mix-Up; Power/Body: Terraforming | Attack smoke; registry |
| 2 | Altaria | Stage 1 / Colorless | Surprise, Gust; Power/Body: Synergy Effect | Attack smoke; registry |
| 3 | Armaldo | Stage 2 / Fighting | Rock Blast, Mach Claw | Attack smoke; registry |
| 4 | Banette | Stage 1 / Psychic | Grudge, Bench Manipulation | Attack smoke; registry |
| 5 | Blaziken | Stage 2 / Fire | Fire Stream; Power/Body: Firestarter | Attack smoke; registry |
| 6 | Charizard | Stage 2 / Fire | Combustion, Bursting Inferno | Attack smoke; registry |
| 7 | Cradily | Stage 2 / Grass | Poison Ring; Power/Body: Evolutionary Call | Attack smoke; registry |
| 8 | Delcatty | Stage 1 / Colorless | Max Energy Source; Power/Body: Energy Draw | Attack smoke; registry |
| 9 | Gardevoir | Stage 2 / Psychic | Energy Burst; Power/Body: Psy Shadow | Attack smoke; registry |
| 10 | Kabutops | Stage 2 / Fighting | Luring Antenna, Blinding Scythe; Power/Body: Primal Stare | Attack smoke; registry |
| 11 | Machamp | Stage 2 / Fighting | Brick Smash, Cross Chop; Power/Body: Overzealous | Attack smoke; registry |
| 12 | Raichu | Stage 1 / Lightning | Plasma, Thunderbolt | Attack smoke; registry |
| 13 | Slaking | Stage 2 / Colorless | Critical Move; Power/Body: Lazy | Attack smoke; registry |
| 14 | Dusclops | Stage 1 / Psychic | Dark Mind, Mysterious Light | Attack smoke; registry |
| 15 | Lanturn | Stage 1 / Lightning | Lightning Strike; Power/Body: Energy Grounding | Attack smoke; registry |
| 16 | Magneton | Stage 1 / Lightning | Magnetic Force; Power/Body: Magnetic Field | Attack smoke; registry |
| 17 | Mawile | Basic / Metal | Call for Family, Pull Away | Attack smoke; registry |
| 18 | Mightyena | Stage 1 / Darkness | Plunder, Dark Burst | Attack smoke; registry |
| 19 | Ninetales | Stage 1 / Fire | Quick Attack, Will-o'-the-wisp; Power/Body: Safeguard | Attack smoke; registry |
| 20 | Omastar | Stage 2 / Water | Pull Down, Hydrocannon | Attack smoke; registry |
| 21 | Pichu | Basic / Lightning | Cry for Help; Power/Body: Baby Evolution | Attack smoke; registry |
| 22 | Sableye | Basic / Psychic | Down Draw, Feint Attack; Power/Body: Synergy Effect | Attack smoke; registry |
| 23 | Seviper | Basic / Grass | Sharp Fang, Toxic | Attack smoke; registry |
| 24 | Wobbuffet | Basic / Psychic | Flip Over; Power/Body: Safeguard | Attack smoke; registry |
| 25 | Zangoose | Basic / Colorless | Call for Family, Sharp Claws; Power/Body: Thick Skin | Attack smoke; registry |
| 26 | Anorith | Stage 1 / Fighting | Fury Cutter; Power/Body: Solid Shell | Attack smoke; registry |
| 27 | Cacturne | Stage 1 / Darkness | Pin Missile; Power/Body: Poison Structure | Attack smoke; registry |
| 28 | Charmeleon | Stage 1 / Fire | Scary Face, Flame Tail | Attack smoke; registry |
| 29 | Combusken | Stage 1 / Fire | Lunge; Power/Body: Natural Cure | Attack smoke; registry |
| 30 | Glalie | Stage 1 / Water | Powder Snow, Double-edge; Power/Body: Synergy Effect | Attack smoke; registry |
| 31 | Kirlia | Stage 1 / Psychic | Hypnosis, Dream Eater | Attack smoke; registry |
| 32 | Lairon | Stage 1 / Metal | Granite Head, Stomp | Attack smoke; registry |
| 33 | Machoke | Stage 1 / Fighting | Steady Punch, Mega Kick | Attack smoke; registry |
| 34 | Medicham | Stage 1 / Fighting | Punch, Rolling Kick; Power/Body: Vigorous Aura | Attack smoke; registry |
| 35 | Metang | Stage 1 / Metal | Extra Comet Punch; Power/Body: Clear Body | Attack smoke; registry |
| 36 | Nuzleaf | Stage 1 / Darkness | Fake Out, Gentle Slap | Attack smoke; registry |
| 37 | Sealeo | Stage 1 / Water | Ice Beam | Attack smoke; registry |
| 38 | Sharpedo | Stage 1 / Darkness | Tight Jaw, Darkness Charge | Attack smoke; registry |
| 39 | Shelgon | Stage 1 / Colorless | Rage, Rolling Tackle | Attack smoke; registry |
| 40 | Vibrava | Stage 1 / Colorless | Ram, Dragonbreath | Attack smoke; registry |
| 41 | Vigoroth | Stage 1 / Colorless | Ambush; Power/Body: Strikes Back | Attack smoke; registry |
| 42 | Aron | Basic / Metal | Dig Deep, Tackle | Attack smoke; registry |
| 43 | Bagon | Basic / Colorless | Retaliate | Attack smoke; registry |
| 44 | Baltoy | Basic / Psychic | Psybeam, Spinning Attack | Attack smoke; registry |
| 45 | Beldum | Basic / Metal | Magnetic Lines | Attack smoke; registry |
| 46 | Cacnea | Basic / Grass | Feint Attack | Attack smoke; registry |
| 47 | Carvanha | Basic / Darkness | Gnaw; Power/Body: Rough Skin | Attack smoke; registry |
| 48 | Charmander | Basic / Fire | Smokescreen | Attack smoke; registry |
| 49 | Chinchou | Basic / Lightning | Positive Ion, Negative Ion | Attack smoke; registry |
| 50 | Duskull | Basic / Psychic | Surprise Attack | Attack smoke; registry |
| 51 | Kabuto | Stage 1 / Fighting | Fast Evolution, Double Scratch | Attack smoke; registry |
| 52 | Lileep | Stage 1 / Grass | Surprise, Acid | Attack smoke; registry |
| 53 | Machop | Basic / Fighting | Smash Punch, Submission | Attack smoke; registry |
| 54 | Magnemite | Basic / Lightning | Ram, Spark | Attack smoke; registry |
| 55 | Meditite | Basic / Fighting | Psyshock, Cross Chop | Attack smoke; registry |
| 56 | Omanyte | Stage 1 / Water | Influence, Mud Shot | Attack smoke; registry |
| 57 | Pikachu | Basic / Lightning | Charge, Slam | Attack smoke; registry |
| 58 | Poochyena | Basic / Darkness | Double Kick | Attack smoke; registry |
| 59 | Ralts | Basic / Psychic | Slap, Teleportation Burst | Attack smoke; registry |
| 60 | Seedot | Basic / Grass | Nap, Double Spin | Attack smoke; registry |
| 61 | Shuppet | Basic / Psychic | Bad Dream | Attack smoke; registry |
| 62 | Skitty | Basic / Colorless | Tail Whip, Tackle | Attack smoke; registry |
| 63 | Slakoth | Basic / Colorless | Amnesia, Scratch | Attack smoke; registry |
| 64 | Snorunt | Basic / Water | Pebble Throw, Double Headbutt | Attack smoke; registry |
| 65 | Spheal | Basic / Water | Defense Curl, Aurora Beam | Attack smoke; registry |
| 66 | Swablu | Basic / Colorless | Fury Attack | Attack smoke; registry |
| 67 | Torchic | Basic / Fire | Super Singe | Attack smoke; registry |
| 68 | Trapinch | Basic / Fighting | Surprise Attack | Attack smoke; registry |
| 69 | Vulpix | Basic / Fire | Confuse Ray, Ember | Attack smoke; registry |
| 70 | Wynaut | Basic / Psychic | Flail; Power/Body: Baby Evolution | Attack smoke; registry |
| 71 | Battle Frontier | Stadium | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 72 | Drake's Stadium | Stadium | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 73 | Energy Recycle System | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 74 | Energy Removal 2 | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 75 | Energy Switch | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 76 | Glacia's Stadium | Stadium | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 77 | Great Ball | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 78 | Master Ball | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 79 | Phoebe's Stadium | Stadium | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 80 | Professor Birch | Supporter | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 81 | Scott | Supporter | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 82 | Sidney's Stadium | Stadium | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 83 | Steven's Advice | Supporter | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 84 | Claw Fossil | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 85 | Mysterious Fossil | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 86 | Root Fossil | Item | Printed Trainer/Fossil effect | Registry; trainer/Fossil integration |
| 87 | Darkness Energy | Special Energy | Attached Special Energy modifiers/choice | Registry; Energy integration |
| 88 | Metal Energy | Special Energy | Attached Special Energy modifiers/choice | Registry; Energy integration |
| 89 | Multi Energy | Special Energy | Attached Special Energy modifiers/choice | Registry; Energy integration |
| 90 | Cyclone Energy | Special Energy | Attached Special Energy modifiers/choice | Registry; Energy integration |
| 91 | Warp Energy | Special Energy | Attached Special Energy modifiers/choice | Registry; Energy integration |
| 92 | Absol ex | Basic / Darkness | Psychic Pulse; Power/Body: Cursed Eyes | Attack smoke; registry |
| 93 | Claydol ex | Stage 1 / Psychic | Psychic Boom, Shadow Crush; Power/Body: Type Shift | Attack smoke; registry |
| 94 | Flygon ex | Stage 2 / Colorless | Slashing Strike; Power/Body: Psychic Protector | Attack smoke; registry |
| 95 | Metagross ex | Stage 2 / Metal | Scanblast; Power/Body: Magnetic Redraw | Attack smoke; registry |
| 96 | Salamence ex | Stage 2 / Colorless | Volcanic Flame, Hydro Wave | Attack smoke; registry |
| 97 | Shiftry ex | Stage 2 / Darkness | Skill Hack, Dirge | Attack smoke; registry |
| 98 | Skarmory ex | Basic / Metal | Whirlwind, Razor Wing; Power/Body: Metal Gravity | Attack smoke; registry |
| 99 | Walrein ex | Stage 2 / Water | Wreck; Power/Body: Chilling Breath | Attack smoke; registry |
| 100 | Flareon ★ | Basic / Fire | Flamethrower; Power/Body: Crimson Ray | Attack smoke; registry |
| 101 | Jolteon ★ | Basic / Lightning | Agility; Power/Body: Yellow Ray | Attack smoke; registry |
| 102 | Vaporeon ★ | Basic / Water | Whirlpool; Power/Body: Blue Ray | Attack smoke; registry |
| 103 | Grass Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |
| 104 | Fire Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |
| 105 | Water Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |
| 106 | Lightning Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |
| 107 | Psychic Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |
| 108 | Fighting Energy | Basic Energy art | Basic Energy art mapped to Classic zone | Registry; Energy integration |

## Reproduce tests

```bash
cd ~/lucky-dex/source
node --test tests/v072*.test.cjs
```

Specific files added: `tests/v07221-ex16-audit-smoke.test.cjs` and `tests/v07221-ex16-printed-interactions.test.cjs`. Previous v07219/v07220 tests updated to resolve the now-optional choice state explicitly and to assert the actual outcome rather than just an open choice popup.

## Android manual QA shortlist

1. Cradily Poison Ring: check opponent may still select attacks but cannot retreat on the following turn.
2. Armaldo Rock Blast: choose repeated hits on protected Bench, then choose a different Colorless Active under Drake's Stadium; confirm prevention and -10.
3. Altaria Surprise: opponent hand is face-down positions only and tapped position returns to deck, with no preselection hand leak.
4. Pokémon ★ and Absol ex: choose **Do not use** and verify board unchanged; CPU should decline harmful symmetrical effects.
5. Shiftry ex Skill Hack: copy Salamence ex Volcanic Flame, pay five-card deck discard but not its Energy cost.
6. Build single-type EX16-only decks of each Energy type; no unexpected second type. A mixed-type Salamence/Flygon deck needs explicit compatible types.
7. Test Lab: power prompts/Bench-entry effects and a long CPU battle for action loops and Android touch usability.

## Install (from v0.69.220)

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.221_EX_POWER_KEEPERS_FULL_PASS.zip -d source
git add source
git commit -m "LuckyDex v0.69.221 Power Keepers full audit fixes"
git push origin main
```
