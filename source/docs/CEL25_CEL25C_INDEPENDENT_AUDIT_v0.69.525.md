# Celebrations and Classic Collection independent audit — v0.69.525

- 25/25 main prints and 25/25 Classic Collection prints remain enabled. All 50 print IDs are distinct; all 66 attacks and 19 printed abilities pass descriptor validation. Both main-set alternate-print pairs have identical gameplay descriptors.
- Dark Gyarados Final Beam: now respects Weakness Guard Energy (including suppression), inherits Weakness and Resistance from the previous card beneath a BREAK, and records its damage as a Pokémon Power rather than attack damage. The damage remains separate from ordinary attack modifiers. The six bilateral regression checks failed against v524 and pass after the fix.
- Rocket's Admin. reprint keeps its own redraw when opposing Milotic protects the opposing hand. Here Comes Team Rocket! keeps Peonia replacement Prizes face up without treating exchange as a Prize award.
- Tested both deck builders on the combined Celebrations pool, with three seeds and four type selections (24 generated decks), validating 30-card size, selected set membership and Energy plans. Sparse standalone pools remain inherently limited.
- New independent audit is registered in Gradle and the full offline preparation chain. Wider historical Power-specific matchup modifiers and physical Android testing are not exhaustively covered.
