# Platinum — Classic30 implementation notes (v0.69.264 Stage 2)

Set: **Platinum / pl1** (130 numbered print IDs plus `SH4`, `SH5`, `SH6`). The canonical printed descriptions, HP, types, and attacks must come from the PokemonTCG/pokemon-tcg-data `cards/en/pl1.json` archive, copied locally to `data/classic/pl1-print-source.json`. The generator `scripts/build-platinum.py` recreates `app/src/main/assets/tcg-classic-platinum.js` from that archive and the explicit audited mappings in `scripts/pl1_verified.py`.

## Battle / deck builder rule

A card is **FULL** and available to play/autobuild only if every printed attack, ability, and attached trainer/special-energy effect has a verified implementation. Other cards remain in the catalogue for inspection and collection and are **not** eligible to be selected in generated 30-card decks. A displayed attack description alone is not evidence that it executes.

- Use existing typed effect handlers for coins, statuses, healing, discards, damage, searches, switches, Energy management, and self-damage, with clear optional player decisions.
- Do **not** treat Pokémon SP as a new species: they are basic Pokémon with a separate `pokemon-sp` identity tag for SP-only effects and search.
- LV.X requires its eligible existing Active Pokémon and retains prior attacks and powers. **All unverified Platinum LV.X cards are disabled** until full transfer, Lost Zone, trigger timing, and body suppression logic are implemented and live-tested.
- Lost Zone is distinct from the discard pile; a discard is never an acceptable substitute for a printed Lost Zone effect.
- Stadium effects must trigger on their *printed* conditions (evolution, bench arrival, etc.), not simply upon playing the Stadium. Unverified Stadiums are disabled.
- Fossils should not appear in autobuild unless their play-as-Pokémon rules work and a playable Fossil evolution is part of the available pool. In this initial audited pass, Armor Fossil and Skull Fossil remain gated.
- Optional attack choices must show clear actions; CPU should choose helpful Energy recovery/search options instead of Skip by default.

## Regression criteria

After generation, `node --test tests/v07263-platinum-catalog.test.cjs tests/v07263-blissey-cpu-energy-absorption.test.cjs` checks 133 identities, battle eligibility gates, effect schemas, lookup, and Blissey ex CPU recovery across difficulty settings. Source commit must include both official print-source JSON and generated JS, so subsequent APK builds are fully offline/deterministic. Do not bypass these tests by enabling incomplete cards or substituting placeholder damage.

**Status:** Platinum is integrated into set selection and catalogue preparation. This is **not** a claim that all 133 cards are battle-ready. Unsupported effects are intentionally held for subsequent mechanics passes; the generator prints a list of every gated print and its reason.

## Stage 2 verified battle expansion (v0.69.264)

Verified in live classic battle-state tests: Rainbow Energy (one flexible unit, 10 damage on attachment), Broken Time-Space evolution timing, Galactic HQ evolution counters, Miasma Valley Basic bench counters, PlusPower attack modifier/expiry, Crobat G Flash Bite target choice, Skuntank G Poison Structure (Stadium prerequisite and Pokémon SP immunity), Happiny Baby Evolution using Chansey in hand, Blissey Nurse Call shared once-per-turn activation, Bastiodon Metal Trait, Dugtrio Sinkhole on retreat, Dialga Time Aura and Metal Burn, selectable Energy Stream recovery, Vulpix Reheat physical hand discards, Looker’s Investigation choosing either hand and 0–5 draws, Life Herb, and chosen Hospitality substitution. Helpful Platinum effect choices are taken by the CPU instead of blindly selecting Skip. All choices draw from actual legal actions; no hidden opponent cards are inspected.

New mechanical mappings are conservative: any card with an unsupported Power, Body, attack or Trainer effect is still in the collection catalogue but disabled for battles and autobuild. In particular, unverified LV.X and Lost Zone implementations remain gated. Fossil deck dependency rules remain intact.

Run `sh scripts/prepare-platinum.sh` after extracting the ZIP. It retrieves the archived official 133 printed cards if absent, runs `scripts/build-platinum.py`, and then the focused test suite when Node.js is installed. This patch does **not** include the synthetic test fixture used during development. The `data/classic/pl1-print-source.json` and generated `tcg-classic-platinum.js` should be committed once generated from the real source. Run `node --test tests/v07264-platinum-stage2-effects.test.cjs` to repeat the Stage 2 runtime tests.

During development, the fixture-backed Platinum tests and selected late-DP/Stormfront regressions passed; full integration against a downloaded real official 133-card archive must run in Termux after preparation.
