LuckyDex v0.69.201 — Conditional Attack Energy Metadata and Auto Builder Audit

Builds on canonical LuckyDex v0.69.200 unpacked source.

Identified bug: EX Delta Species Slowking #28 (Psychic Option, CC) was
selected as Stage 1 support for pure Lightning CPU decks even though its
Water (+20 damage) or Psychic (discard opposing Special Energy) clauses
could not activate. Its Prize Shift Power still works independently.

Changes
- EX Delta Species Slowking stores preferred Energy [Water, Psychic] and
  structured alternative attack payoffs. The Energy conditions are NOT
  treated as required attack costs or as a change to the printed Water type.
- Shared metadata infers self-Pokémon attack Energy conditions across other
  sets, including EX Deoxys Breloom, Claydol and Magcargo.
- Auto builder no longer inserts unpowered conditional-only Stage 1 support
  lines just because their attacks can be paid with Colorless Energy.
- Printed Water or conditional Psychic allows Slowking as a focused family.
- A deliberate Water/Psychic type pair is kept in the Energy Zone.
- CPU validates conditional Energy synergy for themed opponent selection.
- Synergy reports warn when a hand-built deck has a conditional attack whose
  Energy payoff is inactive, while keeping such decks legal.

Tests: 76/76 targeted and nearby checks passed, including Delta Species and
Holon rules. The historical all-card-pool random/competitive suite did not
finish within the execution cap; its result is not asserted as a pass.

Important: previously saved decks do not auto-rebuild. Regenerate the
Lightning opponent/player deck to test the change.
