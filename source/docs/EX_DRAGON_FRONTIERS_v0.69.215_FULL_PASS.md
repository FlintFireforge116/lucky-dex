# EX Dragon Frontiers — v0.69.215 complete source pass

**Date:** 12 November 2026  
**Baseline:** LuckyDex v0.69.214; delivered patch v0.69.215  
**Master project rules:** `docs/LUCKYDEX_MASTER_RULES.txt` v2.9  
**Set:** EX Dragon Frontiers `ex15`, 101 English prints: **83 Pokémon, 12 Trainers, 6 Special Energy**.

## Checklist applied and evidence

| Checklist item | Source check and test evidence | Result |
|---|---|---|
| Set identity, count, number, text and art | Registry 101 unique IDs, each FULL/battle-enabled/deck eligible; Pokémon have printed attack/Power names/text and image references | Automated identity pass |
| Evolution chains and 30-card ownership/copy restrictions | Auto-focus every one of 83 EX15 Pokémon using an owned four-copy-per-print Test Lab pool; validate 30 cards and deck legality for each | **83/83 pass** |
| Stage 2-ex Body and Power synergy | Explicit cards Xatu δ #25 (damage), Swellow δ #40 (retreat), Altaria ex δ #90 (hand Energy), Kingdra ex δ #94 (defence); full Stage 2 ex beneficiary in Xatu/Swellow/Altaria focus; reverse support pairing in representative Stage 2 ex focus | Fixed and regressions pass |
| Basic Energy Zone vs physical cards | Stage 2 ex core Energy selected for attacker, not an incidental Bench support; Typhlosion δ #12 has Psychic/Fire Burn profile; Mr Stone's Project #77 added to Altaria/Fellow Boost builds for *actual hand* Basic Energy; Tool cards physically reserved for Ledian/Quagsire | Focus and state checks pass |
| Powers/Bodies, status and damage | Xatu Extra Feather per unsuppressed copy and player/CPU symmetry; Altaria Extra Boost requires real physical Basic in hand AND a Stage 2 ex recipient; Arbok #13 and Vibrava #42 condition metadata corrected | Executed state assertions pass |
| Attacks, choices, printed attack text | All **128** EX15 Pokémon attack commands exercised with sufficient Energy and effects-choice resolution smoke; 32 Power/Body declarations inspected for identity; previous `v07212` / `v07213` suites assert specific EX15 effect outcomes | Smoke and targeted state tests pass; not exhaustive proof of each effect combination |
| Opponent builder / AI | 27 seeded generated CPU decks across eight typed Energy options and Colorless (three seeds each) legal at 30 cards; CPU side Extra Feather checked; unusable Altaria Extra Boost action hidden | Seeded build and targeted action checks pass; long matches not run |
| Cross-set interactions | Existing EX15 earlier test suites cover Holon/Special Energy, Crystal Beach, choice/Prize and specific action paths | Targeted regression suites pass, no exhaustive cross-set matrix |
| Separate TCG Pocket rules | Shared engine changes tested with Classic format state; no deliberate Pocket deck/prize/energy rule changes | No Pocket-specific Android QA |
| UI, Android hardware, saved data, APK | Source-only changed-files patch, no save/collection replacement, no real touchscreen or APK build | **Not verified on Android** |

## Concrete fixes

1. **Xatu δ Extra Feather:** identified as a Stage 2 Pokémon-ex support role, not a self-contained Darkness attacker. A Xatu-focused deck now contains a complete owned Stage 2 ex evolution chain. A Stage 2 ex-focused deck can include Natu/Xatu as an offensive support; each *unsuppressed* Xatu adds +10 before Weakness and Resistance. Side symmetry verified.
2. **Swellow δ Extra Wing:** a complete Stage 2 ex beneficiary line is preferred when Swellow is the focus; Stage 2 ex attackers can add a complete Taillow/Swellow line to reduce retreat. A Fire-compatible Gardevoir ex δ case is retained.
3. **Altaria ex δ Extra Boost:** only appears with an eligible Stage 2 ex target and a physical Basic Energy card in the acting player's hand; Mr Stone's Project included as a physical hand supply. This does not pull from the separate Basic Energy Zone.
4. **Kingdra ex δ Extra Smoke:** its defensive benefit receives an explicit Stage 2 ex synergy tag. Existing damage prevention mechanics preserved; additional multi-copy edge cases remain for gameplay validation.
5. **Typhlosion δ Burning Ball:** auto-Energy includes Psychic for the attack and Fire for the conditional Burn payoff. Unrelated single-type attackers do not inherit this extra Energy.
6. **Ledian δ / Quagsire δ Tool triggers:** automatic decks reserve physically owned Pokémon Tools before ordinary Trainer filler, making their Tool-triggered bonuses usable.
7. **Arbok δ / Vibrava δ status tags:** Arbok Burn+Poison and Vibrava Confusion are now represented correctly in deck metadata; self-Sleep is not erroneously marketed as an attack condition.

## Node regression result and caveats

**PASS — 198/198** in selected adjacent EX-era Node suites `tests/v07205` through `tests/v07215` (11 test files, including the new `tests/v07215-ex15-full-pass.test.cjs` with 13 new assertions/groups and individual loops). The four focused EX15 suites `v07212`–`v07215` themselves passed **89/89**. Additionally, all modified JavaScript files pass Node syntax check.

An older mixed-suite attempt reached and recorded failures in the two historical EX2/EX3 deck-cohesion tests. The **same three assertions fail when the builder is temporarily replaced with the exact unmodified v0.69.214 code**: (1) explicit single-type deck sometimes includes extra attack Energy, (2) optional Grass/Fighting Golem ex sometimes includes Volbeat, (3) Classic mono-vs-mixed optimiser scores tie. These are pre-existing outstanding issues, **not introduced by this EX15 patch**. The large mixed test run was stopped before full completion; don't report it as a completed pass.

**Scope limits:** A successful attack action smoke is not automatically an exact printed-effect verdict. Real Android portrait rendering, touch, save migration, prolonged Advanced/Expert CPU matches, all status/tool/suppression pairings, and all possible historical cross-set interactions are **not certified**. No APK was produced and no GitHub deployment was made. Four EX Crystal Guardians (ex14) cards remain PARTIAL/gated. Test Lab builds assume test ownership of four copies for every ex15 print; player ownership and restricted set filters must remain binding in production.

## Card-by-card source ledger

Each entry below was checked for a unique catalog ID, kind/stage and FULL gate; **all 83 Pokémon** additionally underwent a legal owned auto-focus build and their printed attack-action smoke; this ledger must not be mistaken for independently validated exact outcomes of every attack or ability. The roles column shows selected synergy/condition metadata — an empty dash is not proof the card lacks other rules.

| No. | Print | Stage / kind | Attacks / Powers (count) | Relevant metadata | Gate |
|---:|---|---|---|---|---|
| 1 | Ampharos δ | Stage 2 | 1 attacks, 1 Body/Power | δ | FULL |
| 2 | Feraligatr δ | Stage 2 | 2 attacks, 1 Body/Power | δ | FULL |
| 3 | Heracross δ | Basic | 2 attacks, 1 Body/Power | δ | FULL |
| 4 | Meganium δ | Stage 2 | 2 attacks, 1 Body/Power | δ | FULL |
| 5 | Milotic δ | Stage 1 | 1 attacks, 1 Body/Power | δ | FULL |
| 6 | Nidoking δ | Stage 2 | 2 attacks | δ | FULL |
| 7 | Nidoqueen δ | Stage 2 | 1 attacks, 1 Body/Power | δ | FULL |
| 8 | Ninetales δ | Stage 1 | 1 attacks, 1 Body/Power | δ | FULL |
| 9 | Pinsir δ | Basic | 2 attacks, 1 Body/Power | δ | FULL |
| 10 | Snorlax δ | Basic | 0 attacks, 2 Body/Power | δ | FULL |
| 11 | Togetic δ | Stage 1 | 2 attacks | δ | FULL |
| 12 | Typhlosion δ | Stage 2 | 1 attacks, 1 Body/Power | inflicts burn; conditional Fire; δ | FULL |
| 13 | Arbok δ | Stage 1 | 2 attacks | inflicts burn, poison; δ | FULL |
| 14 | Cloyster δ | Stage 1 | 1 attacks, 1 Body/Power | δ | FULL |
| 15 | Dewgong δ | Stage 1 | 2 attacks, 1 Body/Power | inflicts paralysis; conditional Water; δ | FULL |
| 16 | Gligar δ | Basic | 2 attacks | inflicts paralysis, poison; δ | FULL |
| 17 | Jynx δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 18 | Ledian δ | Stage 1 | 1 attacks, 1 Body/Power | requires Tool; δ | FULL |
| 19 | Lickitung δ | Basic | 2 attacks | δ | FULL |
| 20 | Mantine δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 21 | Quagsire δ | Stage 1 | 1 attacks, 1 Body/Power | requires Tool; δ | FULL |
| 22 | Seadra δ | Stage 1 | 2 attacks | δ | FULL |
| 23 | Tropius δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 24 | Vibrava δ | Stage 1 | 1 attacks, 1 Body/Power | δ | FULL |
| 25 | Xatu δ | Stage 1 | 1 attacks, 1 Body/Power | Stage 2 ex damage; inflicts confusion; δ | FULL |
| 26 | Bayleef δ | Stage 1 | 1 attacks | inflicts poison; δ | FULL |
| 27 | Croconaw δ | Stage 1 | 2 attacks | δ | FULL |
| 28 | Dragonair δ | Stage 1 | 2 attacks | inflicts paralysis; δ | FULL |
| 29 | Electabuzz δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 30 | Flaaffy δ | Stage 1 | 1 attacks | inflicts paralysis; δ | FULL |
| 31 | Horsea δ | Basic | 2 attacks | δ | FULL |
| 32 | Kirlia | Stage 1 | 2 attacks | inflicts paralysis | FULL |
| 33 | Kirlia δ | Stage 1 | 2 attacks | inflicts sleep; δ | FULL |
| 34 | Nidorina δ | Stage 1 | 2 attacks | inflicts poison; δ | FULL |
| 35 | Nidorino δ | Stage 1 | 2 attacks | δ | FULL |
| 36 | Quilava δ | Stage 1 | 2 attacks | δ | FULL |
| 37 | Seadra δ | Stage 1 | 2 attacks | δ | FULL |
| 38 | Shelgon δ | Stage 1 | 2 attacks | δ | FULL |
| 39 | Smeargle δ | Basic | 2 attacks | inflicts sleep; δ | FULL |
| 40 | Swellow δ | Stage 1 | 1 attacks, 1 Body/Power | Stage 2 ex retreat; δ | FULL |
| 41 | Togepi δ | Basic | 1 attacks | δ | FULL |
| 42 | Vibrava δ | Stage 1 | 2 attacks | inflicts confusion; δ | FULL |
| 43 | Bagon δ | Basic | 1 attacks | δ | FULL |
| 44 | Chikorita δ | Basic | 2 attacks | inflicts sleep; δ | FULL |
| 45 | Cyndaquil δ | Basic | 1 attacks | δ | FULL |
| 46 | Dratini δ | Basic | 1 attacks | δ | FULL |
| 47 | Ekans δ | Basic | 2 attacks | δ | FULL |
| 48 | Elekid δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 49 | Feebas δ | Basic | 1 attacks | δ | FULL |
| 50 | Horsea δ | Basic | 1 attacks | inflicts sleep; δ | FULL |
| 51 | Larvitar | Basic | 2 attacks | — | FULL |
| 52 | Larvitar δ | Basic | 2 attacks | inflicts paralysis; δ | FULL |
| 53 | Ledyba δ | Basic | 2 attacks | inflicts confusion; δ | FULL |
| 54 | Mareep δ | Basic | 1 attacks | δ | FULL |
| 55 | Natu δ | Basic | 1 attacks | δ | FULL |
| 56 | Nidoran ♀ δ | Basic | 2 attacks | δ | FULL |
| 57 | Nidoran ♂ δ | Basic | 2 attacks | inflicts poison; δ | FULL |
| 58 | Pupitar | Stage 1 | 1 attacks | — | FULL |
| 59 | Pupitar δ | Stage 1 | 1 attacks | δ | FULL |
| 60 | Ralts | Basic | 2 attacks | inflicts sleep | FULL |
| 61 | Ralts δ | Basic | 2 attacks | δ | FULL |
| 62 | Seel δ | Basic | 2 attacks | δ | FULL |
| 63 | Shellder δ | Basic | 1 attacks | inflicts paralysis; δ | FULL |
| 64 | Smoochum δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 65 | Swablu δ | Basic | 1 attacks | δ | FULL |
| 66 | Taillow δ | Basic | 1 attacks | δ | FULL |
| 67 | Totodile δ | Basic | 2 attacks | δ | FULL |
| 68 | Trapinch δ | Basic | 2 attacks | δ | FULL |
| 69 | Trapinch δ | Basic | 1 attacks | δ | FULL |
| 70 | Vulpix δ | Basic | 2 attacks | inflicts sleep; δ | FULL |
| 71 | Wooper δ | Basic | 2 attacks | δ | FULL |
| 72 | Buffer Piece | Tool | — | disruption, tool-synergy | FULL |
| 73 | Copycat | Supporter | — | disruption, supporter | FULL |
| 74 | Holon Legacy | Stadium | — | disruption, stadium | FULL |
| 75 | Holon Mentor | Supporter | — | search, disruption | FULL |
| 76 | Island Hermit | Supporter | — | draw, supporter | FULL |
| 77 | Mr. Stone's Project | Supporter | — | search, disruption | FULL |
| 78 | Old Rod | Item | — | disruption, item | FULL |
| 79 | Professor Elm's Training Method | Supporter | — | search, disruption | FULL |
| 80 | Professor Oak's Research | Supporter | — | draw, supporter | FULL |
| 81 | Strength Charm | Tool | — | tool-synergy, tool | FULL |
| 82 | TV Reporter | Supporter | — | draw, supporter | FULL |
| 83 | Switch | Item | — | snipe, retreat | FULL |
| 84 | Holon Energy FF | Special Energy | — | holon-energy-payoff, energy | FULL |
| 85 | Holon Energy GL | Special Energy | — | holon-energy-payoff, energy | FULL |
| 86 | Holon Energy WP | Special Energy | — | retreat, holon-energy-payoff | FULL |
| 87 | Boost Energy | Special Energy | — | energy | FULL |
| 88 | δ Rainbow Energy | Special Energy | — | delta-rainbow, energy | FULL |
| 89 | Scramble Energy | Special Energy | — | energy | FULL |
| 90 | Altaria ex δ | Stage 1 | 1 attacks, 1 Body/Power | Stage 2 ex hand-energy; δ | FULL |
| 91 | Dragonite ex δ | Stage 2 | 2 attacks | δ | FULL |
| 92 | Flygon ex δ | Stage 2 | 1 attacks, 1 Body/Power | δ | FULL |
| 93 | Gardevoir ex δ | Stage 2 | 1 attacks, 1 Body/Power | δ | FULL |
| 94 | Kingdra ex δ | Stage 2 | 2 attacks, 1 Body/Power | Stage 2 ex defense; δ | FULL |
| 95 | Latias ex δ | Basic | 1 attacks, 1 Body/Power | δ | FULL |
| 96 | Latios ex δ | Basic | 2 attacks, 1 Body/Power | δ | FULL |
| 97 | Rayquaza ex δ | Basic | 2 attacks, 1 Body/Power | δ | FULL |
| 98 | Salamence ex δ | Stage 2 | 2 attacks, 1 Body/Power | δ | FULL |
| 99 | Tyranitar ex δ | Stage 2 | 3 attacks | δ | FULL |
| 100 | Charizard ★ δ | Basic | 2 attacks | δ | FULL |
| 101 | Mew ★ δ | Basic | 2 attacks | δ | FULL |

## Practical test cases for the handset

1. In Test Lab, select `ex15` with full test collection, focus **Xatu δ #25**, and autobuild. Inspect for **Natu + Xatu** and an actually owned **Basic + Stage 1 + Stage 2 Pokémon-ex** attacking chain. The Energy Zone should serve the Stage 2 attacker; Darkness is not necessary just to leave Xatu on the Bench.
2. Focus **Gardevoir ex δ #93**. The builder should include the complete Ralts/Kirlia/Gardevoir ex δ family, and when room and ownership permit, Xatu and Swellow evolution lines. In battle, one unsuppressed Bench Xatu grants +10; two grant +20 on Gardevoir ex attack damage before Weakness/Resistance.
3. Focus **Altaria ex δ #90** and check a complete Stage 2 ex beneficiary plus **Mr Stone's Project #77**; activate Extra Boost only when a Basic Energy card is actually in hand. Verify CPU never stalls on an unavailable Extra Boost.
4. Focus **Typhlosion δ #12** and check both **Psychic + Fire** Zone types; two attached Fire Energy should satisfy Burning Ball's printed conditional Burn text. Focus Ledian #18 or Quagsire #21 and check two or more compatible Tool cards are included.
5. In Expert/Advanced CPU tests, inspect actual Energy attachments, Tool uses, Power choices, multi-Xatu stacking and real Special Conditions (Arbok Burn+Poison, Vibrava Confusion); report any observed incorrect results separately because simulated deck legality is not equivalent to human-device play.
