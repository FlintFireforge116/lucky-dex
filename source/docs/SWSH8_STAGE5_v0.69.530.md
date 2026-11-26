# Fusion Strike stage 5 — v0.69.530

Canonical catalogue unchanged: 284 official prints, 391 attacks, 30 Abilities. Enabled prints: 258 (+24); 26 remain gated. All 234 previously enabled descriptors compare equal with v0.69.529. The generator continues to use the immutable pinned source; no changes to its raw card rows.

## Shared mechanics

- Conditional attack cost overrides (Accelgor and Galarian Darmanitan) use the actual current-turn move or damage state. Huntail adds a Colorless cost to opposing Single Strike Pokémon; the core now honors positive typed attack-cost modifiers as well as negative ones, including the previously imported Mawile effect.
- Shared OR card filter allows mixed Pokémon/Supporter recovery without broadening the pool to other Trainers. Muddy Maker and Red/Blue Assist use physical hand Energy, restrict permitted types and recipients, and are once-per-turn. Existing hybrid deck-search logic is reused, including the Energy Zone coin gate; not replaced with unconditional Zone acceleration.
- Greedent VMAX marks Turn a Profit for the attack's turn only; two extra Prizes require an attack damage KO of a Basic. Oricorio's Lesson in Zeal is a non-stacking, Fusion Strike-specific damage reduction. Dunsparce's Weakness protection applies on either board and is suppressible. Hoopa's Two-Faced is calculated continuously without altering printed card metadata; friendly damage counters do not count as recoil or opposing damage.
- Battle VIP Pass uses the acting side's first-turn restriction, not the global turn number. Other additions include three coin-dependent discards, conditional extra Bench damage (Heatmor retains its printed Active damage), previous-turn species attack bonuses, optional card recovery, energy search/attachment, and deck-top inspection.
- Focused outcome tests cover both sides. The full source catalogue and earlier cards remain intact. Espeon VMAX's Solar Revelation mapping now exists, but its local V evolution parent is missing, so the print remains explicitly gated. No claim that Fusion Strike is finished. The remaining paired Items, Fusion Strike Energy and conditional/suppression interactions are tracked in the gap ledger.
- Android APK compilation and physical-device testing are outstanding.

Final v0.69.530 validation: full offline preparation exited 0; 2054/2054 gameplay checks, including 81/81 Fusion Strike checks; 12/12 manifest unit tests. Zero failures, skips or cancellations.
