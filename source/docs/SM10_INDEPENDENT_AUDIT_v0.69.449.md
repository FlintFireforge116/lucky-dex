# Unbroken Bonds — independent gameplay audit (v0.69.449)

## Scope

Audited the supplied v0.69.447 repository overlaid with the completed v0.69.448 patch. The pinned SM10 generator retains 238 official prints, 338 printed attacks, 53 Abilities, 47 GX prints (26 TAG TEAM), 40 Trainers, two Special Energy prints, and zero gated prints. Inventory is not an exhaustive interaction proof.

## Corrected gameplay

- **Force Canceler:** Ice Path-GX previously removed damage counters from its own attacker before checking that the destination was protected. Counter movement now checks the receiving Pokémon's effect and counter-placement protections first. This is atomic: the source is not healed if the destination cannot receive the counters. Both players are tested against active Celesteela-GX, including alternate prints, GX status and spread counters, forced KO/shuffle, energy discard, and the Power Plant control. Attacker-side GX effects still resolve; boosted Double Blaze-GX can bypass defending damage prevention.
- **Ultra Forest Kartenvoy:** the primary attack resolver now propagates the active-only Ultra Beast bypass into the shared matchup routine and a number of historical hardcoded defensive modifiers. Previously legacy Tools (e.g. Eviolite) and passive reductions (e.g. Palossand) could still reduce the damage. Tests cover a non-Ultra Beast control, ordinary printed weakness, and both owners. This is not a blanket removal of the defender's state and does not disable its unrelated effects.
- **Extra-Tight Press:** distinguish printed damage counters from generic retaliation damage. Metal Goggles blocks these counters on a qualifying Metal Pokémon; Stealthy Hood does not block an attack-imposed retaliation. Direct main damage, repeated main damage, and the generic spread/selected-multiple-target damage handlers check actual damage and the marker. A counter-placement attack must not trigger retaliation. Tests cover generic Bench damage and Jet Punch's multi-target route with a seeded retaliation marker; these are engine isolation fixtures, not a claim that a normal switch preserves an Aggron attack effect.
- **Stealthy Hood:** the generic opposing Ability target check recognizes Hood in addition to the existing legacy mutation guard. Added provenance for generic Ability suppression and older direct reactive status mutations, protected selected bespoke reactive paths (including Dark Sandslash Poison Payback), and preserved independent attack/Tool sources. Poison Barb overwrites previous Ability poison provenance. Tests distinguish actual opposing Ability effects, suppressed Tools, and existing damage.
- **Discovery-GX:** independent shortage test verifies an insufficient deck cannot partially replace Prize cards; GX expenditure still occurs.

## Limits and decisions

This is a targeted independent outcome audit and correction pass, not proof of every historic card pairing. Older persisted saves without provenance, continuous Ability locks, additional bespoke damage/counter handlers, weakness/resistance-altering effects, and copied-attack edge cases still merit future coverage. Surprise Fist retains the seeded opposing move adaptation rather than an explicit human defensive input on CPU turns. Hypnotic Reign retains the existing copy recursion restriction. No full Android APK/device verification is claimed. Keep the new audit file in both Gradle and Termux gates; do not replace the original full-set sweep or weaken prior checks.

## Local verification

Full `prepare-sm10.sh` completed successfully: SM10 214/214 (including 32 independent outcomes), DET1 48/48 and historical regression 30/30. Separate SM9 full preflight passed 117/117. Total 409 tests, zero failures or skips across these four suites. All default historical release preflight scripts also exited successfully; their default scope is not exhaustive full historical testing. Gradle source checks passed. No Android APK was built locally.
