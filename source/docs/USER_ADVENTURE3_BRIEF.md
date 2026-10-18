# LuckyDex v0.40.0 — Adventure 3.0 Full Rework Codex Pass

You are working on LuckyDex starting from the **v0.39.1 source**. This is a full Adventure-mode rework and should ship as **v0.40.0 / Android versionCode 4000** unless an unavoidable repository constraint requires otherwise.

This is not a cosmetic pass. Adventure currently contains two competing designs: the older Roam + branching Expedition system and the newer Regional Adventure, which is itself still structured as a long roguelike run. The goal is to make Adventure feel like one coherent, persistent Pokémon journey while retaining the strongest parts already built.

## Product direction — already approved, do not re-litigate it

The approved direction is:

- **Adventure becomes one coherent game mode.**
- **Remove the old branching Expedition roguelike completely from the playable UI and active gameplay.**
- **Keep and improve the existing Roam / Field Chain catch-streak gameplay**, renamed/presented as **Wild Hunt**.
- **Regional Adventure stops being a disposable run.** Kanto, Johto and Hoenn become persistent, resumable journeys with permanent badge checkpoints.
- The main route is authored and understandable; randomness lives inside encounters, optional detours, trainers, item events and Wild Hunts.
- **Party becomes a first-class Adventure section**, not a panel buried in Collection.
- Pokémon move viewing/learning becomes a proper menu with readable, correct move information.
- The Poké Mart/shop gets a substantial usability and visual overhaul: visible balances/owned counts, purchase confirmation, before/after values, lock reasons and good feedback.
- Battle readability, visual feedback, navigation, wording, mechanics, mobile layout and general QoL should all be improved.
- Reuse the **older Adventure mode's stronger scene/environment presentation** rather than merely polishing the newer dark-teal node UI.
- Kanto / Johto / Hoenn should be brought to flagship quality first. Do **not** invent placeholder campaigns for Sinnoh onward.

Do not stop after an audit or return a design proposal. Audit first, then implement the complete pass.

---

# 1. Audit the current implementation before editing

Before making changes:

1. Read the current Adventure source completely enough to understand both implementations and their shared battle/progression code.
2. Run the existing Adventure-focused tests and establish a baseline.
3. If Playwright/browser tooling is available, run the existing Adventure screenshot/browser flows and manually inspect the current mode at realistic phone sizes.
4. Read the existing regional design/balance notes and preserve useful behaviour rather than blindly replacing systems.

Important current files include, but are not limited to:

- `app/src/main/assets/adventure/adventure-controller.js`
- `app/src/main/assets/adventure/adventure-model.js`
- `app/src/main/assets/adventure/adventure-regional-ui.js`
- `app/src/main/assets/adventure/adventure-regional-engine.js`
- `app/src/main/assets/adventure/adventure-regions.js`
- `app/src/main/assets/adventure/adventure-progression.js`
- `app/src/main/assets/adventure/adventure-battle.js`
- `app/src/main/assets/adventure/adventure-move-data.js`
- `app/src/main/assets/adventure/adventure.css`
- `app/src/main/assets/adventure/adventure-regional.css`
- `app/src/main/assets/adventure/adventure-battle.css`
- `app/src/main/assets/app-v0167.js`
- `app/src/main/assets/index.html`
- current Adventure test files under `tests/`

The existing source already contains useful regional teams, encounter pools, move/learnset data, scenes, Pokémon art and Wild Roam hotspot logic. Reuse those.

---

# 2. Remove the old roguelike without deleting Wild Hunt

The old `EXPEDITION` trail is retired.

Remove from playable Adventure:

- Expedition entry buttons and copy.
- Branching generated expedition route/node gameplay.
- Expedition run grading.
- Expedition retreat/run-complete framing.
- Run perks and perk offers.
- Guardian-as-run-boss progression specific to Expedition.
- `LEGACY ROAM & TRAILS`, `legacyPreferred`, and the idea that users choose between two Adventure implementations.
- Any user-facing references to “legacy Adventure”, “run”, “rooms”, “roguelike”, or “Expedition” that no longer apply.

Do **not** throw away the entire old controller blindly because it also owns the good Roam/Field Chain system and atmospheric presentation.

Preserve/refactor into **Wild Hunt**:

- Habitat scene presentation.
- Hotspots and environmental cues.
- Encounter reveal presentation.
- Local scene/weather/effect assets.
- Field Guide data where still useful.
- Per-destination seen/caught/rare/shiny stats.
- Catch/Field Chain state.
- Existing catch encounter and capture integration.

Retain old `adventureV2.destinations` / chain records as migration input if that is the safest route. The retired `activeExpedition` must no longer be resumable from UI.

Migration must never duplicate rewards or corrupt existing saves. If an old Expedition is active, retire it safely. Preserve already-committed catches/currency/items and historical records; do not grant its unclaimed clear reward during migration.

---

# 3. Replace Regional “runs” with persistent journeys

The existing Regional system currently creates a long generated run of roughly 41 selected nodes. Replace that structure.

## Core rule

**Main progression is authored. Moment-to-moment adventure has randomness.**

A regional campaign should feel like:

> Pallet Town → Route 1 → Viridian City → Viridian Forest → Pewter City → Brock → Route 3 → Mt. Moon → Cerulean City → Misty → … → Indigo Plateau

not:

> choose node → choose node → choose node → Gym → repeat eight times.

### Required behaviour

- Kanto, Johto and Hoenn each have independent persistent journey progress.
- Badges/checkpoints are permanent.
- Closing the app or leaving Adventure never turns the campaign into an abandoned run.
- The player resumes at a meaningful location/section.
- Region progress should explicitly record current location, current chapter, chapter/section progress, completed badges/checkpoints and finale progress.
- After earning a badge, the corresponding city/checkpoint is permanently safe/unlocked.
- A player can leave to use Party, Poké Mart, Bag, Wild Hunt, etc., then continue the same journey.
- Completed regions remain replayable/inspectable without erasing completion records.

### Journey chapter structure

Each Gym leg should be a shorter authored chapter containing approximately **3–6 meaningful route/location sections**, not four generic node layers copied eight times.

A section can contain:

- required trainer battle,
- wild encounter,
- optional trainer,
- item/cache,
- NPC/event,
- environmental decision,
- rare sighting,
- Wild Hunt detour,
- travelling merchant,
- healing/rest point,
- short optional branch.

Optional branches must enrich the journey without turning the campaign back into a global branching roguelike.

Use the existing regional `stages`, Gym teams, Elite Four and Champion data as source material, but convert broad stage data into a clearer authored journey definition. It is acceptable to add a dedicated route/chapter data module if that produces a clean boundary.

### Region map / progression screen

Create a proper regional journey presentation that clearly shows:

- current region,
- current location,
- next objective,
- earned badges,
- completed locations,
- upcoming major destination,
- optional available detours where appropriate.

Do not use a wall of anonymous “Wild battle / Trail event / Supply cache” node buttons as the primary campaign UI.

The player should always be able to answer:

1. Where am I?
2. What have I completed?
3. What am I trying to reach next?
4. What optional things can I do here?

---

# 4. Checkpoint and defeat behaviour

Remove whole-region permadeath/run failure.

When the party is defeated:

- return the player to the most recent sensible safe checkpoint / Pokémon Center / town,
- heal/recover the party appropriately,
- keep permanent badges, caught Pokémon, permanent owned EXP, TMs and already-committed inventory/currency,
- reset only the repeatable route traversal progress needed to make defeat matter,
- never make a player replay an entire region,
- never allow already-claimed one-time route rewards to be claimed repeatedly after a defeat/reset.

Use persistent claim flags for one-time items/events/rewards.

Leaving Adventure voluntarily should simply preserve current progress. There should no longer be a “retreat from the region” concept.

---

# 5. Save migration

Introduce a clean new persistent journey schema. You may evolve `adventureRegional` to a new schema version rather than inventing a completely separate top-level object if that is cleaner.

Requirements:

- Existing unrelated save data must remain untouched.
- Existing Pokémon, cards, currencies, inventory, Trainer Rank, TMs, settings, achievements, Arcade records, packs and Collection state must survive unchanged.
- Existing Wild Roam chain/field-guide records must survive.
- An **active v0.39.1 Regional run** should migrate to the nearest sensible permanent checkpoint based on its earned badge count and region. Do not make the player lose all badge progress.
- Already-committed rewards from the old run stay committed; do not re-award them.
- Historical completed-regional-run records can be retained as legacy statistics, but do not use them as a reason to skip the newly reworked campaign unless a direct safe conversion is clearly correct.
- Old active Expedition state must be safely retired with no duplicate claim.
- Migration must be idempotent.

Write explicit migration regression tests before implementation.

---

# 6. Adventure home screen

Opening the Adventure tab should no longer ask the user to choose between “Regional Campaigns” and a legacy mode.

Build a single Adventure home/base screen.

At minimum it should contain:

### Continue Journey
Prominent card/hero showing:

- region,
- current location,
- badge count,
- next objective,
- concise progress indicator,
- **CONTINUE JOURNEY**.

If no region is started, this becomes **START A JOURNEY** and opens region selection.

### Wild Hunt
Show:

- last/current habitat,
- current catch chain,
- useful chain bonus information,
- quick entry.

### Adventure tools
Clear access to:

- **PARTY**
- **POKÉ MART**
- **BAG**
- **TM CASE / MOVES**
- **FIELD GUIDE** where useful
- region map/journey overview

Avoid clutter. Mobile first.

The Adventure home should feel like a game hub, not a settings page.

---

# 7. Wild Hunt / catch streak

The user explicitly wants the catch-streak feature kept.

Rename/reframe Roam as **Wild Hunt** and make its rules legible.

Keep the core principle:

- successful capture increments the chain,
- ending an encounter without a capture can break/reset the chain according to the existing intended rules,
- chain affects rarity/discovery odds,
- chain belongs to the habitat/destination where appropriate.

Do not silently replace the existing chain math unless you identify a balance bug. If you tune it, document the before/after values and why.

### Wild Hunt UI must show

- current chain prominently,
- current habitat,
- what the chain is actually improving,
- the next meaningful threshold/bonus when practical,
- field-guide/mastery progress without drowning the playfield.

Example quality target:

> **Catch Chain ×7**  
> Rare encounter bonus: +1.4%  
> Next field bonus at ×10

Do not expose raw formulas or developer terminology.

The scene itself should remain visually dominant. Preserve hotspot tapping, environmental effects and encounter reveals.

Wild Hunt should be accessible from the Adventure home and from appropriate route locations as an optional detour.

---

# 8. Party becomes its own Adventure section

Currently the Adventure party editor lives in Collection and Adventure buttons navigate the user to Collection. Remove that dependency.

### Required changes

- Remove the **ADVENTURE TEAM / Your three partners** editing panel from the Collection page.
- Collection remains Collection.
- It is acceptable for Collection cards to retain a small read-only TEAM marker/filter, but team editing belongs in Adventure.
- Adventure gets a dedicated **Party** screen.

### Party screen

Show the three active partners clearly, including:

- sprite,
- name,
- shiny state,
- persistent level,
- current journey/synced level when applicable,
- types,
- HP/status while inside an active journey,
- role/readable stats,
- lead marker.

Allow:

- reorder party,
- set lead,
- replace a member from eligible owned Pokémon,
- remove/add members up to the current 3-member limit,
- inspect a Pokémon without leaving Adventure.

Selecting a Pokémon should open a proper detail/menu view with tabs/sections such as:

- **SUMMARY**
- **MOVES**
- **STATS**

Do not bounce the user into Collection for basic party management.

Maintain all existing save keys/ownership semantics unless a migration requires a deliberate change.

---

# 9. Make level syncing explicit

Current Regional Adventure can take a high-level owned Pokémon and instantiate it at a much lower regional battle level, while the UI says the Pokémon “keep their levels”. This is misleading.

Keep level syncing/capping if it remains the right balance tool, but make it explicit everywhere it matters.

Example:

> **Collection Lv. 30 · Journey Lv. 12**

or

> **Lv. 30 · Synced to Lv. 12 for this chapter**

Do not imply permanent levels were lost.

Review the regional level curve after persistent checkpoints replace runs. Keep the owned Pokémon progression meaningful without letting a high-level collection delete early-game balance.

Add tests for sync calculation and UI wording.

---

# 10. Moves and TM Case need a real menu

The current move/TM UI exposes compressed developer-style text such as type strings, `PWR`, raw roles and compatibility labels. Replace this with a proper Pokémon move interface.

Create one reusable move-display model/component used by:

- Pokémon Party → Moves,
- TM Case,
- move learning/replacement,
- battle Fight menu where practical.

### Every move view should correctly present available data

At minimum:

- Move name
- Type, properly capitalized
- Physical / Special / Status category
- Power, if applicable
- Accuracy, if applicable
- PP / current PP where relevant
- clear human-readable effect/role
- compatibility state for a selected Pokémon where relevant

Do not show raw internal role names such as `buff`, `debuff`, `heal`, `no-op` directly to the user.

Do not invent official flavour text. Generate concise factual descriptions from the move metadata the app actually supports, for example:

- “May paralyze the target.”
- “Restores the user’s HP.”
- “Raises the user’s offensive/defensive stance.”
- “Lowers the target’s offensive/defensive stance.”
- “No battle effect is currently implemented in LuckyDex.”

If a move has no supported battle effect, make that explicit rather than pretending otherwise.

### Learning a move

If fewer than four moves are known, allow learning directly.

If four moves are known, show a clear replacement menu:

> **Thunderbolt wants to be learned. Choose a move to forget.**

Display the new move and all four known moves with enough information to compare them before confirmation.

For TMs:

- clearly show quantity owned,
- compatibility,
- selected Pokémon,
- whether already known,
- consume the TM only after confirmed successful teaching/replacement,
- never consume on cancel/failure.

Search/filter can remain, but the UI must feel like a game menu, not a database admin table.

---

# 11. Syntax, naming and copy audit

Run a complete Adventure-facing text audit.

Fix:

- incorrect capitalization,
- raw enum/internal names,
- compressed debug-like strings,
- awkward grammar,
- incorrect singular/plural,
- inconsistent terms such as “run”, “regional run”, “expedition”, “trail” after those concepts are retired,
- misleading level/progression wording,
- `undefined`, empty labels or fallback developer text,
- inconsistent Pokémon/move/type terminology.

All user-facing Adventure text should read as intentional production copy.

Add tests for critical generated labels/formatters rather than relying only on screenshot inspection.

---

# 12. Poké Mart/shop overhaul

The current supply shop is essentially a list of bundles with a cost button and immediate purchase. Rebuild it into a proper Poké Mart experience.

### Shop header/status

Always show:

- current Lucky Coin balance,
- Trainer Rank if stock is rank-gated,
- a clear shop title/context.

### Item cards/rows

Show:

- item name,
- useful description,
- quantity in bundle,
- cost,
- quantity currently owned,
- rank requirement if locked.

If locked, state the actual requirement.

If unaffordable, show the shortfall/readable reason instead of just silently disabling the control.

### Purchase confirmation

Tapping an available item must open a confirmation step before debit.

Example:

> **Buy 3 Potions?**  
> Cost: 180 Lucky Coins  
> Coins: **1,240 → 1,060**  
> Potions: **7 → 10**  
> CANCEL · BUY

The purchase must be transactional:

- validate balance/requirements again at confirmation time,
- debit and grant together,
- never debit without granting,
- never double-buy from rapid taps,
- save immediately,
- show concise success feedback.

Use the same purchasing component for route merchants where possible rather than maintaining separate shop semantics.

Preserve the existing supply economy initially unless balance testing demonstrates a problem. Do not casually inflate costs/rewards during a UI pass.

---

# 13. Bag / inventory QoL

Create an Adventure-owned Bag view or sheet that lets the player understand current usable supplies without entering battle.

At minimum show current counts and purposes for:

- Poké Balls
- Great Balls
- Ultra Balls
- Berries
- Potions

Use correct current mechanics in descriptions.

Do not expose items/actions that cannot be used in the current context as if they can.

The Bag should be reachable from the Adventure home and sensible journey screens.

---

# 14. Battle UX overhaul

The battle engine is valuable and should be evolved rather than replaced with a full competitive simulator.

The goal is **clear, satisfying Pokémon-like decision making**, not perfect cartridge emulation.

### Command hierarchy

Use a clear battle command hierarchy rather than dumping four move buttons and utility buttons into the same visual level.

Preferred direction:

- **FIGHT**
- **BAG**
- **POKÉMON**
- **RUN / LEAVE** only where allowed

FIGHT opens the four-move menu.

For trainer/Gym/League battles, RUN should be absent or clearly unavailable rather than saying “retreat from region”.

Wild Hunt battles can allow leaving/fleeing according to the intended chain consequence.

### Move buttons

Show move name, type/category, PP and enough information to make a decision. Effectiveness feedback should be legible but not spoil unrevealed information unnecessarily.

### Enemy team progress

Trainer/Gym/League fights should clearly show e.g. `2 / 4 Pokémon remaining` or party markers, not hide multi-Pokémon progression inside banner text.

### Status/readability

Make statuses readable and consistently named. Improve feedback for:

- super effective,
- not very effective,
- immunity,
- miss,
- status inflicted,
- residual damage,
- stat/stance changes,
- faint,
- switch,
- catch success/failure.

### Mechanics audit

Review mechanics that currently look meaningful but barely matter.

In particular, **Speed should matter in normal turn order**.

The source CSV already contains move priority. Extend generated move data to include priority if needed, then resolve move-vs-move order using:

1. move priority,
2. Speed,
3. deterministic seeded tiebreak.

Keep item/switch/capture ordering simple and documented; do not attempt to clone every official rule.

Preserve deterministic seeded battle behaviour for tests/replays.

Review STAB, effectiveness, Accuracy, PP, statuses and enemy AI for obvious inconsistencies. Keep simplification intentional and documented.

Do not introduce hidden pay-to-win mechanics or excessive grinding.

---

# 15. Gym and League presentation

Gyms should feel like chapter finales, not just a special node.

Before a Gym battle, give the player a clear preparation screen showing:

- Gym Leader,
- city,
- type/theme,
- current party,
- ability to enter Party/Bag/possibly Mart before challenge,
- badge reward/next unlock where appropriate.

After victory:

- proper badge-earned presentation,
- permanent checkpoint commit,
- clear rewards,
- next destination unlocked,
- no possibility of re-awarding the badge reward on refresh/back-navigation.

Elite Four and Champion should use a deliberate League flow rather than another generic sequence of nodes.

Keep existing canonical teams/data already present unless there is a verified correctness issue.

---

# 16. Visual direction

The old Adventure presentation is visually stronger than the current Regional UI. Use that as the foundation.

Preserve/reuse:

- scene artwork,
- environmental layers,
- Pokémon sprite staging,
- hotspot effects,
- weather/atmosphere,
- battle backdrops,
- trainer art,
- pixel-art visual character.

Regional Journey should feel like locations, not a dashboard of bordered teal boxes.

Use biome/location scenes behind journey sections, city/Gym cards and encounter screens. It is acceptable to use the existing five habitat scenes as visual families where dedicated art does not exist, but label the actual canonical route/city clearly.

Avoid AI-looking replacement art. Prefer existing local assets and coherent pixel-art treatment.

### Mobile requirements

Design primarily for Android phone sizes.

At minimum inspect:

- ~360×780
- ~412×915
- a short-height device
- a wider/tablet viewport for gross regressions

No:

- clipped bottom controls,
- text underneath Android navigation,
- accidental horizontal scroll,
- microscopic labels,
- oversized empty gaps,
- headers consuming half the playfield,
- modal content that cannot be reached,
- important buttons hidden below fixed chrome.

Respect reduced motion.

---

# 17. Route/mastery replayability without grind

Allow completed routes/locations to remain useful without making story progression require grinding.

A simple location mastery model is encouraged, reusing existing Field Guide records where sensible.

Examples of optional mastery goals:

- story clear,
- featured species caught,
- optional trainer defeated,
- hidden item found,
- Wild Hunt catch-chain milestone.

These should reward completionists but **must not gate normal Gym/story progression**.

Avoid adding another giant progression currency/tree in this pass.

---

# 18. Economy and reward safety

Adventure already writes directly to shared Lucky Coins, inventory, Pokémon ownership and TMs. Keep all rewards transaction-safe.

For every one-time reward:

- write the claim/completion flag and reward in the same synchronous transaction/save path,
- refreshing/re-entering/back navigation must not duplicate it,
- failed actions must not consume currency/items,
- purchase confirmation must revalidate at commit.

Add regression tests for duplicate-claim and rapid-tap cases.

---

# 19. Architecture expectations

Do not grow `adventure-regional-ui.js` into an even larger monolith if clean separation is feasible.

Prefer focused responsibilities, for example:

- persistent journey/state engine,
- authored region/journey data,
- Wild Hunt controller/model,
- Adventure hub/navigation UI,
- Party UI,
- Shop/Bag UI,
- reusable move formatting/menu UI,
- shared battle engine.

You do not have to use those exact filenames, but the final boundaries should be clearer than the current “two Adventure controllers wrapping each other” structure.

At the end there should be **one public Adventure entry point**, not a regional wrapper plus a legacy wrapper switching ownership based on flags.

Remove dead code once migration no longer requires it. Do not leave retired Expedition buttons/functions reachable “just in case”.

---

# 20. Testing — TDD required

Add failing regression tests before production changes for the new architecture/behaviours.

Coverage must include at least:

### Save/migration
- schema migration is idempotent,
- old active regional badge progress maps to a sensible permanent checkpoint,
- old Wild Hunt chain survives,
- old Expedition cannot resume and does not duplicate rewards,
- unrelated save data survives unchanged.

### Journey
- permanent badge checkpoint,
- leave/resume persistence,
- defeat returns to checkpoint instead of ending a region,
- claimed route rewards do not duplicate after defeat/replay,
- Kanto/Johto/Hoenn progression can reach Champion,
- unavailable later regions remain clearly unavailable.

### Wild Hunt
- chain survives the refactor,
- successful capture increments,
- intended non-capture outcome resets/breaks correctly,
- rarity/item bonuses use chain,
- UI exposes chain/bonus correctly.

### Party
- Collection no longer owns the editor,
- Adventure Party add/remove/reorder/lead logic,
- three-member cap,
- current synced level is displayed separately from persistent level.

### Moves/TMs
- human-readable formatting,
- category/type/power/accuracy/PP display,
- compatibility,
- replace flow,
- cancel does not consume TM,
- confirmation consumes exactly once,
- unsupported field/status effects are not misrepresented.

### Shop
- balance and owned quantity visible,
- rank lock reason,
- unaffordable state,
- confirmation preview values,
- confirmation-time revalidation,
- exactly-once debit/grant,
- rapid-click protection.

### Battle
- Speed affects order,
- move priority outranks Speed,
- deterministic ties,
- trainer Pokémon cannot be caught,
- wild flee/chain interaction,
- enemy-team progress,
- status/effectiveness copy.

### Mobile/browser
Add/update Playwright tests/screenshots for key screens when browser tooling is available:

- Adventure home
- Region map/journey
- route section
- Wild Hunt
- Party
- Pokémon Moves
- TM Case
- Poké Mart confirmation
- battle FIGHT menu
- Gym prep/result
- defeat/checkpoint recovery

Use multiple phone viewport heights to catch cut-offs.

Run the existing full repository test inventory after targeted tests and report inherited failures separately from regressions introduced by this pass.

---

# 21. Balance validation

Update the regional balance simulator so it reflects the persistent journey rather than generated node runs.

Check at least:

- typical battles per Gym leg,
- total battles per region,
- level curve,
- high-level collection syncing,
- potion usage/availability,
- coin flow,
- TM acquisition,
- defeat frequency,
- League difficulty.

The desired feel is:

- the player progresses by playing, not grinding,
- optional Wild Hunts/mastery make extra play rewarding,
- Gyms feel meaningful,
- no chapter is padded with dozens of filler battles,
- a complete region is substantial but not hundreds of repetitive turns.

Document any material tuning changes.

---

# 22. Preserve unrelated LuckyDex systems

This pass must not regress:

- Pack opening / entitlement safety
- Collection/binder
- Dust trading
- Trade
- Arcade/minigames
- Achievements
- Trainer Rank
- Cards/sealed packs
- Profile
- Navigation/back handling
- offline asset behaviour

Adventure changes may touch shared Collection HTML/state because Party is moving out, but do not redesign unrelated sections in this pass.

---

# 23. Release and deliverables

Ship as **LuckyDex v0.40.0**.

Update:

- `package.json`
- `package-lock.json`
- Android `versionName`
- Android `versionCode` → **4000**
- release/test report
- any handover/readme that tracks current release state

Produce:

1. **Versioned source ZIP:** `LuckyDex_source_v0.40.0.zip`
2. **APK** if the repository/build environment supports a verified Android build; do not claim one if the wrapper/toolchain is absent.
3. **`TEST_REPORT_v0.40.0.md`** containing:
   - Adventure 3.0 changes,
   - migration behaviour,
   - UX changes,
   - battle/mechanics changes,
   - targeted test evidence,
   - full-suite totals,
   - unavailable browser tests/environment limits,
   - syntax/build checks,
   - packaged ZIP re-verification.
4. Screenshots/contact sheet for key Adventure screens if browser tooling is available.
5. Any updated Adventure architecture/balance notes needed for the next developer.

Package from the final verified tree, then extract the produced source ZIP into a fresh directory and rerun release identity, targeted Adventure regressions and syntax checks against the packaged bytes.

Do not include `.git`, `node_modules`, caches, screenshots used only as scratch output or other transient build junk in the source ZIP.

Do not push or merge unless explicitly requested.

---

# 24. Final acceptance checklist

Do not call the pass complete until all of these are true:

- [ ] Adventure opens to one coherent home screen.
- [ ] No Legacy Adventure selector remains.
- [ ] Old Expedition roguelike is not playable/reachable.
- [ ] Wild Hunt and catch chains still work.
- [ ] Kanto is a persistent journey with permanent badges/checkpoints.
- [ ] Johto is a persistent journey with permanent badges/checkpoints.
- [ ] Hoenn is a persistent journey with permanent badges/checkpoints.
- [ ] Defeat returns to a checkpoint instead of deleting a region run.
- [ ] Leaving/reopening Adventure resumes naturally.
- [ ] Regional map/location UI clearly shows current/next progress.
- [ ] Party has its own Adventure section.
- [ ] Collection no longer contains the Adventure Team editor.
- [ ] Pokémon details include a proper Moves menu.
- [ ] TM Case uses readable move cards and safe learn/replace flow.
- [ ] Persistent level vs synced Journey level is unambiguous.
- [ ] Poké Mart shows balance, owned quantities and lock reasons.
- [ ] Purchases require confirmation and preview before/after values.
- [ ] Shop transactions are exactly-once and revalidated at commit.
- [ ] Bag is readable outside battle.
- [ ] Battle commands have clear FIGHT / BAG / POKÉMON hierarchy.
- [ ] Speed and move priority have meaningful deterministic turn-order behaviour.
- [ ] Gym/League battles feel like milestones, not anonymous nodes.
- [ ] Adventure-facing copy has been audited for syntax/grammar/internal enum leakage.
- [ ] No short-phone clipping or inaccessible controls on key screens.
- [ ] Existing unrelated LuckyDex features remain green.
- [ ] New migration and Adventure regression tests are green.
- [ ] Full available test inventory has been run and reported honestly.
- [ ] Final source ZIP has been freshly extracted and re-verified.

## The product standard

Do not treat this as “make the existing Regional screen nicer”. The successful result should feel like LuckyDex gained a real Pokémon campaign mode built from the systems already present.

The Adventure loop should be immediately understandable:

> **Continue your journey → explore a real location → fight/catch/discover → prepare your party → earn the next badge → optionally hunt/master locations → continue.**

Keep the fast, generous LuckyDex philosophy: **play the game, catch Pokémon, earn things, open packs — no artificial daily restriction, no pay-to-win pressure, and no roguelike reset forcing the player to replay content they already earned.**
