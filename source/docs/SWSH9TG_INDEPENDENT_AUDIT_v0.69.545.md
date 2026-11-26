# LuckyDex Classic audit — swsh9tg

**Status:** No definite catalog/schema failures; 0 warnings; 0 follow-up flags.

**Coverage:** 30/30 enabled, 0 gated. 37 attacks, 12 named abilities; 14/30 IDs mentioned in test files (mentions are not proof).

**Source contract:** `docs/LUCKYDEX_MASTER_RULES.txt`.

## Mechanical risk inventory

| Category | Cards needing scenarios |
|---|---:|
| choice | 16 |
| privacy | 4 |
| timing | 3 |
| energyMovement | 10 |
| status | 3 |
| deckSearch | 9 |
| coin | 0 |

## Generated CPU decks

12/16 legal 30-card decks; 4 explicitly unsupported type/seed combinations, 0 failures.

## Synthetic battle action checks

Not requested (run with --smoke).

## Definite failures and warnings

None identified by these checks.

## Needs manual rule / UI review

Risk tags are prompts for scenario tests, not automatic implementation failures. 26 cards flagged.

- **swsh9tg-TG03 Octillery** — choice, privacy, deckSearch
- **swsh9tg-TG05 Zekrom** — status
- **swsh9tg-TG06 Dusknoir** — energyMovement
- **swsh9tg-TG07 Dedenne** — status
- **swsh9tg-TG08 Alcremie** — energyMovement
- **swsh9tg-TG09 Ariados** — choice, status
- **swsh9tg-TG10 Houndoom** — choice, energyMovement, deckSearch
- **swsh9tg-TG11 Eevee** — choice, privacy, deckSearch
- **swsh9tg-TG12 Oranguru** — choice
- **swsh9tg-TG13 Boltund V** — choice, energyMovement, deckSearch
- **swsh9tg-TG14 Sylveon V** — choice, privacy, deckSearch
- **swsh9tg-TG15 Sylveon VMAX** — energyMovement
- **swsh9tg-TG16 Mimikyu V** — choice, timing
- **swsh9tg-TG18 Single Strike Urshifu V** — choice, timing, deckSearch
- **swsh9tg-TG19 Single Strike Urshifu VMAX** — energyMovement
- **swsh9tg-TG20 Rapid Strike Urshifu V** — choice
- **swsh9tg-TG21 Rapid Strike Urshifu VMAX** — energyMovement
- **swsh9tg-TG22 Umbreon V** — timing
- **swsh9tg-TG23 Umbreon VMAX** — choice
- **swsh9tg-TG24 Acerola's Premonition** — choice, privacy
- **swsh9tg-TG25 Café Master** — choice, energyMovement, deckSearch
- **swsh9tg-TG26 Gloria** — choice, deckSearch
- **swsh9tg-TG27 Rapid Strike Style Mustard** — choice
- **swsh9tg-TG28 Single Strike Style Mustard** — choice, deckSearch
- **swsh9tg-TG29 Single Strike Urshifu VMAX** — energyMovement
- **swsh9tg-TG30 Rapid Strike Urshifu VMAX** — energyMovement

## Card ledger

| Print | Status | Attacks | Powers | Risks | Test-file mentions |
|---|---|---:|---:|---|---:|
| swsh9tg-TG01 Flareon | enabled | 1 | 1 |  | 1 |
| swsh9tg-TG02 Vaporeon | enabled | 1 | 1 |  | 1 |
| swsh9tg-TG03 Octillery | enabled | 1 | 1 | choice, privacy, deckSearch | 1 |
| swsh9tg-TG04 Jolteon | enabled | 1 | 1 |  | 1 |
| swsh9tg-TG05 Zekrom | enabled | 2 | 0 | status | 0 |
| swsh9tg-TG06 Dusknoir | enabled | 1 | 1 | energyMovement | 2 |
| swsh9tg-TG07 Dedenne | enabled | 1 | 0 | status | 1 |
| swsh9tg-TG08 Alcremie | enabled | 1 | 1 | energyMovement | 1 |
| swsh9tg-TG09 Ariados | enabled | 1 | 1 | choice, status | 0 |
| swsh9tg-TG10 Houndoom | enabled | 1 | 1 | choice, energyMovement, deckSearch | 1 |
| swsh9tg-TG11 Eevee | enabled | 2 | 0 | choice, privacy, deckSearch | 0 |
| swsh9tg-TG12 Oranguru | enabled | 1 | 1 | choice | 0 |
| swsh9tg-TG13 Boltund V | enabled | 2 | 0 | choice, energyMovement, deckSearch | 0 |
| swsh9tg-TG14 Sylveon V | enabled | 1 | 1 | choice, privacy, deckSearch | 0 |
| swsh9tg-TG15 Sylveon VMAX | enabled | 2 | 0 | energyMovement | 0 |
| swsh9tg-TG16 Mimikyu V | enabled | 1 | 1 | choice, timing | 0 |
| swsh9tg-TG17 Mimikyu VMAX | enabled | 2 | 0 |  | 1 |
| swsh9tg-TG18 Single Strike Urshifu V | enabled | 2 | 0 | choice, timing, deckSearch | 1 |
| swsh9tg-TG19 Single Strike Urshifu VMAX | enabled | 2 | 0 | energyMovement | 0 |
| swsh9tg-TG20 Rapid Strike Urshifu V | enabled | 2 | 0 | choice | 1 |
| swsh9tg-TG21 Rapid Strike Urshifu VMAX | enabled | 2 | 0 | energyMovement | 1 |
| swsh9tg-TG22 Umbreon V | enabled | 2 | 0 | timing | 0 |
| swsh9tg-TG23 Umbreon VMAX | enabled | 1 | 1 | choice | 0 |
| swsh9tg-TG24 Acerola's Premonition | enabled | 0 | 0 | choice, privacy | 1 |
| swsh9tg-TG25 Café Master | enabled | 0 | 0 | choice, energyMovement, deckSearch | 1 |
| swsh9tg-TG26 Gloria | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh9tg-TG27 Rapid Strike Style Mustard | enabled | 0 | 0 | choice | 0 |
| swsh9tg-TG28 Single Strike Style Mustard | enabled | 0 | 0 | choice, deckSearch | 0 |
| swsh9tg-TG29 Single Strike Urshifu VMAX | enabled | 2 | 0 | energyMovement | 0 |
| swsh9tg-TG30 Rapid Strike Urshifu VMAX | enabled | 2 | 0 | energyMovement | 0 |

## Boundaries

- A valid effect object or a passing synthetic attack does **not** prove that printed damage, targets, optionality, Energy sources, or KO timing are correct.
- An ID appearing in a test file is only static evidence; a human must verify the test checks outcomes on both sides.
- The auditor does not execute Android UI, animation, coin-display or real-device tests.
- Resolve high-risk flags with source-card verification and focused deterministic battle tests before claiming complete certification.

