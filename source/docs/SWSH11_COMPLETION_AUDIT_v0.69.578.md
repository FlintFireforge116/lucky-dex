# v0.69.578 — Lost Origin independent completion audit

## Scope and outcomes

- 217/217 prints enabled, 278 printed attacks and 42 named Ability prints. No battle definitions or shared battle-engine files changed since v577.
- Independent registry/schema check: 0 errors, 0 warnings. 16/16 narrow-pool CPU deck generation checks pass.
- All 634 synthetic player/opponent attack and Trainer invocations execute; no skipped actions or unresolved choices. Initially Honchkrow exceeded the smoke resolver's choice limit because the board artificially contained 108 Energy. The revised Lost Origin fixtures provide reasonable Energy amounts, physical discard resources, Lost Zone thresholds and valid Bench/Tool targets. The focused outcome tests independently verify the cards' behaviour rather than treating smoke execution as rules proof.
- Six additional bilateral outcome tests: Honchkrow Night Cyclone preserves Basic counts and Gift / Double Turbo Energy physical identities across two recipients, and applies the Double Turbo modifier; Dark Patch requires a discarded Basic Darkness Energy and an eligible Darkness Bench recipient; the Lost Origin Collapsed Stadium print trims the owner's Bench first, gives no prizes and restores the usual cap when removed.
- 21 review flags in the independent scanner are the expected no-op descriptors for separately implemented passives/Tools/Stadiums. They are not catalogue errors. The focused suite exercises Elder Tree Barrier, Scorching Aura, Netherworld Gate, Guardian of Love, Crisis Muscles, Lost Block, Cursed Message, Wild Style, Poison Peak, Metal Lodging, Unfazed Fat, All Just a Dream, Box of Disaster, Lake Acuity, Lost City, Panic Mask, Windup Arm, and Collapsed Stadium. Alternate prints use shared hooks. The reports are `SWSH11_INDEPENDENT_AUDIT_v0.69.578.json` and `.md`. Smoke tests and these focused outcomes are not exhaustive proof of every cross-era rule interaction or Android UI behaviour.

## Silver Tempest source preparation (not gameplay registration)

- Upstream PokemonTCG/pokemon-tcg-data pinned commit `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`, main-set blob `a57779d463a4f8ddf2bc21ad4ae66e9f4c3eaac2`. Separate Trainer Gallery blob `6a4c0bf2e1ac88309c213702dcc6142d11811e72` is recorded but not imported.
- Full upstream inventory: 215 prints, 280 attack prints, 38 Ability prints (including Tool-granted powers), 35 Trainer prints, 3 Special Energy prints.
- First 65 Pokémon and all 38 support prints transferred in 3 verified JSONL packets. `python3 -B scripts/swsh12_source.py` verifies exact packet checksums and all 103 staged IDs. Remaining 112 Pokemon prints not yet transferred. Nothing from SWSH12 is registered or battle-enabled.
- Plan for subsequent implementation: conservative reuse of exact shared descriptors, explicit handling of VSTAR powers granted by attached Tools (including Forest Seal Stone's Ability, not just its rules text), V Guard nonstacking, Regenerative Energy evolution trigger, Trainer targeting/choices, and repeat-print parity. No stage-one APK gate or set contract until an actual generator and bilateral gameplay tests are present.

## Release validation

Full preparation passed: 3,097 passing gameplay invocations, zero failures, five generated-catalogue skips (XY3). Astral Radiance CI-equivalent 512/512 and Lost Origin 240/240. All 12 manifest unit tests passed. Actual APK and device validation remain separate.
