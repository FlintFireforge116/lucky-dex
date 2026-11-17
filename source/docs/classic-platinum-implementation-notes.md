# Platinum — Classic30 implementation notes (v0.69.263)

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
