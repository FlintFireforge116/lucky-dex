# Astral Radiance stage 11 — v0.69.555

216/216 imported, 215 playable, one gated. All 214 formerly playable print definitions deeply equal to the v0.69.554 generated catalogue.

## Hoothoot #120 — Stand Sentry

Original printed restriction: Basic Energy attached to friendly Benched Pokémon cannot be discarded by an opposing Item or Supporter. A live, unsuppressed Hoothoot may be Active or Benched. Do not extend the protection to Special Energy, Active attachments, opposing attacks/Abilities, self costs or unrelated Trainer effects.

The engine uses a synchronous scoped Basic-attachment view only for the audited arbitrary-target opposing Energy-discard Trainer families (Energy Removal, Super Energy Removal, Energy Removal 2, Crushing Hammer, Plumeria, Wait and See Hammer). Protected Basic units are unavailable during action enumeration and effect resolution, including legacy direct writes; the original attachment map is restored in `finally`, before returning to the UI. Pending choices contain exclusion UIDs, not a hidden mutated board. The Energy-source choice generator observes both slot exclusions and Basic-only exclusions. No target choices may be generated for entirely protected Energy. A mixed slot still offers its actual Special Energy card. An explicitly selected protected Basic cannot fall back to a different card.

Bilateral outcome tests exercise all 16 enabled prints in these families: base1-79/92, ecard1-140, ex1-80, ex6-89, ex10-82, ex16-74, bw2-92, sm1-115, sm3-120/145, sm5-166, sm8-192/236, swsh1-159, sv1-168. Additional outcomes cover Ability suppression, Active Energy, attacks, Enhanced Hammer and Boss's Orders. Six new test invocations, with multiple fixtures per test. These are source-level tests, not physical-device interaction checks.

## Double Turbo Energy — remaining gate and concrete reproduction

Both swsh9-151 and swsh10-216 remain gated. The shared outgoing modifier already handles ordinary Active damage, Bench/spread paths that route through it, provided Energy and suppression. Legacy bespoke attacks can still bypass it. Using one synthetic physical Double Turbo Energy attachment (`provides:{Colorless:2}`), no Weakness/Resistance or other modifiers, and selecting an opposing Bench target, the following diagnostics reproduced on BOTH sides:

| Print | Attack | Printed damage | Expected with one DTE | Actual |
|---|---|---:|---:|---:|
| ex10-102 | Snap Tail | 30 | 10 | 30 |
| ex11-82 | Dig Under | 10 | 0 | 10 |
| dp7-99 | Voltage Shoot | 80 | 60 | 80 |

These intentionally failing diagnostics are not part of the release regression suite because the card remains gated. Convert them into permanent positive outcome tests when the routes are corrected. Audit legacy selected-hit helpers (EX Dragon Frontiers, Crystal Guardians, Holon Phantoms, Legend Maker, Delta Species), direct no-matchup hits, field spread, copied attack resolution, damage-difference calculations and delayed choice hits. Trace each to the printed rule before changing it: damage counter placement, self damage, Abilities, recoil and retaliation are not equivalent to outgoing attack damage. Check Mudslide's cost/choice continuation separately. Do not use blanket damage-delta subtraction after resolution: it gives wrong Weakness/Resistance, zero-floor and counter-placement outcomes. Apply each unsuppressed physical DTE copy before W/R, once per opposing damage hit; preserve friendly damage, attachment identity, suppression and previews. Keep both prints gated until the remaining direct paths are covered by bilateral outcomes.

Repeatable diagnostic: `node scripts/audit-double-turbo-legacy.cjs --both`. The retained JSON report records 422 candidate invocations (211 patterns per side), 360 exercising damage, 50 with no damage and 12 unexercised errors. There are 154 raw mismatches (77 per side); these are candidates for manual printed-rule review, not 154 confirmed bugs. Damage counter placement, poison, compound hits and other non-attack damage can produce false positives. The three simple cases above are confirmed bypasses. The diagnostic is not a release gate while DTE is disabled.

## Release validation

Full offline preparation exited 0: 2495/2495 gameplay test invocations, including 182/182 Astral Radiance checks. Manifest unit tests: 12/12. APK compilation and device testing remain outstanding.
