# Pokémon TCG Pocket card coverage

Cutoff: **2026-10-30 (Europe/London)**. Generated offline from reviewed MIT imports plus independently transcribed current card facts. This report does **not** claim every card is fully implemented. Unsupported cards are excluded from legal battle decks.

| Measure | Count |
| --- | ---: |
| Included expansion/promo namespaces | 26 |
| Known collectible prints | 4547 |
| Released/obtainable prints | 4534 |
| Canonical gameplay identities | 2450 |
| FULL | 2450 |
| PARTIAL | 0 |
| UNSUPPORTED | 0 |
| Unmapped released prints | 0 |
| Unknown effect references | 0 |
| Schema errors | 0 |

FULL means every recorded mechanic compiles to a validated handler. PARTIAL means detailed rules exist but at least one mechanic or data-quality check remains unsupported; those cards are not enabled. UNSUPPORTED means detailed combat data is unavailable. External asset keys identify exact prints/reprints, but never invent missing rules. Each classification applies to the entire card, not merely its simplest attack.

Released print status: FULL 4534, PARTIAL 0, UNSUPPORTED 0.

## Change from supplied v0.69.36

FULL 1707 → 2450; PARTIAL 743 → 0; UNSUPPORTED 0 → 0. Resolved identities: 743. Previously FULL regressions: 0.

## Unique gameplay coverage per set

Each row counts unique gameplay once within that set; cross-set reprints can legitimately appear in multiple rows.

| Set | Prints | Gameplay | FULL | PARTIAL | UNSUPPORTED | Enabled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 286 | 225 | 225 | 0 | 0 | 225 |
| A1a | 86 | 68 | 68 | 0 | 0 | 68 |
| A2 | 207 | 155 | 155 | 0 | 0 | 155 |
| A2a | 96 | 75 | 75 | 0 | 0 | 75 |
| A2b | 111 | 73 | 73 | 0 | 0 | 73 |
| A3 | 239 | 182 | 182 | 0 | 0 | 182 |
| A3a | 103 | 83 | 83 | 0 | 0 | 83 |
| A3b | 107 | 83 | 83 | 0 | 0 | 83 |
| A4 | 241 | 185 | 185 | 0 | 0 | 185 |
| A4a | 105 | 85 | 85 | 0 | 0 | 85 |
| A4b | 379 | 215 | 215 | 0 | 0 | 215 |
| P-A | 117 | 113 | 113 | 0 | 0 | 113 |
| B1 | 331 | 266 | 266 | 0 | 0 | 266 |
| B1a | 103 | 83 | 83 | 0 | 0 | 83 |
| B2 | 234 | 183 | 183 | 0 | 0 | 183 |
| B2a | 131 | 99 | 99 | 0 | 0 | 99 |
| B2b | 117 | 71 | 71 | 0 | 0 | 71 |
| B3 | 234 | 178 | 178 | 0 | 0 | 178 |
| B3a | 109 | 88 | 88 | 0 | 0 | 88 |
| B3b | 106 | 78 | 78 | 0 | 0 | 78 |
| B4 | 233 | 179 | 179 | 0 | 0 | 179 |
| B4a | 110 | 86 | 86 | 0 | 0 | 86 |
| B4b | 429 | 237 | 237 | 0 | 0 | 237 |
| P-B | 103 | 101 | 101 | 0 | 0 | 101 |
| C1 | 217 | 144 | 144 | 0 | 0 | 144 |
| P-C | 0 | 0 | 0 | 0 | 0 | 0 |

## Release audit and known source gaps

Checked 31 October2026. This reviewed inventory remains through30 October2026. [Official release information](https://pokemon.gamespress.com/en-GB/Dual-type-Cards-to-Debut-in-Pokemon-TCG-Pocket-with-new-Dual-Fusion-Ex) dates Special Pack: First Partners to31 October; its card-by-card inventory and exact gameplay joins are not in the supplied reviewed source. It is a known released source gap, not a claim of complete latest-release coverage. Individual Promo C availability exclusions remain date-based.

## Included sets

- A1: Genetic Apex (2024-10-30)
- A1a: Mythical Island (2024-12-17)
- A2: Space-Time Smackdown (2025-01-29)
- A2a: Triumphant Light (2025-02-28)
- A2b: Shining Revelry (2025-03-27)
- A3: Celestial Guardians (2025-04-30)
- A3a: Extradimensional Crisis (2025-05-29)
- A3b: Eevee Grove (2025-06-26)
- A4: Wisdom of Sea and Sky (2025-07-30)
- A4a: Secluded Springs (2025-08-28)
- A4b: Deluxe Pack: ex (2025-09-30)
- P-A: Promo A (2024-10-30)
- B1: Mega Rising (2025-10-30)
- B1a: Crimson Blaze (2025-12-17)
- B2: Fantastical Parade (2026-01-29)
- B2a: Paldean Wonders (2026-02-26)
- B2b: Mega Shine (2026-03-26)
- B3: Pulsing Aura (2026-04-28)
- B3a: Paradox Drive (2026-05-28)
- B3b: Everyday Wonders (2026-06-30)
- B4: Ruler of the Skies (2026-07-30)
- B4a: Team Rocket’s Ambition (2026-08-27)
- B4b: Deluxe Pack: Mega (2026-09-30)
- P-B: Promo B (2025-10-30)
- C1: Dual Fusion (2026-10-29)
- P-C: Promo C (2026-10-29)

## Excluded previews

- P-C-001: Not obtainable by cutoff
- P-C-002: Not obtainable by cutoff
- P-C-003: Not obtainable by cutoff
- P-C-004: Not obtainable by cutoff
- P-C-005: Not obtainable by cutoff
- P-C-006: Not obtainable by cutoff
- P-C-007: Not obtainable by cutoff
- P-C-008: Not obtainable by cutoff
- P-C-009: Not obtainable by cutoff
- P-C-010: Not obtainable by cutoff
- P-C-011: Not obtainable by cutoff
- P-C-012: Not obtainable by cutoff
- P-C-013: Not obtainable by cutoff

## Missing or unsupported mechanic families


## Remaining mechanic-family navigation

Groups can overlap; exact individual blockers remain authoritative.

| Family | Blocked identities |
| --- | ---: |

## Every non-FULL gameplay identity

| ID | Card | Status | Exact reason |
| --- | --- | --- | --- |

See `TCGP_CARD_DATABASE.md` for source licences, update commands, validation and limitations. Machine-readable card/print lists are in `generated/tcgp-card-coverage.json`.
