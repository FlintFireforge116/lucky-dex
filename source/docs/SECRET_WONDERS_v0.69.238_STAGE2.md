# Secret Wonders — Stage 2 (v0.69.238)

**Scope:** Builds on v0.69.237 Stage 1. All 132 original Secret Wonders
collector-number prints remain registered; **72 are now playable**, with
**60 intentionally gated** pending complete rules handling.

## 26 new enabled cards

- 17 Roserade — sleep/poison, conditional coin bonus + healing
- 30 Jynx — previous-turn damage check and Smoochum-enhanced counter movement
- 33 Mothim — conditional damage and next-turn damage modifier; any Burmy form evolves
- 38 Sunflora — Grass-wide healing power, Petal Dance coin results
- 41–43 Wormadam Plant, Sandy, Trash Cloak — HP, effect prevention and Tool-dependent defenses
- 45 Breloom — Energy-dependent healing, retreat-based conditional damage
- 46 Charmeleon — Burn and conditional Fire Energy discard
- 57 Nidorino — next-turn damage modifier and Poison
- 59 Pinsir — retreat lock and two-coin Power Guillotine
- 60 Quagsire — active-only conditional Water Energy healing and bench damage
- 61 Raticate — coin-based bonus and Darkness bonus
- 65 Skiploom — evolved-opponent damage reduction and switch
- 68 Unown K — Kind heals enemy Active as printed
- 78–80 Burmy Plant, Sandy, Trash Cloak — Basic Energy recovery from discard
- 86 Duskull — Astonish coin, hidden random opponent hand-card reveal/return
- 95 Murkrow — targeted Feint Attack, ignores effects
- 104 Sentret — choice between top two deck cards, other to deck bottom
- 106 Shellos East Sea — search/Bench East/West Shellos
- 107 Shellos West Sea — discard Water Energy to heal fully
- 111 Spinda — top/bottom drawing and matching-energy condition
- 122 Professor Oak's Visit — draw three then choose hand card for deck bottom
- 126 Team Galactic's Mars — draw two, move random hidden opponent card to deck bottom

## Engine/metadata improvements

- Mothim may evolve from any of three Burmy Cloak Basics; Wormadam retains
  matching-Cloak-only evolution restriction, including deck construction.
- Typed-Energy threshold checks can optionally include actual Special
  Energy that provides that type (Plant Cloak and Aqua Healing).
- Distinct targeting for opponent Active/Bench and human choice prompts.
- Hidden-card transfers preserve the moved card reference rather than
  inventing or exposing another card.

## Verification and limitations

- Node outcome tests: `v07237-secret-wonders-stage1.test.cjs` and
  `v07238-secret-wonders-stage2.test.cjs`.
- Generated Classic auditor: `generated/classic-audit-dp3.{md,json}`.
- The two-sided action smoke test runs all **234/234 currently enabled
  attack/Trainer paths**, with zero skipped paths or catalog errors.
- Other previously completed sets are checked through separate regression suites.
- This is **not** an Android APK/device UI test, complete set, or proof of every
  printed card ruling. In particular, some hidden-hand reveal UI and other
  high-complexity abilities require further end-to-end testing.
- 60 still-gated cards must not be included in CPU decks. The staged
  smoke test uses a known-good external-set loaner for combat fixtures;
  it does **not** certify Secret Wonders-only CPU deck legality.

## Next pass

Prioritise the remaining card Powers/Abilities, Prize-state handling,
LV.X inheritance, copied Supporters and reactive KO effects, with
explicit player and CPU choice tests before enabling each card.
