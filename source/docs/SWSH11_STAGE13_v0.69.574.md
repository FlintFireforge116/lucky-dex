# Lost Origin stage 13 — v0.69.574

217 imported, 211 playable, six gated. Radiant Steelix #124 and Panic Mask #165 are enabled; all 209 previously playable definitions are unchanged.

- Destructive Finish discards the actual top cards of the physical deck until one remains, counting both Basic and Special Energy for +30 each. The last card and the finite Energy Zone remain untouched. Preview uses the possible Energy count without exposing the order or mutating the battle. CPU evaluation penalizes deck depletion unless a winning knockout is available; this is a heuristic, not exhaustive endgame planning.
- Panic Mask blocks damage only from opposing attackers at 40 or fewer remaining HP, including dynamic max-HP modifiers. It does not prevent attack effects and respects existing Tool suppression. Moved the existing maximum HP implementation into the shared effects module so the battle core and defensive guard use one calculation.
- Eight new bilateral outcome tests; focused suite 208/208, manifest tests 12/12. Six prints remain gated: Orbeetle #20, Enamorus V #82/#178 and Thorton #167/#195/#210.
- APK/device verification separate.

Full release preparation passed: 3037/3037 gameplay test invocations, including 512/512 exact Astral Radiance CI-equivalent tests and 208/208 Lost Origin tests; 29 source gates.
