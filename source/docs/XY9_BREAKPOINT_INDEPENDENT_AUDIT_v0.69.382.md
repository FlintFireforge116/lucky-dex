# v0.69.382 — XY9 BREAKpoint independent rules audit

Baseline: v0.69.381 completion, all 126 official prints mapped.

## Confirmed correction

**Raticate #88 / Raticate BREAK #89 — Antibodies**: prevention of new Special Conditions worked, but cleanup of pre-existing conditions after Garbotoxin suppression was removed did not. Reproduced with Poisoned Raticate and equipped Garbodor, then removed Garbodor's Tool. Fixed using an opt-in `preventStatus.clearExisting` continuous rule. No generic blanket changes to other printed immunities. BREAK inherits the previous card's passive and cleanup via `upgradeAbilities`.

Also corrected Android versionCode to 7382, matching versionName 0.69.382; the permanent preflight now enforces the formula.

## Audit coverage added

- Meganium Overgrow HP threshold and source-scoped damage modifier.
- Golduck BREAK Hyper Transfer finite Basic Energy moves and Special Energy exclusion.
- Raticate BREAK inherited Antibodies with temporary Garbotoxin suppression and restoration.
- Ferrothorn Spike Lash Active attack damage and independent Bench damage.
- Precise print-rule mapping assertion for Antibodies.
- Source-only preflight, earlier XY9 stage tests, older XY regressions and post-generated 126-card audit in Gradle.

This audit improves representative cross-mechanic coverage; it cannot guarantee every combination of all 126 cards. GitHub success must be checked separately after push.
