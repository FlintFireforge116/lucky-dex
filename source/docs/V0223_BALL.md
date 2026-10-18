# v0.22.3 Ball Drop anti-stall fix

The supplied phone screenshot shows the ball resting between the left wall and
the outer peg in row 5. A deterministic run of the unchanged v0.22.2 animation
callback, seeded with the ball at `(30,491)` against peg `(62,515)`, reproduced it:
after 30 seconds the ball remained at `(29.897,491.138)`, with round 0.

## Cause and geometry

The ball radius remains **30** in rendering, peg collision, wall collision,
recovery clearance and settling. The original outer peg center was 62 pixels
from the wall with radius 10, leaving a **52-pixel free corridor for a
60-pixel ball**. Wall correction and peg correction opposed each other. The
last peg row also ended at y=589, leaving only 11 pixels between the peg edge
and divider top y=610.

The board still has seven staggered rows of six/seven pegs, the same 720×760
canvas, peg radius 10, seven scoring slots, aim slider and ball sprite. Peg
positions now use odd-row margin **74**, even-row margin **122**, and
`y = 105 + row * 71`. This gives **64 pixels** beside outer pegs, more than
**65 pixels** of free gap between the closest diagonal pegs, and **69 pixels**
between the bottom peg edge (y=541) and slot divider top (y=610).

## Watchdog

The existing animation owner calls the extracted production `stepBall`
function for each physics substep. The watchdog runs there, without another
animation loop or timer. Before a ball reaches the scoring floor it detects:

- speed below **30 pixels/second for 0.65 seconds**; or
- failure to advance at least **4 pixels downward for 1.2 seconds**.

Recovery searches nearby positions **8–80 pixels downward** and **0–80 pixels
sideways**, in four-pixel increments, and chooses the nearest collision-clear
candidate. It checks full ball clearance against every peg, side wall, slot
divider and floor. It gives that ball a modest sideways velocity of 55 and
downward velocity of 45 pixels/second and resets the watchdog. It never
chooses a slot based on its value, directly awards points, increments pin hits,
or places the ball beyond the scoring floor. Normal physics continues to the
actual slot and the existing settling/scoring path handles it once.

`PIN_BONUS=12`, its 300-point cap, slot points, jackpots, payout functions,
three-ball run, save integration, and existing `LuckyDexBallDropV0180` methods
are preserved. `pegs` and `stepBall` are added to that API so tests exercise
the exact production geometry and physics.

## Verification

`tests/v0223-ball-stalls.test.cjs` uses the real production animation callback
with a controlled clock and independently seeded random stream. It covers
**1,320 seeds**, cycling eleven aims including both extreme edges. Every drop
reaches a scoring slot inside the test's 30-second bound; the slowest measured
drop is **7.328 seconds**. The exact screenshot wedge clears in **0.512 seconds**
with the corrected geometry.

An additional forced wedge uses the original peg geometry with the same
production physics. It proves the watchdog executes, every recovery position
clears every peg, ball radius stays 30, the recovery itself adds no pin hits,
and the ball continues locally to slot **0**, rather than a jackpot.

Native Chrome/browser checks cover three cancellation/reentry cycles, each
after observing a production native animation frame. The reentered browser
then runs the production animation callback with a controlled frame clock,
reaching a real slot in **5.344 physics seconds / 334 frames** within the same
30-second physics bound. Cancellation during the landing hold leaves no
pending animation frames/timers or browser exceptions. The existing
`tests/arcade-ball-drop.test.cjs` still passes its three-ball, jackpot, payout
and idempotent-award checks. Full application screenshots, Android build and
the complete suite are validated by the release coordinator.

An integrated-suite browser timeout was reproduced and diagnosed before
changing the test: after **15.325 wall seconds**, only approximately **1.72
physics seconds** had elapsed, with a **2.996-second native RAF gap**. The ball
was moving at about 314 pixels/second, at y=208 with active downward progress;
it was not stalled. Production intentionally caps each frame's physics delta
at 32ms, so CPU-starved browser wall time cannot be used as the physics bound.
The native cancellation checks remain native; only the bounded landing check
uses the controlled browser clock. No production change or expanded timeout
was needed for that test correction.

The simulations establish zero permanent stalls across these deterministic
cases; they are not an exhaustive proof of every possible floating-point state.
