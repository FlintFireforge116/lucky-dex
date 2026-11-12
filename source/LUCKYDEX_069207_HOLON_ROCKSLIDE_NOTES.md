# LuckyDex v0.69.207 — cross-set Holon Energy & Rock Slide audit

- EX Holon Phantoms focused decks may select owned, battle-ready Holon Energy FF, GL or WP from EX Delta Species, without enabling unrelated cross-set Pokémon or Trainers.
- CPU validation now shares the same narrow permitted set exception as the player deck builder.
- Deck analysis warns when a Holon Energy-dependent Pokémon has no enabling card included (which can occur if the player owns none).
- EX Legend Maker Graveler (ex12-34) Rock Slide was checked using actual battle-state assertions: 20 damage to the Active and 10 to each of two Benched Pokémon, or 0 to an Active with -30 Fighting Resistance. The existing battle damage rule was correct and was not changed.
- Test: `node --test tests/v07207-holon-sharpedo-rock-slide.test.cjs` from source/.

## Special Darkness/Metal Energy fallback fix

- The generic 30-card filler pass previously ignored printed Energy effectiveness and padded unrelated mono-Grass, mono-Psychic, and mono-Water decks with up to four Special Darkness Energy. This was not a strategic choice: these cards provide Darkness Energy and their attack damage bonus only works with Darkness Pokémon or cards with “Dark” in their names.
- Filler now includes Special Darkness only where a Pokémon can earn its +10 damage bonus, and Special Metal only where damage reduction can apply. Dark Metal Energy likewise needs a compatible typed attack or Pokémon. Holon/React/δ Rainbow are no longer inserted as generic filler without their actual support relationships.
- Verified that a Fighting Sharpedo δ deck prioritises owned Holon Energy FF, with no unrelated Special Darkness/Metal, while a Mightyena ex deck can still include Special Darkness and an Aron Metal deck can still include Special Metal.
- Final on-device behaviour still needs testing; the Graveler Rock Slide main-hit result will vary with Fighting Resistance.
