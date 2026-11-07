# LuckyDex v0.69.142 — TCG Expedition Base Set

## Scope

- Adds the 2002 Pokémon TCG **Expedition Base Set (ecard1)** in chronological set order after Legendary Collection.
- Registers all **165 numbered physical cards**, including holo/non-holo reprints and alternate card texts, with numbered images, rarities, types, HP, evolutionary relationships, attacks, original text descriptions, retreat costs, Weakness/Resistance, Trainers and Special Energy.
- Threads Expedition through Classic collection ownership mapping, the unrestricted and restricted 30-card deck builders, CPU deck generation, the deck-editor set selector, and battle UI.
- Retains prior Legendary Collection integration; this release patch is **cumulative from v0.69.140**.

## Battle implementation

The catalogue contains **157 battle-enabled cards** and **8 PARTIAL cards** (visible but excluded from playable/AI decks to avoid pretending an unsupported mechanic works). PARTIAL: `ecard1-1`, `ecard1-2`, `ecard1-30`, `ecard1-33`, `ecard1-34`, `ecard1-68`, `ecard1-144`, `ecard1-150`. Remaining work includes Alakazam Psymimic's attack copying, Ampharos Lightning Strike's optional discard mode, Venusaur Harvest Bounty's extra simultaneous attachment, technical machine borrowed attacks, and Strength Charm's bonus-and-discard trigger.

The battle effects expansion includes status/Sleep attack behavior, Dream Eater's Sleep condition, damage-counter and Energy-based attacks, coin attacks, Energy recovery, targeted switches, activated Poké-Powers, healing, the Expedition-specific Darkness and Metal special Energy rules, and manual selections where appropriate. Notable printed-rule corrections in the final pass: Master Ball now permits **one** selection from its top seven cards; Pokémon Reversal lets the playing Trainer select the opposing Bench target before flipping the coin.

Classic's Basic Energy Zone remains separate from the physical TCG's energy card printing; effects that involve basic Energy may be adapted to that existing LuckyDex rule, not silently treated as original full 60-card TCG rules.

## Version synchronization

- Android `versionName '0.69.142'`, `versionCode 7122`.
- JS `window.__LUCKYDEX_BUILD='0.69.142'`.
- Both title-screen and app-screen labels are updated to `v0.69.142`.
- `index.html` also reads `window.__LUCKYDEX_BUILD` at runtime and synchronizes both labels, preventing the prior case where new game logic still displayed `v0.69.140`.

**Installing source is not the same as updating the phone's installed APK.** After pushing to GitHub, build or download the latest APK from the appropriate GitHub Actions run and install it. Until installation, the old Android app continues displaying its previous build number.

## Tests

- Focused: `node --test source/tests/v07142-expedition.test.cjs source/tests/v07141-legendary-collection.test.cjs` — **26/26 passed**.
- Historical regression subset: 12 test files across Energy, Classic combat, AI, build system, set metadata and deck editors — **113/113 passed**.
- Additional smoke sweep: 232 ability/attack invocations with no runtime exceptions (not equivalent to every card being rule-perfect).
- Android APK device-level build/install and manual UI playthrough not run in this environment.

## Installation

Unzip the cumulative release patch **at the Git repository root**, e.g. `unzip -o /sdcard/Download/LuckyDex_patch_v0.69.142_Expedition_Base_Set.zip -d .`, so entries land inside `source/`. Do not use `-d source`: that would create `source/source/`. Then commit `source/`, push to GitHub, build and install the APK.
