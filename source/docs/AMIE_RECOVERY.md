# Amie recovery

`app/src/main/assets/arcade-amie.js` is the sole runtime owner for Berry Picker, Head It and Tile Puzzle. Its public entry point is `window.LuckyDexAmie`, with `open(gameId)`, `close()`, `activeGame()`, the three start methods and the three mode setters. `arcade-amie.css` is the single scene stylesheet. The earlier versioned Amie files must not be loaded alongside it.

The existing difficulty choices, time limits, miss limits, Fever threshold, yarn points, puzzle dimensions, coin caps and reward payloads are retained from v0190. Rewards still enter the platform through `awardRun`; no storage format or save field is added. On finish, the existing `bestBerryPicker` and `bestHeadIt` mode fields retain the greater score, `bestHeadIt.unlimitedStreak` retains the greater combo, and `bestTilePuzzle` mode fields retain the shorter elapsed time as numeric seconds. Those updates happen before awarding and are persisted through the existing `save()` function. There is no existing Tile Puzzle moves field or Berry Picker unlimited-best field to add. Participants come from the platform's caught-Pokémon roster and its supplied local actor sprites, including its shiny path.

Each game displays its picture and participants before Start. Restart, result replay and re-entry create fresh game state. Disposing a run cancels its interval, RAF, delayed callbacks and active berry gesture. A delayed callback also checks its original run's disposal flag. Pointer cancellation and exit both remove the dragged image and all gesture listeners. Requesters cannot score or miss again during their reaction. Head It keeps lane buttons intact while frames update yarn position and feedback; taps therefore retain their target. Yarn acceleration uses elapsed seconds instead of accidentally reaching maximum speed on the first frame.

The scene and Tile Puzzle canvas use a 5:3 display proportion. Pokémon preserve their source proportions. Berry Picker and Head It backgrounds and yarn are exact rectangular extractions from the original XY sprite sheets, packaged locally by the asset recovery. Their original sheet/source/crop/checksum details are in the asset manifest. Berry buttons and participants use the local Pokémon/item assets. No painted tree, yarn, gradients, clouds or placeholder circles remain in these scenes.

Tile Puzzle uses an authentic empty floor crop from the reference screenshot, with the local participant sprites drawn into its moving source picture. The original complete Tile Puzzle background has not been sourced; the floor crop is a limited visual recovery, not a complete reproduction of the retail stage. It is scaled with its aspect preserved and cropped to fill the canvas. The game still shuffles every tile and swaps any two selected tiles; it does not duplicate screenshot grids, stars, fixed Pokémon or controls.

## Verification

Run `node tests/amie-recovery.test.cjs` with Playwright available through `NODE_PATH`. On the bundled Windows runtime:

```powershell
$env:NODE_PATH='C:/Users/sjwal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/amie-recovery.test.cjs
```

The real browser fixture uses the retained game DOM and the production runtime/stylesheet. It covers 360×800, 412×915 and 412×1200: ready requester imagery, pointercancel and held-drag exit, stable Head It lane nodes across RAF, zero source mutations while a single yarn moves, Tile Puzzle aspect and one swap, horizontal bounds and browser exceptions. Updating the yarn position leaves its existing image source intact; a type change alone assigns a new original asset. It also checks reaction lockout, exactly one reward after three unlimited misses, the existing minimum coin/daily-reward payload, and zero retained timers/RAF after finish/restart/exit. With a controlled browser clock, it completes real berry/head runs and deterministic tile swaps, checks score/streak/time best fields and saved snapshots, verifies slower/lower runs preserve previous bests, and verifies that each completed puzzle awards once. Integrated app navigation/layout and Android packaging are verified separately by the parent recovery task.
