# Guardians Rising SM2 — Independent Battle & Deck Audit

**Project:** LuckyDex · **Release family:** 0.69.402 (audit overlay, no version bump) · **Set:** Sun & Moon Guardians Rising (SM2)

## Frozen official print inventory

- 180/180 collector print records accounted for, including 11 alternate `a` prints.
- 287 printed attacks, 30 printed Ability occurrences, 42 GX prints and four Energy prints.
- Source: bundled `data/classic/sm2-print-compact.json`, checked against pinned checksum in `scripts/sm2_release_contract.json`.
- Attack costs (types and quantities), names, effect text, HP, weakness, resistance, retreat, GX award and alternate print identity are verified for every Pokémon print against the bundled official catalogue.

## Audit result

- **101 of 180 prints battle-enabled** (previously 57); **79 gated** for incomplete effects.
- Every enabled attack executed via the actual `tcgp-battle-core.js` legalAction/applyAction pipeline for player and CPU. Follow-up choices, postattack handoff and exactly one attack event were checked. These are synthetic battle tests, not exhaustive live-play proof.
- Dedicated edge-case tests cover tails/heads/no-Energy discard effects, multi-Pokémon damage, confusion, count-of-Trainers attack, GX protection and 100-poison ticks, Victory Star rerolls, Geotech System choice/once-per-turn and Golisopod EX/GX bonus.
- Player and CPU 30-card SM2 decks generated from multiple random seeds. Basic Energy hybrid coin-flip regression tests stay mandatory through Gradle and full release preflight.
- Any print with unimplemented attack, Ability, Stadium, Item, Tool or Supporter is **fully gated**, not silently simplified or made a no-op. In particular, Sludge Shock's healing block and Finishing Stinger's situational damage are *not* yet safe to enable.

## Still blocked

- **79 prints** have unresolved effects; individual card IDs and exact blocker names are recorded in `docs/SM2_BUILD_COVERAGE.json`. Counts by *blocking reasons* (a print can have multiple): {'Unimplemented Ability': 9, 'Unimplemented attack': 64, 'Unimplemented Trainer rules': 20}.
- Specific mechanics still requiring dedicated work include reactive GX attack abilities, Energy redistribution, deck/hand exchanges, and stadium/tool continuous rules.
- This audit does **not** claim full 180-card battle playability. It checks all collector records for printed fidelity and fully tests the 101 enabled prints in the stated synthetic conditions.

## Mandatory gates

- `python3 scripts/preflight-sm2-release.py --full`: regenerates the bundled catalogue, asserts at least 101 enabled prints and runs SM2 integration, independent audit, deck quality, and cross-era Basic Energy coin-flip tests.
- `node --test tests/v07409-guardians-rising-audit.test.cjs`: direct player/CPU and specific GX/Ability regressions.
- `app/build.gradle` `auditSM2ForApk` runs all relevant suites before APK resource merging.

## Future changes

When implementing any of the 79 gated prints, preserve printed costs and conditions, avoid unlocking unsupported mechanics, add a dedicated regression covering both sides and any choice follow-up, then run this entire source and runtime audit before updating coverage.
