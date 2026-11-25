# Chilling Reign — completion (v0.69.510)

233/233 canonical prints playable, zero explicitly gated. Last three: Greedent #128 and Rugged Helmet #152/#228.

- Brazen Tail protects all friendly attached Energy from opposing Item and Supporter removal to hand, deck or discard. Pure Energy-removal Trainer choices are disabled while an unsuppressed Greedent is present. Shared discard handlers and historical mixed-effect handlers preserve unrelated parts: Flannery can remove Stadiums, Dangerous Drill can remove Tools/Stadiums, Thought Wave Machine still ends the turn, and Super Energy Removal 2 can still remove its user's Energy on tails. Attacks, Ability effects, Lost Zone effects and transfers between Pokémon are not blocked.
- Rugged Helmet queues a mandatory defender-controlled Energy return when the Active holder is damaged by an opposing attack, even on KO. It uses the existing pre-KO reaction queue, respects Tool suppression and preserves exact Special Energy references. Basic Energy uses the engine's existing per-type aggregation and canonical basic-card reconstruction; there is no separate basic Colorless Energy card. The CPU can resolve the reaction and resume the turn.
- Updated exact-completion assertions and release contract; 233 prints, 251 attacks, 44 Abilities, 59 Trainer prints, 6 Energy prints. The static readiness check is complete, not an independent card-by-card gameplay audit.

Independent whole-set audit, cross-era edge cases outside the covered paths, GitHub APK compilation and device testing remain separate.

Full preparation: 1,669/1,669 test invocations; 126/126 Chilling Reign, 12/12 release manifest unit tests, zero failed/skipped/cancelled.
