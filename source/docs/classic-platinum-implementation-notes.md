# Platinum — Classic30 completion pass (v0.69.265)

**Expansion:** Platinum / `pl1`, 133 distinct collector prints: `1`–`130`, plus `SH4`, `SH5`, `SH6`. The canonical card texts, types, HP, retreat, weakness, costs, evolution identity and rarity come **only** from the locally archived official `data/classic/pl1-print-source.json`. No synthesized development card records are distributed in the ZIP. GitHub's Gradle `generatePlatinumForApk` step rebuilds `app/src/main/assets/tcg-classic-platinum.js` offline before assets merge. The standard Termux unzip/commit/push workflow is sufficient.

## Mapped mechanics and deck rules

Every collector print is mapped in `scripts/pl1_verified.py` and validated by `scripts/build-platinum.py`; the latest local catalogue generated against the temporary test fixture showed **133/133 battle-enabled** and **0 gated**. This is an implementation coverage claim, not proof that every possible cross-set board has been played manually. Each card retains its printed effects and unique collector ID; never turn a no-op into unprinted damage or let unsupported effect choices fall through silently.

- Pokémon **SP** retain Basic identity but have an `isPokemonSP` flag. Energy Gain attaches only to SP, removes at most **one** Colorless cost through the Tool modifier, and Power Spray is a reaction to an opposing Poké-Power only when its owner has at least three SP in play. Poké Turn returns the selected SP and attached physical cards to the owner's hand.
- **LV.X** level up the matching Active, not arbitrary evolved families; previously learned attacks and Powers remain accessible. Dialga G, Drapion, Giratina, Palkia G and Shaymin variants use printed restrictions. Non-SP Bodies are suppressed by Time Crystal, not the Poké-Powers of ordinary Pokémon.
- **Lost Zone** differs from discard. Broken-space Blow, Darkness Lost, Remove Lost and Lost Cyclone move appropriate Pokémon, attachments and/or Energy there. Prize resolution for actual knockouts still happens.
- **Stadiums**: Broken Time-Space changes evolution timing; Galactic HQ triggers on hand evolution; Miasma Valley triggers on eligible Basic bench arrival. None is a one-time play damage effect.
- **Rainbow Energy** supplies one flexible Energy unit, never all colours simultaneously, and causes 10 damage counters on hand attachment. Actual Basic-vs-Special Energy identity is maintained across hand, deck, discard, attached and Lost Zone zones.
- **Armor/Skull Fossil** are Trainers in a deck and Basic Pokémon in play, with their printed coin-based defensive effects; the deck builder should only select them where Shieldon/Cranidos evolution support makes sense.
- Multi-stage options remain visible, including Energy source and destination, moving cards and damage counters, chosen deck cards, separate coin results, and whether to use optional effects. CPU choices go through the same legal-action system.
- **Ludicolo Cheerful Voice** ends the current turn and boosts Ludicolo's attacks on the next own turn. **Gardevoir Psychic Connect** moves one Psychic Energy from an own Benched Pokémon only to the own Active. **Rampardos Iron Skull** ignores Resistance and defending effects. Damage Bind prevents damaged Pokémon from using Poké-Powers while allowing Poké-Bodies.

## Validation

- The baseline GitHub Actions Classic preflight: **273/273** Node.js tests passed locally.
- Stormfront preparation and independent deck-builder tests: **46/46** passed.
- Platinum catalogue, Stage 2 and completion tests: **40/40** passed using an *explicitly temporary 133-card fixture*; the fixture is not shipped in the release.
- Platinum static card audit with no CPU simulation: 133/133 enabled, no errors; a further CPU deck audit using the simplified fixture was inconclusive for some typed decks. Full live-archive deck generation and a real GitHub APK build still need verification following the push.

The ZIP deliberately excludes both `data/classic/pl1-print-source.json` and `app/src/main/assets/tcg-classic-platinum.js` because development copies used a simplified test fixture. The previously committed authentic GitHub sources are preserved, and Android builds rebuild the authentic asset deterministically.

Run: `node --test tests/v07263-platinum-catalog.test.cjs tests/v07264-platinum-stage2-effects.test.cjs tests/v07265-platinum-completion.test.cjs`. Do not assert successful installation or the complete Android build before the GitHub workflow finishes.
