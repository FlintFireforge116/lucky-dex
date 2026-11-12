# EX Dragon Frontiers — completion audit v0.69.213

**Date:** 12 November 2026  
**Baseline:** v0.69.212 (82/101 enabled; 19 gated)  
**Result:** **101/101 registered, battle-enabled and available to CPU deck generation**, subject to continued real-device validation.  
**Source requirements:** `LUCKYDEX_MASTER_RULES.txt`, updated to v2.7.

## Previously gated cards now implemented

The following cards were enabled only after completing the named selection/turn/target handling. The 26 state-level tests in `tests/v07213-ex-dragon-frontiers-completion.test.cjs` cover them, alongside 38 pre-existing Dragon Frontiers tests.

| Card | Verified mechanic |
|---|---|
| 1 | Ampharos δ — Holon Veil |
| 2 | Feraligatr δ — pre-damage Drag Off |
| 5 | Milotic δ — Sharing |
| 8 | Ninetales δ — Volunteer / Trick Tail |
| 10 | Snorlax δ — Dozing / Bedhead |
| 11 | Togetic δ — Delta Copy |
| 12 | Typhlosion δ — Shady Move |
| 64 | Smoochum δ — Alluring Kiss / Baby Evolution |
| 74 | Holon Legacy — delta Power/Weakness suppression |
| 76 | Island Hermit — face-up Prize cards |
| 91 | Dragonite ex δ — Deafen / Dragon Roar overflow |
| 93 | Gardevoir ex δ — Imprison / Flame Ball |
| 94 | Kingdra ex δ — Extra Smoke / Energy Link |
| 95 | Latias ex δ — Fellow Boost |
| 97 | Rayquaza ex δ — Rage Aura |
| 98 | Salamence ex δ — Dual Stream / Type Shift |
| 99 | Tyranitar ex δ — Shock-wave markers |
| 100 | Charizard ★ δ — distinct Energy recovery / Dark Swirl |
| 101 | Mew ★ δ — Mimicry / Rainbow Wave |

## Shared engine changes

- Optional Power choices are offered before physical deck or hand mutations; "up to" selection can stop early without an extra action.
- Opponent Bench promotion for Drag Off takes place before calculating the hit; once-per-turn effects and other response effects retain state through the turn as printed.
- Damage counters, direct damage, and damage boosts use the appropriate ordering and Bench visual events; Fighting Weakness can double a 10-point Extra Smoke reduction to 20 apparent HP difference.
- Ex15 Holon Veil applies dynamically while its owner has an unsuppressed Ampharos; Holon Legacy and Imprison restrict Powers without accidentally deleting the Pokémon or Energy.
- A copied attack cannot infinitely copy its own copy action; target selection and Energy cost are checked with the original attack where required.
- Ninetales Trick Tail can attach selected discarded Energy to the chosen Active or Bench Pokémon, not just Ninetales.
- Charizard ★ cannot take back the exact discarded Energy in the same Rotating Claws action, including Basic Energy stored as per-type discard counts.

## Checks and limitations

- Selected recent EX-era suites `v07205`–`v07213`: **167/167 tests passed** after the changes, including 26 Dragon Frontiers completion checks.
- Previous v0.69.212 CPU-generated deck samples across all nine archetypes were retained; cards once blocked are now eligible for builder selection.
- This is a code-level and automated outcome audit, not a guarantee about every possible interaction. **Android visual/touch testing and prolonged Advanced/Expert CPU games have not been performed.**
- **EX Crystal Guardians' four previously partial cards are still gated** and have not been promoted by this release.
- The original `EX_DRAGON_FRONTIERS_v0.69.212_RULES_AUDIT.md` is retained as historical evidence of the 82/101 staged build.
