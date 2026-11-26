# v0.69.561 — Lost Origin stage 2

- 145/217 exact main-set prints imported, 94 playable, 51 gated, 72 not imported. 40 additional Pokémon (66–105) from pinned blob `157da08c0435be1c0692faac35e3a7580e638afb`, packet FNV-1a `3181807879`; compact SHA-256 `e0164d0cb7a4d7b2f7e59042834b90bcd2cb710b7ddf3b4a3bf2c86d2f20bd8c`.
- 27 newly playable; all 67 previously playable card definitions are byte-equivalent when serialized. Double Turbo Energy remains enabled in both previous sets.
- Flower Selecting shares physical top-deck selection with Colress but uses two cards, keeps one, loses the rest, and is Active-only. Lost Mine requires ten real Lost Zone references; Haunter and Sableye use repeated counter choices, not attack damage. Counter placement respects counter protection and effect protection.
- Loving Veil, Very Vulnerable, Worst Gift, Alluring Dance, Hurricane Shock, Muscular Slap, Into the Deep and Battle Step use existing battle descriptors. Battle Step uses one hybrid Basic Energy search flip per requested Energy, with optional recipient choice rather than additional pre-flips. No other Energy Zone rules changed.
- 46 focused tests passed, including 22 new bilateral outcome checks; Android/APK verification separate. Remaining printed effects are fail-closed, see current gap ledger.
