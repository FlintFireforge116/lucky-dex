# LuckyDex v0.69.194 — EX Unseen Forces remaining card-effects pass

**Required base:** v0.69.193; **install folder:** `~/lucky-dex/source/`. This is a source-relative, changed-files-only patch. This release has not been tested on physical Android hardware.

## Scope

- 58 previously PARTIAL EX10 entries implemented and made available; catalogue now reports **145 / 145 battle-enabled cards**, 124 Pokémon, 16 Trainers, 5 Special Energy and **196 attack records**. This does NOT guarantee all edge-case cross-set interactions are error-free.
- Handles EX10 triggered abilities: Baby Evolution, Eevee Energy Evolution, Ampharos Energy Connect, Porygon2 Tool retrieval, Slowking Item Search, Smeargle Makeover, Aipom Snappy Move, evolution-entry abilities (Blissey ex, Espeon ex, Typhlosion ex, Umbreon ex), knockout and attack-response abilities (Poliwrath, Ho-Oh ex, Lugia ex), others.
- EX10 Tool and Special Energy interactions: Energy Root, Curse Powder, Fluffy Berry, Protective Orb, Solid Rage, Sitrus Berry, Boost, Cyclone, Warp. Energy Root's +20 HP is not disabled by its own Pokémon ability lock.
- Distinct Unown A–Z, !, ? Hidden Power behaviours and shared Shuffle Power; preserve card identity and printed restrictions.
- Fixes focused Quilava auto decks to include both Cyndaquil and the now playable EX10 Typhlosion rather than stranding the Stage 1.
- Printed Basic/hand/Zone/discard routing uses master rules 1.9; no intentional Pocket rules change.

## Verified automated tests (Node)

- `tests/v07190-classic-unseen-forces.test.cjs`, `tests/v07191-unseen-forces-attack-sweep.test.cjs`, `tests/v07191-unseen-forces-cpu-ai.test.cjs`, `tests/v07192-unseen-forces-batch.test.cjs`, `tests/v07193-classic-evolution-dual-armor.test.cjs`, `tests/v07194-unseen-forces-remaining.test.cjs`: **78 passed, 0 failed**.
- EX Deoxys, EX Emerald, mixed Classic Energy routing: **112 passed, 0 failed**.
- Selected older Base/Jungle/Fossil: **34 passed, 0 failed**.
- Deterministic attack sweep resolves available actions/choices but does not validate every exact printed outcome or every possible position. This release has no physical-device touch pass and no exhaustive CPU-vs-CPU multi-set campaign.

## Suggested in-game checks

1. EX10-only Fire deck focused on Quilava: verify Cyndaquil + Quilava + Typhlosion are present, then test a CPU Fire deck.
2. Evolve Eevee with Water or Lightning from **hand** and verify matching evolution selection. Validate Typhlosion ex evolution-triggered Fire acceleration vs the ordered Energy Zone.
3. Blissey ex evolution healing, Sitrus Berry between turns, Energy Root HP bonus while its Power is disabled, Unown's Shuffle and nontrivial Hidden Powers, including the letter-specific choices.
4. CPU Advanced/Expert turns: meaningful Supporter and hand Energy decisions, no stuck Resume flow with EX10 search/recovery/Tool effects.

## Known limitations

- Node checks are not a substitute for Android device testing.
- The wider historical Neo suite was not rerun as part of this particular release; older recorded Neo failures are separate.
- Any new printed-rule discrepancy found in live play should be fixed and added to the master regression suite before the next expansion.
