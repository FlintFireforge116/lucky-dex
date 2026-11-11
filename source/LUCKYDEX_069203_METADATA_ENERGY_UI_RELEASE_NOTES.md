# LuckyDex v0.69.203 — card synergy and Energy picker audit

Baseline: v0.69.202. Date: 2026-11-11.

## Coverage reviewed

The shared deck-planning metadata classifier was exercised over **3,348 installed Classic cards** (2,802 Pokémon; 3,249 currently battle-enabled). Every card now passes a shape/metadata extraction check. This does **not** imply that every printed conditional interaction across all expansions has been exhaustively verified in a live battle.

### Optional in-play partners

The existing evolution-aware builder is supplemented with rule-derived, optional partner relationships. It identifies named Pokémon or Stadiums that improve an attack or Poké-Power/Body merely by being in play or on the Bench. It deliberately does **not** treat these as a mandatory requirement to run the attacker.

Examples:
- EX Emerald Regice ex (ex9-98) / Regirock ex (ex9-99); Regirock ex / Registeel ex (ex9-100); Registeel ex / Regice ex.
- EX Delta Species Latias δ / Latios; Illumise / Volbeat.
- EX Legend Maker Lunatone / Solrock; Omastar / Kabuto, Kabutops; Kabutops / Omanyte, Omastar; Gorebyss / Huntail.
- EX Hidden Legends Castform variants / named weather Stadiums.

The scan currently identifies **21 cards with explicit named optional partners across five expansion IDs**. It excludes misleading phrases such as a Pokémon referencing itself, generic Pokémon types, opponents, or solo effects. Other strategic relationships (such as colorless support, healing teams, evolution chains, Energy activation and tool dependencies) remain covered by separate metadata/build rules; these are not counted as 'named in-play partner' relationships.

Optional partner selection runs *after* the main evolution line and evolution support; it cannot consume the deck builder's seeded RNG stream or force a new Energy type just because a Bench partner has unrelated attack costs. The optional inclusion rate is 70% in competitive generation and 40% in random, with a deterministic per-seed roll; selection still respects permitted sets and ownership. Example: Regice ex Water decks can include Regirock ex on the Bench without adding Fighting Energy.

### Energy-picker UI / battle effects

- The Classic battle card-choice overlay now renders eight Basic Energy prints (Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal) as card art when the option represents one of those Energy types, including prefixed text such as `Find Metal Energy`. Non-card actions remain text.
- Both Classic and Pocket deck editors use the same eight card images in their Energy picker.
- Generic legacy Energy-option generators previously limited to six types now expose Darkness and Metal where the printed effect permits any Basic Energy type. Rules that name a specific subset of types were not widened.
- The type picker is wired to the existing Energy Zone attachment logic, not merely painted as extra buttons.

## Tests

- 159/159 targeted and adjacent historical tests pass (tested after the additional full catalogue audit assertion).
- Repeated Regice ex-focused Water deck generation tests confirm valid 30-card decks, optional Regirock ex inclusion, and no unrequested Fighting Energy.
- Existing Delta Species evolution line test preserved after moving optional partner support behind required line selection.
- No on-device Android interaction test was performed here; verify touch sizes/art loading on the installed build.
