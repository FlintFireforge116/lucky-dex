# Test Lab filtering restoration — v0.69.161

The existing filters were still wired to the Pocket and Classic card catalogue, but the Test Lab save format introduced in v0.69.160 persisted deck lists while dropping the selected CPU opponent restrictions. Returning to the lab could therefore reset its allowed sets, archetype, rarity, strategy and related settings.

## UX
- A visible **CPU DECK FILTERS** action appears on the Test Lab landing panel. In Classic it jumps to the allowed-expansions, archetype, rarity, strategy and difficulty selector; in Pocket it opens and jumps to the rarity/strategy selector.
- Pocket CPU filters start expanded in the Test Lab.
- **Filter cards** is explicitly labelled in both deck builders; it still provides sets (Classic), types, gameplay mechanics, categories, rarity and other catalogue filters. No card-filter functionality is removed.
- The Test Lab header distinguishes filtering the cards you can add from filtering the CPU's opponent deck.

## Save format
The independent `state.tcgTestLabDecks` entry is now schema 2. Each `pocket` and `classic` library retains `decks`, `activeDeckId` and a small whitelisted `opponent` object. These preferences are restored into the transient battle-state configuration when Test Lab opens. Normal player decks, normal match settings, cards, rewards and statistics remain untouched. Older schema-1 Test Lab deck saves load unchanged and migrate on subsequent save.

## Verification
- `node --test tests/v07161-testlab-deck-filter-restoration.test.cjs tests/v07160-testlab-persistent-decks.test.cjs tests/v069136-optimizer-sandbox.test.cjs tests/v07153-clear-deck.test.cjs` → 14/14 passed.
- Narrow set-picker, opponent UI and build-version checks → 5/5 passed.
- Full older card-matching suites were not rerun end-to-end due slow unrelated CPU simulation tests. On-device Android visual verification remains outstanding.

## Install
Unzip `LuckyDex_patch_v0.69.161.zip` into the repository's canonical `source/` directory after verifying that `source/app/build.gradle` reports versionName 0.69.160. Rebuild the APK through the existing GitHub workflow after committing the changed source.
