# LuckyDex v0.40.1 — Adventure 3.0 Gen III UX / Mobile Refinement Pass

## Role

You are working on the supplied **LuckyDex v0.40.0 source**. This is a focused refinement pass on the Adventure 3.0 implementation that already exists.

Do **not** redesign Adventure from scratch again. The persistent Kanto/Johto/Hoenn journey architecture, Wild Hunt/catch chains, Party ownership, battle mechanics, save migration, one-time reward protections, Poké Mart transactions, and old-Expedition retirement from v0.40.0 are the accepted foundation.

The problem now is **presentation, flow, mobile ergonomics, naming, and interaction clarity**.

The current build is mechanically much closer to the intended game, but on a real Android phone it still feels too much like a browser RPG / web form. The goal of this pass is to make Adventure feel like a **compact Gen III-era handheld Pokémon-style game interface inside LuckyDex**.

Target release: **v0.40.1 / Android versionCode 4001**.

---

# 1. Read this first

Before editing:

1. Read `README.md`, `TEST_REPORT_v0.40.0.md`, and:
   - `docs/ADVENTURE_JOURNEYS_V040.md`
   - `docs/ADVENTURE_BATTLE_V040.md`
   - `docs/ADVENTURE_BALANCE_V040.md`
2. Inspect all current Adventure 3.0 files, especially:
   - `app/src/main/assets/adventure/adventure-regional-ui.js`
   - `app/src/main/assets/adventure/adventure-regional.css`
   - `app/src/main/assets/adventure/adventure-battle.js`
   - `app/src/main/assets/adventure/adventure-battle.css`
   - `app/src/main/assets/adventure/adventure-tools.js`
   - `app/src/main/assets/adventure/adventure-tools.css`
   - `app/src/main/assets/adventure/adventure-journeys.js`
   - `app/src/main/assets/adventure/adventure-wild-hunt.js`
   - `app/src/main/assets/adventure/adventure-hub.css`
3. Run the current Adventure tests and visual QA before changing anything.
4. Inspect the existing `artifacts/v0400/screens/` output and reproduce the current phone flows yourself in the browser harness.
5. Use test-first changes for behavior and regression bugs.
6. Preserve unrelated LuckyDex systems byte-for-byte wherever the existing preservation contract expects that.

Do not paper over the user feedback with CSS-only changes if the underlying interaction model is what causes the bad screen.

---

# 2. User feedback to solve

These are direct acceptance requirements.

### Battle move menu
Current issue:
- Tapping FIGHT opens a huge move panel.
- Four oversized move cards fill most of the screen.
- Every card repeats power, accuracy, PP and long descriptions.
- It is slow to scan and feels like a website.

Required direction:
- FIGHT must open a **compact 2×2 move selector**.
- Choosing a move should be fast.
- Do not show four full encyclopaedia cards at once.
- Keep deeper information available, but secondary.

### Forced profile / location result screen
Current issue:
- Routine interactions end in a large `Location complete` / party profile screen.
- It is forced after normal progression and interrupts the game loop.

Required direction:
- The party/profile/status view becomes **optional**.
- Routine location interactions should return naturally to the current location or next location menu.
- Reserve full result/interstitial screens for genuinely important events: badge wins, League milestones, major campaign completion, etc.

### TM Case / Moves
Current issue:
- `TM Case & Moves` is a long scrolling page.
- Known moves are giant stacked cards.
- Native Pokémon selection and long lists feel like forms.
- It is visually messy and not suitable for phone use.

Required direction:
- Rebuild this into a compact handheld-game menu.
- Standard move management must not require page scrolling.
- Replace native `<select>` UX with a custom in-game picker.
- No giant vertical move-card stack.

### Scrolling
Current issue:
- Core Adventure screens require too much scrolling.
- Party replacement can invoke a giant Android-native selection list.
- Move details and TM management are vertically long.

Required direction:
- **Core gameplay interactions should fit within the viewport.**
- No document-level scrolling for routine Battle, Party, Moves/TM, location action, shop confirmation, or post-interaction flows at normal phone sizes.
- Large datasets should use **pagination, compact grids, tabs, or contained custom paging**, not a giant browser/native list.
- Do not solve this by shrinking text until it is unreadable.

### Location naming and meaning
Current issue:
- Generated labels such as `New Bark Town supply stop` make a reward interaction sound like a physical place.
- The player can appear to be “located at a supply stop”.
- The UI explains the journey in system language rather than presenting actual Pokémon-like places.

Required direction:
- The player is at **real locations**: `New Bark Town`, `Route 29`, `Cherrygrove City`, `Sprout Tower`, `Violet Gym`, etc.
- A supply cache is an **action/reward within a location**, never the location name itself.
- Remove awkward generated names such as `<location> supply stop` and `<location> rare sighting` from primary location identity.

### Location gameplay
Current issue:
- The current location screen still reads like authored browser cards and prose.
- Too much flavour text explains what is happening.
- The player needs clearer, more open-ended actions.

Required direction:
Make each place feel like a small game menu.

Examples:

**Route**
- Search the grass
- Challenge / encounter a trainer when appropriate
- Fish if the route has accessible water
- Explore
- Use Wild Hunt / continue a catch chain where appropriate
- Continue onward

**Town / city**
- Talk to locals
- Visit Pokémon Center
- Visit Poké Mart
- Check Party
- Challenge Gym when present/unlocked
- Leave / continue journey

**Cave / tower / forest / special area**
- Explore
- Search for Pokémon/items
- Trainer encounter
- Context-specific action
- Continue onward

The exact set must be context-aware. Do not show actions that make no sense in the current place.

Do not turn this into a free-roaming RPG. Keep the existing authored persistent journey structure; change how each location is **presented and interacted with**.

### Visual direction
Current issue:
- Large white cards, browser-like buttons, native form controls, long prose and scrolling make Adventure look like a web game.

Required direction:
- Strong **Gen III / GBA handheld menu feel**.
- Compact windows.
- Pixel-art framing.
- Clear focus/selection states.
- Small status strips.
- Tight spacing.
- Strong hierarchy.
- Crisp readable typography.
- Scene art visible instead of buried under white panels.
- Menu windows should feel like game UI, not HTML cards.

Do not simply imitate a web page with pixel fonts.

---

# 3. Non-negotiable design rule

The player should usually be able to answer these instantly:

1. **Where am I?**
2. **What can I do here?**
3. **Where am I going next?**
4. **What state is my party in?**

Do this with concise UI hierarchy, not explanatory paragraphs.

Use **place + actions + status**, not place + essay.

---

# 4. Battle FIGHT redesign

Current `adventure-battle.js` renders a command panel and then a large `adv-battle-drawer` containing `moveButtons(p)`.

Rework the FIGHT state.

## Required layout

When FIGHT is selected:

- Keep battle actors and HP/status visible.
- Replace the giant drawer with a compact lower battle menu.
- Four move slots in a **2×2 grid**.
- Each slot prioritises:
  - Move name
  - Type
  - Category icon/short label if room
  - Current PP / max PP
- Use type styling subtly; readability first.
- Selected/focused move gets one compact info strip showing:
  - Power
  - Accuracy
  - Short factual effect
- Do not repeat the full description on all four buttons simultaneously.
- Close/back returns to command menu immediately.
- Disabled/no-PP state must be obvious.
- Tap targets remain mobile-accessible.

Target feel: Pokémon battle command speed, not a modal knowledge page.

## No-scroll requirement

At:
- 360×640
- 360×780
- 412×915

the battle field, message, command/move selector and all four moves must be usable without document scrolling.

The smallest layout may reduce secondary details, but never hide the move name or PP.

## Preserve
- Existing priority → Speed → seeded tie resolution.
- PP semantics.
- Bag/switch/capture restrictions.
- wild LEAVE behavior.
- battle save/reload behavior.
- Wild Hunt chain rules.

---

# 5. Moves / TM Case redesign

The existing `adventure-tools.js` `screen === 'moves'` branch is too vertically expansive and currently uses native form controls.

Replace it with a compact in-game tool screen.

## Structure

Use a fixed Adventure tool shell with tabs or segmented navigation:

- **MOVES**
- **LEARN**
- **TM CASE**

A fourth tab is not necessary unless the existing implementation genuinely needs it.

### Pokémon picker
- No native `<select>`.
- Show the currently selected Pokémon as a compact header card with sprite, name, Collection Lv., Journey Lv. if active, and type(s).
- Tapping it opens a custom game-style picker.
- Picker must use a compact grid/list with sprite + name + level.
- Use pagination (for example 6–8 entries per page depending on viewport) and/or compact search.
- Do not invoke the Android browser/native select sheet.
- Selection happens inside LuckyDex UI.

### MOVES
- Show the current four known moves as a compact **2×2 move grid**.
- Same shared visual language as battle move selection.
- Selecting one move reveals details in one shared info panel.
- Do not stack four full-size cards vertically.

### LEARN
- If there are pending level-up moves, show them compactly.
- Show the candidate move and four current replacement slots together.
- The user can compare without scrolling through several screens.
- Confirm replacement clearly.
- If nothing is pending, show a short empty state, not a large heading plus paragraph stack.

### TM CASE
- Show owned TMs in compact rows/tiles.
- Include move name, type, owned count, and compatibility for selected Pokémon.
- Use paging rather than a huge vertical page.
- Search/filter may remain if useful, but should be compact.
- Selecting a TM opens the same 4-slot replacement comparison.
- Keep transaction safety from v0.40.0: no double consume, stale-selection safety, failed-save rollback.

## Shared move component
Continue to use one authoritative move formatter/view model where practical, but add compact variants rather than duplicating move rules.

No raw internal syntax or enum names may leak to UI.

---

# 6. Party / Pokémon selection redesign

The current Android-native-looking replacement selector is unacceptable.

## Required
- Replace native radio/select presentation with a LuckyDex game menu.
- Fixed in-app panel/window.
- Pokémon sprite.
- Pokémon name.
- Collection level.
- Journey level when relevant.
- Current HP/status when relevant.
- Strong selected / active-party state.
- Clear lead marker.
- Page controls instead of a giant vertically scrolling OS list.
- Optional search/filter only if compact.

## Party screen
The main Party screen should itself fit a normal phone viewport.

Use:
- three compact party slots/cards,
- one selected Pokémon detail pane,
- small actions: LEAD / MOVE / REPLACE / SUMMARY / MOVES as appropriate.

Avoid showing every possible detail all at once.

Do not send the user back to Collection.

---

# 7. Remove the forced routine “Location complete” interruption

Find the current normal interaction flow that produces the large result card headed `Location complete`.

Change the state flow so:

### Routine actions
Examples:
- talking to an NPC,
- resting,
- collecting ordinary supplies,
- resolving a small route event,
- leaving a shop,
- ordinary trainer/wild interaction when no milestone was reached,

return the player directly to the current place menu or advance to the next place naturally.

Use a brief inline status/message/toast where feedback is needed:
- `Party restored.`
- `Found 2 Poké Balls.`
- `Trainer defeated.`
- `Route 29 cleared.`

Do not force an interstitial profile screen.

### Keep dedicated result screens for:
- Gym Badge earned
- Elite Four / Champion milestone
- Region completion
- major one-time unlock/reward if it genuinely deserves a result screen

The profile/party status remains reachable explicitly through Party/status UI.

---

# 8. Reframe the journey around actual locations and contextual actions

Do not discard the persistent journey data introduced in v0.40.0.

Instead, change the UI model from:

> node/section card + flavour paragraph + continue button

toward:

> actual location + concise context + available actions

## Location identity

The large title is always the real place:
- New Bark Town
- Route 29
- Cherrygrove City
- Sprout Tower
- Violet City / Violet Gym
etc.

Do not set current location to generated detour names.

The route/chapter progress can be a small secondary line, e.g.:
`JOHTO · Road to Violet City`
or a compact map/progress strip.

## Generated detours

The current `adventure-journeys.js` generates labels like:
- `${name} supply stop`
- `${name} Wild Hunt`
- `${name} rare sighting`

Do not use the first/third as location names.

Convert these to **actions at the parent location**.

Examples:
- `Search for supplies`
- `Rare Pokémon sighting`
- `Wild Hunt`

If the player resolves them, they remain at the same actual location unless the authored journey says they physically moved.

## Route action menu

A route should generally present a compact contextual menu such as:
- **SEARCH GRASS**
- **TRAINER**
- **FISH** (only if this location is water-enabled and fishing is valid)
- **EXPLORE**
- **WILD HUNT**
- **CONTINUE**

Do not show every action at every route.

Use existing regional encounter pools and current battle/capture systems.

### Fishing
Do not build a huge rod subsystem in this pass.
If a location is marked as having accessible water, implement a simple context action using the existing wild encounter/battle machinery and an appropriate water encounter pool. If the current data cannot support a correct water encounter for that location, omit FISH rather than faking it.

## Town/city action menu

Typical compact actions:
- **TALK**
- **POKÉMON CENTER**
- **POKÉ MART**
- **PARTY**
- **GYM** when relevant/unlocked
- **LEAVE / CONTINUE**

A city should feel like a hub, not a flavour card.

## Special areas
Caves, forests, towers and similar locations use context-specific verbs and existing mechanics. Keep copy short.

---

# 9. Reduce flavour text aggressively

The current journey UI over-explains simple actions.

Examples of text that should be reduced:
- long explanations of where the route leads,
- prose explaining that a guide will rest the party,
- repeated “next major destination” paragraphs,
- event cards telling the player what the buttons already communicate.

Rules:
- Prefer one concise subtitle.
- Prefer verbs on buttons.
- Use flavour text only where it adds character or necessary context.
- Most normal location screens should need no more than 1–2 short lines outside labels/actions.

Example:

Instead of:

> Route 29 leads towards Cherrygrove and Violet City. Check your partners with a local guide, or explore a nearby patch for supplies.

Prefer:

**NEW BARK TOWN**  
`Next: Route 29`

Then actions:
- TALK
- POKÉMON CENTER
- CHECK PARTY
- LEAVE FOR ROUTE 29

Do not make every place narrate itself.

---

# 10. Gen III visual language

This pass is not complete unless the screenshots clearly stop looking like browser cards.

## Use the existing local Adventure art
Reuse the packaged pixel scenes, Pokémon sprites, objects, battle assets and backgrounds.

Do not introduce random external artwork unless absolutely necessary.

## Visual system
Create a consistent Adventure window/menu language:

- pixel-style framed windows
- cream/light inner panels with darker 2–3 step borders
- compact green/navy status bars
- highlighted selection cursor/state
- small headers
- crisp pixel sprites
- restrained shadows
- fewer giant white rectangles
- fewer oversized modern buttons
- less dead whitespace

Use CSS that feels deliberate at phone sizes.

## Buttons
Primary actions should look like menu choices, not web CTA cards.

Where helpful:
- use arrow/cursor marker for current choice,
- use two-column menus,
- use smaller rectangular menu rows,
- reserve large full-width gold action buttons for genuinely major actions.

## Typography
Keep the pixel/handheld feel while maintaining legibility.

Do not:
- make everything uppercase,
- use tiny text to force fit,
- allow awkward wraps such as 3–4 lines for common actions,
- allow monospace labels to become visually noisy.

## Scene visibility
Keep the scene art visible behind/around menus.
Do not cover most of the screen with opaque panels unless the screen is intentionally a full menu such as Party/TM Case.

---

# 11. Viewport / scrolling contract

This is a hard requirement.

Test all primary Adventure screens at:
- 360×640
- 360×780
- 412×915
- 768×1024

Also spot-check 320×568.

For the main phone targets:

### Must not require document-level vertical scrolling
- Adventure location action menu
- normal post-interaction return
- battle command menu
- battle FIGHT move selection
- Bag in battle
- Pokémon switch selector in battle
- Party overview
- Pokémon 4-move view
- pending move replacement
- TM teaching confirmation
- Poké Mart purchase confirmation

### Large collections
Party replacement / owned Pokémon / TM inventory may have more entries than fit.

Use:
- pagination,
- page arrows,
- search,
- compact categories,

rather than one giant scrolling document or native system selector.

If a contained list absolutely needs scrolling at 320×568, it must be inside a clearly bounded game window and must not cause the whole page/footer to disappear. At 360×640 and up, prefer paging so the primary interface remains fixed.

---

# 12. Header / navigation cleanup

The current header often has BACK on the left and BAG on the right, while Party/Bag/Mart are repeated lower down.

Reduce duplication.

Each screen should have a predictable compact header:
- back
- place/screen title
- one optional contextual shortcut at most

Do not show BAG twice on the same screen.

Adventure location screens should expose Party/Bag/Mart/Center through the contextual action menu or a compact tool strip, not several redundant controls.

---

# 13. Mechanics to preserve exactly unless a test proves a bug

Do not regress:

- Kanto / Johto / Hoenn persistent journey saves
- permanent badges/checkpoints
- chapter recovery on defeat
- League recovery
- one-time reward claim safety
- save migration/idempotence
- Wild Hunt catch chains and exact v0.40.0 bonus math
- battle priority / Speed ordering
- battle PP/status logic
- Collection level persistence
- Journey level syncing
- party injury/PP persistence across removal and region changes
- TM atomic consume/rollback protection
- Mart confirmation/revalidation/rollback
- existing coin/item prices
- current region availability
- unrelated Arcade / packs / cards / Dust / Collection / achievement systems

This is a UX and interaction-flow pass, not a balance reset.

---

# 14. Tests to add/update

Use TDD for behavior changes.

At minimum add regression coverage for:

1. FIGHT renders four compact move choices and one shared detail area rather than four expanded descriptions.
2. FIGHT opens without document overflow at phone viewport.
3. Party replacement does not use native `<select>` / native radio sheet.
4. TM Case Pokémon picker does not use native `<select>`.
5. Four known moves fit in compact layout.
6. Routine location resolution does not force the old `Location complete` interstitial.
7. Gym/badge result still uses a dedicated milestone result.
8. Supply cache keeps the parent location identity.
9. `New Bark Town supply stop` is not exposed as current location text.
10. Route 29 location menu exposes appropriate route actions.
11. Town/city location menu exposes appropriate town actions.
12. FISH only appears for a location with valid water support.
13. No duplicate BAG controls on the same normal location screen.
14. Core screens meet the no-document-scroll contract at 360×640, 360×780 and 412×915.
15. No horizontal overflow.
16. Back behavior is deterministic from custom pickers and move menus.
17. Rapid taps on pagination/selection do not duplicate transactions or actions.
18. Existing Adventure v0.40.0 preservation / migration / economy / battle suites remain green.

Update the current visual QA harness rather than replacing it with screenshot-only assertions.

---

# 15. Visual QA is mandatory

Generate fresh screenshots for at least:

- Adventure home
- New Bark Town
- Route 29
- a city with Center/Mart/Gym actions
- a route with grass actions
- a water-enabled location if available
- Party overview
- Party replacement picker
- Pokémon Moves
- pending move replacement
- TM Case
- TM teaching flow
- battle command menu
- FIGHT 2×2 move menu
- Bag battle menu
- Pokémon battle switch menu
- Wild Hunt encounter
- Poké Mart
- purchase confirmation
- Gym preparation
- badge result

Capture at minimum 360×780 and 412×915, and run overflow checks at 360×640.

Do not accept the pass just because assertions are green. Inspect the screenshots yourself.

The question to answer visually is:

> Does this now look like a compact handheld Pokémon game menu, or does it still look like a web page with Pokémon sprites?

If the answer is still “web page”, iterate before packaging.

---

# 16. Copy / syntax audit

Audit all player-visible Adventure strings changed or touched by this pass.

Requirements:
- correct Pokémon capitalization
- correct apostrophes
- correct place names
- concise English
- no raw enum values
- no debug/system language
- no awkward generated compound names
- no `undefined`, `[object Object]`, stale placeholders, internal IDs
- consistent `Poké Mart`, `Pokémon Center`, `TM Case`, `Wild Hunt`, `Journey Lv.`, `Collection Lv.` terminology

Avoid excessive flavour copy.

---

# 17. Release requirements

When complete:

1. Bump:
   - `versionName '0.40.1'`
   - `versionCode 4001`
2. Update README with a concise v0.40.1 section.
3. Create `TEST_REPORT_v0.40.1.md` including:
   - baseline findings,
   - changed Adventure files,
   - focused tests,
   - full continuing test inventory,
   - inherited failures clearly separated,
   - visual QA viewport results,
   - Android build result,
   - limitations.
4. Preserve signing identity.
5. Build APK if the existing environment supports it.
6. Package a clean:
   - `LuckyDex_source_v0.40.1.zip`
7. If APK builds successfully, also provide the versioned APK.
8. Do not push/merge unless explicitly asked.
9. Leave a clean handover describing exact UI/state changes.

---

# 18. Acceptance checklist

Do not call v0.40.1 complete unless all of these are true:

- [ ] FIGHT no longer opens the giant four-card move sheet.
- [ ] Move choice is a compact 2×2 handheld-style menu.
- [ ] Move detail is secondary and shared, not repeated four times.
- [ ] Party replacement no longer opens an Android/browser native form list.
- [ ] TM Case no longer uses a native Pokémon `<select>`.
- [ ] TM / move management no longer presents giant vertically stacked move cards as the primary UI.
- [ ] Routine interactions no longer force `Location complete`.
- [ ] Party/profile/status is optional during ordinary travel.
- [ ] Real place names remain the player's location identity.
- [ ] `New Bark Town supply stop`-style labels are removed from primary location naming.
- [ ] Supply/rare interactions are actions within the actual location.
- [ ] Routes present contextual actions such as grass/trainer/explore/fishing where appropriate.
- [ ] Cities present contextual actions such as talk/Center/Mart/Gym where appropriate.
- [ ] Normal location text is significantly shorter.
- [ ] Core phone gameplay fits without document scrolling.
- [ ] Long owned-Pokémon/TM datasets use custom paging/search rather than giant native/browser lists.
- [ ] Header controls are not redundantly duplicated.
- [ ] Adventure has a visibly stronger Gen III/GBA menu feel.
- [ ] Existing v0.40.0 journey, economy, save, reward, battle and Wild Hunt mechanics remain intact.
- [ ] Visual QA has been manually inspected, not only machine-checked.
- [ ] v0.40.1 source ZIP is freshly packaged from the verified final tree.

---

# Final product intent

Adventure 3.0 already has the right broad mechanics.

This pass should make it **feel like a game**.

The user should be moving through Johto/Kanto/Hoenn via recognisable places, seeing a concise set of sensible actions, opening fast compact menus, and making decisions without fighting scrolling, giant cards, native web controls or explanatory prose.

The target is not “a responsive Adventure web page”.

The target is:

**a LuckyDex Adventure mode that feels convincingly like a polished Gen III handheld Pokémon-style game interface on a modern phone.**
