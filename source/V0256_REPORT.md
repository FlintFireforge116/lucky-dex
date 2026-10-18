# LuckyDex v0.25.6 implementation report

## Fossil Dig reveal threshold

Root cause: a find was only marked recovered when every cell in its excavation mask reached rock depth zero. With irregular/transparent item art, this meant a sprite could look completely exposed while one peripheral mask cell remained covered.

Fix: recovery now requires 75% of the find's occupied mask cells to be completely cleared. Placement masks and collision rules are unchanged; only the recovery threshold is tighter. This preserves the need to excavate the object while removing the frustrating final empty-looking corners.

## Recovery copy

The underlying delayed-reward/cave-in system is unchanged. Recovered finds are still only committed when the dig ends successfully (or after cave-in survival is resolved), but the visible `UNBANKED` label has been removed. The recovery banner now simply says `RECOVERED`, and the End Dig confirmation explains that finds are collected when you leave.
