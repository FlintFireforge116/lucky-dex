# Adventure 3.0 battle and move display

The shared reducer still exports `create`, `act`, `markup`, `update`, `animate`,
`migrateFight`, `stats` and `effectiveness`. Reward commits remain outside battle.

Real move turns resolve the two active Pokémon's chosen moves by move priority,
then computed Speed, then one draw from the persisted battle RNG for an exact
tie. Priority is now generated directly from every included move's pinned
`moves.csv` row by `python scripts/build_adventure_moves.py`. A faster Pokémon
can faint its opponent before the queued move; neither an automatic partner
switch nor the opponent's next team member inherits that queued move. Residual
damage applies to the original active pair after resolution.

Switching, Potion use and failed capture apply before one opposing attack.
A successful capture ends the encounter before retaliation. Berries retain the
existing free action: 1.4× stacking capture boost, capped at 2×, reset after a
failed ball (retired expedition modifiers retain their historical reducer
behavior for compatibility). Wild encounters allow LEAVE without retaliation;
trainer/League encounters reject capture, capture berries and LEAVE before
mutating RNG, supplies or battle state. Leaving the Adventure screen is handled
by the journey controller and preserves the encounter.

The UI opens FIGHT / BAG / POKÉMON drawers. `data-adv-command="battle-fight"`
opens `data-battle-drawer="fight"`; existing battle-bag, battle-switch and
battle-close contracts are retained. Move buttons retain `data-adv-battle` and
`data-move-id`; quick/type aliases remain compatible. Drawers scroll on short
phones. The trainer's remaining team count has `data-enemy-progress`.

`LuckyDexMoveView.describe(moveOrId, {currentPP})` returns name, capitalized
type/category, display power/accuracy/PP, maxPP, priority and factual description.
`markup` returns an escaped move card using the same data. Cards describe the
effects LuckyDex implements rather than official flavor text. Unsupported
field/status effects explicitly say no battle effect is implemented.

## Deliberate retained simplifications

- Physical and Special share the existing Attack/Defense stat calculation.
- Canonical move data stays unchanged in the UI. Combat caps damaging power at
  95 and adapts null/variable/fixed/counter power to 40.
- STAB is 1.1×; regional incoming damage retains the fixed 0.60 factor.
- Type effectiveness multiplies across types, including immunities. The missing
  Normal resistance to Rock and Steel is fixed in this release.
- Accuracy uses the canonical percentage; null bypasses the check. An attempted
  move spends PP even when it misses. Sleep/paralysis or an earlier faint cancel
  before PP is spent.
- Burn/poison each deal 4% max HP per resolved turn. Paralysis has an 18% skipped
  action chance without a Speed penalty. Sleep/freeze use a two-action sleep
  adaptation. Fire is immune to burn, Poison/Steel to poison, Electric to paralysis.
- Buff/debuff moves change bounded offensive/defensive stance; Protect/screens
  do not prevent all damage. Positive drain and healing metadata are supported.
- Flinch, confusion, weather, transforms, trapping, stat-specific changes,
  multi-hit behavior, critical-hit bonuses and official secondary recoil are
  retained as source metadata without claiming they are simulated. Struggle has
  the existing 8% max-HP recoil with a 1-HP floor and is available when no damaging
  known move has PP, including status-only partners.
- Enemy AI chooses effective attacks, at most one supported stance/status move
  for non-pressure strategies and one heal below 40% HP per team member. Usable
  heal/support moves are evaluated before Struggle. Skipped actions do not spend
  the AI's heal/support budget. Damage scoring retains canonical power × type
  effectiveness; it does not predict the complete turn or optimize STAB/accuracy.
- Retired compact quick/type combat and guardian modifiers remain reducer
  compatibility paths; active Adventure party battles use real move ordering.

## Verification

New failing regression tests preceded production changes. The combined move
view/data, new battle, existing battle, real-move and residual-status programs
passed 50 tests. Priority is checked against every included CSV source row;
canonical move numeric values, species associations and source hashes remain
covered by the existing source audit.
