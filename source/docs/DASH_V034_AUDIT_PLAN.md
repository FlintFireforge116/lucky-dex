# Pokémon Dash v0.34.0 — audit and execution ledger

Baseline: user-supplied canonical ZIP is verified as **0.33.1 / 331**. Its package ID and included keystore are authoritative. Changes stay in Dash and release markers; 855 protected v0.33.1 file hashes cover Dust, binder-copy handling, Ball Drop/Ball Rain, pack navigation/diagnostics and Adventure.

## Findings before implementation
- The race is already tile-based, not one large painted background. However, most current road textures, borders, theme props and boost graphics are generated pixel templates/tints. Repeating them gives the prototype impression described in the brief.
- The existing Emerald adaptation only decodes primary tile IDs below 512, ignores secondary tiles, guesses tree assemblies, and deletes colours shared with grass. Some supposedly complete trees therefore lack parts. Authentic machinery/indoor/shore environments need the correct tileset pairing and palettes.
- The bundled `authentic-v0200` folder is mainly XY/HGSS/DPPt minigame scenes and screenshot references, unsuitable as complete GBA race backgrounds. Existing Emerald/general source bytes, local actors and item assets are useful; venue screenshots are references, not course floors.
- Renderer terrain/scenery use **2.35 px/world-unit** while v0.33 racing objects/camera use **3.05**. Ground patterns/nearby objects do not share the same world projection. The road variation also keys rows inconsistently across tile wraps.
- Tree/scenery placement deliberately extends beyond the horizontal canvas/verge (`left - width + 7`, `right - 6`), and uses inconsistent fractional scale factors. It needs complete sprites, bounded base anchors and one native pixel scale.
- Course generation has random clusters and numerical thirds, with no authored environment sections. Menu previews/panoramas are separate manually assembled compositions.
- Left/right are click-only, so touch movement starts on release. This is reproduced by both engine and actual-app tests. Motion cycles at 6.4–9 Hz (grounded) and 3.6–5.2 Hz (hover), unsuitable for the requested gentle movement.
- Actual v0.33.1 Chrome viewport captures at 360×640, 360×740, 390×844 and 412×915 fit: course starts y90/100; controls finish at viewport minus 5; no scroll. The reported Android clipping is not claimed reproduced. We will still isolate viewport ownership from app ancestors and test portal restoration and resize.

## Implementation plan
- [x] Extract/reassemble authentic pinned Emerald metatiles, complete objects and Mossdeep north pads; use original palette/layer information. Record source/location/classification/footprint for every asset and reproduce the outputs from cached source bytes.
- [x] Add 18 course profiles and reusable authored sections/set pieces. Keep six racers, 1800 distance, strict Speed classes, rewards/cups, v0.33 contact/stamina/boost/berry semantics. Seed scenery independently; preserve fair hazard spacing and no three-lane wall.
- [x] One renderer projection at 3.05 for ground, near scenery, race objects and racers; integer native pixel blits, bounded scenery feet, depth sorting, authentic animated pads/water, readable berry and collection effect. Replace the high-frequency motion with gentle run/hover/glide profiles.
- [x] Derive previews from the same playable renderer and seeded section composition; remove promotional panorama panels. Compact menu thumbnails remain consistent with actual courses.
- [x] Continuous held steering (`steer -1/0/+1`) starts on press and stops on release/cancel. Preserve direct `targetLane` API compatibility and AI lanes. Dash temporarily mounts at body level and restores its original slot; a single VisualViewport-aware shell owns HUD/course/controls.
- [x] Run new/legacy Dash and v0.33.1 preservation tests, all-four-size native Chrome input/layout checks, every-course visual QA, repeated-race/cache checks, full test inventory and offline audits.
- [x] Release 0.34.0 / 340, build with original signer, package source/APK, freshly extract exact ZIP and rerun focused checks, report hashes and honest limitations.

The approved brief governs local design decisions. No weapons, item boxes, joystick, drift, rubber-banding, unrelated feature redesign or fake full-route backgrounds are introduced.
