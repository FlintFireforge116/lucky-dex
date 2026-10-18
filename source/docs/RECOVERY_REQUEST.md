You are taking over an existing Android LuckyDex project after a series of increasingly unstable Arcade UI rewrites.

This is a RECOVERY / STABILISATION PASS, not a feature-development pass.

## Primary objective

Take the supplied current source as the starting point and make LuckyDex feel like a coherent native mobile game/app again.

Do not add new features.

Do not blindly preserve recent implementation choices if they are causing problems.

You may remove, consolidate, or revert recent Arcade layers where necessary.

The priority order is:

1. Runtime stability
2. Correct rendering/scaling
3. Navigation safety
4. Offline/local asset reliability
5. Mobile-app-quality UI
6. Arcade visual fidelity
7. Only then minor polish

---

# Current known problems

The current v0.20 build has serious regressions.

### App-wide crashes / navigation

Reported examples:

* entering certain menus such as Trade can crash the app
* leaving Poké Ball Drop can crash or break navigation
* other menus may be affected
* recent Arcade work may have introduced global lifecycle/listener/navigation regressions

Do not assume these are isolated bugs.

Audit navigation and lifecycle across the app.

---

# Arcade world / zones

Current problems include:

* venue/location images sometimes do not load at all
* previous versions used generated/Paint-like artwork and must not return
* world navigation has had scaling and scrollbar problems
* proportions do not look like an actual game
* it still feels like a web page embedded in an APK

Requirements:

* ALL required venue imagery must be packaged locally in the APK.
* Absolutely no runtime dependency on external URLs for essential Arcade graphics.
* No image should disappear because GitHub/Wiki/raw URLs are unavailable.
* No browser-style horizontal scrollbar.
* No web-card carousel appearance.
* No giant empty HTML panels.
* No controls positioned outside the initial useful viewport.

The Arcade world should resemble a game world/location selector, not a website.

Use actual Pokémon game assets/screenshots/reference material where legally/source-repository available within this personal project.

Do not replace missing assets with generated geometric art.

If an authentic required asset cannot be sourced, explicitly list it as missing rather than inventing an approximation.

---

# Arcade games

Audit EVERY visible Arcade game individually.

Current set:

* Berry Picker
* Head It
* Tile Puzzle
* Voltorb Flip
* Poké Ball Drop
* Berry Blender
* Clefairy game
* Fossil Excavation
* Unown Decoder
* Who's That Pokémon?

For every game:

1. Identify the real Pokémon game/minigame it is based on, if one exists.
2. Inspect reference screenshots/assets and existing decomp resources where available.
3. Compare current LuckyDex layout with the reference.
4. Fix proportions first.
5. Then fix visual hierarchy.
6. Then fix controls/gameplay.
7. Then fix animation/polish.

Do NOT merely recolour existing HTML panels.

---

# Specific mobile-layout requirement

Test at minimum:

* 360 × 800
* 412 × 915

Prefer also testing another taller Android phone viewport.

For each game at each target size:

* primary gameplay area must fit sensibly
* Start/New Game/Play controls must be visible without hunting for them
* controls must actually receive the tap
* nothing essential should be underneath navigation bars
* no accidental horizontal page overflow
* no native browser scrollbar over game graphics
* text must not overlap
* sprites/images must preserve aspect ratio
* buttons must not stretch absurdly
* game board must not be cropped
* modal/results screens must fit

Do not solve this by making everything tiny.

Use responsive composition appropriate to the source game's aspect ratio.

---

# Native-app feel

A major complaint is that all of the games currently feel like web games.

Treat this as a design defect.

Reduce or remove:

* generic rounded web cards
* repeated bordered panels
* giant pills
* Bootstrap-like button rows
* excessive explanatory text inside game screens
* browser-scroll-based navigation
* debug-looking labels
* excessive padding around the game surface
* arbitrary gradients and CSS shapes pretending to be game artwork

Prefer:

* one dominant game scene
* source-game-style HUD integrated into the scene
* image/sprite assets
* compact overlays
* game-appropriate typography
* touch regions integrated naturally into the game
* transitions instead of page-like content appearing below other content

The player should primarily see THE GAME, not the HTML surrounding it.

---

# Asset strategy

This is critical.

Audit all Arcade asset references.

Classify every asset as:

* packaged local asset
* generated asset
* runtime remote asset
* missing asset

Produce an asset audit file.

Essential visible assets must be local.

Do not depend on CI fetching assets from random external websites unless there is absolutely no alternative.

If build-time acquisition is still required, materialise those files into the source/release package before declaring the build complete.

The finished APK must work offline.

Prefer known decomp repositories such as pret projects when they expose original game graphics in usable form.

Preserve attribution/source notes in development documentation where appropriate.

---

# Architecture cleanup

The Arcade has gone through v0.17, v0.18, v0.19 and v0.20 overlays.

Assume there may be:

* duplicate event listeners
* multiple implementations of the same game
* old modules still loaded
* CSS override chains
* stale DOM shells
* global function name collisions
* old launcher code
* compatibility shims unintentionally running
* navigation state being mutated by more than one subsystem

Audit this explicitly.

For every Arcade game, establish ONE authoritative runtime owner.

For world navigation, establish ONE authoritative runtime owner.

Remove inactive superseded script/style loading where safe.

Do not keep multiple generations active merely because old tests expect their files to exist.

Legacy save-data compatibility is important; legacy runtime ownership is not.

---

# Crash investigation

Before changing crash-related code:

Reproduce each crash.

Capture:

* JS console error
* Android/WebView log where available
* stack trace
* originating file/function
* navigation sequence that triggers it

At minimum investigate:

### Trade

* open Trade from a clean app launch
* perform common interactions
* leave Trade
* return to Trade

### Poké Ball Drop

* enter game
* start run
* leave before finishing
* complete run
* leave after finishing
* re-enter
* navigate to another Arcade game

Also perform repeated navigation between unrelated app sections.

Look for uncancelled:

* requestAnimationFrame loops
* timers
* pointer listeners
* mutation observers
* animation callbacks
* stale DOM references

Game cleanup must be idempotent.

---

# Testing

Do not rely mainly on static string tests.

Keep useful unit/static tests, but add runtime/browser tests for user-visible regressions.

Create navigation smoke tests covering:

* title -> home
* home -> collection -> home
* home -> trade -> home
* home -> Arcade world
* Arcade world -> each venue
* each venue -> each game
* game -> venue
* venue -> world
* Ball Drop -> back
* Trade -> back
* repeated enter/exit cycles

Check console for uncaught errors after every sequence.

A test should fail if ANY uncaught exception occurs.

---

# Visual QA

Use screenshots from the running app.

Do not infer visual quality only from CSS.

Capture representative screenshots at phone dimensions for:

* Arcade world
* every Arcade game
* Trade
* at least one normal non-Arcade app screen

Compare Arcade screens with their reference games.

Store a QA contact sheet or screenshot folder in artifacts/docs so the result can be reviewed visually.

If something obviously looks broken in the screenshot, fix it before declaring success even if tests pass.

---

# Git / safety

Work on a new recovery branch.

Suggested branch:

`fix/v021-stability-ui-recovery`

Do not rewrite known-good historical checkpoints.

Commit in logical stages.

Suggested phases:

1. baseline and crash reproduction
2. navigation/lifecycle repairs
3. Arcade runtime-owner cleanup
4. local asset pipeline
5. viewport/layout repair
6. per-game visual rebuild
7. regression tests
8. final visual QA
9. release packaging

---

# Version target

Use:

* versionName `0.21.0`
* next appropriate versionCode above current 200-series build

Do not bump the version until the recovery branch is actually ready to package.

---

# Important behavioural requirement

Do not optimise for preserving v0.20.

Optimise for producing the best working LuckyDex.

If an older implementation was materially better, you may restore its behaviour and then improve it.

If recent code is fundamentally poor, replace it.

Do not stack another `v0210.css` file full of `!important` overrides on top of four earlier implementations.

Refactor ownership instead.

---

# Completion criteria

Do NOT report completion until all of these are true:

* app starts reliably
* no known Trade crash
* no known Ball Drop exit crash
* repeated navigation smoke passes
* no uncaught JS errors in tested routes
* all venue graphics load offline
* required game graphics load offline
* no visible world scrollbar
* no horizontal document overflow
* initial game controls visible at tested phone sizes
* games are visually dominated by their game scene, not web UI
* there is one clear runtime implementation per Arcade game
* existing collection/save data remains compatible
* test suite passes
* Android build succeeds
* screenshots have been manually inspected
* source ZIP is produced
* APK/build artifact is produced through the existing workflow if applicable

At the end, provide:

1. concise summary of root causes
2. list of code removed/consolidated
3. asset audit
4. crash fixes
5. screenshot/visual QA summary
6. test results
7. remaining known issues, if any
8. source ZIP / build artifact paths

Do not hide incomplete areas behind wording such as “mostly complete”.

If something remains broken, say exactly what remains broken.
