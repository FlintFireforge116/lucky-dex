# Darkness Ablaze independent audit — v0.69.483

All 201 printed cards remain enabled; the generator is unchanged.

## Findings and repairs

- Powerful Colorless Energy and Struggle Gloves were applied through the generic main-attack damage modifier. Deferred selected-target attacks (Salamence VMAX Sonic Double) bypassed that calculation. Move the two bonuses to the opposing Active target boundary so each applies exactly once, before Weakness/Resistance, including deferred multi-target damage. Preserve normal preview, ignore-Weakness and copied attack paths; do not boost Bench hits or create damage for a zero-damage attack. Struggle Gloves consults the current weakness and shared Tool suppression.
- Glimwood Tangle's snapshot wrapper could offer a reroll after a failed attack declaration, notably confusion. Limit its trigger to attack-side non-status coins, excluding failed declarations and known pre-attack checks. The existing replay engine still replays the full action, including successful pre-attack checks; fully separating those RNG streams and unusual downstream coin effects is outstanding. Do not claim every historical coin interaction is correct.
- Added independent bilateral tests for stacked bonuses on Sonic Double, Swoop Across and preview, weakness overrides and Tool suppression, failed confusion, Sky Field leaving play while Eternal Zone stays active, and temporary type change disabling and restoring Eternal Zone. Type conversion trim test preserves the converted Pokémon to ensure the five-slot fallback is actually exercised. Existing hybrid Bench conventions remain unchanged.

## Verification

- Offline catalogue generator: 201/201, zero gates; 274 attack prints, 32 Ability prints.
- Current full release preflight: 147/147 (12 new tests).
- Recent Sword & Shield, Rebel Clash, Sky Field, and deck performance regression: 296/296.
- Actual SM1 Gradle gameplay test group: 48/48.
- Static Gradle guard and version parity passed; new test file included in both Termux and Gradle preflight.
- APK compilation, on-device checks, exhaustive historical placement/coin interactions and full historical gameplay sweep not verified. Known old test failures from v481 not changed.
