# LuckyDex v0.28.3 — Clefairy Pace + Unown Decoder Overhaul

Date: 2026-10-08
Status: Approved conversational design, written spec pending user review

## Goal

Improve two existing Arcade minigames without changing their venue ownership or breaking update compatibility:

1. **Clefairy Match** should retain its current presentation and mechanics but play much faster, especially during long sequence playback.
2. **Unown Decoder** should become a deeper, replayable decoding game with typed-answer modes, far more content, all National Pokédex species, and runtime glyph composition rather than word-specific art.

The app package identity must remain `com.example.luckydex`; the release target is v0.28.3 / versionCode 283.

## Current State

### Clefairy Match

- `clefairy-memory.js` owns the memory-game loop.
- `clefairy-scene.js` owns the animated Clefairy action timeline.
- Action durations are currently roughly 1450–1750 ms, plus a 220 ms pause after each playback symbol.
- Long sequences therefore spend too much time in passive playback.

### Unown Decoder

- `arcade-unown.js` currently owns a five-question, multiple-choice game.
- It contains only 24 hardcoded entries.
- It already renders messages dynamically from the existing 26 Unown A–Z sprite assets, one glyph per character.
- `adventure/adventure-species.js` is loaded earlier in `index.html` and exposes `LuckyDexAdventureSpecies.byId`, containing National Pokédex species 1–1025.
- Therefore no word-level image assets are needed for a much larger answer pool.

## Clefairy Match Design

### Scope

This is a pacing-only change. The visual stage, reflection system, sequence rules, bank/cash-out loop, rewards, and controls remain unchanged.

### Timing

- Speed the non-idle Clefairy action timelines to approximately 1.5–1.6× their current playback speed.
- Preserve each animation's relative internal timing so the star/song/moon/spin actions still read clearly.
- Reduce the inter-symbol playback pause from 220 ms to approximately 100 ms.
- Player-tap feedback should use the same faster action timing.
- Failure/reset timing should derive from the updated action duration so it does not leave a long dead pause after a mistake.

### Success Criteria

- A sequence of 6–10 actions is materially faster than v0.28.2.
- Individual actions remain visually distinguishable.
- No change to sequence generation, input checking, banking, rewards, lifecycle cancellation, or save data.

## Unown Decoder Design

### Core Interaction

Replace the current two-mode/five-question structure with three modes and a continuing streak loop.

#### Easy — Identify

- Multiple choice.
- Category and clue are shown.
- Four answer choices.
- Intended as the casual / learn-the-alphabet mode.

#### Normal — Decode

- Typed answer using a text field and submit action.
- Category is shown.
- A concise clue is shown where the entry has one.
- No answer choices.
- More time than Hard.

#### Hard — Ancient Script

- Typed answer.
- Category is shown so non-Pokémon terms remain fair.
- No descriptive clue.
- Shorter timer and higher scoring/reward multiplier.

### Run Structure

- The game runs as a streak rather than a fixed five-question set.
- After every correct answer, the streak rises and the next challenge becomes progressively more valuable.
- The player can **cash out** after at least one correct answer.
- A wrong answer or timeout ends the run and awards a reduced/consolation result rather than the full current bank.
- Difficulty affects time allowance, clue availability, scoring multiplier, and candidate weighting.
- Repeats within the same run should be prevented until the available pool is exhausted.

### Content Pool

#### Pokémon

- Build Pokémon entries at runtime from `LuckyDexAdventureSpecies.byId`.
- Include all 1,025 National Pokédex species in the existing dataset.
- Do not duplicate this list in `arcade-unown.js`.
- Pokémon entries should use category `POKÉMON` and may derive lightweight clues from existing type data where appropriate (for Easy/Normal), e.g. `WATER / FLYING Pokémon`.

#### Handcrafted Terms

Add a significantly larger curated pool spanning at least:

- Regions
- Types
- Common items and Poké Balls
- Moves
- Major locations
- Battle/status terminology
- Evolution / breeding / collecting terminology
- Other recognisable Pokémon-world terms

These entries are text data only and should be easy to extend without adding assets.

### Glyph Generation

- Continue using only the existing A–Z Unown sprite assets.
- Convert each answer into a renderable glyph sequence at runtime.
- Preserve spaces as word breaks.
- Ignore punctuation and symbols that have no Unown glyph when rendering while retaining the canonical answer for reveal/display.
- Examples:
  - `HO-OH` renders `HOOH` but reveals `HO-OH`.
  - `MR. MIME` renders `MR MIME`.
  - `FARFETCH'D` renders `FARFETCHD`.
  - `NIDORAN♀` and `NIDORAN♂` render `NIDORAN`.

### Answer Normalisation

Typed answer checking must be forgiving but not ambiguous:

- Case-insensitive.
- Ignore whitespace, hyphens, apostrophes, periods, accents, gender symbols, and other non-alphanumeric punctuation.
- Canonical display text remains untouched.
- Examples such as `Mr Mime`, `MR. MIME`, and `mr-mime` should all match `Mr. Mime`.
- The normaliser should be a standalone helper with direct unit coverage.

### Difficulty / Length Weighting

Avoid unfair early questions while still allowing the full pool:

- Easy should strongly favour shorter/common entries.
- Normal uses the broad pool with mild weighting against very long answers early in a run.
- Hard can draw from the entire pool immediately.
- Longer or multi-word answers should be worth more points.
- As streak rises, longer and more complex terms become more likely in Easy/Normal.

This is weighting, not exclusion: all Pokémon remain available overall.

### Reveal Animation

After an answer resolves:

- The current Unown glyphs should briefly transition/reveal into ordinary Latin letters in the same word positions.
- Correct answers use a positive decoded state; wrong/timeout states reveal the canonical answer clearly.
- No new word-specific assets are required.
- The reveal should be short enough not to slow the streak loop.

### UI

The Decoder panel should expose:

- Three difficulty tabs: Easy / Normal / Hard.
- Current score and streak.
- Current category.
- Unown glyph chamber.
- Clue area that hides/shows according to mode.
- Multiple-choice answer area for Easy only.
- Text input + prominent `DECODE` submit button for Normal/Hard only.
- `CASH OUT` button enabled once the player has banked at least one correct decode.
- Timer bar.

Mobile keyboard behaviour matters: submitting via the keyboard action/Enter must be equivalent to tapping `DECODE`, and the input should regain sensible focus on the next typed-answer round.

### Scoring and Rewards

- Preserve Arcade platform reward routing (`awardArcadeCoins` / session result flow) rather than inventing a separate reward path.
- Score should incorporate answer length/complexity, remaining time, streak, and difficulty multiplier.
- Bank/reward should rise enough with streak to create a push-your-luck decision without eclipsing other Arcade games.
- Hard should pay more than Normal, Normal more than Easy for equivalent performance.
- Existing `state.arcade.bestUnown` should remain meaningful as the best Decoder score.
- Existing `state.arcade.unownPerfect` may be retired or reinterpreted only if required; avoid breaking old save data.

## Data / Architecture

Prefer separating content/data helpers from the DOM-heavy game loop so the new mechanics stay testable:

- `arcade-unown.js` — game state, DOM interaction, timers, run lifecycle.
- New small data/helper module if useful, e.g. `arcade-unown-data.js` — curated entries, Pokémon-pool construction, normalisation, renderable-letter conversion, weighting helpers.
- Existing `adventure/adventure-species.js` remains the sole Pokémon species source.
- Existing Unown sprite directory remains unchanged.

If a helper module is added, load it before `arcade-unown.js` in `index.html`.

## Testing

Use test-first changes.

### Clefairy

- Action duration contract is shortened to the agreed range.
- Playback gap is reduced.
- Existing cancellation/lifecycle behaviour remains intact.

### Decoder Data / Helpers

- All 1,025 species are available to the Decoder pool.
- No duplicate species data is introduced.
- Runtime glyph conversion handles spaces and punctuation examples correctly.
- Answer normalisation accepts punctuation/case variants.
- Difficulty weighting remains deterministic under seeded/test RNG where needed.

### Decoder Game Flow

- Easy renders four choices and accepts button answers.
- Normal/Hard render typed-answer UI and no answer choices.
- Correct typed answers advance streak and bank.
- Wrong answer/timeout ends the run.
- Cash-out is unavailable before the first correct answer and available afterwards.
- Repeats are avoided within a run.
- Category/clue visibility matches mode.
- Reveal uses the canonical answer while glyph rendering uses only supported A–Z assets.
- Open/close/replay cancels timers and does not leak stale callbacks.

### Regression / Release

- Existing Arcade ownership and venue navigation remain unchanged.
- Existing save migration/update identity remains compatible.
- Android package remains `com.example.luckydex`.
- Version becomes `0.28.3`, versionCode `283`.
- Run the full available non-browser suite, asset audits, syntax checks, and browser tests where the environment supports Playwright.

## Out of Scope for v0.28.3

- New Unown artwork beyond the existing A–Z sprites.
- Online word/API fetching.
- Additional Unown punctuation glyphs.
- Reworking the Moon Stage art or Clefairy game rules.
- New Arcade venue/world-map structure.
- Changes to unrelated minigames.
