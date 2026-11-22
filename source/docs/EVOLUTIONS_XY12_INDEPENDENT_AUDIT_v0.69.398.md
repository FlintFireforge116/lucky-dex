# LuckyDex v0.69.398 — Evolutions XY12 independent gameplay audit

## Basis and coverage

Audit performed against the locally reconstructed **v0.69.397** completion overlay and its checked-in pinned XY12 source (`7e80c06b0f3e5621058a29e26c90023d1033e65f`). GitHub Actions run **692** confirmed the starting v0.69.397 APK was successful. This patch remains unconfirmed on GitHub until the user's next push.

All **113/113 official prints** remain enabled (83 Pokémon, 20 Trainer, 10 physical Energy). Exactly **129 printed attacks**, **11 printed Ability instances**, **four Pokémon BREAK** and zero dual-type prints were retained. Alternate-art Mewtwo-EX reuses the same correct logic. No deliberately unsupported XY12 prints have been introduced.

## Confirmed independent defects and corrections

1. **Raichu #36 — Spark Bolt.** The original `chooseOption` placed a `bonusDamage` inside an effect resolved *after* attack damage calculation. Selecting the printed +70/discard path could throw `bonusDamage must resolve as part of an attack.` It now presents two legal attack-action choices and calculates **70 or 140** damage during attack resolution, before applying an optional, source-specific `discardEnergyCard` pending effect. The bonus is unavailable without attached Energy. Basic and actual Special attachments are discarded correctly.
2. **Mewtwo-EX #52, alternate #103 — Energy Absorption.** The old generic `attachEnergyFromDiscard` offered only Basic type counters. It could not attach a discarded **Special Energy card**, contrary to the printed “an Energy card from your discard pile.” The XY12 handler now offers individual physical Energy cards, including Double Colorless Energy #90, and individually discarded virtual Energy Zone Basic units. It preserves card identity for Special Energy, uses the proper `provides` mapping, does not select other players' discards, and does not turn a physical Special card into a basic Energy Zone counter.

## Independent testing

- `tests/v07398-evolutions-independent-audit.test.cjs` (eight tests): printed effect support; both Spark Bolt options and no-Energy edge case; discard of Basic and Special attachments; Energy Absorption for both print variants, physical Basic, Double Colorless, virtual discard and invalid targets; and **64 reproducible automatic deck-building trials** across two styles.
- A further standalone sampling of **128** Evolutions single-set player deck builds (64 seeds × competitive/random): all completed as valid 30-card decks, missing zero attack Energy types and triggering zero current dead-Trainer warnings. This samples quality; it does not prove ideal card synergies in every battle state.
- Required `scripts/preflight-xy12-release.py --full` invokes all old and new XY12 tests and the **cross-set 30-card deck-quality regression**; `auditXY12ForApk` invokes the same tests during Gradle.
- XY11 and XY10 full release preflights and global energy audit were also run for regression safety.

## Remaining limits

No Android SDK/Gradle build was executed for v0.69.398 in this container: **confirm the new GitHub Actions run**. Automated test sampling does not exhaust every cross-era effect pairing. The physical-action novelty cards have the documented digital adaptations retained from v0.69.397. The special Energy recovery handler is general for cards labelled `kind:'energy'`; historical Holon Energy Pokémon are outside the XY12 printed set and may warrant separate cross-era tests.
