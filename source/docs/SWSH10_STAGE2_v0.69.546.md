# Astral Radiance stage 2 — v0.69.546

- Added 32 exact upstream prints (pinned blob `888a5253d3bf05bc4107d52742003ce42f1980f3`, second source packet FNV-1a UTF-8 checksum 1483015771). 112/216 imported, 108/216 enabled, 4 gated and 104 not imported. Added 32 playable prints: 31 new prints and previously gated Path to the Peak; 76 prior enabled descriptors unchanged.
- All three Radiant Pokémon enabled; one total Radiant across any deck, including alternate prints, one Prize, Rule Box status; player and CPU use shared deck building validation. Radiant Hawlucha's Big Match only from Bench vs opposing Active VMAX. Radiant Greninja uses Energy payment and distinct damage targets; Radiant Heatran damage scales with own counters.
- Palkia VSTAR Star Portal and Darkrai VSTAR Star Abyss share per-side VSTAR allowance; Star Portal restricts Water targets; Star Abyss recovers only Items. Machamp V/VMAX family, Gallade, Wyrdeer, Luxray V, Regieleki, Dialga V, Magnemite, Registeel, Bronzong, Adaman and further prints enabled.
- Path to the Peak alternate print reuses existing suppression, including Radiant Rule Boxes. Fang Snipe may attack without a Trainer in opposing hand; selected disruption remains restricted to Trainers. Magnetic Catch recovers only Metal from physical discard and Classic Basic Energy ledger. Preserved hybrid Energy policy.
- Four gated prints: Drifblim, Kleavor V, Unidentified Fossil and Double Turbo Energy. All unverified effects remain deck-ineligible. Trainer Gallery separate. Double Turbo legacy damage paths remain incomplete in both sets.
- Focused tests: 37/37 passed, including attack smoke tests on both sides, all six original single-type pools plus Lightning and Metal and Radiant mixed-pool decks. Android APK and device testing not performed. Cross-set exhaustive outcome testing remains outstanding.

## Final validation
Full offline preparation `sh scripts/prepare-swsh10.sh` exited 0: 2350/2350 gameplay checks, 37/37 Astral Radiance and 179/179 Brilliant Stars/Gallery tests. No failures, skips or cancellations. All 12 release-manifest unit tests passed.
