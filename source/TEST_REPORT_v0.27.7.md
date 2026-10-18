# LuckyDex v0.27.7 test report

Ball Drop polish release.

## Changes verified
- Half-visible physical edge pegs break up wall-hugging straight drops.
- Reward wells extend to the true bottom of the 720×1004 cabinet.
- Ball launch produces a short red cabinet glow.
- Mystery, Card and Booster wins use distinct full-board fanfare tiers.
- Existing v0.27.6 collision/physics/effects and layered rendering remain intact.

## Verification
- 98 non-browser Node test programs passed; 19 Playwright-dependent programs unavailable in this environment.
- 264 seeded production Ball Drop simulations landed successfully; worst simulated fall 22.352s.
- Arcade authentic/sprite/actor, venue, Adventure and Fossil Museum offline asset audits passed.
- `node --check app/src/main/assets/arcade-ball-drop.js` passed.
