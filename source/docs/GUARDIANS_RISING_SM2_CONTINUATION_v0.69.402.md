# Guardians Rising SM2 — Battle implementation continuation (v0.69.402)

## Frozen inventory and coverage
- No source catalogue changes: 180 unique official prints, including 11 suffix-a variants, 287 printed attacks, 30 printed Abilities, 42 Pokémon-GX prints.
- Battle-ready prints expanded **101 → 146**; **34 remain gated**. This is not a full 180-card completion claim. See `docs/SM2_BUILD_COVERAGE.json` for their individual named blockers.
- Conservatively mapped attack descriptors by matching exact printed text, never just attack names. Previous Ancient Origins Thunder Rod hybrid exception and global Basic Energy search coin-flip rule remain unchanged.

## Verified shared mechanics
- Conditional attacks and calculations: Trashalanche opponent Item discard count, Facade when Burned or Poisoned, Finishing Stinger zero-damage legality, Karate Chop damage-counter reduction, Heavy Slam retreat reduction, Electromagnetic Rock Wrecker per-Lightning coin, Power Whip typed Energy count, Revelation Dance requiring Stadium.
- Choice and target effects: Raging Thunder one OWN Benched Pokémon, Bind Wound healing choice, Tapu Cure-GX heals exactly two different allies, Tractorbeam switches then damages chosen new Active, Supernatural Dance apportions discard counters, Beat Slider forces switching.
- Expanded GX: Turtonator Shell Trap and five discarded Fire Energy distribution (cannot create Energy), Alolan Ninetales Ice Path damage transfer, Wishiwashi Blue Surge redistribution, Sylveon Plea-GX returns two selected opposing Bench Pokémon, including attachments. Alternate collector prints use the same mechanics. GX once-per-game is preserved.
- Lunala Wings of the Moone moves both Basic and Special Energy to Bench with full conservation.
- Trainer effects: Hala (4 cards before using GX attack, 7 after); Max Potion (heal one damaged Pokémon, discard its attached Basic and Special Energy); Rescue Stretcher (either 1 discarded Pokémon into hand or 3 back into shuffled deck); Field Blower (up to 2 chosen Tools or Stadiums in any combination). Tested both printed variants.

## Mandatory gates and remaining work
- `tests/v07410-guardians-rising-continuation.test.cjs` contains 21 outcome-based regression tests and is included in `auditSM2ForApk` and `scripts/preflight-sm2-release.py --full`.
- `tests/v07409-guardians-rising-audit.test.cjs` independently executes every enabled printed attack through player and CPU action logic. Previous v07407/v07408 and v07404/v07406 Energy-search tests remain required.
- `scripts/preflight-sm2-release.py --full` asserts ≥146 enabled, all gated cards have named blockers, the pinned source checksum and player/CPU deck construction.
- Remaining incomplete effects include Stadium continuous rules, Choice Band passive Tool, some triggered Abilities and several unique choice/search attacks. Cards stay gated rather than displaying effects that do nothing.
- Local tests and source preflight do **not** constitute confirmation of the GitHub APK build. Verify its actual status after pushing.
