# LuckyDex v0.69.210 — EX Crystal Guardians Charizard δ Energy pass

## Bug reproduced

EX Crystal Guardians-only auto-builder with focus on Charizard δ returned 30 cards but 0 physical Energy, despite owned Double Rainbow Energy. Peal of Thunder reveals the top five REAL draw-deck cards, not Energy from the separate Basic Energy Zone, so it had no eligible cards to attach. Builder also selected Fire Charmander/Charmeleon prints while configuring only Lightning/Metal Basic Energy. Metal Burn resolved damage without discarding its Metal-providing Energy.

## Corrected

- Reserve up to 3 owned compatible physical Double Rainbow Energy cards in a Charizard δ focus before Trainer filler, including the EX Emerald print only if its set is selected. Do not invent or pull unowned cards.
- Warn on generated Peal-of-Thunder decks with no available physical Energy, rather than accessing the unlimited Basic Energy Zone.
- Prefer compatible early-stage alternative prints, so Charizard δ uses the Lightning δ pre-evolutions when available.
- On evolution, Peal uses a real physical top-five and correctly enforces printed Special Energy attachment restrictions.
- Metal Burn discards Basic Metal to the Basic Energy discard ledger and attached physical Metal-providing Energy to real discard, while preserving Crystal Beach's effect on what types Special Energy provides.
- Keep 100/100 EX14 registered, 96 battle-enabled, and four original PARTIAL cards gated. No other game economies, files, signers, saves or minigames changed.

## Verification

New tests: `tests/v07210-crystal-charizard-physical-energy.test.cjs`. Prior v209 and surrounding deck-builder/EX tests should be rerun after extraction. These are Node state tests; no physical Android QA claimed.
