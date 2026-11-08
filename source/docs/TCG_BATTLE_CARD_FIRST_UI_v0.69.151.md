# LuckyDex v0.69.151 — card-first TCG battle interactions

Based on **v0.69.150**. No card rules, deck composition or AI decision logic are changed in this patch.

## Player choices

- Battle `effectChoice` targets already on a board can be selected by tapping their highlighted card in place. This includes either side's Active or Bench, with physical slots distinguishing duplicate names such as two Flareon cards.
- A target with more than one legal subchoice (for example an attached Energy or copied attack) opens a compact central card strip for the specific subchoice; no arbitrary first choice is made.
- Deck, discard, opponent-hand and other effect choices show actual cards (when art exists) in a horizontally scrollable central strip, with selection followed by **CONFIRM**. Optional **SKIP** remains available.
- Valid cards in the player's hand rise above the fan for direct choice. Tapping a valid hand target resolves it, while the normal hand play and drag interactions are unchanged.
- Attached Pokémon Tools are directly selectable when an effect asks for one.
- Clicking Energy Zone with multiple targets highlights legal Pokémon on the board rather than displaying a bottom text list. The quick hand picker also raises playable hand cards.
- Retreat/Promote target actions highlight the actual Bench slots rather than displaying repeated names in an undifferentiated menu. Other action alternatives are presented in a compact central card row.

## CPU readability

- CPU action reports move from the top of the arena to the centre lane. CPU-played Trainers, Pokémon, Special Energy and attack source cards briefly appear on the opponent's mat, physically separate from the text.
- CPU actions have deliberately longer dwell times (attacks 2.75s, Trainer/abilities ~2.45s, Energy/Bench ~2s), preserving all existing coin and hit animations.
- The CPU action card preview clears naturally after the action and does not affect board state.
- Player action text remains visible as a smaller centre-lane notification.

## Validation

- New test file `v07151-card-first-battle-ui.test.cjs` checks duplicate board targets, opponent selection, hand choices, pile-card metadata, copied attack subchoices, CPU card identification, pacing, and build-version consistency.
- Existing Skyridge version regression assertion updated to check that all build markers match the **current** build rather than being hard-coded to v0.69.150; the card/engine tests are untouched.
- `node --test source/tests/v0714*.test.cjs source/tests/v07150-skyridge-completion.test.cjs source/tests/v07151-card-first-battle-ui.test.cjs`: 135 passed, zero failed.

## Install

Extract the ZIP to the repository **root**, not into `source/`, because paths inside the ZIP begin with `source/`. Intended to apply on top of v0.69.150.

Android v0.69.151, versionCode 7131; updated both in-app version labels and JavaScript build marker. Not tested on a physical Android device.
