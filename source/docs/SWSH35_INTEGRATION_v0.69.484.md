# Champion's Path first integration — 0.69.484

All 80 official prints, 89 attacks and 12 Abilities imported from the pinned Pokémon TCG data revision. The compact catalogue matches the independently retrieved length and FNV-1a checksum; its SHA-256 is fixed in the offline generator. 75 enabled, 5 gated. The print signature and effect validator gates are mandatory; all alternate-art pairs preserve descriptors.

Shared mechanics: same-target typed discard acceleration, healing-turn damage bonus, Bench-only counter allocation, Active-only Energy attachment reaction, protection against V/GX attack damage, Fighting discard count, conditional Basic attack lock, Piers damage bonus. Both sides have smoke and outcome tests. Existing hybrid rules remain unchanged. Swelling Pulse reuses the existing heal-turn marker; older bespoke healing effects that do not set that marker need a later independent audit. No new deck-builder scan or performance design.

Outstanding: Alcremie VMAX (Adornment and G-Max Whisk), Galarian Obstagoon (Wicked Ruler), Rotom Phone, both Suspicious Food Tin prints. See gap ledger.

Verification: 27/27 current-set preflight; 434/434 focused recent-set and performance tests; 67/67 SM1 full preflight. Gradle source guard and release version parity passed. Android APK compilation and exhaustive historical gate sweep not run in this environment.
