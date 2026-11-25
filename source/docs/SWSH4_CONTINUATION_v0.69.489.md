# Vivid Voltage continuation — v0.69.489

188/203 playable (+10 prints), 15 explicitly gated. Exact canonical signatures remain pinned. Newly enabled: Celebi (9), Shaymin (15), Zarude V (22/167), Cramorant (40), Zapdos (48), Garbodor (111), Galarian Perrserker (113), Telescopic Sight (160/203).

- Amazing Bloom reuses the staged evolution selection path, restricted to distinct Benched Pokémon, including newly played Pokémon; no hand-evolution trigger or second evolution of the same target. Hidden-deck search can be declined.
- Flower Bearing shuffles the removed Pokémon and attachments as a group below the existing unchanged deck. Uses the existing hybrid physical Basic Energy reconstruction.
- Jungle Rising attaches real Basic Energy cards from hand to Bench only, with shared healing and actual-heal tracking for each successful attachment. CPU takes available optional choices; the usual healing prevention still applies.
- Thunder Snipe targets only V/GX, discards all attached Energy before damage, and is unavailable without a legal target under the existing target-selection convention.
- Continuous Gulp Missile chooses among Arrokuda on the bounded physical Bench, discards chosen stacks and attachments without awarding Prizes, and scales by chosen Pokémon count. Beginner CPU scoring prefers sufficient damage rather than excess discards.
- Trash Cyclone counts and recycles actual Tool cards in discard; Stealy Claws reveals the opposing hand and permits attacker-selected Trainer discards up to the coin-head count.
- Telescopic Sight reuses the shared Bench matchup function; excludes Active, ordinary Pokémon, own Bench, and damage counters. Respects existing Tool suppression. Older bespoke damage paths and copied attack choice/timing remain audit priorities.

Verification: current full release preflight 77/77 (18 new bilateral outcomes); static Gradle and version parity passed; full SM1 release preflight 67/67. Android APK and exhaustive historical compatibility have not been verified. The remaining 15 prints are intentionally gated; see the updated gap ledger. In particular, do not approximate spectral/typed suppression, restricted setup placement, pre-damage tool payments, or HP/Prize changes.
