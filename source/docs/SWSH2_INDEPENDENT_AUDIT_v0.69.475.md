# Rebel Clash independent audit — v0.69.475

Reviewed the pinned 209-print catalogue and effect mappings against the included printed text, plus core handling of turn-start choices, suppression, physical Energy, switching, and secondary damage. All 209 prints remain enabled. No new set was introduced.

## Corrections
- Screen Cleaner prevents non-damage effects, not Blizzard's spread damage or Max Bullet's selected Bench damage. The shared damage paths explicitly distinguish these hits from effects; other damage guards remain in place.
- Malamar V's Drag Off uses the existing switch-before-damage attack primitive, with its own 30-damage amount (historical Drag Off defaults to 50). With no opposing Bench or a prevented switch it does no damage to the original Active. Damage is resolved against the new Active using normal attack calculation.
- Nugget's start-of-turn use now shares Classic Item lock legality with regular Items, including ex5-100's active prohibition, Chilling Breath and Founja hand restrictions. Top Entry is not treated as a hand Item.

## Independent tests
22 additional tests, mirrored in player and opponent orientations: both damage-only Screen Cleaner paths, Drag Off success and absent target, three historical Nugget lock cases, Training Court ledger recovery without Zone consumption, full Bench Top Entry, Neutralizing Gas deactivation on Bench, and the existing lone-Active Scoop Up Net restriction.

The latter restriction is deliberately retained for the hybrid rules: do not permit a voluntary Trainer removal of the last Pokémon. Recursive copied attacks remain excluded by the existing safety guard. Full printed semantics of every cross-era interaction, actual UI play and Android compilation have not been exhaustively verified. The new independent test file is wired into both the Gradle audit task and the full Termux preflight; historical tests remain enabled.

## Verification
- 130/130 Rebel Clash integration, outcome and independent-audit tests passed through `preflight-swsh2-release.py --full`; all 283 attack prints are exercised from each orientation by the smoke suite.
- 157/157 Sword & Shield and shared deck-performance regression tests passed in a separate completed invocation.
- Broader regression invocation reached 591 passing test results without a reported failure before the local execution timeout; it is not a completed pass and overlaps the focused run.
- Version guard, current-set source/coverage/Gradle/Termux parity and generator passed. All 22 contract version strings synchronized. Historical source gate sweep not rerun to completion in this audit. Full nested Termux prepare, complete APK regression and actual Android build remain unverified.
