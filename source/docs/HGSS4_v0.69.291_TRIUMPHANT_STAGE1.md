# LuckyDex v0.69.291 — HGSS Triumphant Stage 1

## Verified source
The English collector source for Pokémon TCG Triumphant (`hgss4`) has 103 distinct prints: 1–102 and secret `FOUR` (Alph Lithograph), including 96 Pokémon, six Trainers, and one Special Energy. It is pinned to PokemonTCG/pokemon-tcg-data commit `7ee26f8d2914651ccc854244a79ec7049aec66d1`, Git blob `dbc160f44240837d5684cdddfadafe82cbe25f6b`, with a locally bundled compact JSON whose SHA-256 is `77c7859b072a1be81422cb962a02d6b4b59934ea4739025aa0f17db660c6fbde`. The generator verifies this digest and checks all collector IDs before emitting the browser catalogue; GitHub builds require no external source download.

## Stage-one coverage
All 103 authentic prints have exact identities, printed HP, types, evolutions, retreat, Weakness/Resistance, rarity, attack costs, printed damage and text, ability classifications and rule text. **53/103** have supported executable mappings and are battle-enabled; **50/103** remain visible in collection but gated from battle and CPU decks. Unsupported cards are *not* silently replaced with no-op effects. Pokémon Prime cards, Rescue Energy KO-trigger, Alph Lithograph FOUR, and Darkrai & Cresselia/Palkia & Dialga LEGEND effects are incomplete where not fully mapped. Both halves of a LEGEND pair have matching gating and two-Prize data. A future completion pass will implement the remaining effect types and investigate real battle-choice interactions.

## Integration
The catalogue is exposed by `tcg-classic-triumphant.js` via `tcg-classic-battle-data.js` and included in `index.html` before battle-data initialization. Player set selection, deck builder, collection owned-card lookup (including secret FOUR) and CPU opponent choices include `hgss4`. Selected-set CPU decks are checked for complete evolution lines, valid Energy plans, 30-card legality and matched physical LEGEND halves. New version 0.69.291 is consistent across Gradle, HTML and boot JS.

## Local checks
- `python3 scripts/build-hgss4.py` validated the bundled checksum and printed all 103 records.
- `node --test tests/v07291-triumphant-stage1.test.cjs` — 8/8 pass.
- `node scripts/audit-classic-set.cjs --set hgss4 --smoke --no-write` — 53/103 enabled, zero errors/warnings/review flags, CPU 16/16, 180/180 smoke actions pass.
- Selected combined HGSS2/HGSS3/HGSS4 regression run — 104/104 pass.
- Syntax checks for generator and new JS modules pass.

The GitHub v0.69.290 APK built successfully. **The new v0.69.291 APK has not been built in GitHub yet.** Phone tests and new full mechanics remain pending.
