# LuckyDex v0.53.0 — Pikachu's Beach Classic + DX design

Date: 2026-10-17
Baseline: LuckyDex v0.52.0

## Intent

Replace the hand-built v0.52.0 Pikachu's Beach approximation with two playable modes under the existing Summer Beach House venue:

1. **Classic** — a source-faithful port of Pokémon Yellow's Surfing Pikachu minigame, using `pret/pokeyellow`'s `engine/minigame/surfing_pikachu.asm` and associated graphics as the behavioural reference.
2. **DX** — a LuckyDex-native port of the supplied `superSurfingPikachuDX_v1_1.zip`, preserving the fangame's surfing, tricks, rings, combat, allies, HP pickups, bosses, difficulty and distance/length systems rather than embedding the Windows executable.

The app remains private/personal. The supplied GameMaker package may therefore be treated as an implementation and asset source without designing around public redistribution constraints. Asset provenance will still be documented for maintainability.

Success means the user can launch Pikachu's Beach, choose Classic or DX, play either comfortably on a narrow Android portrait screen, receive persistent records/achievements/rewards, and force every rare event from Settings.

## Baseline findings

v0.52.0 already supplies:

- Summer Beach House venue and `pikachuBeach` game registration.
- A JS core, presentation controller, CSS and reserved-safe Lucky Wave prize module.
- Easy / Normal / Hard, records, results and seven achievements.
- Lucky Wave Off / Vanilla 2% / Test 25% / Always 100% controls.
- The shared five-way prize pool: Lucky Coins, Card Dust, Pack Voucher, card, sealed booster.

The supplied DX archive contains a GameMaker Studio 2.3 Windows build with `data.win`. Resource strings confirm sprites/effects for Pikachu, waves, rings, HP pickups, allied Seaking/Lapras/Natu, enemies and boss-related assets including Articuno, Zapdos, Moltres, Lugia and Wailord. The public project description confirms movement, jump, shooting/Iron Tail, airborne tilt spins, rings, five bosses, allies, HP pickups, variable difficulty and configurable distance from shore.

`pret/pokeyellow` includes the original `engine/minigame/surfing_pikachu.asm` as a dedicated 2,877-line source file, with explicit riding/jumping/landing/crashed/results states and tile-aware landing logic.

The uploaded `.ips` patch is not required for this design because it is a patch against a base ROM, while the Yellow disassembly already provides the original minigame source directly.

## User-facing structure

`Summer Beach House -> Pikachu's Beach` opens a compact mode picker:

- **CLASSIC** — Pokémon Yellow rules and Game Boy-style presentation.
- **DX** — the expanded Super Surfing Pikachu DX game.

Both are available immediately. Neither is an unlock gate for the other.

The shared game ID remains `pikachuBeach` for venue compatibility. Persistent state stores separate Classic and DX record branches so old v0.52.0 data can migrate into Classic without losing existing scores.

## Classic mode

### Behavioural source

Port mechanics from `pret/pokeyellow/engine/minigame/surfing_pikachu.asm`, translating the original state machine rather than copying v0.52.0's simplified timer/wave cadence.

The port should preserve, where practical in a browser runtime:

- riding -> jumping -> landing/crashed -> result state flow;
- wave/terrain interaction and jump initiation;
- airborne rotation from left/right input;
- clean, rough, hard and wipeout landing outcomes based on orientation and water/wave state;
- speed gain/loss from landings and crashes;
- original HP/time countdown behaviour;
- original Radness trick scoring and final score composition;
- original-style results behaviour.

Any timing constants that depend directly on Game Boy frame timing should be translated to deterministic milliseconds using a fixed simulation step, not rebalanced by feel unless a browser-specific correction is demonstrably required.

### Classic presentation

Use the Yellow disassembly's surfing graphics/palette/layout as the source for a crisp pixel-art Classic scene. Render at integer-friendly scale where possible and disable smoothing for pixel assets.

The LuckyDex shell remains modern, but the actual playfield should look deliberately Game Boy/Yellow rather than like the v0.52.0 illustrated beach approximation.

### Classic difficulty

Classic's default rules are the authentic ruleset. LuckyDex Easy/Normal/Hard remain selectable, but difficulty modifiers must be narrowly layered around the original simulation:

- Easy: slightly wider landing tolerance / gentler speed loss.
- Normal: authentic target behaviour.
- Hard: narrower tolerance / harsher loss while retaining the same state machine.

Do not rewrite wave behaviour into three unrelated games.

## DX mode

### Port strategy

Do **not** embed or execute `surfing pokemon.exe` inside LuckyDex.

Extract GameMaker resources from `data.win` and port the gameplay into LuckyDex's JavaScript runtime. The extraction phase should produce a checked-in manifest so the source tree is understandable without reopening the binary.

Preferred extraction order:

1. Use a compatible GameMaker/UndertaleModTool-style extractor if one can run in the environment.
2. If the official extractor cannot run, use or write a focused `data.win` resource exporter for the needed chunks/assets.
3. Decompiled object/event code is a behavioural reference; LuckyDex implementation remains readable JS modules rather than a dump of generated decompiler output.

### DX systems to preserve

Port all gameplay systems present in the supplied release that materially define the game:

- slippery 3/4 surfing movement;
- directional movement;
- jump;
- wave-assisted extra airtime;
- airborne tilt/flip tricking;
- Iron Tail spin attack/trick;
- ranged shooting;
- gold scoring rings;
- trick chaining/multipliers;
- perfect/poor landing consequences;
- enemy Pokémon waves;
- difficulty-scaled spawn pressure;
- HP and damage;
- HP Up pickups;
- allied Seaking, Lapras and Natu helpers;
- five boss encounters and their distinct attack patterns;
- distance-from-shore / run-length selection;
- score chasing and clear/death results.

Where a system is visible in the compiled release but not recoverable with confidence from the extracted logic, reproduce observed release behaviour from the executable/resource data rather than inventing a replacement mechanic.

### DX controls

Desktop mapping stays recognizable:

- arrows / WASD: movement;
- Space: jump;
- Z: shoot / Iron Tail behaviour as appropriate to the recovered release logic;
- X: airborne tilt/spin;
- Escape: pause.

Android portrait gets compact controls **below** the playfield:

- left-side 4-way D-pad;
- right-side JUMP, ATTACK and TILT buttons;
- multi-touch support so direction + action can be held together;
- no critical artwork hidden under opaque controls.

The control bar may compress at very narrow widths but must keep finger-safe hit targets.

## Architecture

Keep Classic and DX isolated behind one launcher.

Suggested modules:

- `arcade-pikachu-beach.js` — mode picker, shared lifecycle and routing only.
- `arcade-pikachu-beach-classic-core.js` — deterministic Yellow-derived simulation.
- `arcade-pikachu-beach-classic.js` — Classic rendering/input/results bridge.
- `arcade-pikachu-beach-dx-core.js` — deterministic DX world/state simulation.
- `arcade-pikachu-beach-dx-content.js` — enemies, bosses, ally definitions, level/distance tables.
- `arcade-pikachu-beach-dx.js` — DX rendering/input/audio/pause/results bridge.
- `arcade-pikachu-beach-prizes.js` — shared reserved-safe Lucky Wave reward delivery.
- `arcade-pikachu-beach.css` — shared shell plus Classic/DX-specific sections.

Do not build a general-purpose game engine. Shared low-level helpers are acceptable only when both modes genuinely use them.

## Asset layout

Keep assets local:

- `app/src/main/assets/arcade/pikachu-beach/classic/`
- `app/src/main/assets/arcade/pikachu-beach/dx/`

DX extraction should preserve a machine-readable `manifest.json` mapping shortened local names back to GameMaker resource names. Convert textures/sprites to PNG/WebP only when conversion preserves animation frames/transparency. Extract audio in a browser-compatible format when practical.

Document sources in `docs/PIKACHU_BEACH_ASSETS_v0530.md`.

## Lucky Wave and prizes

Lucky Wave remains the shared rare event for Pikachu's Beach and applies to both modes.

Settings continue to expose:

- Off
- Vanilla 2%
- Test 25%
- Always 100%

A successful Lucky Wave interaction must reserve and safely grant one item from the existing five-way Arcade prize pool:

- Lucky Coins
- Card Dust
- Pack Voucher/ticket
- card
- sealed booster

Card/booster rewards must resolve before claim, survive save/visibility interruptions, prevent duplicate delivery and retry safely after reopening.

For DX, Lucky Wave should be represented as a visually distinct bonus wave/ring encounter that fits the recovered DX presentation without replacing its normal rings, HP pickups or boss drops.

## Persistence and migration

Migrate existing `state.arcade.pikachuBeach` v0.52.0 statistics into `classic` records on first normalization. Never discard existing best scores, clears, Lucky Wave counts or prizes.

New state should track at minimum:

### Classic

- games played / clears / hard clears / flawless clears;
- best score by difficulty;
- best Radness;
- best remaining HP;
- best trick / flip statistics;
- wipeouts;
- Lucky Wave seen/landed/prizes.

### DX

- games played / clears / deaths;
- best score by difficulty and selected distance;
- best combo / trick bank;
- rings collected;
- enemies defeated;
- damage taken;
- allies recruited/triggered;
- each boss defeated and best boss performance where useful;
- Lucky Wave seen/claimed.

## Achievements

Preserve/migrate the existing seven Classic achievements where their conditions remain meaningful.

DX is effectively a new game mode and must receive its own achievement set. Include at least six useful DX goals, covering:

- first DX clear;
- Hard clear;
- high combo/trick milestone;
- ring milestone;
- boss progression / all five bosses;
- no-death or low-damage clear;
- ally-related goal;
- Lucky Wave reward.

Avoid achievements that depend on inaccessible debug-only behaviour.

## Results and records

Use the established Arcade result framework.

Classic results emphasize:

- Score
- Radness
- Remaining HP
- landing quality / wipeouts
- best trick
- Lucky Wave prize

DX results emphasize:

- Score
- distance completed
- enemies defeated
- bosses defeated
- rings
- best combo/trick bank
- HP/damage
- allies
- Lucky Wave prize

Permanent Arcade Records should show separate Classic and DX sections under Pikachu's Beach rather than mixing incomparable scores.

## Pause, lifecycle and failure safety

Both modes pause on visibility loss/pagehide and must not silently advance while the app is backgrounded.

Reward reservation must happen before any asynchronous card/booster resolution.

DX asset/audio failures should degrade locally (missing sound/effect) rather than aborting a run. Missing required collision/gameplay data should fail verification and block packaging.

## Testing strategy

Use TDD for new behavioural work.

### Classic tests

- Yellow-derived state transitions;
- deterministic wave/jump behaviour;
- rotation and complete flips;
- clean/rough/hard/wipeout landing classifications;
- speed effects;
- authentic score examples;
- HP/time completion;
- difficulty wrappers do not replace the base simulation;
- old v0.52.0 record migration.

### DX tests

- content manifest integrity;
- movement/slippery velocity;
- jump/wave airtime;
- shooting and Iron Tail damage;
- tilt trick scoring;
- rings and multipliers;
- landing bank/loss behaviour;
- enemy spawning by difficulty/progress;
- HP/damage/HP Up;
- all three ally types;
- each of five bosses has reachable spawn, attack and defeat states;
- distance option changes run length;
- pause/background lifecycle;
- results and persistent records.

### Shared integration tests

- mode picker exposes Classic + DX;
- Summer Beach House route remains intact;
- controls remain below/unobstructive to playfield;
- achievements register/persist;
- Lucky Wave Off / Vanilla / Test / Always;
- five-way reserved-safe prize delivery including card and booster;
- duplicate/retry/save-switch safety;
- results routing/replay/back;
- text selection suppression;
- version metadata and packaging.

## Visual verification

Before release, inspect fresh narrow Android portrait screenshots for:

- mode picker;
- Classic riding, airborne trick and results states;
- DX normal surfing, combat, ally/pickup, boss and results states;
- forced Lucky Wave in both modes;
- Settings rare-event control;
- records/achievement surfaces.

Check cropping, pixel scaling, sprite transparency, touch controls, multi-touch layout, HUD collisions and result readability.

## Packaging

Target version: **v0.53.0** (`versionCode 5300`).

Deliver:

- `LuckyDex_source_v0.53.0.zip`
- `TEST_REPORT_v0.53.0.md`

The report must distinguish:

- what was directly ported from Yellow behaviour;
- which DX systems/assets were successfully recovered and ported;
- anything genuinely unrecoverable from the supplied build;
- focused and wider test results;
- visual QA performed;
- APK/build limitations;
- SHA-256 of the source ZIP.

Do not claim an APK build or browser visual verification unless actually performed.

## Explicit non-goals

- No attempt to run the Windows EXE inside Android/LuckyDex.
- No emulator/ROM dependency.
- No requirement to use the uploaded IPS patch.
- No unrelated Arcade refactors.
- No Codex for this implementation unless the user explicitly asks for it later.
