# LuckyDex Classic — Great Encounters (dp4) implementation pass

Version: **0.69.243** — source implementation and automated audit (Android device testing still required)

## Scope and policy

- The canonical 2008 *Diamond & Pearl: Great Encounters* catalog has **106 collector-number entries**, including 100 Pokémon and 6 Trainers.
- The print identities, HP, evolution dependencies, attack names/costs, weaknesses, resistances, rarity and artwork IDs are registered for **all 106**.
- **76 of 106** prints are enabled for actual Classic battle and automatic deck building. **30** remain deliberately gated because mandatory or interrupting effects still require battle-engine work. They must not be selected by player/CPU auto-builders.
- Supported effects use physical card selections where relevant; choices must not reveal unknown opponent cards or face-down Prizes. The current patch does **not** claim independent card-by-card printed-rule certification.
- All eight Energy-type-only CPU deck modes yield 30-card legal candidate decks for two tested seeds (16/16). CPU strategy is not proven optimal.

## Important effects implemented and outcome-tested

- Darkrai: optional Defending Pokémon switch and Sleep Hole conditional damage.
- Rotom: Astonish hand-card shuffle and Telebeam's coin and paralysis effect (synthetic hand scenario still a smoke skip).
- Butterfree: Parallel Drain selects a real damaged ally and heals equal to damage actually dealt.
- Lapras: Carry In selects actual Tool, Supporter and basic Energy cards from draw deck, without inventing any cards.
- Wigglytuff / Igglybuff / Jigglypuff: Baby Evolution uses a physical Jigglypuff, Balloon Attack only gains its bonus when Igglybuff is under Wigglytuff, and Good Night Melody sleeps both Active Pokémon.
- Claydol: Cosmic Power selects zero, one or two physical cards to put on the bottom of the deck, then draws up to six when applicable.
- Pachirisu: Smash Short removes the attached Tool and all matching Tools in the defending player's hand after revealing it.
- Tangrowth: chooses an opposing target and counts Basic Energy rather than Special Energy for Power Whip.
- Exploud: Ambient Noise resolves both coin outcomes separately, including Bench damage and next-turn Trainer-family restrictions.
- Magcargo: Lava Plume's optional top-card discard and Magma Armor status protection.
- Huntail: conditional Darkness bonus and selected Special Energy discard.
- Linoone: moves a physical Tool between valid opposing Pokémon without inventing replacement cards.
- Caterpie / Metapod: active-only Emerge/Pupate power, real Evolution from draw deck.
- Feebas: searches for an actual Evolution print; Igglybuff's autobuilder dependency on Jigglypuff uses the existing generic Baby Evolution dependency system.
- Zigzagoon: Pull Out returns a selected discard card to the top of the draw deck.
- Premier Ball: selects a real LV.X print from deck or discard, with artwork-capable card IDs.

## Catalog ledger: enabled battle cards (76)

- 3 Darkrai
- 4 Darkrai
- 5 Pachirisu
- 7 Rotom
- 10 Tangrowth
- 12 Altaria
- 13 Beedrill
- 14 Butterfree
- 15 Claydol
- 17 Exploud
- 19 Hypno
- 20 Kingler
- 21 Lapras
- 22 Latias
- 27 Primeape
- 32 Wigglytuff
- 33 Arbok
- 34 Cacturne
- 35 Combusken
- 36 Delibird
- 37 Floatzel
- 38 Gorebyss
- 39 Granbull
- 40 Grovyle
- 41 Hariyama
- 42 Huntail
- 43 Linoone
- 44 Loudred
- 45 Magcargo
- 47 Metapod
- 50 Purugly
- 51 Relicanth
- 52 Seviper
- 53 Skarmory
- 54 Slowbro
- 55 Togetic
- 58 Wailmer
- 59 Zangoose
- 60 Baltoy
- 61 Buizel
- 62 Cacnea
- 63 Caterpie
- 64 Clamperl
- 65 Drowzee
- 66 Ekans
- 67 Feebas
- 68 Glameow
- 69 Houndour
- 70 Igglybuff
- 71 Illumise
- 72 Jigglypuff
- 73 Kakuna
- 74 Koffing
- 75 Krabby
- 76 Lunatone
- 77 Luvdisc
- 78 Makuhita
- 79 Mankey
- 80 Mudkip
- 81 Porygon
- 82 Slowpoke
- 83 Slugma
- 84 Snubbull
- 86 Swablu
- 87 Tangela
- 88 Togepi
- 89 Torchic
- 90 Treecko
- 92 Volbeat
- 93 Weedle
- 94 Whismur
- 95 Wingull
- 96 Zigzagoon
- 98 Felicity's Drawing
- 101 Premier Ball
- 102 Rare Candy

## Catalog ledger: gated pending further effect work (30)

- 1 Blaziken
- 2 Cresselia
- 6 Porygon-Z
- 8 Sceptile
- 9 Swampert
- 11 Togekiss
- 16 Dialga
- 18 Houndoom
- 23 Latios
- 24 Mawile
- 25 Milotic
- 26 Palkia
- 28 Slowking
- 29 Unown [H]
- 30 Wailord
- 31 Weezing
- 46 Marshtomp
- 48 Pelipper
- 49 Porygon2
- 56 Unown [F]
- 57 Unown [G]
- 85 Solrock
- 91 Unown [L]
- 97 Amulet Coin
- 99 Leftovers
- 100 Moonlight Stadium
- 103 Cresselia LV.X
- 104 Darkrai LV.X
- 105 Dialga LV.X
- 106 Palkia LV.X

## Evidence and limitations

Run from `~/lucky-dex/source`:

```bash
node --test tests/v07243-great-encounters.test.cjs
node scripts/audit-classic-set.cjs --set dp4 --smoke --no-write
```

The synthetic smoke runner supplies generated board states and can skip an action when its required hand, evolution or other prerequisites are absent. Such skips must not be represented as passing gameplay tests. Report details are in `generated/classic-audit-dp4.md` and `generated/classic-audit-dp4.json`.

Next review should address **the 30 gated prints**, especially the LV.X Powers, reactive Poké-Bodies, Trainer/Tool timing, mandatory Energy costs, alternative targets and Prize-card interactions. Re-run the existing dp2/dp3 effect suites after changing shared handlers.
