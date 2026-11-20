# LuckyDex v0.69.310 — Black & White Boundaries Crossed

## Release coverage

- **Source:** PokémonTCG/pokemon-tcg-data `cards/en/bw7.json`, pinned as the 153-print compact roster in `data/classic/bw7-print-compact.json` with generator integrity SHA-256.
- **Cards:** 153/153 numbered prints enabled: 135 Pokémon and 18 Trainers, including the full-art and secret print variants.
- **Printed combat text:** 216 attacks and 21 Abilities mapped, including six standard and six full-art Pokémon-EX prints; the two-Prize EX rule remains in effect.
- **First ACE SPEC cards:** Computer Search, Crystal Edge, Crystal Wall, Gold Potion. Deck validation enforces no more than one ACE SPEC card in total, regardless of its print or name. Both the player and CPU deck paths share this constraint.
- **Collection + UI:** Black & White Boundaries Crossed is in the Classic set picker, card registry, collection, deck builder and CPU set filters. The displayed app and Android version are v0.69.310, Android versionCode 7310.

## Executable mechanics and safeguards

The custom handlers include Rush In, Sinister Hand, Crystal Edge/Wall, Allergy Panic, Stickiness, Sentinel, Sturdy, Town Map, the four ACE SPEC Trainers, Hugh with actual opponent-first hand discards, Energy Search, Skyla, Computer Search and Energy-Zone-aware attacks. Decks and attached Tools preserve card identity and enforce one-card quotas.

Additional fixes applied during the integration rather than waiting for a later audit:

- **Musharna Dream Waltz:** allowed even while Asleep, gains printed bonus damage.
- **Whimsicott Fluffy Tag:** selects a Benched recipient; the extra 40 damage applies on the recipient's next own turn, before Weakness/Resistance.
- **Liepard Assist:** coin heads asks the player to choose a real Benched Pokémon attack and copies its damage/effects. It no longer misfires by searching for a Supporter.
- **Hugh:** discards are chosen by the opponent first, then by the player; these physical cards go to the discard pile, never invisibly back to deck.
- **Audino Busybody:** the hand-action UI exposes it. It discards the revealed Audino, heals 10 and removes **exactly one** chosen Special Condition, even if the Active has several.
- **Dragon Stream and Draw In:** recover discarded Basic Energy from its real physical discard/ledger; do not mint new Energy from the ordered Energy Zone.

## Verification in this release

- **26/26** focused Boundaries Crossed gameplay and UI regression tests passed.
- **293/293** selected earlier-set cross-era tests (BW1 through Dragons Exalted) passed independently.
- **120/120** additional generated decks across ten types and 12 seeds passed legality and ACE SPEC one-per-deck checks.
- **153/153** printed cards enabled, **466/468** synthetic smoke scenarios executed with no failures, **2** scenarios skipped because the synthetic setup provided no damaged target for Potion; **16/16** sampled CPU decks valid.
- **Zero schema errors and warnings**; **60 static review flags** remain for complex, special-case effects. These are not 60 confirmed bugs.
- Core, UI, effects, tests and Gradle task wiring inspected; `node --check` passed for modified battle modules.

**Limitations:** No Android SDK/Gradle APK compilation or actual phone gameplay was available during this source integration. Synthetic smoke/feature regressions are not an exhaustive card-to-card independent audit. Real device testing and our usual follow-up independent pass remain recommended.

## Install

Apply over v0.69.309 using `unzip -o LuckyDex_patch_v0.69.310_BW7_BOUNDARIES_CROSSED.zip -d source` while in `~/lucky-dex`, then `git add source`, commit, and push.
