# Shining Fates and Shiny Vault completion — v0.69.497

73/73 main-set prints and 122/122 Shiny Vault prints enabled; zero gated. Eight newly enabled prints: Ditto V and VMAX in both collections, both Ball Guy prints, Rusted Shield and Rusted Sword.

- V Transformation selects an enabled Basic Pokémon V from the discard pile, respects shared placement restrictions and preserves slot identity, attached cards, damage, conditions, locks and turn history. The discarded Ditto replaces the chosen physical discard reference. Max Transform uses the shared copied attack pathway and recursive copy safety guard.
- Ball Guy offers up to three distinct Item names containing Ball; it cannot select alternate prints of an already chosen name. Optional choices can end early; shuffle afterward.
- Rusted Shield uses the name-filtered continuous HP modifier. Rusted Sword uses the target-aware Active damage bonus with effective Tool checks. CPU Tool recipient matching reserves them for the matching species. CPU Ball Guy accepts useful selections; V Transformation uses a conservative static HP and printed damage heuristic and declines transformations that would immediately KO the source.
- Added 13 outcome checks, including both controllers, alternate arts, Ability/Tool suppression, copied attacks, physical state preservation and CPU choices. Existing integration/smoke suites now exercise every enabled print. Both release contracts require complete coverage.

Verified exact `sh scripts/prepare-swsh45.sh`: exit 0, 1421/1421 test invocations, zero failures/skips/cancellations, 27/27 source gates. Current-set suites 53/53. Android APK and exhaustive historical interaction verification not run. Independent whole-set audit remains next. Ditto's interaction with other once-per-turn Ability history on the transformed slot and copied unusual historical attack effects are audit priorities; existing UID-based Ability tracking and recursive copy guard retained.
