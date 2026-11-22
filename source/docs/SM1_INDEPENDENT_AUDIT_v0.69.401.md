# LuckyDex v0.69.401 — Sun & Moon (SM1) independent card audit

Baseline: successful GitHub Actions v0.69.400b build (run #696); this audit overlay is a new APK version.

## Scope and source
- 173 pinned official physical prints, including Eevee #101a; 238 attacks, 26 Abilities, 27 Pokémon-GX and GX attacks; 13 physical Energy prints.
- Printed attack names, costs, damage text, HP, types and Ability names checked individually against pinned `data/classic/sm1-print-compact.json`.
- GX rules verified live: one GX attack per player even after switching to another Pokémon-GX, and two individual physical Prize choices after a GX knockout. Older sets and deck quality remain build gates.

## Three reproduced independent gameplay defects fixed
1. **Toxapex #63 — Toxic Spikes**: the voluntary retreat handler referenced `foeSide` before its block-scoped declaration. Retiring into a new Active while opposing Toxapex was in play raised a `ReferenceError` instead of inflicting Poison. `foeSide` is now established before any retreat checks. Two live `core.applyAction` regressions exercise both the normal and Ability-suppressed paths.
2. **Alolan Dugtrio #87 — Tangling Hair**: the shared Retreat Cost function used a Boolean existence check, adding only one Colorless no matter how many unsuppressed opposing Alolan Dugtrio were present. It now counts each actual in-play source and discounts suppressed copies. Live `core.retreatCost` regression covers two sources and suppression.
3. **Pyukumuku #47 — Innards Out**: the triggered Ability registration lacked `activeOnly`. It could trigger on Bench knockouts even though the printed rule requires Pyukumuku to be Active. The shared triggered-Ability `activeOnly` guard is now enabled for this printed ability.

## Mandatory regression gate
- Added seven tests in `tests/v07401-sun-moon-independent-audit.test.cjs` to both SM1 `--full` preflight and Gradle `auditSM1ForApk` (not a local-only test).
- No printed cards were gated and no changes were made to the Energy Zone, GX cost/prize system, or deck-builder policy.
- Verify in Termux with `python3 scripts/preflight-sm1-release.py --full` and prior XY12, XY11, XY10 preflights before pushing.
- GitHub APK outcome for v0.69.401 must be checked after user push; passing local tests cannot certify the Android build.
