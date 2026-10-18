# LuckyDex v0.33.0 — Pokémon Dash finishing pass

## Scope

This release is a focused finishing pass over the existing Pokémon Dash subsystem on top of the supplied v0.32.0 Regional Adventure baseline. Adventure, card systems and unrelated minigames are intentionally left alone.

### Dash presentation
- Dash now owns the full phone viewport instead of relying on a scrollable Arcade page.
- Menu, difficulty and race layouts are compacted for normal and short phone heights.
- Redundant clipped menu panorama blocks were removed.
- Race HUD/controls leave more height to the track.
- Added compact transient BOOST / STAMINA / BUMP / SLOWED feedback.

### Racers and motion
- Dash racer metadata can carry species height/weight from the Adventure species catalogue.
- Species visual scale is deliberately compressed so large/small Pokémon remain recognisable without making collision unfair.
- Sprite width is capped to the usable lane area and remains foot-anchored.
- Ground racers bob/lean while moving; Flying/Ghost racers use a hover profile.
- Sprint/boost/collision states feed visual motion, dust and impact effects.
- Racer-to-racer overlap now produces soft contact feedback and a short slowdown rather than an immovable pile-up.

### Course interaction and assets
- Rock/mud collisions now create explicit impact state and feedback; rock hits also knock the racer slightly backward.
- Boost pads and stamina pickups have their own feedback states.
- Stamina pickup now uses the already packaged PokeAPI Oran Berry sprite.
- Electric/Steel obstacle art and Fire rocks now use adapted Pokémon Emerald metatiles rather than the placeholder-style generated objects.
- Asset provenance remains documented in `docs/DASH_ASSET_SOURCES.md`.

## Identity / update compatibility
- `applicationId` remains `com.example.luckydex`.
- Version: **0.33.0 / 330**.
- Existing permanent development signer configuration and `app/luckydex-dev.keystore` are preserved.
- Package/lock/runtime/visible version markers are kept in sync.

## Verification performed in this workspace

### Targeted Dash / release tests
The Dash unit/static contracts pass, including:
- baseline Dash engine/config/course/UI/assets/renderer contracts;
- v0.33 species sizing and animation contracts;
- v0.33 collision/contact contracts;
- v0.33 compact phone-layout contract;
- v0.33 release identity/version contract;
- backwards-compatible legacy Dash platform contract.

### Broader Node test inventory
- **172** `*.test.cjs` files discovered.
- **160 passed** in the supplied environment.
- **12 browser integration tests could not start because the uploaded source does not include `node_modules` and this offline workspace cannot install the declared Playwright 1.62.1 dependency.** Each of those 12 stops at `Cannot find module 'playwright'`; no product assertion is reached.
- Two inherited historical tests with stale exact-version/layout expectations were updated to test their actual compatibility contract rather than pinning v0.28.7 literals.

### Asset validation
Passed:
- `python3 scripts/fetch_arcade_v0200_assets.py --check`
- `python3 scripts/verify_v0223_venues.py`
- `python3 scripts/verify_adventure_assets.py`
- `python3 scripts/verify_fossil_museum_v0250_assets.py`

Results include 44 authentic Arcade scenes/sheets/crops, 2,098 offline Arcade sprites, 2,078 unretouched actors, all 8 venue assets, 829 Adventure images / 1,025 species / 386 back sprites, and 42 Fossil Museum images verified.

### Android build limitation
A fresh APK was **not** compiled in this workspace because no Gradle distribution or Android SDK is installed here and outbound package downloads are unavailable. The repository's existing GitHub Action remains the authoritative APK builder from `LuckyDex_source.zip` after push. Do not treat the supplied v0.32.0 APK as a v0.33.0 build.

## Manual phone QA still recommended
Automated contracts cannot replace a real-device pass. Specifically recheck:
- small/short phone viewport fit;
- very wide/tall Pokémon sprites;
- repeated left/right obstacle collisions;
- rival pile-ups and overtakes;
- Electric and Steel course art in motion;
- sprint/stamina pacing across Easy through Expert.
