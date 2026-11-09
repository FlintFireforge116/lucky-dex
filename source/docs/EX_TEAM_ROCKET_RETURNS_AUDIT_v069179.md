# LuckyDex v0.69.179 — EX Team Rocket Returns rules, metadata and original Team Rocket compatibility audit

Base: v0.69.178. Unzip into canonical `~/lucky-dex/source/` (archive paths begin with `app/` and `tests/`). A source patch; do not overwrite the repository root or interpret this as a complete APK.

## Fixes
- Dark Hypno's Dark Link now copies an attack from a different *Dark*-named Benched Pokémon after heads. It refuses ordinary Pokémon and can copy supported original Team Rocket Dark cards.
- Togetic's Rainbow Moves now copies a chosen *opponent Benched* Pokémon's attack. Togepi's Mini-Metronome now copies the opposing Active's attack on heads, rather than doing nothing.
- The generic copy-attack engine now supports `opponentBench` selection and name-prefix restrictions without widening other copies. Copied attacks honour their additional effects/costs.
- EX Rocket Returns deck metadata recognises the Rocket family across base5 (2000) and ex7 (2004) by card name (`Dark ` / `Rocket's `), rather than requiring an EX7-only ID or conflating Dark with Darkness Energy.
- Fixed misleading roles for Copycat, Pokémon Retriever, Rocket's Hideout, Rocket's Mission, Rocket's Tricky Gym and Here Comes Team Rocket; corrected Dark Crobat's Black Beam Poison metadata.
- Rocket's Scizor ex and Rocket's Scyther ex preferentially use Metal and Grass respectively when a focused build has only Colorless attack costs (Dual Armor powers), rather than defaulting to Darkness and never enabling their printed Bodies.
- Original Team Rocket cross-set checks: old Dark Pokémon get Rocket Hideout HP, borrowed Rocket's Tricky Gym attack, R Energy attachment, Rocket Poké Ball search, and the four-card Rocket Mission draw; original and new Dark Dragonair/Dragonite evolution lines are cross-compatible; Dark Ampharos triggers on original Dark evolution cards played from hand.
- Player builder and CPU build legal 30-card decks for base5-only, ex7-only, and both selected together. Test Lab / player / CPU set filters remain intact, mono-type preference and separate Test Lab saves preserved.

## Known existing limitation
The original 2000 Team Rocket (`base5`) catalogue has 83 cards, but 40 are presently battle-enabled and 43 remain tagged partial due to original rule effects not implemented in that *older set*. This audit verifies compatibility for battle-ready old cards; it does not silently claim full original Team Rocket move completeness or alter old card ownership.

## Verification
208/208 automated regression tests passed across new Rocket-specific outcomes, original Team Rocket, prior EX expansions, Classic deck generation and Energy consistency. A full mobile-on-device test and exhaustive all-set combinations remain outstanding.
