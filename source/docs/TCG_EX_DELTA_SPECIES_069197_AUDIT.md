# LuckyDex v0.69.197 — EX Delta Species and EX Unseen Forces audit

## Scope and baseline

Base: v0.69.196. This is a focused **printed-rule and outcome audit** of EX Delta Species (ex11), with an EX Unseen Forces Unown damage correction. The existing 114 ex11 cards remain registered (95 Pokémon, 14 Trainers, 5 Special Energy). **82 are battle-ready; 32 remain PARTIAL and excluded from legal battles.** The 107 attack smoke cases for battle-ready EX11 Pokémon are retained. Unfinished Holon Pokémon-as-Energy and complicated triggered effects remain gated until implemented and independently tested.

## Confirmed gameplay issues corrected

1. **EX Unseen Forces Unown W (ex10-W) Hidden Power:** Previously a hardcoded `W:0` branch discarded the printed 20 base damage, whether or not card recovery occurred. Removed this zero-damage override, keeping the coin-flip discard-card-to-deck-top effect. Checked actual damage AND preview, plus fixed-20 variants K, O, T, V.
2. **EX Delta Species Shelgon δ (ex11-54) — Exoskeleton:** Poké-Body was present in card data but not applied. Damage is now reduced by 10 (after Weakness/Resistance), only when the Body operates.
3. **Secret Azumarill (ex11-114) — Thick Fat:** Poké-Body was present in card data but had no reduction. It now reduces incoming Fire/Water attack damage by 30 (after Weakness/Resistance), not Psychic damage. Body suppression remains shared.
4. **Vaporeon ex (ex11-110) — Evolutionary Swirl:** On evolving, the player may opt to shuffle the opponent's hand. Previously the engine always shuffled and drew four. The opponent now selects from zero to four cards after the optional shuffle, using opponent-owned effect choices.
5. **ex11 deck-building metadata:** Search abilities are tagged as search rather than blind draw; Gardevoir δ's Energy Jump is transfer, not acceleration; opponent hand disruption is not self-card draw; Holon Energy FF/GL/WP metadata now records its conditional Basic Energy activator types.

## Tests and results

The new `tests/v07197-unown-delta-audit.test.cjs` has 9 top-level checks: Unown damage, other fixed-20 Unown variants, two passive reductions, selected ex11 scaling and prerequisite attacks, deck meta, Vaporeon optional/opponent choice, and 12 simulated CPU matches across four difficulty levels.

Results: **209/209 recent EX-era + Energy + CPU tests passed**, including all nine newly added audit checks. A selected historical Base/Jungle/Fossil/Neo test run was **46/52 passing**: the same six tests fail in the untouched v0.69.196 baseline, with zero new failures in this comparison. These tests were executed in Node on the source, **not on an Android device**. Earlier v0.69.196 set integration tests are retained (including 107 ex11 attack-execution smoke cases), along with ex10/EX-era/Energy regressions. Passing attack smoke tests cannot prove each optional outcome, every matchup or touch interaction. Any unexpected match behaviour should be treated as a reproducible bug, not "working as intended" simply because the test runs.

## Not included

- No unrelated balance changes or new cards were unlocked.
- The 32 previously gated ex11 cards are not silently labelled fully implemented.
- Pocket battle Energy and hand-limit mechanics were not changed.
- No Android on-device tests or Play Store deployment were performed.

## Manual QA to prioritise

- Use EX Unseen Forces Unown W Hidden Power against a neutral target: verify preview and actual damage of 20 with and without eligible discard recovery.
- Attack a normal ex11-54 Shelgon δ with 40 damage to verify 30; attack ex11-114 Azumarill with Fire/Water and an unrelated type to verify only the former reductions.
- Evolve Eevee into Vaporeon ex while the opponent has a hand: select decline, then repeat and select shuffle; as defending player choose 0, 2 and 4 cards.
- Build a deck containing Holon Energy FF/GL/WP and confirm the builder considers the matching Basic Energy type rather than confusing the Special Energy with a Basic one.
