# Secret Wonders — Stage 3 (v0.69.239)

**Build on:** v0.69.238 Stage 2. All 132 official collector-number
prints remain in the catalog; **88 cards are battle-enabled**, and the
remaining **44 are intentionally gated**.

## Added battle-ready cards (16)

| Collector # | Card | Implemented printed interactions |
|---|---|---|
| 2 | Blastoise | Waterlog repeatable Basic Water from hand, choose recipient, turn ends; Hydro Pump surplus Water |
| 5 | Flygon | Sand Sonic same-turn hand Fighting attachment; Irritating Buzz between turns excluding Fighting targets |
| 8 | Gastrodon East Sea | Osmotic Pressure selectable counter transfer; Dwindling Wave penalty |
| 9 | Gastrodon West Sea | Raging Flood damage/heal, Wild Waves damage both Benches |
| 13 | Ludicolo | Rain Dish between-turn healing, Nature Power Stadium owner conditions |
| 14 | Lugia | Silver Wing coin + selectable returned Energy, Psychic Destruction lower base damage with attached Energy |
| 21 | Absol | Baleful Wind concealed random opponent hand removal and conditional extra discard, Raid play-turn condition |
| 25 | Electivire | Motor Drive discarded Lightning recovery; Discharge actual Energy discards and per-Energy coins |
| 31 | Magmortar | Flame Body reactive hand attachment healing; Flame Blast Energy scaling; Fireball Bazooka two distinct Benched recipients |
| 37 | Sharpedo | Rough Skin reactive damage; Strike Wound bonus and damage-rule bypass |
| 48 | Donphan | Rapid Spin two-sided sequential switches, Bash In Tool check |
| 55 | Miltank | Healing Milk two coins + actual damaged target, Continuous Tumble coin results |
| 63 | Sableye | Rummage visible top-five Trainer choices, Shadow Sneak Prize-card count |
| 84 | Corsola | Rally choosing up to 3 Basic types, distinct species and target bench slots |
| 96 | Natu | Bothering Wave coin + Energy discard, Future Sight selecting either deck and five-card order |
| 125 | Roseanne's Research | Two Basic Pokémon/Basic Energy searches with physical-card identities and documented Energy Zone adaptation |

## Reusable engine changes

- Record physical from-hand typed Energy attachment events separately
  from Energy Zone attachment. Used for Magmortar and Flygon, with
  source events available to other Classic cards.
- Notify Sharpedo's Rough Skin reactive damage handler upon a real
  damaging opponent attack, before knockout resolution.
- Treat optional damage-counter movement, opponent replacement choices,
  random concealed hand card discard and multi-target attack choices as
  genuine effect-resolution steps.
- Guard unavailable or no-result Powers and healing choices to prevent
  dead-end menus.

## Verification

- New outcome tests: `tests/v07239-secret-wonders-stage3.test.cjs`.
- Stage 1/2 tests are retained and updated to assert the new baseline.
- Auditor: `node source/scripts/audit-classic-set.cjs --set dp3 --smoke --no-cpu`.
- Generated reports: `source/generated/classic-audit-dp3.md` and `.json`.
- GitHub preflight includes all three Secret Wonders stages plus the
  completed Mysterious Treasures audit.

**Limits:** The synthetic smoke harness is not an independent printed
card-rules review. It cannot verify Android screen rendering, all CPU
strategic choices, or complete Secret Wonders-only CPU deck legality.
The 44 gated cards are not selectable for live battle. Stage 4 should
handle high-complexity Prizes, LV.X cards, Gardevoir Telepass, and
reactive knockouts with focused tests and UI checks.
