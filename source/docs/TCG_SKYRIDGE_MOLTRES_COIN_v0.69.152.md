# LuckyDex v0.69.152 — Skyridge Moltres coin presentation

## Bug
The Skyridge Moltres (#21) Burning Tail coin was resolved in the battle engine,
but did not create a `type: 'coin'` battle-log entry. The centre-screen coin
presentation only animates logged coin events, making the flip appear missing.
Collect Fire (#21) and Articuno's Freeze Solid used the same unlogged rule path.

## Fix
- Log the Burning Tail heads/tails outcome and whether Fire Energy was discarded.
- Show the Burning Tail outcome in the in-battle action text.
- Record Collect Fire and Freeze Solid coin events, without re-rolling on choice resolution.
- Keep the attack's 60 base damage and its conditional Fire discard unchanged.
- Add six tests for both outcomes, the real attack path, no-Fire edge case,
  visibility through the existing presentation, and Collect Fire.

## Validation
`node --test tests/v0714*.test.cjs tests/v0715*.test.cjs`

141 tests passed. Android device visual test not performed.
