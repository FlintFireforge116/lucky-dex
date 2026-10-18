# Adventure 2.0 move-data provenance

The app ships a generated offline JavaScript bundle at
`app/src/main/assets/adventure/adventure-move-data.js`. It uses no runtime API.
The generation command is `python scripts/build_adventure_moves.py`; the builder
uses only Python's standard library and the checked-in CSV cache.

## Primary source and pinned snapshot

Data comes directly from [PokeAPI's maintained repository](https://github.com/PokeAPI/pokeapi),
snapshot [`2fe95532d27a9bf340575253aff50868319d8182`](https://github.com/PokeAPI/pokeapi/tree/2fe95532d27a9bf340575253aff50868319d8182/data/v2/csv),
retrieved 9 October 2026. `data/adventure-moves/manifest.json` records the exact
SHA-256 digest of every downloaded CSV. Generation rejects changed cached inputs.

Canonical files are `pokemon.csv`, `pokemon_types.csv`, `pokemon_moves.csv`,
`moves.csv`, `move_names.csv`, `types.csv`, `version_groups.csv`,
`pokemon_move_methods.csv`, `move_meta.csv`, `move_meta_categories.csv`,
`move_meta_ailments.csv` and `move_meta_stat_changes.csv`.
Each source URL is the pinned directory above plus its filename. PokeAPI's
[API documentation](https://pokeapi.co/docs/v2#pokemonmove) describes move learn
methods, version details, damage classes and effect metadata.

## Form, version and learning policy

All 1,025 National Dex species map to their actual `is_default=1` Pokemon form;
form-specific learnsets are never merged. The bundled species types match these
default forms. For example Urshifu uses single-strike, Meowstic uses male and
Ogerpon uses its default form; alternate and regional forms are not implemented
by this data file.

Each species uses one latest available conventional main-series level-up and
machine learnset. Preference is Scarlet/Violet including DLC groups where
populated, BDSP, Sword/Shield including DLC groups, USUM, then earlier traditional
games. Legends Arceus, Legends Z-A, Mega Dimension, Champions, Let's Go and
Colosseum/XD data are excluded because this engine uses traditional level/PP
battles. Actual populated versions are Scarlet/Violet (733 species), BDSP (140),
Sword/Shield (143) and USUM (9). Newer version groups present in PokeAPI do not
imply every species has populated records there.

Level-up records come strictly from method 1, deduplicated by move at its earliest
learn level. Source evolution/relearner entries at level 0 become level 1 for
this game's initial move selection. No evolution system is implied by this
normalization. TM compatibility comes strictly from method 4 in the SAME selected
version, intersected with the 30 curated reward moves. Egg/tutor moves do not
grant compatibility. A move is identified by its stable move ID rather than
version-specific TM numbers.

## Basic moves and special cases

Basics are real default-form level-up associations. Selection prefers a damaging
move of power 40 or lower, learned by level 12, then STAB, then earlier learning.
No generic type-to-move substitution is used. Charmander has Ember, Squirtle
Water Gun and Pikachu Thunder Shock. Bulbasaur has Tackle: its canonical Vine
Whip has power 45, so that would not satisfy the requested weak-basic target.

When a current evolved form's learnset drops an appropriate weak basic, an
earlier verified default-form association may supply the basic move. This
affects 10 species; e.g. Clefable receives Disarming Voice from BDSP instead of
starting with Meteor Mash. `basicVersionGroup` and `basicLevel` record the real
association. Its level-up progression and TM compatibility still use the single
latest learnset, with no fabricated entries added to that progression.

47 species have basics above power 40 because no appropriate damaging move at
40 or below exists in the allowed source associations (or because a distinctive
special case applies). Examples are Unown's Hidden Power (60), Kadabra's
Confusion (50) and Blipbug's Struggle Bug (50). `basicExceptions` records every
such case and the historical/basic-special exceptions.

14 species preserve status basics: Metapod/Kakuna/Silcoon/Cascoon/Spewpa and
Pyukumuku use Harden,
Abra Teleport, Ditto Transform, Smeargle Sketch, Magikarp/Feebas/Wynaut/Cosmog
Splash, and Cosmoem Cosmic Power. Wobbuffet uses Counter (a damaging move with null canonical
power), and Delibird Present (variable power, also null). The bundle exports
Struggle (165) as a universal battle fallback; it is NOT inserted into canonical
level-up or TM learnsets. The consuming battle engine must make status-only
starters playable through its documented simplification/fallback policy.

## Canonical values and simplified effects

The 693 referenced moves retain source names, types, power, accuracy, PP, priority and
damage class (`physical`, `special`, `status`). Blank canonical power/accuracy
remain `null`: fixed damage, counter attacks, variable-power moves and attacks
that bypass an accuracy check must be adapted explicitly by combat, not disguised
as invented canonical values. For older learnsets, numeric move properties use
PokeAPI's current canonical move record rather than recreating historic rule sets.

`role` is a deliberately broad Adventure adapter hint: `damage`, `heal`, `buff`,
`debuff`, `status`, or `no-op`. Source ailment, healing/drain percentages, flinch
chance, stat changes, target/effect IDs and multi-hit bounds are retained as
metadata. These fields do not claim the battle engine simulates all effects.
Protect/screens and related defensive moves are marked as a broad defensive buff;
unsupported weather/field/transform mechanics may remain no-op until adapted.
PokeAPI uses ailment chance 0 for some guaranteed status moves, so consumers must
distinguish those from damaging moves with no status proc.

The bundle contains 14,929 level-up records and 7,849 curated TM compatibility
records. Audit tests compare every species/basic association, level-up schedule,
TM compatibility and move numeric value against the pinned local source cache.
