# LuckyDex v0.69.272 — Supreme Victors Stage 2

Source base: v0.69.271. Official Supreme Victors (pl3) source archive and compact source are unchanged and SHA-locked.

- 153 authentic cards registered; 116 battle/deck-enabled, 37 gated pending further implementation.
- +32 battle-ready cards from the original 84. Cards with unverified printed mechanics remain excluded from battle and automatic deck construction.
- New multi-step `pl3:` attack and Power rules in the shared effect engine: physical-card discard recovery, typed Energy attachments, selected damage counters, forced switch with pre-damage target choice, attacker/defender hand-card conditions, Energy discard triggers, coin outcomes, and opponent-specific selection.
- Passive and triggered abilities include Drifblim FB Pump Up, Arcanine G Extreme Speed, Butterfree FB Compound Eyes, Dewgong Thick Fat, Roserade C Natural Cure, Swampert Root Protector, Ivysaur Evolutionary Pollen, Sandslash Dig Down, and Shedinja Marvel Shell.
- Champion's Room Stadium reduces retreat costs for Pokémon SP on both sides, without modifying other Pokémon.
- 13 dedicated Stage 2 outcome/deck checks added to Gradle APK prebuild gate, in addition to the Stage 1 full attack-resolution smoke.
- The Python generator and generated JS are BOTH bundled. CI regenerates the JS and reruns tests, ensuring a missing generator update cannot silently disable newer cards as happened previously.

**Known gaps:** 37 prints are visible but explicitly gated because their attacks, Powers, or Trainer effects require additional runtime handlers. A fully closed-loop card-by-card independent audit remains for the future completion pass; smoke tests alone do not prove every effect is exact in every board state. Some specialised set-only CPU Energy types may still lack enough compatible Pokémon to form 30-card decks.

**Manual testing priorities:** 1) Fighting Energy search via Sandslash Dig Down, 2) Ivysaur Evolutionary Pollen choices on hand evolution, 3) optional Swampert Drag Off before damage, 4) Regigigas FB unique SP-name damage, 5) Manectric G recovered Energy from discard, 6) Palmer's Contribution target selection, 7) Champion's Room symmetric retreat discount, 8) conditional Bodies under status suppression.
