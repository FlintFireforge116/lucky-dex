# LuckyDex Plasma Storm (BW8) — Master checklist audit

**Patch:** v0.69.313 (audits v0.69.312). **Date:** 20 November 2026.

## Verified coverage

- Official pinned BW8 source (Git blob `5ae56545ca722ef9ebfee78ae434ce416efa4277`): **138/138** numbered English prints, **194** printed attacks, **20** Ability entries; **137 battle-enabled**, Togekiss #104 Bright Veil **intentionally gated**.
- Generated static scanner: **0 catalogue errors, 0 schema warnings**, **78 review flags**, generic synthetic smoke **144/416 exercised; 270 skipped**. Generic smoke skips and review flags are *not* completed gameplay validations.
- **96/96** local automated tests passed across original BW6, BW7, BW8 and independent BW8 checklist tests.
- **315/315** CPU 30-card decks (9 type selections × 35 seeds) are legal with no orphan evolutions, additional ACE SPECs or non-eligible prints.

## Confirmed rules defects repaired

| Affected card/system | Problem | v0.69.313 correction |
|---|---|---|
| Team Plasma Grunt #125 | Another copy of the same card was excluded as a discard-cost payment | Distinct physical copies are accepted, checking hand index instead of card ID |
| Dowsing Machine #128 | Unplayable when no Trainer was already in discard even if a Trainer could be discarded as the required cost | Correct pre-play eligibility; mandatory two chosen card discards still occur before the recovery choice |
| Donphan #72 — Wreck | Opponent-owned Stadium was sent to the attacker’s discard | Physical Stadium goes into its original owner’s discard with UID intact |
| Weezing #58 — Smogbank; Cubchoo #40 — Hail | Bench splash damage was assigned raw, bypassing attacks guards and Eviolite | Uses the standard Bench attack-damage handler; adds Eviolite damage reduction for eligible Basic Benched targets |
| Clefable #98 — Moon Guidance | Could evolve a newly benched or already-evolved Pokémon on that turn | Applies evolution timing guard and records resulting evolution/event |
| Scramble Switch #129 | Selecting **Done** in the optional Energy transfer could reopen the menu indefinitely | Done exits, with no extra Energy moved |
| BW8 CPU metadata | **26** Pokémon incorrectly tagged as Energy acceleration because the text contained “attached” | Actual acceleration roles restricted to Victini-EX #18/#131, Manaphy #34, Vanilluxe #37, Magnezone #47 and Blastoise #137 |

## Build and remaining validation

The patch changes only files relative to `source/` and includes the pinned BW8 compact source and generated catalogue so no download is required to build the set once installed. `scripts/prepare-bw8.sh` and the Gradle BW8 gate now run the independent checklist suite.

**Still requires manual / on-device validation:** 78 static review flags, skipped generic smoke actions, rare opponent responses, ability timing chains and actual UI prompts. The v0.69.312 GitHub build reportedly succeeded; v0.69.313 has **not** yet been built or tested on Android.
