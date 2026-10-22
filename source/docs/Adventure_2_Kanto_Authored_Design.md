# LuckyDex Adventure 2.0 — Kanto Authored Journey Design

Date: 2026-10-21  
Baseline: LuckyDex v0.69.16  
Scope: deepen the existing Adventure mode without replacing its battle engine, regional save model, fishing, Wild Hunt, Journey moves, or location scene system.

## 1. Goal

Make Adventure feel worthy of being a LuckyDex main game by turning the existing regional journey into a short but memorable Pokémon campaign rather than a sequence of travel screens and battles.

The target experience is:

> **Short enough to play casually, rich enough that two routes rarely feel the same.**

Kanto is the first authored region. Its implementation should establish reusable systems that Johto and Hoenn can inherit later without copying Kanto's exact content.

Success means the player can remember *things that happened* during a run — characters, discoveries, choices, places and party moments — rather than only remembering which Gym they reached.

## 2. Non-goals

Adventure 2.0 is **not** a full Pokémon ROM recreation.

Do not:

- replace the existing battle engine;
- replace the current regional progression/save schema unnecessarily;
- build free-roaming tile-map movement;
- reproduce every canonical NPC, dialogue line, item placement or route tile;
- make routes longer merely by inserting extra mandatory battles;
- gate core progression behind owning one exact species;
- turn party utility into hidden HM requirements;
- reset existing Adventure progress, badges, records, parties or claimed rewards;
- rewrite Fishing, Wild Hunt or Journey move systems unless integration requires a small compatible extension;
- build Johto and Hoenn's authored content in the same release as Kanto.

## 3. Current-state findings

The current engine is stronger than the current authored content.

Existing strengths that should be preserved:

- nine Kanto chapters plus League progression;
- named Kanto location scenes;
- regional battles, Gyms, badges, checkpoints and League finale;
- persistent Collection levels plus capped Journey battle levels;
- Journey/Collection move separation;
- Fishing as a reusable location activity;
- Wild Hunt / local encounter systems;
- backtracking to completed locations;
- location capability infrastructure through `adventure-location-activities.js`;
- additive Adventure save state;
- mobile location/action UI.

Current content weaknesses:

- Kanto's route grammar is very repetitive: travel/wild/trainer/camp/event/Gym;
- generic event nodes commonly resolve to either a small heal or a coin/supply risk;
- generic local exploration currently resolves to only four simple rewards: coins, Poké Ball, Berry or Potion;
- TALK is often only next-destination guidance;
- Fishing is effectively the only fully developed reusable location activity;
- locations have visual identity but not enough mechanical identity;
- the party matters heavily in battle but rarely in the world;
- optional detours exist structurally but rarely tell stories;
- there is little recurring-character continuity;
- rewards rarely create anticipation because many discoveries are interchangeable consumables.

Adventure therefore has **infrastructure for personality but not enough authored material using it**.

## 4. Design principles

### 4.1 Preserve the existing backbone

Keep the existing Kanto chapter order, Gyms, regional battle progression, scenes and major save structure. Adventure 2.0 enriches the space *between* those milestones.

### 4.2 Every important location needs a reason to exist

A location should earn its place through at least one of:

- a unique activity;
- an authored event;
- a recurring-character beat;
- a party interaction;
- a discovery or secret;
- a meaningful optional challenge;
- a chapter payoff.

Visual differences alone are not sufficient.

### 4.3 Player execution and choice over passive stat checks

Party species/types can unlock contextual options, but the result should normally still involve a decision, timing task, puzzle, resource trade or meaningful choice.

Avoid interactions that simply say "you own a Water type, therefore you win".

### 4.4 No hard species gates

Party interactions must use broad capability groups such as:

- small Pokémon;
- Water-capable;
- Fire-capable;
- Electric-capable;
- Flying-capable;
- strong/heavy;
- Psychic/Ghost-sensitive;
- cutting/vine/plant-capable.

If the player's party lacks the ideal capability, the main route remains completable. They may receive a different branch, reduced reward, alternate puzzle, or simply miss an optional secret.

### 4.5 Authored plus systemic

Use authored beats for memorable moments and reusable systems for replayability.

A route should not be entirely random, but a replay should not be textually identical either.

### 4.6 Main-path density over campaign bloat

The goal is not to double the number of compulsory nodes. Most improvement should come from making current stops richer, plus small optional branches.

## 5. Architecture

Adventure 2.0 should extend the existing capability model rather than introducing a second Adventure engine.

### 5.1 Authored encounter registry

Add a data-driven Kanto authored-content registry, separate from generic regional battle data.

Each authored entry can declare:

- location ID;
- chapter and optional ordering constraints;
- trigger type;
- one-time or repeatable state;
- text/character beats;
- available choices;
- party capability checks;
- activity handoff;
- reward bundle;
- follow-up flags;
- next recurring-character state;
- Developer force ID only when a genuinely rare/random state exists.

Module boundary:

- `adventure-authored-events.js` — event schema, state normalization and generic event resolution;
- `adventure-kanto-events.js` — Kanto-specific authored content data;
- existing `adventure-location-flow.js` — presents eligible actions and routes into the event/activity;
- existing regional engine — remains authority for core journey progression and battle handoff.

The authored event module must not directly mutate unrelated global systems. It should return explicit effects/rewards to a small resolver.

### 5.2 Expanded location capabilities

Extend `adventure-location-activities.js` beyond `fish` with reusable capability types where they fit naturally:

- `search` — clue-based hidden-item/discovery interaction;
- `npcRequest` — short side request with persistent completion state;
- `headbutt` — tree encounter/item activity in suitable later regions, but Kanto may use generic tree/search interactions first;
- `rockSmash` — rubble/rock interaction with item/encounter outcomes;
- `berry` — berry-tree/plant interaction where appropriate;
- `puzzle` — lightweight location puzzle shell;
- `partyAssist` — contextual party interaction hook;
- `rematch` — optional recurring trainer/rival battle where appropriate.

Kanto does not need to use every capability type. The point is to establish clean reusable interfaces rather than hard-code one-off button logic.

### 5.3 Adventure event shell

Create a shared presentation shell for authored non-battle encounters.

It should support:

- character portrait/icon when available;
- 1–3 short paragraphs or dialogue beats;
- 1–3 large mobile-safe choices;
- optional party-assist indicator;
- concise result/payoff;
- help only when the interaction contains a non-obvious mechanic;
- pause/input lock while open;
- safe resume after Android background/foreground lifecycle changes;
- exact return to the location state that opened it.

This should feel like part of Adventure, not like an Arcade modal pasted on top.

## 6. Party utility system

### 6.1 Capability tags

Derive broad utility tags from species data and party state rather than maintaining a giant per-species exception list.

Examples:

- `small` — compact species suitable for holes, gaps or narrow spaces;
- `water` — Water type or canonically aquatic species;
- `fire` — Fire type / reliable flame source;
- `electric` — Electric type;
- `flying` — Flying type or clear flight capability;
- `strength` — high physical profile / large body / Fighting-Rock-Steel leaning;
- `sense` — Psychic/Ghost or species suited to sensing hidden/strange phenomena;
- `nature` — Grass/Bug or species suited to plants/forest interaction.

The implementation should prefer explainable, data-driven rules with a small override table for obvious edge cases.

### 6.2 Interaction rules

A party interaction should follow this pattern:

1. present an environmental situation;
2. identify a relevant party member if one qualifies;
3. let the player choose whether to use that Pokémon;
4. resolve a short interaction/puzzle/choice;
5. give a specific result and acknowledge the Pokémon by name.

Example:

> A maintenance panel in the Power Plant annex is dead. **Jolteon** could try to restart it.

The important emotional payoff is that *your Pokémon did something*, not merely that the game checked a type flag.

### 6.3 No punishment for collection choice

Failing a capability check may mean:

- taking the ordinary route;
- receiving a smaller reward;
- seeing a different text resolution;
- leaving an optional secret undiscovered for later backtracking.

It must not soft-lock chapter progression.

## 7. Recurring cast and continuity

Kanto should introduce three recurring roles.

### 7.1 Rival

A recurring rival appears at several chapter milestones.

Purpose:

- create continuity;
- provide occasional skill checks/battles;
- react to badges and previous outcomes;
- give the campaign a personal through-line.

The rival is referred to as **Rival** in v1 of this system rather than adding a naming/customisation subsystem.

Appearances:

- early Route 1 / Viridian introduction;
- Cerulean/Nugget Bridge challenge;
- Lavender or Saffron character beat;
- Route 22 pre-League confrontation;
- optional post-Champion rematch later.

Rival battles use the existing trainer battle system and should not replace Gym milestones.

### 7.2 Field Researcher

A recurring researcher teaches/uses discovery systems.

Purpose:

- Field Guide / Wild Hunt framing;
- rewards for seeing/catching local species;
- occasional research requests;
- explains regional ecological details without tutorial dumps.

Requests should be things like "log three cave species" or "show me a Pokémon found while fishing", not grind-heavy capture quotas.

### 7.3 Wayfarer Fisherman

A light recurring NPC used for humour and heart.

He appears in increasingly unlikely fishing locations, remembers previous meetings, and eventually offers a worthwhile optional payoff.

Purpose:

- make repeated locations feel connected;
- give Fishing personality;
- provide a low-stakes recurring joke without dominating the story.

His progression should be deterministic once the relevant locations are reached; any rare catch associated with him may use Developer forcing if genuinely rare.

## 8. Kanto authored chapter structure

The existing nine Kanto chapters remain. Each receives one mini-arc and at least one location-specific interaction.

### Chapter 1 — Pallet to Pewter

**Theme:** beginning a journey / learning to explore.

- Pallet Town: departure beat; Researcher introduction; optional starter-party interaction.
- Route 1: first discovery tutorial using `search` or party assist; first Rival appearance.
- Viridian City: small NPC request that introduces returning to completed locations.
- Viridian Forest: branching forest search with a nature/small-party shortcut and a hidden reward.
- Pewter: Gym remains the climax; museum-related teaser can unlock for later backtracking.

The chapter should teach Adventure 2.0's vocabulary without a wall of instructions.

### Chapter 2 — Route 3 / Mt. Moon / Cerulean

**Theme:** curiosity and hidden places.

- Route 3: unusual footprint/clue discovery.
- Mt. Moon: lightweight cave route/puzzle with two approaches; Rock-type/Flying/small-party interactions can reveal optional rewards.
- Fossil-related discovery can be referenced without creating a full fossil subsystem here.
- Cerulean: first Field Researcher follow-up.
- Gym climax unchanged.

### Chapter 3 — Nugget Bridge to Vermilion

**Theme:** competition and movement.

- Nugget Bridge: Rival rematch or authored trainer sequence payoff.
- Routes 5/6: choice between faster riskier path and exploratory path, but with authored consequences rather than generic coin RNG.
- Vermilion: first Wayfarer Fisherman reappearance; Fishing-specific optional beat.
- Gym climax unchanged.

### Chapter 4 — Rock Tunnel / Lavender / Celadon

**Theme:** atmosphere and contrast.

- Rock Tunnel: darkness/navigation interaction; Fire/Electric/Flash-like party capabilities can reveal optional information or a shortcut, but are not mandatory.
- Lavender: quieter character event; recurring cast reacts differently than on normal routes.
- Celadon: bustling-city interaction, shop/cosmetic or Game Corner flavour without duplicating existing dedicated LuckyDex games.
- Gym climax unchanged.

### Chapter 5 — Cycling Road / Fuchsia

**Theme:** speed versus observation.

- Cycling Road: short route hazard/timing activity or choice-driven descent event.
- Route 15: hidden nature discovery.
- Fuchsia: Safari-flavoured request/search content using local encounters rather than building a separate Safari Zone simulator in this phase.
- Gym climax unchanged.

### Chapter 6 — Pokémon Tower / Saffron

**Theme:** mystery and escalation.

- Pokémon Tower: multi-step authored haunted event; `sense` party capability may reveal extra information or a hidden encounter.
- Lavender return: payoff to earlier character beat.
- Saffron: urban incident involving Rival or Researcher; optional trainer/rematch branch.
- Gym climax unchanged.

### Chapter 7 — Route 19 / Seafoam / Cinnabar

**Theme:** expedition.

- Route 19: Fishing/Fisherman continuation.
- Seafoam Islands: compact current/ice/navigation puzzle using the reusable puzzle shell.
- Cinnabar: environmental discovery and Pokémon Mansion setup.
- Pokémon Mansion: search chain with a meaningful permanent/rare reward rather than generic supplies.
- Gym climax unchanged.

### Chapter 8 — Route 21 / Viridian return

**Theme:** homecoming and unfinished business.

- Route 21: callback to early-game exploration.
- Pallet Town: NPCs acknowledge badge progress and previous side outcomes.
- Route 22: major Rival battle/payoff.
- Viridian: returning NPC/request resolutions.
- Gym climax unchanged.

### Chapter 9 — Route 23 / Victory Road / Indigo Plateau

**Theme:** culmination.

- Route 23: badge-gate presentation should celebrate accumulated progress rather than act as another generic route.
- Victory Road: the strongest compact puzzle/exploration sequence in Kanto; multiple party capabilities create optional shortcuts/secrets.
- Indigo Plateau: recurring cast send-off; unresolved side threads can provide tiny acknowledgements/rewards.
- League remains the mechanical finale.

## 9. Discoveries and rewards

Adventure 2.0 needs rewards that are memorable without destabilising LuckyDex's economy.

### 9.1 Reward categories

Use a mix of:

- Lucky Coins in modest amounts;
- Adventure supplies;
- TMs / move-learning opportunities;
- cosmetics or profile collectibles where existing systems allow;
- one-time discovery badges/records;
- rare encounter opportunities;
- Fishing bait/tackle-related rewards where appropriate;
- small Card Dust / pack-related cross-mode rewards only sparingly and at milestone-level significance;
- unique key-item-style Adventure mementos that are records/collectibles rather than currencies.

### 9.2 Discovery mementos

Add a lightweight `adventureDiscoveries` collection for authored one-time finds.

Examples:

- Viridian Forest keepsake;
- Mt. Moon fragment;
- Lavender charm;
- Seafoam relic;
- Pokémon Mansion research note;
- Victory Road crest.

These are not inventory items with mechanical complexity. They exist to:

- make exploration feel permanent;
- support records/achievements later;
- let NPCs acknowledge prior discoveries;
- give regions a completion layer beyond badges.

### 9.3 Economy rules

- Generic exploration should no longer be a repeatable source of disproportionately profitable Lucky Coins.
- Authored one-time rewards may be richer because they are finite.
- Optional battles should pay in line with existing Adventure battle economy.
- Rare discoveries can reward more, but rarity must be genuine and Developer-forceable when necessary for testing.
- Cross-mode currencies must be used conservatively so Adventure does not become the optimal way to farm every other LuckyDex mode.

## 10. Route replayability

Adventure should gain variation without making story beats unreliable.

Use three layers:

1. **fixed authored beat** — defines location identity and chapter story;
2. **conditional branch** — depends on party capability, prior event flag, or player choice;
3. **small systemic variation** — encounter/reward flavour chosen from a controlled pool.

Do not randomise major narrative continuity.

Replay runs may:

- choose different branches;
- see different party-assisted solutions;
- discover missed secrets;
- complete unresolved requests;
- encounter optional rematches.

## 11. Backtracking

The existing completed-location revisit system becomes more valuable in Adventure 2.0.

Backtracking may expose:

- unresolved NPC requests;
- party-capability secrets missed earlier;
- Fishing/local encounter activity;
- recurring NPC follow-ups;
- discovery completion;
- optional rematches.

Backtracking should not reopen already-claimed one-time economy rewards.

Location cards should indicate concise completion state, such as:

- discovery found / unknown;
- request complete / available;
- local species progress;
- available activity icons.

This should remain phone-readable and avoid turning the map into a checklist wall.

## 12. UI and mobile requirements

- No essential interaction below the safe mobile viewport.
- Choice buttons at least 44px high.
- No stylus-level precision.
- Event text should be concise enough to read comfortably on a phone.
- One screen should normally contain one decision, not a dense menu of seven equivalent buttons.
- Location actions should prioritise contextually important authored actions above generic services.
- Existing Center/Mart/Fish/Look for Pokémon controls remain available where appropriate.
- If a location has more actions than comfortably fit, use a compact secondary **MORE** sheet rather than shrinking controls.
- Scene artwork remains visible during authored events where possible so the world does not disappear behind text.
- Android suspend/resume must preserve event state and current scene using the lifecycle work added in v0.69.16.

## 13. Save model and migration

All changes are additive.

Additive state lives under `save.adventureRegional.authored`:

```text
authored:
  schema
  flags
  completedEvents
  requests
  recurringCharacters
  discoveries
  locationState
```

Requirements:

- missing fields initialise safely;
- existing active journeys resume at the same region/chapter/location;
- existing badges and claimed rewards remain claimed;
- existing Fishing/Wild Hunt records remain intact;
- no existing event node should become unfinishable because its old generic resolution is already claimed;
- already-completed Kanto chapters should not force the player backwards.

### Migration policy for players already through Kanto

Previously completed chapters stay complete.

New Adventure 2.0 optional content becomes available through backtracking where sensible. Story-only beats that would make no sense after the fact should be marked as `legacySkipped`, not replayed as if they had just occurred.

Major recurring-character state should infer a sensible chapter-level minimum from badge progress so a late-game existing save does not meet the Rival "for the first time" on Route 22.

## 14. Developer / testing controls

Do not add Developer toggles for ordinary deterministic authored events.

Add force controls only for genuinely rare/random mechanics introduced here, for example:

- a rare hidden encounter;
- a low-probability special Fishing/Fisherman outcome;
- an unusual discovery variant.

Useful non-cheat diagnostics may expose:

- current authored-event flags;
- current recurring-character stage;
- location capability tags;
- party utility tags;
- discovery completion.

These are debugging visibility, not player-facing progression controls.

## 15. Records and achievements

Adventure 2.0 should add records where they reflect meaningful play rather than raw button presses.

Initial records:

- Kanto discoveries found / total;
- NPC requests completed;
- party-assisted interactions completed;
- Rival battles won;
- optional location challenges completed;
- Kanto authored completion percentage.

Achievements should be added only once the implemented event list is final enough that every requirement is demonstrably obtainable.

Potential themes:

- complete all Kanto discoveries;
- solve several different party-assist interactions;
- finish a recurring NPC storyline;
- clear Victory Road's optional challenge;
- revisit an earlier location and resolve something previously missed.

## 16. Testing strategy

Implementation follows the project's test-first rules.

### Required focused tests

- old v0.69.16 saves normalise without resetting progression;
- completed Kanto saves receive sensible recurring-character migration state;
- authored-event eligibility and one-time claiming;
- deterministic prior-choice continuity;
- party capability derivation and override cases;
- no party capability blocks main progression;
- backtracking exposes only valid unresolved content;
- one-time rewards cannot be reclaimed;
- event-to-battle and battle-to-event return paths;
- Fishing/Wild Hunt still coexist with authored actions;
- Android `pagehide`/`pageshow` preserves active authored-event state;
- mobile action priority / overflow behaviour;
- discovery records and completion counts;
- Developer force controls exist only for genuine rare mechanics;
- existing Kanto Gym/League progression still completes;
- existing Journey move, route-fishing and background-resume regressions remain covered.

### Regression suites

Run relevant existing:

- Adventure regional engine tests;
- Adventure location-flow tests;
- Adventure scene-navigation tests;
- Adventure battle tests;
- Adventure Journey/move tests;
- Fishing integration tests;
- Wild Hunt tests;
- save migration/persistence tests;
- achievements/records tests affected by new records;
- release/version tests.

Browser-dependent suites must be reported separately if Playwright remains unavailable. Do not describe a partial suite as the complete repository suite.

## 17. Release strategy

Do not implement all Kanto content as one enormous untestable patch.

Adventure 2.0 should still feel like one coherent initiative, but land in internally complete slices using the same architecture.

Implementation sequence:

### A2.0-A — Core authored systems + Chapter 1

- authored event registry;
- event shell;
- party utility capability system;
- recurring-character state model;
- discoveries state;
- Chapter 1 fully authored;
- migration/backtracking support.

This is the proof release. Chapter 1 must already feel materially better before expanding.

### A2.0-B — Chapters 2–4

- cave/search interactions;
- Rival/Researcher continuity;
- first stronger environmental party interactions;
- Lavender/Celadon atmosphere beats.

### A2.0-C — Chapters 5–7

- route hazard/puzzle shell usage;
- Safari-flavoured Fuchsia content;
- Pokémon Tower chain;
- Seafoam puzzle;
- Mansion discovery chain;
- Wayfarer Fisherman progression.

### A2.0-D — Chapters 8–League

- homecoming callbacks;
- Route 22 Rival payoff;
- Victory Road challenge;
- Indigo recurring-cast acknowledgements;
- Kanto authored-completion records and final achievement pass.

Only after Kanto feels good in real playtesting should the reusable systems be applied to Johto and Hoenn.

## 18. Acceptance criteria

Kanto Adventure 2.0 is successful when:

- the existing Kanto journey can still be completed from old and new saves;
- every major Kanto stop has at least one meaningful identity beyond its background image and encounter pool;
- each chapter contains at least one authored memorable event or payoff;
- recurring characters visibly remember earlier interactions;
- party members can affect the world in multiple optional ways;
- no exact species is mandatory for progression;
- exploration produces persistent discoveries rather than only consumables;
- backtracking has useful optional reasons without becoming compulsory cleanup;
- the economy remains secondary to the adventure rather than becoming a farm exploit;
- the mode remains comfortable to play one-handed on a phone;
- the player can describe several things that happened on the journey besides "I fought trainers and earned badges".

## 19. Explicitly deferred until Kanto proves the design

- Johto authored story conversion;
- Hoenn authored story conversion;
- full double-battle simulator;
- abilities/held-item overhaul;
- free-roaming overworld movement;
- large dialogue trees;
- relationship meters;
- full Safari Zone simulation;
- canonical story recreation scene-for-scene;
- Sinnoh and later regional campaigns.

