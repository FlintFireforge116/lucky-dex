# LuckyDex v0.58.0 Test Report

## Scope

v0.58.0 adds a shared how-to-play system across every currently registered Arcade/minigame activity.

- 35/35 current Arcade game IDs have complete instructions.
- First launch is intercepted before the game owner's `open()` runs, so gameplay cannot begin underneath the first-play instructions.
- Seen state is persisted per game in `state.arcade.helpSeen` and migrates safely from older saves.
- After first play, a shared top-right `ⓘ` button reopens the same instructions.
- Reopened help calls a game's existing `pause()` / `resume()` lifecycle when that game exposes one; the modal blocks game input everywhere.
- No gameplay balance, rewards, achievements, rare-event odds, or Developer toggles were changed.

## New v0.58.0 tests

Command:

```text
node --test tests/v0580-arcade-help.test.cjs tests/v0580-arcade-help-integration.test.cjs tests/v0580-release.test.cjs
```

Result: **9/9 pass**.

Coverage includes:

- shared help assets/load order;
- exact 35-game manifest coverage;
- complete Goal / Controls / Rules / Tip copy for every game;
- old-save migration and per-game seen state;
- first-play startup deferral;
- info-button help lifecycle;
- supported pause/resume lifecycle;
- cleanup/back handling;
- v0.58.0 release metadata.

## JavaScript syntax checks

All passed:

```text
node --check app/src/main/assets/arcade-help.js
node --check app/src/main/assets/arcade-world.js
node --check app/src/main/assets/arcade-platform.js
node --check app/src/main/assets/app-v0167.js
```

## Arcade/minigame regression pass

A selected regression run covering the new help tests plus current Arcade navigation/state and representative games across Stadium 1, Stadium 2, Challenge Course, Dream World, Game Corner and Picross completed with:

**104/104 tests pass, 0 failures.**

This includes Topsy-Turvy, Furret's Frolic, Gutsy Golbat, Pokémon Seek, Wailord's Water Spout, Ice Cream Scoop, Game Corner navigation/catalogue, Roulette, Endurance Expedition, Elemental Gauntlet, Sushi-Go-Round, Run Rattata Run, Snore War, Thundering Dynamo, Goldenrod Challenge Course integration, Rock Harden, Magikarp's Splash, Ekans' Hoop Hurl, Arcade ownership/navigation regression, Oreburgh navigation, Picross integration, records/state integration, and all v0.58.0 help tests.

## Full repository test command

`npm test` was also attempted.

- The first suite completed **18/18 pass**.
- The runner then stopped at `adventure-core.test.cjs` because this supplied source bundle does not have the `playwright` package installed:

```text
Error: Cannot find module 'playwright'
Require stack:
- scripts/recovery-browser.cjs
- tests/adventure-core.test.cjs
```

This is an environment/dependency blocker rather than a v0.58.0 test failure. The full repository suite is therefore **not claimed as passing**.

## Development method

No Codex was used for v0.58.0.
