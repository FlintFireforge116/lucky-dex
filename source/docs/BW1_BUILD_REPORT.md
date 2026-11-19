# LuckyDex v0.69.296 — Black & White Base Set

## Integration

- Complete 115/115 print roster: 112 regular cards, 2 full-art print variants (Reshiram #113, Zekrom #114) and secret Pikachu #115. Source print fields transcribed from `PokemonTCG/pokemon-tcg-data`, `cards/en/bw1.json` (repository file SHA `13db9f92ace41bee5608504315f49e836942dd94`), and pinned by local SHA256 `a92250f8e8d3db240a4bd9f5d56d40d05b118e156aa5a20ef6566c28029d7c90`.
- 115/115 battle enabled in generated roster, 160 printed attack definitions, five Abilities, 13 Trainer cards and eight Basic Energy prints (Energy Zone handling; basic energies excluded from the shortened 30-card deck slots).
- Added Black & White to collection registry, set picker, deck builder, AI opponent generation, ownership projection, WebView loading and build version 0.69.296.
- New engine rules support Royal Heal, Inferno Fandango, Damage Swap, Leaf Storm, Nature Power, Energy Search/Retrieval, Flame Charge, Cell Culture, Torment, Blindside, Odor Sleuth, Revive, Professor Juniper, Super Scoop Up and Energy Switch. Existing effects reused for status conditions, attack choices, coin flips, copy attacks, Energy movement and defensive effects.
- Explicit tests added for Emboar, Serperior, Samurott, Reuniclus, Klinklang, Zoroark, Reshiram, Zekrom and Pikachu, plus physical Trainer/card transfers and deck building.
- New `generateBW1ForApk` and `auditBW1ForApk` tasks are preBuild/mergeAssets dependencies.

## Verifications performed

- Print integrity: 115 records, exact collector number/name/HP/rarity/attacks/Ability text equality checked by pinned-source test.
- Battle definition validator: 160/160 attacks, 5/5 Abilities and 13/13 Trainer effects schema valid.
- CPU deck sampling: 16/16 valid 30-card decks in static audit. Dedicated test sweeps **108** type-and-seed CPU builds and checks basic evolution chains.
- Combined recent regression suite: **91/91 tests pass** across Triumphant, Call of Legends and Black & White.
- B&W new dedicated tests: **25/25 pass**.
- Static audit: **0 errors, 0 warnings**, **19 follow-up flags**. The follow-up flags represent interactions the static rule matcher cannot certify, not validation failures.
- Synthetic smoke audit: **340/346 scenarios executed**, **4 skipped** (four Dream Eater scenarios without Sleep precondition); two unresolved *Leaf Tornado* multi-stage choice smokes. A dedicated regression test confirms a correct Energy move and explicit Done choice on Leaf Tornado. Synthetic scenarios do not prove complete card-by-card gameplay.
- Source verified with Node syntax checks. Full Android Gradle APK build and physical phone playtest have **not** been performed here.

## Important rules to preserve

1. Classic LuckyDex is a 30-card deck format with separate ordered Basic Energy Zone. Deck-search attachments may consume Energy Zone units only when the corresponding Basic Energy is genuinely present; no free synthetic Energy.
2. Special Energy is a physical card, unlike queued Basic Energy. Move/discard only eligible types and preserve cards when relevant.
3. A Pokémon with a printed *Ability* differs from an older Poké-Power: Abilities are not automatically disabled by ordinary Special Conditions, and repeatable ones remain usable while legal targets/costs exist.
4. All Pokémon lines need playable pre-evolutions; build focused lists rather than orphan Stage 1/Stage 2 cards. Emboar's Inferno Fandango is supported by Energy Search creating real Energy cards in hand from supply.
5. Player-target choices, coin flips and prize cards must be resolved in the existing battle sequence rather than silently selecting defaults.

## Run locally

```sh
python3 scripts/build-bw1.py
node --test tests/v07296-black-white.test.cjs
node scripts/audit-classic-set.cjs --set bw1 --smoke --no-write
```

## Installation

Overlay the ZIP contents onto LuckyDex `source/` after applying v0.69.295, then push and let GitHub Actions build the APK. The ZIP does not include an APK.
