# LuckyDex 0.69.335 — Furious Fists completion and rules audit

## Source and build
- Official XY Furious Fists `xy3` source: pinned Git blob `9996bfa724c3d7fc23c9fcc31341cd521311ecb1` of PokemonTCG/pokemon-tcg-data; 114 prints (including 55a), 159 attacks, 14 Abilities.
- `scripts/build-xy3.py` regenerates the printed catalogue in GitHub Actions, before battle, deck and asset audits.
- The v0.69.334 APK build was verified successful (workflow #623). This v0.69.335 APK build must still complete on GitHub; locally bundled `xy3` data is a placeholder and full official catalogue tests skip until generation.

## Implemented mechanics
- Fighting Stadium: +20 to attacks of Fighting Pokemon against active Pokemon-EX (both players), in addition to Strong Energy +20 per valid attachment and Machamp Fighting Fury boosts.
- Herbal Energy: only Grass Pokemon, provides one Grass, heals 30 on hand attachment. Strong Energy: only Fighting Pokemon, provides one Fighting, +20 damage against opposing Active. Evolution/type changes discard ineligible Special Energy.
- Focus Sash: a qualifying Fighting Pokemon at full HP survives an attack KO on 10 HP and loses the Tool. Sparkling Robe clears and prevents Special Conditions. Training Center +30 max HP to Stage 1/2, both players. Mountain Ring protects Bench attack damage.
- Restored Pokemon: Fossil Researcher searches specified Amaura/Tyrunt physical cards from deck; Jaw/Sail Fossils search the bottom seven for the right Pokemon and Bench it.
- Korrina selects one Fighting Pokemon and one Item; Maintenance shuffles two selected physical hand cards into the deck and draws one; Tool Retriever returns selected attached Tools. Special Energy and real physical-card identities are maintained.
- Furious Fists battle effects: Mega Heracross Big Bang Horn remaining-HP scaling; Giga Power optional boost/recoil; Magmortar/Electivire link; Victreebel Wafting Scent; Seismitoad-EX Quaking Punch/Grenade Hammer; Blaziken Burning Shot target selection; Dragonite-EX Bust In and Jet Sonic; Noivern Boomburst/Echolocation visible coin; Accelgor Afterimage Strike; Energy/hand disruption and shuffle/recovery; Politoed King's Song cost; Fairy resistance (Klefki); status, locks, discard and many more.
- Patrat Safety Check chooses a facedown Prize and reveals it in the acting player's private selection pane only; public battle logs retain only the Prize number.
- Player and opponent selection still use the global 0.69.333 30-card synergy builder; no trainer-spam rollback.

## Deliberately gated — unfinished interaction
- `xy3-36` Hypno: **Hand Control**. Requires forcing an opponent's Supporter under the attacker's own choices. It cannot silently draw, ignore opposing state, or fake a Supporter being played.
- Other prints remain automatically disabled if their official text fails the conservative explicit-effect parser, with exact reasons recorded at build time in `docs/XY3_BUILD_COVERAGE.json`. Do not equate print count with battle-ready count.

## Audits
- `node --test tests/v07334-furious-fists-stage1.test.cjs tests/v07335-furious-fists-completion.test.cjs` — local rule, schema and UI/build integration checks. Tests requiring generated XY3 cards run in GitHub after `generateXY3ForApk`.
- `node --test tests/v07333-classic-deck-quality.test.cjs` — cross-era player/CPU autobuilder legality, Trainer variety, Energy and synergy regression.
- `app/build.gradle` runs both XY3 suites **after** official source generation and **before** APK packaging.

## Termux handoff
```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.335_FURIOUS_FISTS_COMPLETION.zip -d source

git add source
git commit -m "LuckyDex v0.69.335 Furious Fists completion and audit"
git push origin main
```
