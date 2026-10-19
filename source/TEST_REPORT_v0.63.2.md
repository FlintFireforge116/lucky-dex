# LuckyDex v0.63.2 – Tumbling Togepi controls + countdown

## Root cause
The mobile Tumbling Togepi joystick normalized X/Y to a circular vector before passing it to gameplay. Because forward speed uses the Y axis directly, steering diagonally reduced player throttle (for example a 45° diagonal produced ~0.71 forward) while CPU racers always retain `inputY = 1`. This made the player slower whenever steering.

## Changes
- Mobile joystick now calculates gameplay X and Y independently, so full downward input remains full running speed while steering left/right.
- The visual knob still remains constrained inside the circular joystick.
- Added a visible **3 → 2 → 1 → GO!** countdown.
- Player can pre-position/hold the joystick during the countdown.
- Racers and race timer remain frozen until GO.
- Countdown pauses correctly with the shared help/pause lifecycle.
- Version metadata updated to v0.63.2.

## Verification
Applied v0.63.2 changes on top of a clean v0.63.0 + v0.63.1 patch stack.

- 9 included focused/regression test programs executed.
- **26 / 26 subtests passed.**
- Changed/relevant JavaScript files passed `node --check`.
- v0.63.2 release metadata checks passed.

The complete repository runner (`source/scripts/run-tests.cjs`) is not included in the patch workspace, so this is focused/regression verification rather than a claim that the full repository suite ran here.
