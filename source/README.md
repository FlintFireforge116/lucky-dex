LuckyDex v0.69.28 – TCG Pocket board layout rebuild

What changed
- Reworked Battle Lab board CSS to feel much closer to a single-screen TCG Pocket battlefield.
- Reduced the sense of floating/stacked widgets by integrating the centre status strip into the board.
- Re-anchored opponent hand and pile placement so the top area reads as a deliberate layout instead of overlapping pieces.
- Enlarged and aligned deck/discard piles so they sit in clearer board homes.
- Expanded the player play area and rebalanced the vertical space split.
- Increased hand space and cleaned up the fan so the bottom cards have more room and are less obscured.
- Added active spot halo/pad styling to reinforce the active field visually.

Files touched
- app/src/main/assets/tcgp-battle.css
- package.json
- package-lock.json
- app/build.gradle
- app/src/main/assets/app-v0167.js
- app/src/main/assets/index.html

Verification
- Targeted Node test suites passed:
  - adventure-battle-v0404.test.cjs
  - adventure-battle-v0411.test.cjs
  - adventure-battle.test.cjs
- Full browser-backed suite could not be completed in this container because Playwright is not installed here.
