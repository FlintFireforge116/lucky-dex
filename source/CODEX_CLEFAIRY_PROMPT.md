Work on **Lucky Dex Clefairy Match animation only** in the supplied Android WebView project. Do not redesign pack opening in this run.

Read `CODEX_HANDOVER.md` and inspect `reference/TARGET_CLEFAIRY_AND_PACK_OPENING.png`.

The goal is a real game scene, not HTML effects or full-scene screenshot swapping.

Architecture:
- Keep the scenic moonlit background static.
- Clefairy is a separate transparent character layer.
- Reflection is derived from the same active pose and same transforms, mirrored vertically, compressed, blurred/masked and clipped to water.
- Use the supplied local pose assets.
- Preload all pose images before play.
- Fallback to idle if any asset fails.
- Do not warp/zoom/breathe the whole scene.

Implement a small animation state machine: idle / star / song / moon / spin / transition.

Idle:
- no left-right motion;
- no scene zoom;
- at most 1–2 px gentle vertical breathing every ~2.5–3 s;
- keep face/eyes stable.

Star:
- 80–120 ms pose crossfade;
- small delighted hop;
- shooting star crosses sky with luminous trail;
- reflection follows character motion;
- smooth return to idle.

Song:
- use song pose;
- gentle bounce/squash-and-stretch on the character only;
- animated musical notes drift upward;
- no face deformation;
- reflection stays synced.

Moon:
- use moon pose;
- moon blooms brighter and scene exposure lifts briefly;
- small character lift/hold;
- background camera remains static;
- return smoothly.

Spin:
- movement itself is a true continuous 360° transform over ~650–850 ms, not screenshot/frame swapping;
- rotate around character visual centre;
- optional small hop;
- reflection rotates in sync while mirrored/compressed;
- add short gold spiral/ribbon effect around character using Canvas/SVG;
- settle exactly upright with no snap.

Sequence playback:
- scene animation is the primary cue;
- button highlight can accompany it;
- timing should be slow enough to read;
- no slideshow of static scenes.

Performance / robustness:
- Web Animations API/requestAnimationFrame;
- cancel timers/RAF on game exit/reset;
- no network needed for animation;
- no blank stage if local asset missing;
- Android WebView-compatible.

Add `window.LuckyDexDebug.playClefairyAction('star'|'song'|'moon'|'spin')` so every action can be replayed instantly for testing.

Refactor the existing accumulated Clefairy code instead of appending another overriding renderer. Remove obsolete conflicting scene/GIF code once verified unused.

Acceptance:
- static scenic background never warps;
- character layer visible immediately;
- reflection looks like water reflection, not a second character;
- all four actions are distinct smooth animations;
- spin is a continuous 360° motion;
- face/eyes remain stable;
- no blank stage on Android WebView;
- mobile viewport smoke tests and debug APK build pass.

Implement and test it; do not just write a plan.
