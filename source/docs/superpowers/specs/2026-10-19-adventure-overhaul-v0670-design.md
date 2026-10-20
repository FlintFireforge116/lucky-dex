# LuckyDex Adventure Overhaul — Design

Date: 2026-10-19
Baseline inspected: LuckyDex v0.64.1 APK

## Goal

Turn Adventure from a sequence of mostly static travel/battle screens into a reusable, location-driven Pokémon journey while preserving the existing battle engine, save progression, badges, parties, rewards, Wild Hunt records, and completed-region state.

The overhaul should make individual places feel meaningfully different, give the player reasons to interact with routes/towns/caves/water beyond pressing Continue, and make wild hunting/chaining an actual player-directed activity.

## Non-goals

- Do not rewrite the existing battle engine.
- Do not reset or invalidate existing Adventure saves.
- Do not add Sinnoh or later regions yet.
- Do not implement every missing main-series mechanic in the first release.
- Do not replace established LuckyDex systems merely because a different architecture would be easier.

## Current-state findings

- Kanto already has individually assigned location scenes across its journey.
- Johto and Hoenn largely fall back to generic region/kind scene categories, causing visually different places to feel repetitive.
- The journey/location framework already separates authored journey data, place presentation, regional progression, battle flow, and Wild Hunt.
- Generic Explore/event interactions are shallow and commonly resolve to deterministic small supplies or recovery.
- Wild Hunt chaining is habitat-based. Both captures and victories increment the same field chain; fleeing/loss resets it.
- Current chain bonuses are small and cap quickly, so the player has little reason to care about a long chain beyond the displayed number.

## Architecture

### 1. Location capability model

Extend authored journey/location data with reusable capabilities rather than hard-coding UI logic per named place.

Each location can declare zero or more activities such as:

- `fish`
- `search`
- `headbutt`
- `rockSmash`
- `berryTree`
- `puzzle`
- `npcRequest`

Capabilities include configuration such as encounter pool, reward pool, difficulty, required unlock/tool, one-time/repeatable state, and flavour text.

`adventure-location-flow.js` remains responsible for presenting the current place and routing the player into an activity. Individual activity modules own their gameplay/state.

This keeps future regions data-driven: adding Fishing to a new lake should be a location-data change, not another custom screen implementation.

### 2. Regional visual registry

Keep the current scene resolution hierarchy, but fill the named location registry so Johto and Hoenn reach Kanto-style location identity.

Requirements:

- Every named journey stop receives an explicit scene assignment or intentionally shared canonical scene where the original games reuse the same location.
- Johto and Hoenn receive proper region-map artwork/configuration rather than Kanto-only map presentation.
- Named scenes win over generic `region-kind` fallbacks.
- Generic category scenes remain as safe fallback assets for saves/modded/unknown locations.
- Location art and touch/collision overlays must use the same coordinate space where interaction hotspots are shown.

### 3. Fishing as the first reusable location activity

Fishing belongs primarily to Adventure, with an optional later Arcade shortcut if desired.

Core loop:

1. Player selects Fish at a valid water location.
2. Cast phase gives a simple timing/placement input.
3. Wait phase has variable bite timing and false movement/feedback.
4. Bite requires a reaction input within a species/rod-dependent window.
5. Hooked Pokémon enters a short reel contest where the player must manage line tension while the Pokémon pulls/moves.
6. Success creates a normal wild encounter/capture opportunity using Adventure's existing Pokémon/battle/capture systems.
7. Failure lets the Pokémon escape without fabricating a battle.

Rods:

- Old Rod: forgiving, limited/common pools.
- Good Rod: moderate timing and broader pools.
- Super Rod: stronger/faster fish, best pools and rare possibilities.

Fishing data is location-specific and should use authentic regional encounter identity where practical.

Fishing records should track at minimum casts, hooked Pokémon, landed encounters, catches, escapes, best streak, and notable rare/shiny catches.

Rare fishing encounters use normal probability and receive a Developer force option only where a genuinely low-probability event needs testing.

### 4. Catch Chain v2 — species-targeted hunt

Replace the generic "habitat chain" concept with an explicit hunt target while preserving old records during migration.

Starting a hunt:

- The player chooses a target from species already known/seen in the area's field guide, or starts an untargeted search until a species is found and then chooses to track it.
- The active hunt stores destination, target species, current chain, best chain, hunt seed/state, and clues/hotspots.

Chain rules:

- Catching the target advances the chain most strongly.
- Defeating the target can maintain/advance the chain, but should be less valuable than catching so the system is genuinely about hunting/catching.
- Encountering a non-target does not automatically destroy the chain; the player can leave it without punishment if they have not committed to the encounter.
- Failing a committed target encounter, target escape, or losing the relevant battle breaks the chain.
- Leaving the area voluntarily should clearly warn whether the chain will be suspended or broken; default design is to suspend only within the same location session and break when starting another hunt.

Chain progression should create visible gameplay changes rather than only tiny invisible percentages. Examples:

- clearer/more numerous target clues;
- increased target weighting;
- better chance of high-energy hotspots;
- modest rare/shiny/item improvements with sensible caps;
- milestone feedback and records.

The chain UI must show exactly what is improving and what action will break the chain.

Migration:

- Existing destination chain values remain stored as legacy field records/stat history.
- They must not be silently converted into a species-target chain because there is no defensible target species to infer.
- Existing seen/caught/rare/mastery records remain intact.

### 5. Location activity shell

Create one shared Adventure activity shell so Fishing and later mechanics do not each invent their own navigation/help/pause behaviour.

The shell provides:

- place/region header;
- Back/Exit behaviour;
- pause/input lock when a modal/help state is open;
- compact instructions/help;
- reward handoff back to Adventure;
- save/restore lifecycle;
- mobile-safe controls and touch target sizing.

Adventure activities are not Arcade minigames and do not need to be registered in the Arcade help system, but they should follow the same usability standard: first-use explanation plus reusable help where the mechanic is not self-evident.

## First implementation release

### P1A — Regional identity parity

- Add named Johto scene assignments.
- Add named Hoenn scene assignments.
- Add Johto region map support.
- Add Hoenn region map support.
- Preserve generic fallback scenes.

If all final art cannot be sourced/generated in the same pass, the code/data registry must still be completed and missing individual scenes clearly enumerated rather than silently using generic images.

### P1B — Fishing

- Add reusable Fishing activity module and mobile UI.
- Wire Fishing into appropriate Kanto, Johto and Hoenn water locations already present in Adventure.
- Add rod progression/access rules compatible with existing saves.
- Feed successful hooks into existing Adventure encounter/capture systems.
- Add fishing records and focused tests.

### P1C — Catch Chain v2

- Add species-target hunt state with safe migration.
- Update Wild Hunt UI to choose/show target species.
- Update hotspot weighting and chain feedback.
- Separate "leave non-target alone" from "failed target encounter".
- Add best-chain records and focused tests.

## Follow-up releases

After P1 proves the capability model, expand location interactions using the same framework:

- Headbutt trees in Johto and suitable later areas.
- Rock Smash encounters/items.
- Berry trees/soil where region-appropriate.
- Hidden-item/search interactions.
- Strength/ice/current/switch traversal puzzles.
- NPC requests and authored side events.
- Region story beats (Rocket/Aqua/Magma/rivals/legendaries).
- Gym-specific puzzle layers.
- Battle-system extensions such as proper double battles, abilities and held items only when they naturally become the next limiting factor.

## Save compatibility

All new state lives behind additive schema fields with normalization/migration defaults.

Must preserve:

- Pokémon collection and levels;
- current party;
- Adventure region/chapter/location progress;
- permanent badges and completion state;
- one-time reward claims;
- Wild Hunt seen/caught/rare/mastery records;
- settings and Developer toggles;
- unrelated Arcade records and achievements.

No migration may reset Adventure simply because the new location-capability fields are absent.

## Testing

Focused tests should cover:

- old saves opening each region after migration;
- named-scene resolution and fallback behaviour;
- Johto/Hoenn map selection;
- Fishing state machine, success/failure, pause/back behaviour and mobile-safe controls;
- rod/location encounter selection;
- Fishing handoff into normal encounter/capture flow;
- chain target selection and persistence;
- target catch, target KO, non-target leave, target flee/loss, hunt switch and area exit rules;
- chain bonus caps and milestone display;
- existing regional progression/badge/reward regression;
- existing Wild Hunt field-guide records surviving migration.

Run relevant existing Adventure tests and app-level regression tests available in the canonical source repository. Report focused/regression results separately from any unavailable full suite.

## Release/handoff

- Update version/release metadata consistently.
- Build from canonical unpacked `source/` project.
- Verify generated APK and release source ZIP before handoff.
- Do not commit the release ZIP as canonical Git source.
- Provide matching Termux update/push commands automatically with the build.

## Repository hygiene adjunct

The uploaded canonical repository also contains historical delivery/build clutter that should not remain in the canonical source tree. This cleanup is maintenance attached to the v0.67.0 release; it must not remove live runtime assets, reproducibility inputs, active tests, or provenance that is still used by build/development scripts.

### Remove as dead/generated repository clutter

- Top-level `LuckyDex-APK-1.zip` build artifact.
- Root-level historical `source/TEST_REPORT_v*.md` files.
- Root-level historical `source/V*_REPORT.md` files.
- Obsolete root `source/CODEX_*.md` prompt/handover files and `source/LuckyDex_Master_Update_Continuation_Plan.txt`.
- Obsolete `source/docs/CODEX_DASH_V2_GEN3_POLISH_PASS.md` and old version-only report documents where the information is already represented by release history/design docs.
- Stale whole-tree preservation snapshots `tests/adventure-location-preservation-v0402.json` and `tests/adventure-scene-nav-preservation-v0403.json`, plus their no-longer-active snapshot-generation scripts. These snapshots preserve historical repository filenames rather than product behaviour and currently pin obsolete reports/Codex files.
- Committed contents of `source/artifacts/`; active simulations/tests may recreate artifacts locally, but generated evidence is not canonical source.

### Keep

- Runtime assets under `app/src/main/assets/` unless a reference audit proves them unused and a regression test covers removal.
- `data/adventure-moves/` because it is source input for move-data regeneration.
- `data/dash-gen3/` because active scene/Dash generation scripts consume it.
- `reference/` Dream World source catalogues for now because active staging/audit scripts still reference them; slimming those catalogues is a separate provenance task, not a blind deletion.
- Active tests, focused test fixtures, asset provenance docs, current design/spec docs, and build scripts.
- Root `card-art-index.json`, which is an input to the booster-art build workflow.

### Prevent recurrence

- Extend `.gitignore` for generated APK/source ZIP handoff artifacts, `source/artifacts/`, and transient release reports.
- Replace the stale source README/changelog dump with a concise canonical-source/build README linking to `docs/RELEASE_HISTORY.md` for history.
- Add a repository-hygiene regression that rejects known generated delivery artifacts in canonical source.

### Release identity

The uploaded tree is internally inconsistent: Gradle is at `0.66.3`, visible HTML is `0.64.1`, and package/runtime metadata is `0.64.0`. v0.67.0 must normalize `versionName`, `versionCode`, package metadata, runtime build metadata and visible version strings to one identity.
