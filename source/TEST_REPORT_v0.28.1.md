# LuckyDex v0.28.1 test report

## Scope
Tile Puzzle reference/scene consistency upgrade from v0.28.0:
- the scene shown before START PUZZLE is now locked into that run instead of selecting a second image;
- RESHUFFLE and difficulty changes retain the current scene rather than silently changing the reference;
- ready-state completed-picture reference is enlarged for studying before play;
- active-run reference remains substantially larger on phones;
- tapping the reference opens a near-fullscreen copy of the exact same rendered image;
- overlay can be dismissed by tapping the image/backdrop, the × control, or Escape;
- original Android application ID/signing/update path remains unchanged.

## Verification
- v0.28.1 Tile Puzzle scene-lock/reference contract: PASS
- v0.25.3 curated Tile Puzzle scene contract: PASS
- v0.22 targeted restore contract: PASS
- v0.18 Arcade session rules contract: PASS
- 106 non-browser test programs: PASS
- Playwright/browser programs: not runnable in this environment because Playwright is not bundled and npmjs.org was unreachable (`EAI_AGAIN`)
- `node --check app/src/main/assets/arcade-amie.js`: PASS
- Android identity: `com.example.luckydex`, versionCode 281, versionName 0.28.1
