# LuckyDex Pokémon Dash v2 — Gen III Polish / Balance Pass

## Mission

You are working on **LuckyDex**, an Android/WebView Pokémon collecting app. The current source baseline is **v0.30.0**. Pokémon Dash v2 is mechanically good, but the current presentation is still placeholder-quality and several race-balance rules are wrong.

This is a **full focused Dash pass**, not a general LuckyDex refactor. Preserve all working non-Dash features, save data, package identity, signing identity, God Pack behavior, Arcade world behavior, and existing Dash progression unless this brief explicitly changes them.

Target the next release as:

- `versionName 0.31.0`
- `versionCode 310`
- package ID remains `com.example.luckydex`
- keep the existing `luckydex-dev.keystore` signing configuration
- package/npm version must match Android version
- runtime build marker and visible version text must match v0.31.0

The three screenshots supplied with this handoff are the current v0.30.0 mobile result and should be treated as **before** references:

1. `reference/01_race_current.jpg`
2. `reference/02_menu_current.jpg`
3. `reference/03_picker_current.jpg`

The user’s feedback is explicit:

> Mechanically the race is good: boosts, obstacles, race length and sprinting work. But the visuals do not look Gen III at all; they look like Paint/placeholders. The UI is dull. Pokémon are stretched and clumped together. There should be a much wider visible range of race speeds and racers are allowed to fall off-screen. Obstacles, boosts and terrain need proper Gen III-style pixel assets. Difficulty speed bands must be **hard restrictions** — a Pokémon below or above the selected band must not be allowed to race.

Do not reinterpret that as “recommendations.” These are requirements.

---

# 1. Start by understanding the existing Dash implementation

Read these files completely before editing:

- `app/src/main/assets/arcade-dash.js`
- `app/src/main/assets/arcade-dash.css`
- `app/src/main/assets/arcade-dash-config.js`
- `app/src/main/assets/arcade-dash-course.js`
- `app/src/main/assets/arcade-dash-league.js`
- `app/src/main/assets/index.html`
- `app/src/main/assets/arcade-platform.js`
- `app/src/main/assets/arcade-session.js`
- `app/src/main/assets/adventure/adventure-species.js`
- all existing `tests/arcade-dash*.test.cjs`
- `tests/v0300-release.test.cjs`
- `TEST_REPORT_v0.30.0.md`

Also inspect the existing local racer sprite directory:

- `app/src/main/assets/arcade/sprites/actors/pokemon/`

Do not assume a visual bug is an asset problem until checking the renderer. In v0.30.0, `drawRacer()` draws every Pokémon into a square bounding box; that is a known source of distortion.

Before changing code, reproduce the current screenshots on a mobile-size viewport if possible.

---

# 2. Non-negotiable gameplay behavior to preserve

The user likes the underlying game. Preserve unless changed below:

- six-racer race
- top-down vertical camera
- hidden three-line/lane collision model
- left/right controls
- hold-to-sprint
- stamina drain / regeneration
- rock/mud slowdown semantics
- speed-pad boost semantics
- stamina pickup semantics
- course length around the current value (`1800` world distance)
- current obstacle frequency / reaction spacing unless visual asset sizes require tiny collision-radius adjustments
- deterministic seeded courses
- no unavoidable all-lane hazard wall
- Quick Race
- 18 Type Leagues
- three-race League cups
- scoring `10 / 6 / 4 / 3 / 2 / 1`
- tie-break by total race time
- trophy persistence per type and difficulty
- pause/resume behavior on Android recents/backgrounding
- exactly-once rewards
- shiny appearance remains cosmetic
- current Lucky Coin reward tables unless a regression requires correction

Do **not** add rubber-banding that teleports/slows leaders or accelerates trailing racers. If a racer is much faster, it is allowed to leave the visible screen.

---

# 3. Hard difficulty eligibility — fix this first

The current UI labels Pokémon as “above/below” the selected speed band but still allows them to race. That is wrong.

## Required rule

A racer is eligible only when:

1. its base Speed is inside the selected difficulty band, **inclusive**, and
2. in a Type League, at least one of its types matches that league.

If either fails, it must not be possible to start the race with that Pokémon.

Create one authoritative eligibility helper and use it everywhere, e.g.:

```js
isRacerEligible(row, { mode, type, difficulty }) -> {
  eligible: boolean,
  reason: 'eligible' | 'too-slow' | 'too-fast' | 'wrong-type'
}
```

The exact name can differ, but there must be a single source of truth.

Enforce it in **all** of these places:

- racer picker rendering
- racer selection
- remembered last-racer restoration
- Start Race button state
- `startRace()` as a final defensive gate
- League entry count / eligibility copy
- difficulty cards if they show eligible counts

No UI-only gate is sufficient.

## Picker behavior

Keep collection discovery useful:

- In Quick Race, show the collection, but put eligible Pokémon first.
- Out-of-band Pokémon may remain visible, but they must be visibly disabled and non-selectable.
- Label disabled racers clearly as `TOO SLOW` or `TOO FAST`.
- Do not use vague `NORMAL · ABOVE` style text.
- In Type Leagues, continue filtering out wrong-type Pokémon; within the correct type, speed-ineligible Pokémon may be shown disabled.
- If a remembered selection is no longer eligible after difficulty/type changes, clear it and select the first eligible racer if one exists.
- Start button is disabled when there is no eligible selection.
- Header copy should clearly say e.g. `ELIGIBLE SPEED 20–65`.

## Difficulty bands

The current Expert range `125–180` makes some type leagues impossible because some types have fewer than five — or zero — species in that band.

Use these bands unless the current species dataset proves a slightly different boundary is required:

- Easy: **20–65**
- Normal: **55–100**
- Hard: **90–135**
- Expert: **100–180**

The overlap is intentional. It gives some Pokémon multiple suitable difficulties while keeping every band meaningful.

Add a test over the actual bundled species dataset asserting that every one of the 18 types has at least five species inside every League difficulty band. Never silently pull an out-of-band AI racer just to fill the grid.

If a future dataset somehow provides fewer than five in-band candidates, prefer sampling an in-band candidate more than once or disabling that league+difficulty with clear UI; **never break the speed restriction**.

---

# 4. Make race speeds visibly different

The current v0.30.0 Speed mapping is intentionally compressed to roughly `0.92–1.08`, which makes fields bunch together. The user specifically wants more visible race-speed variety and is happy for rivals to leave the screen.

## New pace mapping

Change Speed’s contribution to be substantially more visible while keeping sprint/obstacle skill relevant.

Recommended target:

- raw Speed 10 -> pace modifier about **0.80**
- raw Speed 180 -> pace modifier about **1.20**
- use a simple monotonic mapping that does not excessively flatten high-Speed Pokémon
- keep level bonus small (the current max 4% is fine)

A linear mapping is acceptable and probably preferable here.

Add tests that prove:

- modifier is monotonic
- full raw-Speed pace spread is around **1.45–1.50×** from minimum to maximum
- every difficulty band has a meaningful internal spread
- level does not dominate base Speed

Do not compensate by giving slow AI hidden boosts.

## Deliberately varied AI fields

The current `aiPool()` shuffles the in-band species and takes the first five, which can randomly produce five racers with nearly identical Speed.

Change AI selection to deliberately span the band.

A good approach:

- derive five target percentiles across the selected band, e.g. ~10%, 30%, 50%, 70%, 90%
- choose the nearest **unique** eligible species to each target where possible
- in Type Leagues, all five must also match the type
- shuffle assignment/order after the speed profile is chosen so the same lane is not always “fastest”

Tests should assert that a generated field:

- contains only in-band racers
- contains only the League type when applicable
- has five racers
- has a meaningful speed span rather than a tight accidental cluster
- is deterministic for a fixed seed

The same five League AI racers still persist through all three cup races.

---

# 5. Fix Pokémon sprite distortion and clumping

This is a visible blocker in the screenshot.

## Never stretch Pokémon to a square

Current behavior effectively does:

```js
ctx.drawImage(img, x-half, y-half, size, size)
```

Do not do this.

Render each image at its **native aspect ratio**:

- `ctx.imageSmoothingEnabled = false`
- derive width/height from `img.naturalWidth` / `img.naturalHeight`
- scale proportionally into a racer visual-height target
- anchor sprites by **bottom-center / feet**, not square-center, so different aspect ratios stand on the same ground line
- round final canvas coordinates to integer pixels

The local sprites are already small pixel sprites with differing aspect ratios. Preserve that.

Target on a 540×720 race canvas:

- typical visible Pokémon height around **88–112 px**
- small sprites can be somewhat smaller
- naturally larger source silhouettes can be larger/wider
- do not force every species to the exact same width or height

The user wants racers large, but not deformed.

## Reduce clumping

Several things should work together:

1. Wider speed spread naturally separates the field.
2. Do not clamp AI into view. Existing off-screen culling is good.
3. Do not center/camera on the field average; keep the camera attached to the player.
4. Improve the start formation so all six sprites do not occupy the same apparent point during countdown/launch.

Use a fair **visual starting grid** without altering race ranking distance. Examples:

- deterministic small rendering offsets during countdown / first ~0.8 s, fading to zero, or
- safe initial lane assignments plus small visual offsets

Do not give any racer a hidden distance advantage purely to separate sprites.

When racers genuinely overlap later (overtaking in the same line), correct y-sorting is enough; do not introduce collision pushing that changes mechanics unless absolutely necessary.

Test at least one group of very differently-shaped sprites (Pikachu, Pinsir, Rattata, Chansey, a tall Pokémon) and verify none are stretched.

---

# 6. Replace the “Paint” renderer with a real Gen III-style pixel environment

This is the largest visual requirement.

The v0.30.0 renderer draws terrain, rocks, mud, boosts and props using canvas rectangles, ellipses and polygons. That is why it looks like a mock-up.

The final screen should read immediately as **GBA-era Pokémon route art**, while remaining a LuckyDex-original racing mode rather than a direct Pokémon Dash clone.

## Asset research

Internet access is expected for this pass.

Good public references/sources to investigate:

- `https://github.com/pret/pokeemerald`
  - authentic Gen III environment graphics / tileset references
- `https://github.com/PokeAPI/sprites`
  - generation-specific Pokémon sprites if a local racer sprite needs replacement
- The Spriters Resource Pokémon Emerald / Ruby-Sapphire route and tileset pages can be used as visual reference and, where appropriate for this personal project, asset source. Do not hotlink at runtime.

Useful visual references include:

- Pokémon Emerald / Ruby-Sapphire route tiles
- Route 101 / 104 / 117 grass-route look
- Route 112 / volcanic / ash environments
- Route 111 desert
- ocean routes 124–130
- Mt. Pyre / graveyard style
- cave / rock environments
- Shoal Cave / ice environments

Do not simply paste a whole route screenshot under the racers. Build a reusable local **tile/object asset system**.

## Offline rule

All runtime assets must be local. No network fetch is allowed during gameplay.

Create a clear asset location, e.g.:

```text
app/src/main/assets/arcade/dash/
  tiles/
  objects/
  ui/
```

Create a provenance file:

- `docs/DASH_ASSET_SOURCES.md`

For every downloaded or adapted asset, record:

- local file path
- source URL/repository path
- what it is used for
- any relevant attribution/license note

If an online asset is awkward to reuse cleanly, create a small original Gen-III-compatible pixel equivalent rather than leaving a vector/shape placeholder.

## Renderer architecture

Do not leave dozens of image-loading and tile-drawing responsibilities tangled into `arcade-dash.js` if avoidable.

Preferred split:

- `arcade-dash-assets.js` — asset manifest / preloader / local image lookup
- `arcade-dash-renderer.js` — terrain, props, race objects, racers, finish line
- `arcade-dash.js` — race state, controller, lifecycle, menus

Preserve the public `LuckyDexDash` API expected by existing Arcade integration.

Update script order in `index.html` and tests accordingly.

## Tile look

Remove the fake spreadsheet/grid appearance visible in the current race screenshot.

The track should use real pixel texture and edge tiles:

- repeatable dirt/stone/snow/etc surface tiles
- grass/water/cliff/industrial verge tiles
- proper border transitions
- deterministic side props
- no translucent 32px drawn grid lines
- no generic flat green margin

Use nearest-neighbor rendering and integer-aligned tile placement.

The camera should scroll the tile world smoothly downward while maintaining crisp pixel art.

---

# 7. Replace all race-object placeholders with pixel assets

The current shapes are specifically rejected.

Replace these with local sprite assets:

## Rock hazard

- real pixel boulder / stump / gravestone / crystal / machine obstacle depending on theme
- hitbox should remain fair and broadly match visible footprint

## Mud/slow hazard

Theme-specific pixel patch such as:

- mud / rough dirt
- tall grass
- shallow water
- ash
- snow
- sand
- web
- ectoplasm / mist
- oil

Do not draw a generic translucent ellipse.

## Speed pad

- recognisable ground-level pixel boost marker
- at least a double-chevron / racing-arrow language
- should look intentional and clearly beneficial
- do not use a cream rectangle with a single triangle

## Stamina pickup

- use a proper berry/item-like pixel pickup or type-appropriate energy pickup
- do not use the current green circle with a white plus
- it must be visually distinct from the speed pad at a glance

Theme config may map multiple league themes onto shared base assets plus palette variants, but **every league must look intentional**, not like the same brown road recoloured.

At minimum, every theme needs:

- a non-flat terrain/edge tileset identity
- themed obstacle skin
- themed slow-patch skin
- themed boost treatment
- themed side props

---

# 8. Give all 18 Type Leagues stronger visual identities

Keep the existing 18 themes, but move them from palette-only ideas to asset-backed scenes.

Suggested direction:

- Normal — Hoenn meadow / Route-style dirt path
- Fire — volcanic / ash / magma cracks
- Water — coast / shallow water / boardwalk elements
- Electric — Mauville/power-station-inspired industrial route
- Grass — dense woodland / flowers / tall grass
- Ice — snow / frozen pools / pale rock
- Fighting — training road / banners / posts
- Poison — swamp / toxic marsh / pipes
- Ground — desert / dunes / sandstone
- Flying — highland / bridge / windswept route
- Psychic — crystal / surreal route
- Bug — deep forest / webs / mushrooms
- Rock — quarry / canyon / boulders
- Ghost — graveyard / Mt. Pyre-like atmosphere
- Dragon — ancient summit / ruins
- Dark — moonlit forest / dark route palette
- Steel — rail yard / machinery / metal flooring accents
- Fairy — luminous grove / flowers / pastel crystals

Do not need 18 completely independent giant tilesheets. Reuse intelligently, but the user should be able to glance at the course and identify a meaningful theme change.

Quick Race can use the polished Normal/Hoenn route theme.

---

# 9. Upgrade the entire Dash UI — current UI is functional but dull

The screenshots show too much empty cream/green space and oversized plain cards.

Aim for a **Gen III/GBA interface language**, not a generic modern dashboard and not a crude imitation of proprietary menu screenshots.

## Global Dash shell

Fix the large empty green strip at the top on mobile. The current `dash-game`/mobile padding leaves excessive dead space before the Dash header.

The game should use almost all available vertical space below the device/app chrome without introducing page scrolling during a race.

Use:

- square/pixel corners or tiny radii
- crisp 1–3px highlight/shadow borders
- layered pixel-panel edges
- deliberate palette accents
- compact spacing
- no huge blank panels
- no soft modern card shadows

## Main Race Course menu

Current Quick Race / Type Leagues cards are huge and empty.

Redesign them as richer compact mode tiles:

- small pixel scene/icon area
- strong mode title
- one-line explanation
- clear focus/pressed state
- stats integrated compactly rather than floating as generic boxes

Both choices should fit comfortably on one phone screen with no large dead area below.

## Type League grid

Make the 18 leagues visually interesting and compact:

- 2–3 columns depending on screen width
- type-colour accent / simple pixel icon or glyph
- trophy status readable at a glance
- locked/no-racer states distinct
- current selected/pressed state obvious

Do not let trophy text turn into a tiny unreadable paragraph.

## Difficulty screen

Each difficulty card should show:

- difficulty name
- hard eligible Speed range
- concise AI descriptor
- ideally current number of owned eligible racers

Out-of-collection states should not break the layout.

Update copy: remove wording like “Faster Pokémon can still enter easier races.” That is now false.

## Racer picker

The current picker has text crowding/overlap, especially in the selected-racer bar.

Requirements:

- preserve sprite aspect ratio here too
- clean two-column cards on a typical phone
- no text collision (`PinsirLv.8` style issue)
- name, level and Speed are distinct lines/regions
- eligible state is obvious
- `TOO FAST` / `TOO SLOW` disabled states are obvious
- selected card has a strong but tasteful highlight
- selected-racer footer is compact and correctly spaced
- Start Race button does not waste a large blank area
- search and sort remain usable

## Race HUD

The v0.30.0 HUD works but looks like plain cream boxes.

Keep only the useful information:

- place
- course progress
- stamina

Restyle it as a compact GBA-like status strip with pixel borders and stronger hierarchy. Do not let the HUD steal vertical space from the course.

Controls remain one row:

`LEFT | SPRINT (hold) | RIGHT`

Keep large touch targets.

---

# 10. Collision and visual footprint

New sprite assets must not create invisible-square gameplay.

For objects:

- collision should be based on the object’s visible footprint / intended lane footprint
- do not use a huge transparent PNG canvas as the hitbox
- preserve current forgiving gameplay; art replacement must not make hazards unfair

For Pokémon:

- racer-to-racer collisions are not required; this is not a blocking-contact racer
- render overlap is okay during overtaking

---

# 11. Performance and asset loading

This is an Android WebView game.

Requirements:

- no runtime internet dependency
- preload the assets required for the selected theme before countdown begins
- cache loaded images
- do not reload images every frame
- no DOM nodes per frame
- canvas renderer should remain requestAnimationFrame-based
- keep `imageSmoothingEnabled=false` for pixel assets
- avoid giant multi-megabyte route screenshots if a compact tile sheet can do the job
- race must still resume cleanly after Android recent-app switching

If assets are still loading, hold at a short loading/pre-race screen rather than starting with missing sprites and popping them in later.

---

# 12. Tests — use TDD and update the contracts, not just screenshots

Write failing tests before production changes wherever practical.

At minimum add/update coverage for:

## Eligibility

- Easy rejects Speed 19 and 66; accepts 20 and 65
- Normal rejects below 55 and above 100
- Hard rejects below 90 and above 135
- Expert uses final agreed band (target 100–180)
- dual-type League eligibility still works
- wrong type cannot enter League
- out-of-band player cannot be selected or started
- remembered out-of-band racer is not restored as active selection
- Start Race stays disabled without valid racer

## Species-pool viability

Using real `adventure-species.js`:

- every type + difficulty has at least five valid AI candidates under the final bands, or the code’s documented in-band duplicate/lock fallback is exercised
- AI never leaves selected speed band
- League AI never leaves selected type

## AI speed diversity

For representative seeded fields:

- 5 racers returned
- deterministic for seed
- speed span is meaningful
- field is not five near-identical Speed values when broader eligible values exist

## Pace

- monotonic
- approx 0.80 to 1.20 modifier endpoints
- approx 1.45–1.50× slowest/fastest pace spread
- sprint/stamina tests remain green

## Rendering source contract

Update/add tests that prove:

- no square `drawImage(... size, size)` racer distortion path remains
- renderer uses native image dimensions/aspect ratio
- smoothing disabled
- tile/object assets are local
- shape placeholders for rock/mud/boost/stamina are no longer the primary renderer
- portrait 540×720 canvas can remain if appropriate
- race view still prevents page scroll
- controls remain one row

## UI

- difficulty copy states restriction
- ineligible cards are disabled
- correct reason labels
- no old `ABOVE/BELOW` recommendation wording presented as selectable

## Regression

Keep all existing Dash functionality tests green:

- `tests/arcade-dash-config.test.cjs`
- `tests/arcade-dash-course.test.cjs`
- `tests/arcade-dash-integration.test.cjs`
- `tests/arcade-dash-league-integration.test.cjs`
- `tests/arcade-dash-league.test.cjs`
- `tests/arcade-dash-render-contract.test.cjs`
- `tests/arcade-dash-ui.test.cjs`
- `tests/arcade-dash.test.cjs`

Add a new v0.31.0 release contract rather than weakening old behavioral coverage.

Run the broader LuckyDex test inventory after the targeted suite.

If Playwright is available on the PC, run the browser tests too. If not, report that limitation explicitly; do not pretend they passed.

---

# 13. Visual verification is mandatory

Source tests alone are not enough for this task.

Use a browser/mobile viewport matching roughly the supplied Samsung screenshot proportions and capture screenshots of at least:

1. Dash main menu
2. difficulty screen
3. racer picker on Easy showing valid and invalid racers
4. Quick Race about 30–50% through the course
5. a second type-themed League race (Fire, Water, Ghost, Ice, etc.)
6. League standings

Inspect those screenshots yourself before declaring completion.

Explicitly verify:

- no stretched Pokémon
- no six-racer pile at the bottom
- slower/faster opponents can visibly leave player vicinity
- no giant blank green header area
- no large pointless cream voids
- no text overlap in racer cards/selected racer
- terrain reads as pixel art, not drawn rectangles
- rocks/slow patches/boosts/pickups read as actual game assets
- course still has enough clear space to react on a phone

If a screenshot still looks like v0.30.0 with recoloured shapes, the task is not done.

---

# 14. Release / packaging

When the implementation is verified:

Update all release markers to **v0.31.0** / **310**.

Preserve:

- `applicationId 'com.example.luckydex'`
- existing keystore/signing identity
- save schema compatibility
- God Pack = **1/1000**
- Lucky Pack = **1/500**
- all unrelated LuckyDex features

Create:

- `TEST_REPORT_v0.31.0.md`
- `LuckyDex_source_v0.31.0.zip`

The source ZIP must have the same root layout as the existing LuckyDex source ZIP — do not accidentally wrap everything in an extra directory.

After creating the ZIP:

1. extract that exact ZIP into a fresh temp directory
2. rerun targeted Dash tests against the extracted copy
3. verify release identity/version from the extracted copy
4. verify required local Dash assets actually exist in the ZIP
5. report SHA-256

If the repo uses canonical `LuckyDex_source.zip`, also copy the verified versioned ZIP over that filename only at the final handoff stage. Do not delete the versioned ZIP.

Do not push/merge unless explicitly authorised by the user or that is already the active Codex task.

---

# 15. Acceptance checklist

Do not call this complete until every relevant item is true:

- [ ] Easy/Normal/Hard/Expert are hard Speed restrictions
- [ ] Type + Speed are both enforced for League racers
- [ ] `startRace()` defensively rejects invalid player racers
- [ ] AI never violates the selected Speed band
- [ ] every type/difficulty can field a valid League race
- [ ] AI fields intentionally span a useful Speed range
- [ ] raw Speed has a visibly stronger pace effect
- [ ] leaders/trailers may naturally leave the screen
- [ ] no rubber-banding
- [ ] Pokémon render at preserved native aspect ratio
- [ ] Pokémon are not square-stretched
- [ ] starting field is not a six-sprite pile
- [ ] proper Gen III-style tile assets replace flat/grid terrain
- [ ] proper pixel obstacles replace polygon rocks
- [ ] proper pixel slow patches replace generic ellipses
- [ ] proper boost sprite replaces cream rectangle/triangle
- [ ] proper pickup sprite replaces green plus circle
- [ ] all 18 League themes have meaningful asset-backed identities
- [ ] main Dash UI is visually richer and more compact
- [ ] huge blank mobile top area is gone
- [ ] picker text does not overlap
- [ ] HUD is compact and game-like
- [ ] no race page scrolling on phone
- [ ] pause/resume still works
- [ ] rewards and cup scoring still exactly-once
- [ ] all targeted tests pass
- [ ] broader test suite is run and failures classified honestly
- [ ] screenshots inspected at mobile size
- [ ] v0.31.0 release identity is consistent
- [ ] source ZIP re-extracted and reverified

---

# 16. What to hand back

At completion, give the user a concise report containing:

1. what changed visually
2. exact final Speed bands
3. how hard eligibility is enforced
4. how AI speed diversity now works
5. asset sources used and location of `docs/DASH_ASSET_SOURCES.md`
6. targeted test results
7. broader test results / any environment limitations
8. mobile screenshots or paths to them
9. `LuckyDex_source_v0.31.0.zip`
10. SHA-256
11. any genuinely deferred minor polish items

Do not write a long design report before doing the work. The requirements above are already approved. Work end-to-end, make sensible local decisions, and only stop for a genuinely blocking ambiguity or destructive/external action.
