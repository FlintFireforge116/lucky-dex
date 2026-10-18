Work on **Lucky Dex pack opening only** in the supplied Android WebView project. Do not touch Clefairy Match in this run.

Read `CODEX_HANDOVER.md` and inspect `reference/TARGET_CLEFAIRY_AND_PACK_OPENING.png`.

The current pack reveal feels like a PowerPoint effect. Replace it with a continuous game-quality 3D reveal.

Required sequence:
1. Card back begins very small/far away and flies toward camera over ~650 ms while continuously rotating in 3D and around Z.
2. It overshoots very slightly, then settles.
3. Card performs a true 3D Y-axis flip to the preloaded front image.
4. Mid-flip flash + haptic.
5. Rarity payoff begins as the front appears.
6. After payoff settles, enable swipe-left next / swipe-right previous and Full Screen.

Top-tier gold swirl is mandatory:
- Canvas or SVG animated ribbon trails orbiting the card.
- 2–3 elliptical glowing trails.
- Some trail rendered behind card, some in front, for real depth.
- Emit gold sparks along the ribbon.
- ~1.5–2.5 revolutions then fade.
- Do not cover card art/text.

Rarity scaling:
- Common: clean flip only.
- Rare/Holo: flash + modest sparkles.
- One-star/illustration type: stronger bloom/particles.
- Two/three-star high hit: gold rays + swirl + longer settle.
- Crown/top tier: full gold/rainbow cinematic effect, strongest haptic and longest reveal.

Technical requirements:
- Use Web Animations API/requestAnimationFrame and CSS 3D transforms.
- Target smooth 60 fps.
- Do not implement the reveal as screenshot swapping.
- Preload current and next card image.
- Cancel all animation loops on exit/next card.
- Preserve v0.13 offline card/set/artwork caching.
- Preserve pack economy and collection updates exactly once.
- Add a small Skip control without allowing duplicate commits/rewards.

Fix set ordering at the same time:
- Newest release first.
- Sort by real release date.
- If the list endpoint lacks dates, preserve the API's chronological order or enrich/cache dates.
- Do not alphabetically sort chronology.
- Put unknown-date sets after dated sets.

Add `window.LuckyDexDebug.playPackTier(tier)` to replay visuals against a local/mock card without consuming currency.

Refactor instead of adding another pile of overrides. Remove obsolete pack-animation code after verifying it is unused.

Acceptance:
- card visibly comes from depth and grows into frame while spinning;
- true 3D flip;
- top-tier moving gold ribbon orbits around/behind/in front of card;
- no cheap static glow pretending to be motion;
- swipe works after reveal;
- offline cached pack still opens;
- chronology is demonstrably correct;
- mobile viewport smoke tests pass;
- debug APK builds.

Do the implementation and tests; do not stop at a plan.
