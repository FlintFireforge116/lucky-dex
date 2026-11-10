# LuckyDex Classic TCG — EX Unseen Forces CPU, Energy and metadata audit

**Date:** 2026-11-10  
**Baseline:** v0.69.190  
**Patched version:** v0.69.191  
**Scope:** ex10's currently battle-enabled subset plus shared Classic AI turn decisions; Pocket rules unchanged.

## Verified defects repaired

1. **Normal hand attachments overlooked by AI.** The CPU considered Classic `attach` (Energy Zone) but not `attachSpecial` (physical Basic or Special Energy card from hand) when scoring actions and before committing to an attack/end turn. It could search/draw/recover Energy into hand and leave it there. Both allowances remain independent, as required by C-ENERGY rules.
2. **EX Unseen Forces Energy Recycle System could raise `invalid damage mode`.** The 1-to-hand/3-to-deck choice stored an internal `mode:'hand'|'deck'` in a `neoRule`, colliding with generic damage-effect schema validation. Use `recoveryMode` for this internal state. Outcome tests check both paths, deck growth and discard consumption.
3. **Optional choice bias.** The Classic CPU previously selected Skip automatically for many beneficial optional results. In ex10 it now selects legal recovery/heal/target choices for Energy Search, Energy Recycle System, Potion, Flareon's Fire Dance, Jolteon's Energy acceleration, Lanturn's Energy Stream, Onix's Dig Deep, Unown Q and selected board-search actions. It remains permitted to decline costly or disadvantageous effects such as Ampharos discarding all Lightning Energy.
4. **Useless Trainer plays.** Avoid EX10 Potion on fully healed targets, Energy Recycle System with no Basic Energy discarded and draw Supporters when the deck is empty. The CPU may still use legal Supporters to draw, then attach the fetched Energy in the same turn if its normal hand allowance is unused.
5. **Deck-building metadata.** Correct role metadata for Energy Recycle System (`energy`/`recovery`), Energy Search (`search`/`energy`), Mary's Request (`draw`), Potion (`healing`) and Unown Q/Sunkern searches (`energy`/`search`). These annotate genuine supported effects, not guessed abilities.

## Automated checks actually run

- **296/296 passed** across recent Classic expansion suites (v07170–v07191), including new AI tests and the full ex10 executable-attack smoke sweep.
- **All 89 currently executable ex10 attacks** complete with resolvable choices in deterministic simulated board states (a smoke check, **not** all branches or printed-effect proof).
- **44/44 passed** from selected older Base/Jungle/Fossil Classic suites.
- **3/8 passed** from two older Neo Discovery suites; five failures are identical on unchanged v0.69.190 and patched v0.69.191 (one old version assertion, four older Energy/coverage expectations). These were not weakened to force a pass.
- Additional combined older test runner stalled in the source snapshot; individual older test suites completed and are reported above.
- Standalone historic Pocket test couldn't load an absent `scripts/lib/tcgp-normalize.cjs` helper in this source snapshot. No full Pocket CPU QA is claimed.
- No physical Android, browser touch, production APK or user-save integration testing performed.

## Deliberately unchanged / still open

- The complete ex10 catalogue has **145 cards**. Only **65 cards / 89 attacks** are currently marked FULL/battle-enabled; **80** continue to be PARTIAL and barred from legal battle decks. This CPU/metadata patch does not unlock unfinished Pokémon-ex, Pokémon Star, Unown or Trainer effects.
- CPU strategy is heuristic, not a proof of optimal tournament play. Additional combinations and some opponent-choice effects may still require focused tests.
- The manual **Resume CPU** UI remains as a recovery affordance; this patch removes one reproduced underlying effect exception and many skip/attachment mistakes. It does **not** prove every browser-presentation stall is eliminated.

## Suggested on-device test

1. Construct a battle-ready ex10 CPU deck including **Energy Search**, **Mary's Request**, **Potion** and **Energy Recycle System**.
2. Let CPU search Basic Energy; confirm it makes a legal **hand attachment** when available, separately from its Energy Zone attachment.
3. Give CPU a damaged Pokémon; confirm Potion actually heals the chosen Pokémon, while it does not waste Potion when undamaged.
4. Seed two or three discarded Basic Energy and check Energy Recycle System: **1 to hand**, or **3 shuffled into actual draw deck**.
5. Watch a longer CPU turn and confirm it doesn't ask for Resume when those card effects resolve; capture the event, card and game phase if a different stall recurs.

## Rules maintenance

`docs/LUCKYDEX_MASTER_RULES.txt` updated to 1.6 with C-AI-ENERGY-001, C-AI-CHOICE-002, C-AI-HEAL-003 and a specific exception-regression for EX10 Energy Recycle System. Update these, the set notes and outcome tests alongside future changes.
