# Battle Styles — v0.69.499 first integration

- Canonical source: PokemonTCG/pokemon-tcg-data, cards/en/swsh5.json, revision `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, blob `41dbfbb564cdae9a8aca473b02589dcc18c8e351`. Compact source SHA-256 is recorded in SWSH5_CANONICAL_SOURCE.json. Offline reconstruction matched the canonical compact FNV-1a checksum `0a93e972`.
- 183 printed cards, 122 enabled, 61 gated. See generated coverage and gap ledger for individual print IDs and precise blockers.
- Both player and CPU deck pools and collection ownership mapping are integrated. Preserve strike labels as printed metadata on Pokemon, Trainers and Energy, rather than inferring them from names. The pinned source marks Korrina's Focus full-art 160 Single Strike while other prints are Rapid Strike; metadata is retained from the pinned source pending independent verification.
- Single/Rapid Strike Urshifu V and VMAX, Octillery shared once-per-turn search, Emboar's stacking target-aware Active-only attack damage bonus, Falinks, Tower of Waters and several Trainers are enabled. G-Max Rapid Flow uses actual Energy removal and distinct target choices.
- 25 integration and outcome tests, including bilateral attack execution, shared Ability limits, damage stacking/suppression and Bench exclusion.
- Luxray Electrostep remains gated because its target damage and self-switch choices need to coexist. Strike Energy, Scroll Tools, Houndoom, Empoleon and other unimplemented mechanics remain gated rather than silently omitted.
- Independent whole-set audit, exhaustive cross-era interactions, Android compilation and physical-device testing are separate.
- Exact `sh scripts/prepare-swsh5.sh` completed with exit code 0: 1454/1454 test invocations, zero failures/skips/cancellations, all 28 release-source gates passed.
